const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'rensto-saas-api'
  });
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    message: 'Rensto SaaS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Tenant endpoints
app.get('/api/tenants', (req, res) => {
  res.json({
    message: 'Tenant management endpoint',
    timestamp: new Date().toISOString(),
    status: 'ready'
  });
});

app.post('/api/tenants', (req, res) => {
  res.json({
    message: 'Create tenant endpoint',
    timestamp: new Date().toISOString(),
    status: 'ready'
  });
});

// Subscription endpoints
app.get('/api/subscriptions', (req, res) => {
  res.json({
    message: 'Subscription management endpoint',
    timestamp: new Date().toISOString(),
    status: 'ready'
  });
});

app.post('/api/subscriptions', (req, res) => {
  res.json({
    message: 'Create subscription endpoint',
    timestamp: new Date().toISOString(),
    status: 'ready'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rensto-saas';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Rensto SaaS API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
