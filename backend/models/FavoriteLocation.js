const mongoose = require('mongoose');

const favoriteLocationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    state: {
      type: String,
      default: '',
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    customLabel: {
      type: String,
      default: '',
      trim: true,
      maxlength: 50,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 300,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

favoriteLocationSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('FavoriteLocation', favoriteLocationSchema);
