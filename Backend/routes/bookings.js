const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getBookingStats,
  updateBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { validateBooking } = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Get booking statistics (Admin/Warden only)
router.get('/stats', authorize('admin', 'warden'), getBookingStats);

// Get all bookings
router.get('/', getBookings);

// Create booking (Students only)
router.post('/', 
  authorize('student'), 
  upload.array('documents', 5), 
  validateBooking, 
  createBooking
);

// Get single booking
router.get('/:id', getBooking);

// Approve booking (Admin/Warden only)
router.put('/:id/approve', authorize('admin', 'warden'), approveBooking);

// Reject booking (Admin/Warden only)
router.put('/:id/reject', authorize('admin', 'warden'), rejectBooking);

// Cancel booking (Student - own booking only)
router.put('/:id/cancel', authorize('student'), cancelBooking);

// Update booking (Student/Admin/Warden)
router.put('/:id', authorize('student', 'admin', 'warden'), upload.array('documents', 5), validateBooking, updateBooking);

module.exports = router;