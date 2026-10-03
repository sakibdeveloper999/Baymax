const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Store = require('../models/Store');
const { isValidId } = require('../db/ids');
const { tenantAccessError } = require('../utils/tenantAccess');

const RECHECK_MS = 30000;
const LOOKUP_TIMEOUT_MS = 5000;
const MAX_TIMER_MS = 2147483647;

class SocketAccessError extends Error {
    constructor(code, message) {
        super(message);
        this.data = { code };
    }
}
const denied = (code, message) => new SocketAccessError(code, message);
const publicError = error => error instanceof SocketAccessError
    ? error : denied('ACCESS_CHECK_FAILED', 'Unable to verify socket access');

function withTimeout(work, timeoutMs) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(denied('ACCESS_CHECK_FAILED', 'Unable to verify socket access')), timeoutMs);
        timer.unref?.();
    });
    return Promise.race([Promise.resolve().then(work), timeout]).finally(() => clearTimeout(timer));
}

function readToken(socket) {
    // Never accept credentials in a URL/query string.
    const authToken = socket.handshake.auth?.token;
    if (authToken !== undefined) return authToken;
    const header = socket.handshake.headers.authorization;
    return typeof header === 'string' ? /^Bearer ([^\s]+)$/i.exec(header)?.[1] : undefined;
}

async function authenticate(token) {
    if (typeof token !== 'string' || !token || token.length > 8192) {
        throw denied('AUTH_REQUIRED', 'An access token is required');
    }
    let claims;
    try {
        claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
        throw denied(error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN', 'Invalid or expired access token');
    }
    if (!isValidId(claims.userId) || !isValidId(claims.tenantId) ||
        !Number.isFinite(claims.exp)) {
        throw denied('INVALID_TOKEN', 'Invalid access token');
    }
    const user = await User.findById(claims.userId).populate('tenantId');
    if (!user || !user.isActive || !user.tenantId) {
        throw denied('ACCOUNT_SUSPENDED', 'Account is unavailable');
    }
    if (String(user.tenantId._id) !== claims.tenantId) {
        throw denied('INVALID_TOKEN', 'Invalid access token');
    }
    const policyError = tenantAccessError(user.tenantId);
    if (policyError) throw denied(policyError.code, policyError.error);
    const expiresAt = Math.min(claims.exp * 1000, new Date(user.tenantId.expireAt).getTime());
    if (Date.now() >= expiresAt) throw denied('ACCESS_EXPIRED', 'Socket access expired');
    return { userId: claims.userId, tenantId: claims.tenantId, expiresAt };
}

async function authorizeStore(storeId, tenantId) {
    if (!isValidId(storeId)) throw denied('INVALID_STORE_ID', 'Invalid store ID');
    const store = await Store.findOne({ _id: storeId, tenantId, isActive: true });
    if (!store) throw denied('STORE_ACCESS_DENIED', 'Store is unavailable');
    return store;
}

const storeRoom = (tenantId, storeId) => 'tenant:' + tenantId + ':store:' + storeId;

function installSocketAccess(io, { recheckMs = RECHECK_MS, lookupTimeoutMs = LOOKUP_TIMEOUT_MS } = {}) {
    if (!Number.isFinite(recheckMs) || recheckMs <= 0 || !Number.isFinite(lookupTimeoutMs) || lookupTimeoutMs <= 0) {
        throw new TypeError('Socket access intervals must be positive');
    }
    // Credentials stay private to this process, not in adapter-visible socket.data.
    const sessions = new WeakMap();
    io.use(async (socket, next) => {
        try {
            const token = readToken(socket);
            const access = await withTimeout(() => authenticate(token), lookupTimeoutMs);
            sessions.set(socket, { token, access });
            next();
        } catch (error) {
            next(publicError(error));
        }
    });

    io.on('connection', socket => {
        const session = sessions.get(socket);
        let closed = false;
        let expiryTimer;
        let recheckTimer;
        let selectedStore;
        let joins = Promise.resolve();
        let checking;

        function revoke(error) {
            if (closed) return;
            socket.emit('access:revoked', { success: false, code: publicError(error).data.code });
            socket.disconnect(true);
        }

        function scheduleExpiry() {
            clearTimeout(expiryTimer);
            const delay = session.access.expiresAt - Date.now();
            if (delay <= 0) {
                revoke(denied('ACCESS_EXPIRED', 'Socket access expired'));
                return;
            }
            expiryTimer = setTimeout(() => {
                if (Date.now() >= session.access.expiresAt) revoke(denied('ACCESS_EXPIRED', 'Socket access expired'));
                else scheduleExpiry();
            }, Math.min(delay, MAX_TIMER_MS));
            expiryTimer.unref?.();
        }

        function checkAccess() {
            // Coalesce concurrent packet/idle checks without allowing overlapping state writes.
            if (checking) return checking;
            checking = withTimeout(async () => {
                const access = await authenticate(session.token);
                if (selectedStore) await authorizeStore(selectedStore, access.tenantId);
                if (Date.now() >= access.expiresAt) throw denied('ACCESS_EXPIRED', 'Socket access expired');
                return access;
            }, lookupTimeoutMs).then(access => {
                if (closed) throw denied('ACCESS_EXPIRED', 'Socket disconnected');
                session.access = access;
                scheduleExpiry();
                return access;
            }).finally(() => { checking = undefined; });
            return checking;
        }

        function scheduleRecheck() {
            if (closed) return;
            recheckTimer = setTimeout(async () => {
                try {
                    await checkAccess();
                    scheduleRecheck();
                } catch (error) { revoke(error); }
            }, recheckMs);
            recheckTimer.unref?.();
        }

        socket.on('disconnect', () => {
            closed = true;
            clearTimeout(expiryTimer);
            clearTimeout(recheckTimer);
            sessions.delete(socket);
        });

        socket.use(async (_packet, next) => {
            try {
                await checkAccess();
                if (!closed) next();
            } catch (error) {
                // Do not pass an error to an unhandled Socket 'error' event.
                revoke(error);
            }
        });

        socket.on('join:store', (storeId, acknowledgement) => {
            const reply = body => {
                if (!closed && typeof acknowledgement === 'function') acknowledgement(body);
            };
            // Serialize switches so two rapid joins cannot retain two store rooms.
            joins = joins.then(async () => {
                if (closed) return;
                try {
                    const access = await checkAccess().catch(error => {
                        revoke(error);
                        throw error;
                    });
                    await withTimeout(() => authorizeStore(storeId, access.tenantId), lookupTimeoutMs);
                    if (closed) return;
                    if (Date.now() >= access.expiresAt) throw denied('ACCESS_EXPIRED', 'Socket access expired');
                    const room = storeRoom(access.tenantId, storeId);
                    if (selectedStore && selectedStore !== storeId) {
                        await socket.leave(storeRoom(access.tenantId, selectedStore));
                    }
                    if (closed) return;
                    await socket.join(room);
                    // A disconnect while an asynchronous adapter joins must not restore membership.
                    if (closed) {
                        await socket.leave(room);
                        return;
                    }
                    selectedStore = storeId;
                    reply({ success: true, storeId });
                } catch (error) {
                    const safe = publicError(error);
                    reply({ success: false, code: safe.data.code, error: safe.message });
                    if (!['INVALID_STORE_ID', 'STORE_ACCESS_DENIED'].includes(safe.data.code)) revoke(safe);
                }
            }).catch(error => revoke(error));
        });

        scheduleExpiry();
        scheduleRecheck();
    });
}

module.exports = { installSocketAccess, storeRoom, RECHECK_MS, LOOKUP_TIMEOUT_MS };