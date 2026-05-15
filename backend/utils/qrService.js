const crypto = require('crypto');

const QR_SECRET = process.env.QR_SECRET || 'default-secret-change-in-production';
const QR_TTL_DAYS = 30;

/**
 * Generate HMAC-SHA256 signed QR token
 * Token format: orderId:timestamp:hmac
 * TTL: 30 days
 */
function generateQrToken(orderId) {
    const timestamp = Date.now();
    const payload = `${orderId}:${timestamp}`;

    const hmac = crypto.createHmac('sha256', QR_SECRET)
        .update(payload)
        .digest('hex');

    const token = Buffer.from(`${payload}:${hmac}`).toString('base64url');

    return {
        token,
        expiresAt: new Date(timestamp + QR_TTL_DAYS * 24 * 60 * 60 * 1000)
    };
}

/**
 * Verify HMAC-SHA256 signed QR token
 * Returns: { valid: true/false, orderId, status: 'valid'|'tampered'|'expired' }
 */
function verifyQrToken(token) {
    try {
        // Decode from base64url
        const decoded = Buffer.from(token, 'base64url').toString('utf-8');
        const [orderId, timestamp, receivedHmac] = decoded.split(':');

        if (!orderId || !timestamp || !receivedHmac) {
            return {
                valid: false,
                status: 'tampered',
                message: 'Invalid token format'
            };
        }

        // Check expiry
        const tokenAge = Date.now() - parseInt(timestamp);
        const expiryMs = QR_TTL_DAYS * 24 * 60 * 60 * 1000;

        if (tokenAge > expiryMs) {
            return {
                valid: false,
                status: 'expired',
                orderId,
                expiryDate: new Date(parseInt(timestamp) + expiryMs)
            };
        }

        // Verify HMAC (timing-safe comparison)
        const payload = `${orderId}:${timestamp}`;
        const expectedHmac = crypto.createHmac('sha256', QR_SECRET)
            .update(payload)
            .digest('hex');

        const timingSafeMatch = crypto.timingSafeEqual(
            Buffer.from(receivedHmac),
            Buffer.from(expectedHmac)
        );

        if (!timingSafeMatch) {
            return {
                valid: false,
                status: 'tampered',
                message: 'HMAC verification failed'
            };
        }

        return {
            valid: true,
            status: 'valid',
            orderId
        };

    } catch (error) {
        return {
            valid: false,
            status: 'tampered',
            message: error.message
        };
    }
}

module.exports = { generateQrToken, verifyQrToken };
