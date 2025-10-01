const { db, COLLECTIONS } = require('../config/firebase');
const { getCachedData, setCachedData, CACHE_KEYS, cache } = require('../config/cache');

// Mock data for development when Firebase is not available
const mockMarkets = [
  {
    id: 'mock-1',
    title: 'Will Bitcoin reach $100k by end of 2024?',
    description: 'Prediction market for Bitcoin price target',
    volume: 125000,
    categories: ['crypto'],
    iconName: 'bitcoin.png',
    address: '0x123...',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    market_mean: 75000,
    market_mean_min: 50000,
    market_mean_max: 150000,
    market_standard_deviation: 15000,
    market_standard_deviation_min: 5000,
    market_standard_deviation_max: 25000,
    min_sigma: 1000,
    Lambda: 0.1,
    peak_p: 0.8,
    headroom: 0.2,
    s: 1.5,
    mu_per_one: 1.0,
    sigma_per_one: 0.5,
    x_axis_field_name: 'Price (USD)',
    x_axis_short_form: 'USD'
  },
  {
    id: 'mock-2',
    title: 'US Presidential Election 2024',
    description: 'Prediction market for 2024 US Presidential Election outcome',
    volume: 250000,
    categories: ['politics', 'elections'],
    iconName: 'usa.png',
    address: '0x456...',
    startDate: '2024-01-01',
    endDate: '2024-11-05',
    market_mean: 0.5,
    market_mean_min: 0.0,
    market_mean_max: 1.0,
    market_standard_deviation: 0.2,
    market_standard_deviation_min: 0.1,
    market_standard_deviation_max: 0.4,
    min_sigma: 0.05,
    Lambda: 0.15,
    peak_p: 0.6,
    headroom: 0.3,
    s: 2.0,
    mu_per_one: 0.8,
    sigma_per_one: 0.3,
    x_axis_field_name: 'Probability',
    x_axis_short_form: 'P'
  }
];

