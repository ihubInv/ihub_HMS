const express = require('express');
const router = express.Router();
const {
  getBeds,
  getBed,
  updateBedStatus,
  assignBed,
  getBedStats,
  getAvailableBeds
} = require('../controllers/bedController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getBeds);
router.get('/available', getAvailableBeds);
router.get('/stats', getBedStats);
router.get('/:id', getBed);

// Protected routes
router.use(protect);

// Update bed status (Admin/Warden only)
router.put('/:id/status', authorize('admin', 'warden'), updateBedStatus);

// Assign bed to user (Admin/Warden only)
router.put('/:id/assign', authorize('admin', 'warden'), assignBed);

module.exports = router;