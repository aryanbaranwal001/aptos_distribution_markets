const express = require('express');
const marketRoutes = require('./marketRoutes');
const chatRoutes = require('./chatRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/markets', marketRoutes);
router.use('/chat', chatRoutes);

module.exports = router;
