const WeatherHistory = require('../models/WeatherHistory');

// @desc    Get user weather search history with pagination & search
// @route   GET /api/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = { user: req.user._id };
    if (search) {
      query.city = { $regex: search, $options: 'i' };
    }

    const total = await WeatherHistory.countDocuments(query);
    const history = await WeatherHistory.find(query)
      .sort({ searchedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: history.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single history item
// @route   DELETE /api/history/:id
// @access  Private
exports.deleteHistoryItem = async (req, res, next) => {
  try {
    const item = await WeatherHistory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'History record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'History record deleted.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all history for user
// @route   DELETE /api/history
// @access  Private
exports.clearHistory = async (req, res, next) => {
  try {
    const result = await WeatherHistory.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} history records successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export history (JSON or CSV)
// @route   GET /api/history/export
// @access  Private
exports.exportHistory = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const history = await WeatherHistory.find({ user: req.user._id }).sort({ searchedAt: -1 });

    if (format === 'csv') {
      let csv = 'City,Country,Temperature (°C),Condition,Humidity (%),Wind Speed (km/h),Date\n';
      history.forEach((h) => {
        csv += `"${h.city}","${h.country || ''}",${h.weather?.temp || 0},"${h.weather?.condition || ''}",${h.weather?.humidity || 0},${h.weather?.windSpeed || 0},"${new Date(h.searchedAt).toISOString()}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="weatherwise_history.csv"');
      return res.status(200).send(csv);
    }

    // Default JSON
    res.status(200).json({
      success: true,
      exportedAt: new Date().toISOString(),
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
