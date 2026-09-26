const FavoriteLocation = require('../models/FavoriteLocation');
const weatherService = require('../services/weatherService');

// @desc    Get all favorite locations with live weather enrichment
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await FavoriteLocation.find({ user: req.user._id }).sort({ isPinned: -1, createdAt: -1 });

    // Enrich favorites with live weather in parallel
    const enriched = await Promise.all(
      favorites.map(async (fav) => {
        const favObj = fav.toObject();
        try {
          const live = await weatherService.getCurrentWeather(fav.name);
          favObj.currentWeather = {
            temp: live.weather.temp,
            condition: live.weather.condition,
            icon: live.weather.icon,
            humidity: live.weather.humidity,
            windSpeed: live.weather.windSpeed,
            feelsLike: live.weather.feelsLike,
          };
        } catch (e) {
          favObj.currentWeather = null;
        }
        return favObj;
      })
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add favorite location
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res, next) => {
  try {
    const { country, lat, lon, customLabel, notes, isPinned } = req.body;
    const name = req.body.city || req.body.name;

    if (!name) {
      return res.status(400).json({ success: false, message: 'City is required.' });
    }

    // Default coords if not supplied
    let latitude = lat;
    let longitude = lon;
    if (latitude === undefined || longitude === undefined) {
      const weather = await weatherService.getCurrentWeather(name);
      latitude = weather.coordinates.lat;
      longitude = weather.coordinates.lon;
    }

    const existing = await FavoriteLocation.findOne({ user: req.user._id, name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(400).json({ success: false, message: `${name} is already in your favorite locations.` });
    }

    const favorite = await FavoriteLocation.create({
      user: req.user._id,
      name,
      country: country || '',
      lat: latitude,
      lon: longitude,
      customLabel: customLabel || '',
      notes: notes || '',
      isPinned: isPinned || false,
    });

    res.status(201).json({
      success: true,
      message: `${name} added to favorites`,
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update favorite location
// @route   PUT /api/favorites/:id
// @access  Private
exports.updateFavorite = async (req, res, next) => {
  try {
    const { customLabel, notes, isPinned } = req.body;

    const favorite = await FavoriteLocation.findOne({ _id: req.params.id, user: req.user._id });
    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite location not found.' });
    }

    if (customLabel !== undefined) favorite.customLabel = customLabel;
    if (notes !== undefined) favorite.notes = notes;
    if (isPinned !== undefined) favorite.isPinned = isPinned;

    await favorite.save();

    res.status(200).json({
      success: true,
      message: 'Favorite updated successfully',
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove favorite location
// @route   DELETE /api/favorites/:id
// @access  Private
exports.removeFavorite = async (req, res, next) => {
  try {
    const favorite = await FavoriteLocation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite location not found.' });
    }

    res.status(200).json({
      success: true,
      message: `${favorite.name} removed from favorites.`,
    });
  } catch (error) {
    next(error);
  }
};
