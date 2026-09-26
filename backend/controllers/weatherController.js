const weatherService = require('../services/weatherService');
const WeatherHistory = require('../models/WeatherHistory');
const Settings = require('../models/Settings');

// @desc    Get Current Weather for City
// @route   GET /api/weather/current
// @access  Public (Enhanced if Authenticated)
exports.getCurrentWeather = async (req, res, next) => {
  try {
    const city = req.query.city || 'London';
    let customKey = null;

    // Check if user has custom key in settings
    if (req.user) {
      const userSettings = await Settings.findOne({ user: req.user._id });
      if (userSettings && userSettings.customWeatherKey) {
        customKey = userSettings.customWeatherKey;
      }
    }

    const data = await weatherService.getCurrentWeather(city, customKey);

    // Save to user history if logged in
    if (req.user) {
      WeatherHistory.create({
        user: req.user._id,
        city: data.city,
        country: data.country,
        coordinates: data.coordinates,
        weather: data.weather,
      }).catch((e) => console.error('History save error:', e.message));
    }

    res.locals.isFallback = data.weather.isFallback || false;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Multi-Day Weather Forecast
// @route   GET /api/weather/forecast
// @access  Public
exports.getForecast = async (req, res, next) => {
  try {
    const city = req.query.city || 'London';
    const days = parseInt(req.query.days, 10) || 7;
    let customKey = null;

    if (req.user) {
      const userSettings = await Settings.findOne({ user: req.user._id });
      if (userSettings && userSettings.customWeatherKey) {
        customKey = userSettings.customWeatherKey;
      }
    }

    const data = await weatherService.getForecast(city, days, customKey);
    res.locals.isFallback = data.isFallback || false;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search Locations (Autocomplete)
// @route   GET /api/weather/search
// @access  Public
exports.searchLocations = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const results = weatherService.searchLocations(query);
    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Weather Analytics for User
// @route   GET /api/weather/analytics
// @access  Private
exports.getUserWeatherAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Top searched cities by user
    const topCities = await WeatherHistory.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$city', count: { $sum: 1 }, lastTemp: { $last: '$weather.temp' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Total searches
    const totalSearches = await WeatherHistory.countDocuments({ user: userId });

    // Recent 10 searches
    const recentSearches = await WeatherHistory.find({ user: userId })
      .sort({ searchedAt: -1 })
      .limit(10)
      .select('city country weather.temp weather.condition searchedAt');

    res.status(200).json({
      success: true,
      data: {
        totalSearches,
        topCities,
        recentSearches,
      },
    });
  } catch (error) {
    next(error);
  }
};
