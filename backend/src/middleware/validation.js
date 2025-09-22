const { body, query, param, validationResult } = require('express-validator');

// Validation rules for different endpoints
const validationRules = {
  // Market query validation
  getMarkets: [
    query('category')
      .optional()
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category must be a string between 1-50 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1-100'),
    query('sort')
      .optional()
      .isIn(['volume', 'endDate', 'startDate', 'title'])
      .withMessage('Sort must be one of: volume, endDate, startDate, title'),
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be asc or desc')
  ],

  // Market detail validation
  getMarketById: [
    param('id')
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Market ID must be a string between 1-50 characters')
  ],

  // Search validation
  searchMarkets: [
    query('q')
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1-100 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1-50')
  ],

  // Category validation
  getMarketsByCategory: [
    param('category')
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Category must be a string between 1-50 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1-100')
  ]
};

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

module.exports = {
  validationRules,
  handleValidationErrors
};
