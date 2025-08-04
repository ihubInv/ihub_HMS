const express = require('express');
const router = express.Router();
const {
  createMaintenance,
  getMaintenanceRequests,
  getMaintenanceRequest,
  updateMaintenanceStatus,
  deleteMaintenance,
  getMaintenanceStats
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { validateMaintenance } = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Get maintenance statistics (Admin/Warden only)
router.get('/stats', authorize('admin', 'warden'), getMaintenanceStats);

// Get all maintenance requests
router.get('/', getMaintenanceRequests);

// Create maintenance request (Admin/Warden only)
router.post('/', 
  authorize('admin', 'warden'), 
  upload.array('images', 5), 
  validateMaintenance, 
  createMaintenance
);

// Get single maintenance request
router.get('/:id', getMaintenanceRequest);

// Update maintenance status (Admin/Warden only)
router.put('/:id/status', authorize('admin', 'warden'), updateMaintenanceStatus);

// Delete maintenance request (Admin only)
router.delete('/:id', authorize('admin'), deleteMaintenance);

module.exports = router;