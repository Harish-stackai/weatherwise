const express = require('express');
const {
  getOverviewStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getApiLogs,
  getSearchAnalytics,
  broadcastNotification,
  getSystemHealth,
  getAllAdminFavorites,
  deleteFavoriteByAdmin,
  getAdminReports,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

// Require both authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getOverviewStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/favorites', getAllAdminFavorites);
router.delete('/favorites/:id', deleteFavoriteByAdmin);
router.get('/logs', getApiLogs);
router.get('/analytics', getSearchAnalytics);
router.get('/reports', getAdminReports);
router.post('/broadcast', broadcastNotification);
router.get('/health', getSystemHealth);

module.exports = router;
