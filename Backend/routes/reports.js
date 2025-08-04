const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const reportsController = require('../controllers/reportsController');

// All routes are protected and require admin/warden access
router.use(protect);
router.use(authorize('admin', 'warden'));

// @desc    Generate occupancy report
// @route   GET /api/reports/occupancy
router.get('/occupancy', reportsController.getOccupancyReport);

// @desc    Generate financial report
// @route   GET /api/reports/financial
router.get('/financial', reportsController.getFinancialReport);

// @desc    Generate user demographics report
// @route   GET /api/reports/demographics
router.get('/demographics', reportsController.getDemographicsReport);

// @desc    Generate maintenance report
// @route   GET /api/reports/maintenance
router.get('/maintenance', reportsController.getMaintenanceReport);

// @desc    Generate booking history report
// @route   GET /api/reports/bookings
router.get('/bookings', reportsController.getBookingsReport);

module.exports = router;