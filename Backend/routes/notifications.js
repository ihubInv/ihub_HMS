const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getNotificationStats
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Get all notifications for user
router.get('/', getNotifications);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Create notification (Admin only)
router.post('/', authorize('admin'), createNotification);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

module.exports = router;