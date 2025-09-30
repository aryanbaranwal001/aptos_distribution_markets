const NodeCache = require('node-cache');
require('dotenv').config();

// Cache configuration
const cacheConfig = {
  stdTTL: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Better performance
};

// Create cache instance
const cache = new NodeCache(cacheConfig);

// Cache keys
const CACHE_KEYS = {
  MARKETS_BY_CATEGORY: (category, page, limit) => `markets_${category}_${page}_${limit}`,
  MARKET_DETAIL: (id) => `market_detail_${id}`,
  CATEGORIES: 'categories_list',
  SEARCH_RESULTS: (query, page, limit) => `search_${query}_${page}_${limit}`,
  MARKET_COUNT: (category) => `market_count_${category}`
};

// Cache wrapper functions
const cacheWrapper = {
  get: (key) => {
    if (process.env.ENABLE_CACHE === 'false') return null;
    return cache.get(key);
  },
  
  set: (key, value, ttl = null) => {
    if (process.env.ENABLE_CACHE === 'false') return false;
    return cache.set(key, value, ttl);
  },
  
  del: (key) => {
    return cache.del(key);
  },
  
  flush: () => {
    return cache.flushAll();
  },
  
  getStats: () => {
    return cache.getStats();
  }
};

// Export individual functions for easier use
const getCachedData = (key) => cacheWrapper.get(key);
const setCachedData = (key, value, ttl = null) => cacheWrapper.set(key, value, ttl);

module.exports = {
  cache: cacheWrapper,
  getCachedData,
  setCachedData,
  CACHE_KEYS
};
