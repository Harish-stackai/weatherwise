const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    temperatureUnit: {
      type: String,
      enum: ['C', 'F'],
      default: 'C',
    },
    windSpeedUnit: {
      type: String,
      enum: ['kmh', 'mph', 'ms'],
      default: 'kmh',
    },
    pressureUnit: {
      type: String,
      enum: ['hPa', 'inHg'],
      default: 'hPa',
    },
    theme: {
      type: String,
      enum: ['dark', 'light', 'cyber'],
      default: 'dark',
    },
    aiModel: {
      type: String,
      enum: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
      default: 'gemini-1.5-flash',
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    severeWeatherAlerts: {
      type: Boolean,
      default: true,
    },
    autoRefreshMinutes: {
      type: Number,
      default: 15,
      min: 5,
      max: 120,
    },
    customGeminiKey: {
      type: String,
      default: '',
    },
    customWeatherKey: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
