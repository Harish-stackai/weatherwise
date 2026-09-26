const geminiService = require('../services/geminiService');
const weatherService = require('../services/weatherService');
const AIInsight = require('../models/AIInsight');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');

// @desc    Generate Weather Insights using Google Gemini AI
// @route   POST /api/ai/insights
// @access  Public (Enhanced if Authenticated)
exports.generateWeatherInsight = async (req, res, next) => {
  try {
    const { city } = req.body;
    if (!city || city.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a city name.' });
    }

    let customKey = null;
    let customModel = 'gemini-1.5-flash';

    if (req.user) {
      const userSettings = await Settings.findOne({ user: req.user._id });
      if (userSettings) {
        if (userSettings.customGeminiKey) customKey = userSettings.customGeminiKey;
        if (userSettings.aiModel) customModel = userSettings.aiModel;
      }
    }

    // First fetch current weather for this city
    const currentWeather = await weatherService.getCurrentWeather(city);

    // Call Gemini AI service
    const insightData = await geminiService.generateWeatherInsights(
      currentWeather.city,
      currentWeather.weather,
      customKey,
      customModel
    );

    // Save to database
    let savedRecord = null;
    try {
      savedRecord = await AIInsight.create({
        user: req.user ? req.user._id : null,
        city: insightData.city,
        country: insightData.country,
        weatherSnapshot: insightData.weatherSnapshot,
        summary: insightData.summary,
        recommendations: insightData.recommendations,
        source: insightData.source,
        modelUsed: insightData.modelUsed,
      });

      // If severe weather detected and user is logged in, create high priority alert
      if (req.user && insightData.recommendations.severeAlerts?.isSevere) {
        await Notification.create({
          user: req.user._id,
          title: `⚠️ Severe Weather Alert: ${insightData.city}`,
          message: insightData.recommendations.severeAlerts.headline,
          type: 'alert',
        });
      }
    } catch (dbErr) {
      console.error('AIInsight DB save error:', dbErr.message);
    }

    res.status(200).json({
      success: true,
      data: {
        ...(savedRecord ? savedRecord.toObject() : insightData),
        weatherSnapshot: currentWeather.weather,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Saved AI Insights
// @route   GET /api/ai/insights
// @access  Private
exports.getSavedInsights = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const insights = await AIInsight.find({ user: req.user._id })
      .sort({ generatedAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: insights.length,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ask Weather Assistant (Interactive Chat Q&A)
// @route   POST /api/ai/ask
// @access  Public
exports.askAssistant = async (req, res, next) => {
  try {
    const { city, question } = req.body;
    if (!city || !question) {
      return res.status(400).json({ success: false, message: 'Please provide both city and question.' });
    }

    let customKey = null;
    if (req.user) {
      const userSettings = await Settings.findOne({ user: req.user._id });
      if (userSettings && userSettings.customGeminiKey) {
        customKey = userSettings.customGeminiKey;
      }
    }

    const currentWeather = await weatherService.getCurrentWeather(city);
    const result = await geminiService.askWeatherAssistant(
      currentWeather.city,
      currentWeather.weather,
      question,
      customKey
    );

    res.status(200).json({
      success: true,
      city: currentWeather.city,
      question,
      answer: result.answer,
      source: result.source,
    });
  } catch (error) {
    next(error);
  }
};
