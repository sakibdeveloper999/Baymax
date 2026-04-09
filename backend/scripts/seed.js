/**
 * Seed script: Load sample products into MongoDB
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const SAMPLE_PRODUCTS = [
    {
        barcode: '111001',
        name: 'Rice 5kg',
        category: 'Grains',
        costPrice: 150,
        sellingPrice: 200,
        stock: 50,
        unit: 'pcs',
        description: 'Premium quality long grain rice',
    },
    {
        barcode: '111002',
        name: 'Oil 1L',
        category: 'Oils',
        costPrice: 100,
        sellingPrice: 150,
        stock: 30,
        unit: 'bottle',
        description: 'Pure vegetable oil',
    },
    {
        barcode: '111003',
        name: 'Sugar 1kg',
        category: 'Pantry',
        costPrice: 40,
        sellingPrice: 60,
        stock: 100,
        unit: 'kg',
        description: 'White granulated sugar',
    },
    {
        barcode: '111004',
        name: 'Salt 500g',
        category: 'Pantry',
        costPrice: 15,
        sellingPrice: 25,
        stock: 200,
        unit: 'pcs',
        description: 'Iodized table salt',
    },
    {
        barcode: '111005',
        name: 'Milk 500ml',
        category: 'Dairy',
        costPrice: 30,
        sellingPrice: 50,
        stock: 60,
        unit: 'bottle',
        description: 'Fresh pasteurized milk',
    },
    {
        barcode: '111006',
        name: 'Flour 1kg',
        category: 'Grains',
        costPrice: 45,
        sellingPrice: 70,
        stock: 80,
        unit: 'kg',
        description: 'All-purpose wheat flour',
    },
    {
        barcode: '111007',
        name: 'Lentils 1kg',
        category: 'Legumes',
        costPrice: 60,
        sellingPrice: 100,
        stock: 40,
        unit: 'kg',
        description: 'Red lentils',
    },
    {
        barcode: '111008',
        name: 'Spice Mix 100g',
        category: 'Spices',
        costPrice: 75,
        sellingPrice: 120,
        stock: 25,
        unit: 'pcs',
        description: 'Biryani masala blend',
    },
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️ Cleared existing products');

        // Insert sample products
        const inserted = await Product.insertMany(SAMPLE_PRODUCTS);
        console.log(`✅ Seeded ${inserted.length} products`);

        // Display seeded products
        const allProducts = await Product.find();
        console.log('\n📦 Database Products:');
        allProducts.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name} (Barcode: ${p.barcode}) - ৳${p.sellingPrice}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Seed complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seedProducts();
