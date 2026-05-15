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

// Public routes
app.use('/api/auth', authRoutes);

// ──── TODO: Add Protected Routes ────
// Once more controllers are created, add:
// app.use('/api/stores', verifyToken, checkSubscription, storeRoutes);
// app.use('/api/products', verifyToken, checkSubscription, productRoutes);
// app.use('/api/orders', verifyToken, checkSubscription, orderRoutes);
// ... (add 20 more route groups as per the guide)

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

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: message,
        code: err.code || 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// ══════════════════════════════════
// START SERVER
// ══════════════════════════════════

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n🚀 OmniPOS Backend v4.0`);
    console.log(`   API running on port ${PORT}`);
    console.log(`   Base URL: ${process.env.API_BASE_URL}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   Socket.io ready on ws://localhost:${PORT}`);
    console.log(`\n📋 API Documentation:`);
    console.log(`   POST   /api/auth/signup      - Create new tenant`);
    console.log(`   POST   /api/auth/login       - Login user`);
    console.log(`   GET    /api/auth/me          - Get current user`);
    console.log(`   POST   /api/auth/refresh-token - Refresh access token`);
    console.log(`\n💡 Tip: Run 'npm run seed' to populate database with test data`);
    console.log('');
});

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

