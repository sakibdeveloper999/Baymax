const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const database = require('../db/pool');

/**
 * SINGLE FUNCTION that handles ALL stock mutations
 * Writes StockLog on every call
 * Used by: orders, purchases, returns, transfers, manual adjust
 */
async function adjustStock(
    productId,
    delta,
    reason,
    userId,
    storeId,
    orderId = null,
    purchaseId = null,
    note = '',
    session = null
) {
    if (!session && !database.currentSession()) {
        return database.transaction(tx => adjustStock(productId, delta, reason, userId, storeId, orderId, purchaseId, note, tx));
    }
    try {
        // Lock the product in this store for the duration of the transaction
        const product = await Product.findOne({ _id: productId, storeId }).session(session);
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        const oldStock = product.stock;
        const newStock = oldStock + delta;

        // Prevent negative stock (except for returns/damage)
        if (newStock < 0 && !['return', 'damage'].includes(reason)) {
            throw new Error(`Insufficient stock. Current: ${oldStock}, Requested: ${Math.abs(delta)}`);
        }

        // Update product stock
        product.stock = Math.max(0, newStock);
        await product.save({ session });

        // Create immutable StockLog entry
        await StockLog.create([{
            storeId,
            productId,
            delta,
            reason,
            changedBy: userId,
            orderId,
            purchaseId,
            note,
            newBalance: product.stock
        }], { session });

        return product;
    } catch (error) {
        throw error;
    }
}

module.exports = { adjustStock };
