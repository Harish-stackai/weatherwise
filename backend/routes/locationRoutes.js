const express = require('express');
const {
  getFavorites,
  addFavorite,
  updateFavorite,
  removeFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFavorites)
  .post(addFavorite);

router.route('/:id')
  .put(updateFavorite)
  .delete(removeFavorite);

module.exports = router;
