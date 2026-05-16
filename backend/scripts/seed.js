require('dotenv').config();
const mongoose = require('mongoose');

// Models
const Tenant = require('../models/Tenant');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const ExpenseType = require('../models/ExpenseType');

// Utilities
const { hashPassword } = require('../utils/helpers');

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // ──── 1. Create Plans ────
        console.log('\n📋 Creating plans...');
        const plans = await Plan.insertMany([
            {
                name: 'basic',
                features: ['pos', 'products', 'categories'],
                limits: { users: 2, products: 500, branches: 1 },
                price: 19,
                trialDays: 7,
            },
            {
                name: 'standard',
                features: ['pos', 'products', 'categories', 'reports', 'suppliers', 'purchases', 'customers', 'loyalty', 'wallet', 'vouchers'],
                limits: { users: 5, products: 2000, branches: 3 },
                price: 49,
                trialDays: 14,
            },
            {
                name: 'pro',
                features: ['pos', 'products', 'categories', 'reports', 'suppliers', 'purchases', 'customers', 'loyalty', 'wallet', 'vouchers', 'accounting', 'payroll', 'banking', 'multilingual', 'multicurrency'],
                limits: { users: 999, products: 999999, branches: 999 },
                price: 99,
                trialDays: 30,
            },
        ]);
        console.log(`   ✓ Created ${plans.length} plans`);

        // ──── 2. Create Test Tenant ────
        console.log('\n🏢 Creating test tenant...');
        const tenant = await Tenant.create({
            businessName: 'Demo Store Inc.',
            ownerEmail: 'demo@omnipo.local',
            plan: 'standard',
            subscriptionStatus: 'active',
            expireAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            language: 'en',
            currency: 'USD',
        });
        console.log(`   ✓ Created tenant: ${tenant.businessName}`);

        // ──── 3. Create Users ────
        console.log('\n👤 Creating users...');
        const adminPassword = await hashPassword('admin123456');
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@omnipo.local',
            password: adminPassword,
            role: 'owner',
            tenantId: tenant._id,
        });
        console.log(`   ✓ admin@omnipo.local (owner)`);

        const managerPassword = await hashPassword('manager123456');
        const manager = await User.create({
            name: 'Manager User',
            email: 'manager@omnipo.local',
            password: managerPassword,
            role: 'manager',
            tenantId: tenant._id,
        });
        console.log(`   ✓ manager@omnipo.local (manager)`);

        const cashierPassword = await hashPassword('cashier123456');
        const cashier = await User.create({
            name: 'Cashier User',
            email: 'cashier@omnipo.local',
            password: cashierPassword,
            role: 'cashier',
            tenantId: tenant._id,
        });
        console.log(`   ✓ cashier@omnipo.local (cashier)`);

        // ──── 4. Create Store ────
        console.log('\n🏪 Creating store...');
        const store = await Store.create({
            tenantId: tenant._id,
            name: 'Main Branch',
            address: '123 Commerce St, Downtown',
            phone: '+1 555-0123',
            taxRate: 8,
            taxLabel: 'Sales Tax',
            currency: 'USD',
            timezone: 'America/New_York',
            receiptFooter: 'Thank you for shopping with us!',
        });
        console.log(`   ✓ Created: ${store.name}`);

        // ──── 5. Create Categories ────
        console.log('\n📂 Creating categories...');
        const categories = await Category.insertMany([
            { storeId: store._id, name: 'Beverages' },
            { storeId: store._id, name: 'Dairy' },
            { storeId: store._id, name: 'Bakery' },
            { storeId: store._id, name: 'Produce' },
            { storeId: store._id, name: 'Meat' },
            { storeId: store._id, name: 'Groceries' },
            { storeId: store._id, name: 'Health & Beauty' },
        ]);
        console.log(`   ✓ Created ${categories.length} categories`);

        // ──── 6. Create Products ────
        console.log('\n📦 Creating products...');
        const products = await Product.insertMany([
            { storeId: store._id, barcode: '8717644369994', name: 'Coca Cola 500ml', category: 'Beverages', costPrice: 0.50, sellingPrice: 1.99, stock: 100 },
            { storeId: store._id, barcode: '5901234123457', name: 'Milk 1L Organic', category: 'Dairy', costPrice: 0.80, sellingPrice: 2.99, stock: 50 },
            { storeId: store._id, barcode: '8719189010124', name: 'Bread Whole Wheat', category: 'Bakery', costPrice: 0.75, sellingPrice: 2.49, stock: 30 },
            { storeId: store._id, barcode: '4001101111115', name: 'Butter 250g', category: 'Dairy', costPrice: 2.00, sellingPrice: 5.99, stock: 25 },
            { storeId: store._id, barcode: '9780134994724', name: 'Apples Red 1kg', category: 'Produce', costPrice: 1.00, sellingPrice: 3.49, stock: 80 },
            { storeId: store._id, barcode: '5060088821095', name: 'Chicken Breast 500g', category: 'Meat', costPrice: 4.00, sellingPrice: 9.99, stock: 40 },
            { storeId: store._id, barcode: '7622201111110', name: 'Pasta 500g', category: 'Groceries', costPrice: 0.60, sellingPrice: 1.79, stock: 150 },
            { storeId: store._id, barcode: '4006000561371', name: 'Soap Bar 100g', category: 'Health & Beauty', costPrice: 0.40, sellingPrice: 1.49, stock: 200 },
        ]);
        console.log(`   ✓ Created ${products.length} products`);

        // ──── 7. Create Customers ────
        console.log('\n👥 Creating customers...');
        const customers = await Customer.insertMany([
            { storeId: store._id, name: 'John Doe', phone: '+1-555-0001', creditLimit: 500, walletBalance: 50 },
            { storeId: store._id, name: 'Jane Smith', phone: '+1-555-0002', creditLimit: 250, walletBalance: 25 },
            { storeId: store._id, name: 'Bob Johnson', phone: '+1-555-0003', creditLimit: 1000, walletBalance: 100 },
        ]);
        console.log(`   ✓ Created ${customers.length} customers`);

        // ──── 8. Create Suppliers ────
        console.log('\n🏭 Creating suppliers...');
        const suppliers = await Supplier.insertMany([
            { storeId: store._id, name: 'Fresh Foods Co.', phone: '+1-555-1001', openingBalance: 5000, currentBalance: 5000 },
            { storeId: store._id, name: 'Beverage Dist.', phone: '+1-555-1002', openingBalance: 3000, currentBalance: 3000 },
            { storeId: store._id, name: 'Pantry Supplies', phone: '+1-555-1003', openingBalance: 2000, currentBalance: 2000 },
        ]);
        console.log(`   ✓ Created ${suppliers.length} suppliers`);

        // ──── 9. Create Expense Types ────
        console.log('\n💰 Creating expense types...');
        const expenseTypes = await ExpenseType.insertMany([
            { storeId: store._id, name: 'Rent' },
            { storeId: store._id, name: 'Electricity' },
            { storeId: store._id, name: 'Transport' },
            { storeId: store._id, name: 'Salary' },
            { storeId: store._id, name: 'Maintenance' },
            { storeId: store._id, name: 'Miscellaneous' },
        ]);
        console.log(`   ✓ Created ${expenseTypes.length} expense types`);

        // ──── Summary ────
        console.log('\n' + '═'.repeat(60));
        console.log('✅ SEED COMPLETED');
        console.log('═'.repeat(60));
        console.log('\n🔐 TEST ACCOUNTS:');
        console.log('   admin@omnipo.local     | owner    | admin123456');
        console.log('   manager@omnipo.local   | manager  | manager123456');
        console.log('   cashier@omnipo.local   | cashier  | cashier123456');
        console.log('\n' + '═'.repeat(60) + '\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedDatabase();
