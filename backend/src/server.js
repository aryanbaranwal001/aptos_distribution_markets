const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(apiLimiter);

// API routes
app.use(process.env.API_BASE_URL || '/api/v1', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Aptos Markets API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      markets: '/api/v1/markets',
      search: '/api/v1/markets/search',
      categories: '/api/v1/markets/categories',
      stats: '/api/v1/markets/stats'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: ${process.env.API_BASE_URL || '/api/v1'}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

module.exports = app;
