const express = require('express');
const {
  getHistory,
  deleteHistoryItem,
  clearHistory,
  exportHistory,
} = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getHistory)
  .delete(clearHistory);

router.get('/export', exportHistory);

router.delete('/:id', deleteHistoryItem);

module.exports = router;
