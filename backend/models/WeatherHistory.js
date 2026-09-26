const mongoose = require('mongoose');

const weatherHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    coordinates: {
      lat: { type: Number },
      lon: { type: Number },
    },
    weather: {
      temp: Number,
      temp_min: Number,
      temp_max: Number,
      feelsLike: Number,
      condition: String,
      description: String,
      icon: String,
      humidity: Number,
      windSpeed: Number,
      windDirection: Number,
      pressure: Number,
      visibility: Number,
      uvIndex: Number,
      aqi: Number,
      aqiLabel: String,
      isFallback: { type: Boolean, default: false },
    },
    searchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

weatherHistorySchema.index({ user: 1, searchedAt: -1 });

module.exports = mongoose.model('WeatherHistory', weatherHistorySchema);
