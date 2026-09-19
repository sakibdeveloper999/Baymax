const crypto = require('crypto');
const QR_TTL_MS = 30 * 24 * 60 * 60 * 1000;
function secret() {
    if (!process.env.QR_SECRET) throw new Error('QR_SECRET must be configured');
    return process.env.QR_SECRET;
}
function signature(payload) { return crypto.createHmac('sha256', secret()).update(payload).digest('hex'); }
function generateQrToken(orderId) {
    const timestamp = Date.now();
    const payload = `${orderId}:${timestamp}`;
    return { token: Buffer.from(`${payload}:${signature(payload)}`).toString('base64url'), expiresAt: new Date(timestamp + QR_TTL_MS) };
}
function verifyQrToken(token) {
    try {
        if (typeof token !== 'string' || token.length > 512) return { valid: false, status: 'tampered' };
        const parts = Buffer.from(token, 'base64url').toString('utf8').split(':');
        if (parts.length !== 3) return { valid: false, status: 'tampered' };
        const [orderId, timestamp, receivedHmac] = parts;
        if (!/^[a-f0-9]{24}$/i.test(orderId) || !/^\d+$/.test(timestamp) || !/^[a-f0-9]{64}$/.test(receivedHmac)) return { valid: false, status: 'tampered' };
        const expectedHmac = signature(`${orderId}:${timestamp}`);
        if (!crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac))) return { valid: false, status: 'tampered' };
        const age = Date.now() - Number(timestamp);
        if (!Number.isSafeInteger(Number(timestamp)) || age < 0) return { valid: false, status: 'tampered' };
        if (age >= QR_TTL_MS) return { valid: false, status: 'expired' };
        return { valid: true, orderId, status: 'valid' };
    } catch { return { valid: false, status: 'tampered' }; }
}
module.exports = { generateQrToken, verifyQrToken };
