const NodeCache = require('node-cache');

// Standard TTL: 600 seconds (10 minutes) for current weather, checkperiod: 120 seconds
const weatherCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
// Forecast TTL: 1800 seconds (30 minutes)
const forecastCache = new NodeCache({ stdTTL: 1800, checkperiod: 300 });
// AI Insight TTL: 3600 seconds (1 hour)
const aiCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

module.exports = {
  weatherCache,
  forecastCache,
  aiCache,
  getCacheStats: () => ({
    weather: weatherCache.getStats(),
    forecast: forecastCache.getStats(),
    ai: aiCache.getStats(),
  }),
  clearAllCache: () => {
    weatherCache.flushAll();
    forecastCache.flushAll();
    aiCache.flushAll();
  },
};
