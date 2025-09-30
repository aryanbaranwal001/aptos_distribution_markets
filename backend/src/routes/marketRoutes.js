const express = require('express');
const marketController = require('../controllers/marketController');
const { validationRules, handleValidationErrors } = require('../middleware/validation');
const { searchLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// GET /api/v1/markets - Get markets with filtering, pagination, and sorting
router.get('/',
  validationRules.getMarkets,
  handleValidationErrors,
  marketController.getMarkets
);

// GET /api/v1/markets/search - Search markets
router.get('/search',
  searchLimiter,
  validationRules.searchMarkets,
  handleValidationErrors,
  marketController.searchMarkets
);

// GET /api/v1/markets/categories - Get all categories
router.get('/categories',
  marketController.getCategories
);

// GET /api/v1/markets/stats - Get market statistics
router.get('/stats',
  marketController.getMarketStats
);

// GET /api/v1/markets/category/:category - Get markets by category
router.get('/category/:category',
  validationRules.getMarketsByCategory,
  handleValidationErrors,
  marketController.getMarketsByCategory
);

// GET /api/v1/markets/:id - Get single market by ID
router.get('/:id',
  validationRules.getMarketById,
  handleValidationErrors,
  marketController.getMarketById
);

module.exports = router;
