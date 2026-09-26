const express = require('express');
const { check } = require('express-validator');
const {
  generateWeatherInsight,
  getSavedInsights,
  askAssistant,
} = require('../controllers/aiController');
const { optionalAuth, protect } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

router.post(
  '/insights',
  optionalAuth,
  [check('city', 'City name is required').not().isEmpty(), validate],
  generateWeatherInsight
);

router.post(
  '/recommendations',
  optionalAuth,
  [check('city', 'City name is required').not().isEmpty(), validate],
  generateWeatherInsight
);

router.get('/insights', protect, getSavedInsights);

router.post(
  '/ask',
  optionalAuth,
  [
    check('city', 'City name is required').not().isEmpty(),
    check('question', 'Question is required').not().isEmpty(),
    validate,
  ],
  askAssistant
);

module.exports = router;
