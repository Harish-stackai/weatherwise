const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'weatherwise_super_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, defaultLocation } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // First registered user can optionally become admin if specified or if email contains 'admin'
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser || email.toLowerCase().includes('admin@weatherwise.com') ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password,
      role,
      defaultLocation: defaultLocation || { city: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
    });

    // Create default settings for user
    await Settings.create({
      user: user._id,
      temperatureUnit: 'C',
      windSpeedUnit: 'kmh',
      theme: 'dark',
      aiModel: 'gemini-1.5-flash',
    });

    // Create welcome notification
    await Notification.create({
      user: user._id,
      title: 'Welcome to AI WeatherWise!',
      message: 'Explore live meteorological forecasts, generate Gemini AI summaries, and save your favorite cities.',
      type: 'system',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        defaultLocation: user.defaultLocation,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account has been suspended by an administrator.' });
    }

    // Update lastLogin
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Fetch user settings
    let userSettings = await Settings.findOne({ user: user._id });
    if (!userSettings) {
      userSettings = await Settings.create({ user: user._id });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        defaultLocation: user.defaultLocation,
        preferences: user.preferences,
        settings: userSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let settings = await Settings.findOne({ user: req.user.id });
    if (!settings) {
      settings = await Settings.create({ user: req.user.id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        defaultLocation: user.defaultLocation,
        preferences: user.preferences,
        settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({ success: true, message: 'Password updated successfully', token });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed demo admin and demo user
// @route   POST /api/auth/seed
// @access  Public
exports.seedDemoUsers = async (req, res, next) => {
  try {
    let admin = await User.findOne({ email: 'admin@weatherwise.com' });
    if (!admin) {
      admin = await User.create({
        name: 'WeatherWise Admin',
        email: 'admin@weatherwise.com',
        password: 'AdminPassword123!',
        role: 'admin',
        bio: 'Lead System Administrator & Meteorology Architect',
        defaultLocation: { city: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
      });
      await Settings.create({ user: admin._id, temperatureUnit: 'C', theme: 'dark' });
      await Notification.create({
        user: admin._id,
        title: 'Admin Console Initialized',
        message: 'Welcome to the WeatherWise Admin Portal. Monitor analytics and API metrics.',
        type: 'system',
      });
    }

    let demoUser = await User.findOne({ email: 'user@weatherwise.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Rivera',
        email: 'user@weatherwise.com',
        password: 'UserPassword123!',
        role: 'user',
        bio: 'Outdoor enthusiast, marathon runner, and aviation hobbyist.',
        defaultLocation: { city: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
      });
      await Settings.create({ user: demoUser._id, temperatureUnit: 'C', theme: 'cyber' });
      await Notification.create({
        user: demoUser._id,
        title: 'AI Insight Ready',
        message: 'Check out today’s Gemini weather summary and clothing advisory for Paris.',
        type: 'recommendation',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Demo credentials verified/seeded successfully',
      demoAccounts: {
        admin: { email: 'admin@weatherwise.com', password: 'AdminPassword123!', role: 'admin' },
        user: { email: 'user@weatherwise.com', password: 'UserPassword123!', role: 'user' },
      },
    });
  } catch (error) {
    next(error);
  }
};
