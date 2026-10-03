# Socket.IO access contract

Updated: 2026-10-03.

The default Socket.IO namespace on the backend now authenticates connections and restricts store-room membership. The current desktop/web UI does not yet consume Socket.IO, and controllers do not yet publish business events. This is the access-control foundation, not a completed realtime sync feature.

## Connect and select a store

Send the current access JWT in the Socket.IO handshake auth object. An Authorization header with a Bearer access token is also supported for clients that can send headers. Query-string tokens are not accepted.

    const socket = io(apiOrigin, {
        auth: { token: accessToken },
    });

    socket.on('connect', () => {
        socket.emit('join:store', selectedStoreId, result => {
            if (!result.success) {
                // Handle result.code and result.error.
                return;
            }
            // Membership is active for this store.
        });
    });

    socket.on('connect_error', error => {
        // error.data.code identifies the authentication/access failure.
    });

    socket.on('access:revoked', result => {
        // Stop realtime actions. The server disconnects this socket.
    });

A successful join acknowledges { success: true, storeId }. Invalid IDs return INVALID_STORE_ID; missing, inactive and foreign stores all return STORE_ACCESS_DENIED. A rejected store selection preserves the previous authorized room. Successful switches remove the previous room, including concurrent switch requests. The server permits one selected store per socket.

After a server disconnect, obtain a valid session through the existing auth flow, assign the new access token to socket.auth, and explicitly reconnect. Do not automatically reconnect repeatedly with the same invalid credentials. Revocation events are best-effort notices; clients must also handle disconnect.

## Authorization and expiry

- Access tokens require an HS256 signature, valid user/tenant IDs and a finite expiry.
- The server reloads the active user and tenant and applies the same tenantAccessError policy used by HTTP authentication. The JWT tenant claim must match the user's tenant.
- Each incoming event rechecks access. Store joins additionally query an active store belonging to that tenant.
- Idle sockets recheck the user, tenant and selected store every 30 seconds after the previous check completes. Each check has a 5-second timeout and fails closed.
- Timers enforce the earlier of the access-token and last-observed subscription expiry. Other database changes are detected on the next incoming event or idle check (normally within about 35 seconds, subject to event-loop scheduling). This is periodic revocation, not instantaneous cross-process invalidation.
- Deactivated/deleted users, suspended/invalid tenants, transferred/deactivated stores and database failures disconnect sockets and remove room membership.
- Disconnect clears timers; delayed authorization cannot rejoin a disconnected socket.
- Credentials are held privately in process memory, not copied into adapter-visible socket.data or logs.

## Future event publishers

Use the exported storeRoom(tenantId, storeId) helper from middleware/socketAccess.js. It produces `tenant:<tenantId>:store:<storeId>`. Do not publish protected business data through global io.emit, client-provided room names, or the old `store:<storeId>` name. Determine tenant and store IDs from the authorized server context.

There are no current business-event publishers to migrate. Future multi-node adapters, connection-state recovery, resource-specific event permissions and client integration require separate implementation and validation. Room authorization alone does not implement plan-feature checks for future events.

## Verification

Run node --test backend/tests/socket-access.test.js from the project root. Tests use real local Socket.IO transport connections with mocked User/Store queries. Coverage includes invalid handshakes, tenant policy, store isolation, room switching, idle revocation, expiry, failed/stalled lookups, delayed joins and application-server wiring.

On 2026-10-03, npm.cmd test --prefix backend passed 52 tests, including 22 Socket.IO tests/subtests and the existing isolated PGlite integration coverage. These checks did not connect to live Neon or establish production-scale concurrency, deployment or frontend realtime behavior.

Protocol references: [Socket.IO middleware](https://socket.io/docs/v4/middlewares/) and [server API](https://socket.io/docs/v4/server-api/).
