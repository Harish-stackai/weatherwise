const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
      index: true,
    },
    responseTimeMs: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ip: {
      type: String,
      default: '',
    },
    cityQueried: {
      type: String,
      default: '',
      index: true,
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

apiLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ApiLog', apiLogSchema);
