const Settings = require('../models/Settings');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });
    if (!settings) {
      settings = await Settings.create({ user: req.user._id });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
  try {
    const {
      temperatureUnit,
      windSpeedUnit,
      pressureUnit,
      theme,
      aiModel,
      emailNotifications,
      severeWeatherAlerts,
      autoRefreshMinutes,
      customGeminiKey,
      customWeatherKey,
    } = req.body;

    let settings = await Settings.findOne({ user: req.user._id });
    if (!settings) {
      settings = new Settings({ user: req.user._id });
    }

    if (temperatureUnit) settings.temperatureUnit = temperatureUnit;
    if (windSpeedUnit) settings.windSpeedUnit = windSpeedUnit;
    if (pressureUnit) settings.pressureUnit = pressureUnit;
    if (theme) settings.theme = theme;
    if (aiModel) settings.aiModel = aiModel;
    if (emailNotifications !== undefined) settings.emailNotifications = emailNotifications;
    if (severeWeatherAlerts !== undefined) settings.severeWeatherAlerts = severeWeatherAlerts;
    if (autoRefreshMinutes !== undefined) settings.autoRefreshMinutes = autoRefreshMinutes;
    if (customGeminiKey !== undefined) settings.customGeminiKey = customGeminiKey;
    if (customWeatherKey !== undefined) settings.customWeatherKey = customWeatherKey;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
