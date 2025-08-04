const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadProfileImage,
  getUserStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Get user statistics (Admin/Warden only)
router.get('/stats', authorize('admin', 'warden'), getUserStats);

// Get all users (Admin/Warden only)
router.get('/', authorize('admin', 'warden'), getUsers);

// Get single user
router.get('/:id', getUser);

// Update user
router.put('/:id', updateUser);

// Delete user (Admin only)
router.delete('/:id', authorize('admin'), deleteUser);

// Upload profile image
router.post('/:id/profile-image', upload.single('profileImage'), handleUploadError, uploadProfileImage);

module.exports = router;