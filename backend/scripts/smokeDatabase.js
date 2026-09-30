require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const assert = require('node:assert/strict');
const database = require('../db/pool');
const { newId } = require('../db/ids');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Store = require('../models/Store');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const StockLog = require('../models/StockLog');
const { adjustStock } = require('../utils/stockService');

(async () => {
    const marker = newId();
    const rollback = new Error('intentional smoke-test rollback');
    try {
        await require('../config/db')();
        try {
            await database.transaction(async session => {
                const tenant = await Tenant.create({ businessName: 'Rollback verification', ownerEmail: `${marker}@example.invalid`, expireAt: new Date(Date.now() + 60000) });
                const user = await User.create({ name: 'Verification', email: tenant.ownerEmail, password: newId(), tenantId: tenant._id, role: 'owner' });
                const store = await Store.create({ name: 'Verification', tenantId: tenant._id });
                const category = await Category.create({ name: 'Verification', storeId: store._id });
                const product = await Product.create({ name: 'Verification', barcode: marker, storeId: store._id, categoryId: category._id, costPrice: 2, sellingPrice: 5, stock: 3 });
                const customer = await Customer.create({ name: 'Verification', storeId: store._id, walletBalance: 20 });
                const order = await Order.create({ storeId: store._id, cashierId: user._id, customerId: customer._id,
                    items: [{ productId: product._id, productName: product.name, quantity: 1, unitPrice: 5, total: 5 }], subtotal: 5, total: 5 });
                await adjustStock(product._id, -1, 'sale', user._id, store._id, order._id, null, '', session);
                customer.walletBalance -= 5; await customer.save();
                assert.equal((await Product.findById(product._id)).stock, 2);
                assert.equal((await Order.findById(order._id).populate('items.productId', 'name')).items[0].productId.name, 'Verification');
                assert.equal(await StockLog.countDocuments({ storeId: store._id }), 1);
                throw rollback;
            });
        } catch (error) { if (error !== rollback) throw error; }
        assert.equal(await Tenant.countDocuments({ ownerEmail: `${marker}@example.invalid` }), 0);
        console.log('Live PostgreSQL CRUD, relations, stock transaction and rollback verified. Test data was not committed.');
    } catch (error) { console.error('Smoke check failed:', error.code || error.message); process.exitCode = 1; }
    finally { await database.close(); }
})();
