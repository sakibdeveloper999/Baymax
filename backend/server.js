require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const http = require('http');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        credentials: true,
    },
});

// Make io accessible to routes
app.set('io', io);

// ══════════════════════════════════
// MIDDLEWARE
// ══════════════════════════════════

// Security
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API rate limiting
const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api/', apiLimiter);

// Authentication & authorization (injected into protected routes)
const { verifyToken } = require('./middleware/auth');
const { checkSubscription } = require('./middleware/subscription');

// ══════════════════════════════════
// MONGODB CONNECTION
// ══════════════════════════════════

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('✅ MongoDB Connected');
        console.log(`   Cluster: ${process.env.MONGO_URI.split('/')[2]}`);
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });

// ══════════════════════════════════
// ROUTES
// ══════════════════════════════════

// Health check (public)
app.get('/health', (req, res) => {
    res.json({
        status: '✅ Backend is running',
        timestamp: new Date(),
        environment: process.env.NODE_ENV,
        apiVersion: 'v1.0',
    });
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const storeRoutes = require('./routes/stores');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (require verifyToken + checkSubscription)
app.use('/api/products', verifyToken, checkSubscription, productRoutes);
app.use('/api/categories', verifyToken, checkSubscription, categoryRoutes);
app.use('/api/stores', verifyToken, checkSubscription, storeRoutes);
app.use('/api/orders', verifyToken, checkSubscription, orderRoutes);
app.use('/api/customers', verifyToken, checkSubscription, customerRoutes);

// ──── ROUTES TO CREATE IN NEXT PHASE ────
// app.use('/api/suppliers', verifyToken, checkSubscription, supplierRoutes);
// app.use('/api/purchases', verifyToken, checkSubscription, purchaseRoutes);
// app.use('/api/stock-transfers', verifyToken, checkSubscription, stockTransferRoutes);
// app.use('/api/quotations', verifyToken, checkSubscription, quotationRoutes);
// app.use('/api/sales-returns', verifyToken, checkSubscription, salesReturnRoutes);
// app.use('/api/shifts', verifyToken, checkSubscription, shiftRoutes);
// app.use('/api/reports', verifyToken, checkSubscription, reportRoutes);
// app.use('/api/payroll', verifyToken, checkSubscription, payrollRoutes);
// app.use('/api/expenses', verifyToken, checkSubscription, expenseRoutes);
// app.use('/api/vouchers', verifyToken, checkSubscription, voucherRoutes);
// app.use('/api/banking', verifyToken, checkSubscription, bankingRoutes);
// app.use('/api/loyalty', verifyToken, checkSubscription, loyaltyRoutes);
// app.use('/api/admin', verifyToken, requireRole(['owner']), adminRoutes);

// ══════════════════════════════════
// SOCKET.IO REAL-TIME EVENTS
// ══════════════════════════════════

io.on('connection', (socket) => {
    console.log(`📡 Client connected: ${socket.id}`);

    // Client joins store room
    socket.on('join:store', (storeId) => {
        socket.join(`store:${storeId}`);
        console.log(`  └─ Joined store room: store:${storeId}`);
    });

    // Broadcast handlers (called by controllers)
    socket.on('disconnect', () => {
        console.log(`📡 Client disconnected: ${socket.id}`);
    });
});

// ══════════════════════════════════
// ERROR HANDLING
// ══════════════════════════════════

const { errorHandler } = require('./utils/errorHandler');

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found',
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
        },
    });
});

// Global error handler (must be last)
app.use(errorHandler);

// ══════════════════════════════════
// START SERVER
// ══════════════════════════════════

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n🚀 OmniPOS Backend v4.0 SaaS`);
    console.log(`   API running on port ${PORT}`);
    console.log(`   Base URL: ${process.env.API_BASE_URL}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   Socket.io ready on ws://localhost:${PORT}`);
    console.log(`\n📋 Public API Endpoints:`);
    console.log(`   POST   /api/auth/signup           - Create new tenant + owner`);
    console.log(`   POST   /api/auth/login            - Authenticate + get tokens`);
    console.log(`   POST   /api/auth/refresh-token    - Refresh expired access token`);
    console.log(`   GET    /api/auth/me               - Get current user + tenant`);
    console.log(`\n📦 Product & Inventory Endpoints:`);
    console.log(`   GET    /api/products              - List products with search/filters`);
    console.log(`   POST   /api/products              - Create product (requires manager)`);
    console.log(`   GET    /api/products/:id          - Get product details`);
    console.log(`   PUT    /api/products/:id          - Update product`);
    console.log(`   DELETE /api/products/:id          - Soft delete product`);
    console.log(`   PATCH  /api/products/:id/stock    - Adjust stock manually`);
    console.log(`\n🏪 Store & Category Endpoints:`);
    console.log(`   GET    /api/stores                - List stores (multi-branch)`);
    console.log(`   POST   /api/stores                - Create store/branch`);
    console.log(`   GET    /api/categories            - List categories`);
    console.log(`   POST   /api/categories            - Create category`);
    console.log(`\n🛒 Order & POS Endpoints:`);
    console.log(`   POST   /api/orders/checkout       - Create order + deduct stock`);
    console.log(`   GET    /api/orders                - List orders with filters`);
    console.log(`   GET    /api/orders/:id            - Get order details`);
    console.log(`   GET    /api/orders/:id/receipt    - Verify QR + get receipt`);
    console.log(`   PATCH  /api/orders/:id/status     - Update order status`);
    console.log(`\n👥 Customer Endpoints:`);
    console.log(`   GET    /api/customers             - List customers`);
    console.log(`   POST   /api/customers             - Create customer`);
    console.log(`   GET    /api/customers/:id         - Get customer details`);
    console.log(`   PATCH  /api/customers/:id/wallet  - Add funds to wallet`);
    console.log(`   PATCH  /api/customers/:id/loyalty/redeem - Redeem loyalty points`);
    console.log(`\n💡 Next Steps:`);
    console.log(`   npm run seed              - Populate with test data`);
    console.log(`   npm run dev               - Watch mode with auto-reload`);
    console.log(`\n`);

    // ══════════════════════════════════
    // GRACEFUL SHUTDOWN
    // ══════════════════════════════════

    process.on('SIGTERM', async () => {
        console.log('\n⏸️  SIGTERM received, shutting down gracefully...');
        server.close(async () => {
            await mongoose.connection.close();
            console.log('✅ Graceful shutdown complete');
            process.exit(0);
        });
    });

    module.exports = app;

