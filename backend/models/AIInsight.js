const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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
    },
    weatherSnapshot: {
      temp: Number,
      condition: String,
      humidity: Number,
      windSpeed: Number,
      uvIndex: Number,
    },
    summary: {
      type: String,
      required: true,
    },
    recommendations: {
      travel: {
        status: { type: String, enum: ['Favorable', 'Caution', 'Hazardous'], default: 'Favorable' },
        precautions: [String],
        advice: String,
      },
      clothing: {
        primary: String,
        accessories: [String],
        layers: String,
      },
      activities: {
        outdoor: [String],
        indoor: [String],
        bestTimeOfDay: String,
      },
      severeAlerts: {
        isSevere: { type: Boolean, default: false },
        riskLevel: { type: String, enum: ['None', 'Low', 'Moderate', 'High', 'Extreme'], default: 'None' },
        headline: String,
        instructions: [String],
      },
    },
    source: {
      type: String,
      enum: ['gemini-ai', 'smart-fallback-engine'],
      default: 'gemini-ai',
    },
    modelUsed: {
      type: String,
      default: 'gemini-1.5-flash',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AIInsight', aiInsightSchema);
