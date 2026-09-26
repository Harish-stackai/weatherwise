const User = require('../models/User');
const WeatherHistory = require('../models/WeatherHistory');
const FavoriteLocation = require('../models/FavoriteLocation');
const AIInsight = require('../models/AIInsight');
const ApiLog = require('../models/ApiLog');
const Notification = require('../models/Notification');
const { getCacheStats } = require('../services/cacheService');

// @desc    Get Admin Overview Statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getOverviewStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalSearches = await WeatherHistory.countDocuments({});
    const totalFavorites = await FavoriteLocation.countDocuments({});
    const totalAiInsights = await AIInsight.countDocuments({});
    const totalApiRequests = await ApiLog.countDocuments({});
    const fallbackRequests = await ApiLog.countDocuments({ isFallback: true });

    // Average API response time
    const avgResponseAgg = await ApiLog.aggregate([
      { $group: { _id: null, avgTime: { $avg: '$responseTimeMs' } } },
    ]);
    const avgResponseTime = avgResponseAgg[0] ? Math.round(avgResponseAgg[0].avgTime) : 45;

    // Cache Stats
    const cacheStats = getCacheStats();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSearches,
        totalFavorites,
        totalAiInsights,
        totalApiRequests,
        fallbackRequests,
        fallbackRate: totalApiRequests > 0 ? Math.round((fallbackRequests / totalApiRequests) * 100) : 0,
        avgResponseTimeMs: avgResponseTime,
        cacheStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search and pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const roleFilter = req.query.role || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (roleFilter) {
      query.role = roleFilter;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password');

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { role, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Clean up user data
    await WeatherHistory.deleteMany({ user: req.params.id });
    await FavoriteLocation.deleteMany({ user: req.params.id });
    await AIInsight.deleteMany({ user: req.params.id });
    await Notification.deleteMany({ user: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get API Logs for monitoring
// @route   GET /api/admin/logs
// @access  Private (Admin)
exports.getApiLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const total = await ApiLog.countDocuments({});
    const logs = await ApiLog.find({})
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Top Searched Cities & Search Analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getSearchAnalytics = async (req, res, next) => {
  try {
    // Top 10 cities
    const topCities = await WeatherHistory.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 }, avgTemp: { $avg: '$weather.temp' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Hourly search traffic
    const recentLogs = await ApiLog.aggregate([
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 },
          avgLatency: { $avg: '$responseTimeMs' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Endpoints breakdown
    const endpointBreakdown = await ApiLog.aggregate([
      { $group: { _id: '$endpoint', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        topCities,
        hourlyTraffic: recentLogs,
        endpointBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Broadcast Notification to all users
// @route   POST /api/admin/broadcast
// @access  Private (Admin)
exports.broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'system' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const users = await User.find({ status: 'active' }).select('_id');
    const notifications = users.map((u) => ({
      user: u._id,
      title,
      message,
      type,
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Broadcast message sent to ${users.length} active users.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all favorite locations across users (Admin)
// @route   GET /api/admin/favorites
// @access  Private (Admin)
exports.getAllAdminFavorites = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;

    const total = await FavoriteLocation.countDocuments({});
    const favorites = await FavoriteLocation.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any favorite location (Admin)
// @route   DELETE /api/admin/favorites/:id
// @access  Private (Admin)
exports.deleteFavoriteByAdmin = async (req, res, next) => {
  try {
    const favorite = await FavoriteLocation.findByIdAndDelete(req.params.id);
    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite location not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Favorite location removed by admin',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate executive system reports (Admin)
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.getAdminReports = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalSearches = await WeatherHistory.countDocuments({});
    const totalFavorites = await FavoriteLocation.countDocuments({});
    const totalInsights = await AIInsight.countDocuments({});
    const totalLogs = await ApiLog.countDocuments({});
    const fallbackCount = await ApiLog.countDocuments({ isFallback: true });

    // Recent error logs
    const recentErrors = await ApiLog.find({ statusCode: { $gte: 400 } })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('user', 'name email');

    // Popular cities in history
    const popularCities = await WeatherHistory.aggregate([
      { $group: { _id: '$city', totalQueries: { $sum: 1 }, avgTemp: { $avg: '$weather.temp' } } },
      { $sort: { totalQueries: -1 } },
      { $limit: 8 },
    ]);

    res.status(200).json({
      success: true,
      reportGeneratedAt: new Date().toISOString(),
      data: {
        summary: {
          totalUsers,
          totalSearches,
          totalFavorites,
          totalInsights,
          totalApiRequests: totalLogs,
          fallbackRequests: fallbackCount,
          reliabilityScore: totalLogs > 0 ? ((totalLogs - fallbackCount) / totalLogs * 100).toFixed(1) + '%' : '100%',
        },
        popularCities,
        recentErrors,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    System Health & Diagnostics
// @route   GET /api/admin/health
// @access  Private (Admin)
exports.getSystemHealth = async (req, res, next) => {
  try {
    const memory = process.memoryUsage();
    const uptime = process.uptime();

    res.status(200).json({
      success: true,
      status: 'OPERATIONAL',
      service: 'AI WeatherWise Enterprise API',
      uptimeSeconds: Math.floor(uptime),
      memory: {
        rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      },
      resilientFallbackMode: {
        status: 'READY_AND_ENGAGED',
        externalApis: {
          openWeather: process.env.OPENWEATHER_API_KEY ? 'CONFIGURED' : 'FALLBACK_SIMULATION',
          geminiAI: process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'SMART_FALLBACK_SIMULATION',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

