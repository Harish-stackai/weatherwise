const express = require('express');
const {
  getCurrentWeather,
  getForecast,
  searchLocations,
  getUserWeatherAnalytics,
} = require('../controllers/weatherController');
const { optionalAuth, protect } = require('../middleware/auth');

const router = express.Router();

router.get('/current', optionalAuth, getCurrentWeather);
router.get('/forecast', optionalAuth, getForecast);
router.get('/search', searchLocations);
router.get('/analytics', protect, getUserWeatherAnalytics);

module.exports = router;
