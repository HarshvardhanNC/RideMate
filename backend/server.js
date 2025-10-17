const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const compression = require('compression');
const http = require('http');
const webSocketService = require('./services/websocket');

// Load environment variables
dotenv.config();

// Import security middleware
const { securityConfig, sanitizeInput, securityLogger } = require('./middleware/security');
const { generalLimiter, authLimiter, rideCreationLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');
const userRoutes = require('./routes/users');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Security configuration
const { helmetConfig, corsConfig } = securityConfig();

// Production-ready security middleware
app.use(helmetConfig);
app.use(corsConfig);
app.use(compression());
app.use(securityLogger);
app.use(sanitizeInput);

// Rate limiting
app.use(generalLimiter);

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware with security limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    if (buf.length > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Request too large');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'RideMate API is running',
    timestamp: new Date().toISOString()
  });
});

// API Documentation endpoint (simplified)
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'RideMate API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      rides: '/api/rides',
      users: '/api/users'
    }
  });
});

// API routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/rides', rideCreationLimiter, rideRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to RideMate API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      rides: '/api/rides',
      users: '/api/users'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// Import database connection
const connectDB = require('./config/database');

// Swagger will be added later

// Initialize WebSocket service
webSocketService.initialize(server);

// Make WebSocket service available to routes
app.set('io', webSocketService.io);

// Start server
const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`🚀 RideMate API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`🔌 Socket.IO enabled for real-time updates`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

module.exports = app;
