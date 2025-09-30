const MarketService = require('../services/marketService');
const marketService = new MarketService();

class MarketController {
  // Get markets with filtering, pagination, and sorting
  async getMarkets(req, res, next) {
    try {
      const {
        category,
        page = 1,
        limit = 20,
        sort = 'volume',
        order = 'desc'
      } = req.query;

      const options = {
        category,
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order
      };

      const result = await marketService.getMarkets(options);

      res.json({
        success: true,
        data: result,
        message: 'Markets fetched successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single market by ID
  async getMarketById(req, res, next) {
    try {
      const { id } = req.params;
      const market = await marketService.getMarketById(id);

      res.json({
        success: true,
        data: market,
        message: 'Market details fetched successfully'
      });
    } catch (error) {
      if (error.message === 'Market not found') {
        return res.status(404).json({
          success: false,
          message: 'Market not found'
        });
      }
      next(error);
    }
  }

  // Search markets
  async searchMarkets(req, res, next) {
    try {
      const {
        q: searchQuery,
        page = 1,
        limit = 20
      } = req.query;

      const result = await marketService.searchMarkets(
        searchQuery,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result,
        message: 'Search completed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get markets by category
  async getMarketsByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const {
        page = 1,
        limit = 20
      } = req.query;

      const result = await marketService.getMarketsByCategory(
        category,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: result,
        message: `Markets in category '${category}' fetched successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all categories
  async getCategories(req, res, next) {
    try {
      const categories = await marketService.getCategories();

      res.json({
        success: true,
        data: categories,
        message: 'Categories fetched successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get market statistics
  async getMarketStats(req, res, next) {
    try {
      const stats = await marketService.getMarketStats();

      res.json({
        success: true,
        data: stats,
        message: 'Market statistics fetched successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MarketController();
