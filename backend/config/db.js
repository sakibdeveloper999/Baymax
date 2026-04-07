const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            tlsAllowInvalidCertificates: true,
        });
        console.log('✅ MongoDB Connected:', conn.connection.host);
        return conn;
    } catch (error) {
        console.error('❌ Database Connection Error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
