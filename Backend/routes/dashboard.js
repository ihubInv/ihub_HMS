const { stats,activities,quickActions,buildingLayout } = require("../controllers/dashboardController")
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Protect all dashboard routes
router.use(protect);

router.get('/stats', stats)
router.get('/activities', activities)
router.get('/quick_actions', quickActions)
router.get('/building-layout',buildingLayout)


module.exports = router;