class MarketService {
  // Get markets with pagination, filtering, and sorting
  async getMarkets(options = {}) {
    const {
      category = null,
      page = 1,
      limit = 20,
      sort = 'volume',
      order = 'desc'
    } = options;

    try {
      // Create cache key
      const cacheKey = `markets_${category || 'all'}_${page}_${limit}_${sort}_${order}`;
      
      // Check cache first
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      let markets = [];
      let totalCount = 0;

      // Use mock data if Firebase is not available or fails
      if (!db) {
        console.log('📝 Using mock data for markets (Firebase not available)');
        let filteredMarkets = [...mockMarkets];

        // Apply category filter
        if (category && category !== 'trending') {
          filteredMarkets = filteredMarkets.filter(market => 
            market.categories.includes(category)
          );
        }

        // Apply sorting
        filteredMarkets.sort((a, b) => {
          let aVal, bVal;
          
          if (sort === 'date') {
            aVal = new Date(a.startDate || 0);
            bVal = new Date(b.startDate || 0);
          } else {
            aVal = a[sort] || 0;
            bVal = b[sort] || 0;
          }
          
          if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });

        totalCount = filteredMarkets.length;
        
        // Apply pagination
        const offset = (page - 1) * limit;
        markets = filteredMarkets.slice(offset, offset + limit);
      } else {
        // Try Firebase, fallback to mock data on error
        try {
          let query = db.collection(COLLECTIONS.MARKETS_MINIMAL);

          // Apply category filter
          if (category && category !== 'trending') {
            query = query.where('categories', 'array-contains', category);
          }

          // Get all matching documents first (to avoid compound index requirements)
          const snapshot = await query.get();
          let allMarkets = [];
          snapshot.forEach(doc => {
            allMarkets.push({
              id: doc.id,
              ...doc.data()
            });
          });

          // Apply sorting in memory
          allMarkets.sort((a, b) => {
            let aVal, bVal;
            
            if (sort === 'date') {
              aVal = new Date(a.startDate || 0);
              bVal = new Date(b.startDate || 0);
            } else {
              aVal = a[sort] || 0;
              bVal = b[sort] || 0;
            }
            
            if (order === 'asc') {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          });

          totalCount = allMarkets.length;
          
          // Apply pagination
          const offset = (page - 1) * limit;
          markets = allMarkets.slice(offset, offset + limit);

          console.log(`🔥 Retrieved ${markets.length} markets from Firestore (${totalCount} total)`);
        } catch (firestoreError) {
          console.warn('⚠️  Firestore query failed, falling back to mock data:', firestoreError.message);
          
          // Fallback to mock data
          let filteredMarkets = [...mockMarkets];

          // Apply category filter
          if (category && category !== 'trending') {
            filteredMarkets = filteredMarkets.filter(market => 
              market.categories.includes(category)
            );
          }

          // Apply sorting
          filteredMarkets.sort((a, b) => {
            let aVal, bVal;
            
            if (sort === 'date') {
              aVal = new Date(a.startDate || 0);
              bVal = new Date(b.startDate || 0);
            } else {
              aVal = a[sort] || 0;
              bVal = b[sort] || 0;
            }
            
            if (order === 'asc') {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          });

          totalCount = filteredMarkets.length;
          
          // Apply pagination
          const offset = (page - 1) * limit;
          markets = filteredMarkets.slice(offset, offset + limit);
          
          console.log('📝 Using mock data fallback for markets');
        }
      }

      const result = {
        markets,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      };

      // Cache the result
      setCachedData(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error fetching markets:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        options: { category, page, limit, sort, order }
      });
      throw new Error('Failed to fetch markets');
    }
  }

  // Get single market with full details
  async getMarketById(id) {
    try {
      // Check cache first
      const cacheKey = `market_${id}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      let market = null;

      // Use mock data if Firebase is not available
      if (!db) {
        console.log('📝 Using mock data for single market');
        market = mockMarkets.find(m => m.id === id);
      } else {
        // Try full collection first for complete data including AI context
        let doc = await db.collection(COLLECTIONS.MARKETS_FULL).doc(id).get();
        
        if (!doc.exists) {
          // Fallback to minimal collection
          doc = await db.collection(COLLECTIONS.MARKETS_MINIMAL).doc(id).get();
        }

        if (doc.exists) {
          market = {
            id: doc.id,
            ...doc.data()
          };
        }
      }

      if (!market) {
        return null;
      }

      // Cache the result
      setCachedData(cacheKey, market);

      return market;
    } catch (error) {
      console.error('Error fetching market by ID:', error);
      throw new Error('Failed to fetch market');
    }
  }

  // Search markets
  async searchMarkets(searchQuery, page = 1, limit = 20) {
    try {
      // Check cache first
      const cacheKey = `search_${searchQuery}_${page}_${limit}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      let allMarkets = [];

      // Use mock data if Firebase is not available
      if (!db) {
        console.log('📝 Using mock data for search');
        allMarkets = [...mockMarkets];
      } else {
        // Since Firestore doesn't support full-text search natively,
        // we'll implement a simple search by fetching all markets and filtering
        // In production, consider using Algolia or Elasticsearch for better search
        
        const snapshot = await db.collection(COLLECTIONS.MARKETS_MINIMAL).get();
        snapshot.forEach(doc => {
          allMarkets.push({
            id: doc.id,
            ...doc.data()
          });
        });
      }

      // Filter markets based on search query
      const query = searchQuery.toLowerCase();
      const filteredMarkets = allMarkets.filter(market => 
        market.title.toLowerCase().includes(query) ||
        market.description.toLowerCase().includes(query) ||
        market.categories.some(cat => cat.toLowerCase().includes(query))
      );

      // Apply pagination
      const totalCount = filteredMarkets.length;
      const offset = (page - 1) * limit;
      const paginatedMarkets = filteredMarkets.slice(offset, offset + limit);

      const result = {
        markets: paginatedMarkets,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      };

      // Cache the result
      setCachedData(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error searching markets:', error);
      throw new Error('Failed to search markets');
    }
  }

  // Get markets by specific category
  async getMarketsByCategory(category, page = 1, limit = 20) {
    return this.getMarkets({ category, page, limit });
  }

  // Get all available categories
  async getCategories() {
    // Check cache first
    const cacheKey = CACHE_KEYS.CATEGORIES;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      // Get unique categories from markets
      const snapshot = await db.collection(COLLECTIONS.MARKETS_MINIMAL)
        .select('categories')
        .get();

      const categoriesSet = new Set();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.categories) {
          data.categories.forEach(cat => categoriesSet.add(cat));
        }
      });

      const categories = Array.from(categoriesSet).sort();

      // Cache the result for longer time as categories don't change often
      cache.set(cacheKey, categories, 1800); // 30 minutes

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  // Get market statistics
  async getMarketStats() {
    try {
      const snapshot = await db.collection(COLLECTIONS.MARKETS_MINIMAL).get();
      
      let totalVolume = 0;
      const categoryStats = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        totalVolume += data.volume || 0;
        
        data.categories?.forEach(category => {
          if (!categoryStats[category]) {
            categoryStats[category] = { count: 0, volume: 0 };
          }
          categoryStats[category].count++;
          categoryStats[category].volume += data.volume || 0;
        });
      });

      return {
        totalMarkets: snapshot.size,
        totalVolume,
        categoryStats
      };
    } catch (error) {
      console.error('Error fetching market stats:', error);
      throw new Error('Failed to fetch market statistics');
    }
  }
}

module.exports = MarketService;
