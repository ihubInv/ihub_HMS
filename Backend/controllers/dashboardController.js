const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Bed = require('../models/Bed');
const User = require('../models/user');
const Maintenance = require('../models/Maintenance');
const Notification = require('../models/Notification');

// All routes are protected
router.use(protect);

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const stats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userRole = req.user.role;
    let stats = {};
    
    // Common stats for all roles
    const totalBeds = await Bed.countDocuments();
    const occupiedBeds = await Bed.countDocuments({ status: 'occupied' });
    const availableBeds = await Bed.countDocuments({ status: 'available' });
    const maintenanceBeds = await Bed.countDocuments({ status: 'maintenance' });
    
    stats.bedStats = {
      total: totalBeds,
      occupied: occupiedBeds,
      available: availableBeds,
      maintenance: maintenanceBeds,
      occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0
    };
    
    // Role-specific stats
    if (userRole === 'admin') {
      // Admin gets all statistics
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const pendingBookings = await Booking.countDocuments({ status: 'pending' });
      const totalBookings = await Booking.countDocuments();
      const pendingMaintenance = await Maintenance.countDocuments({ status: 'pending' });
      
      stats.userStats = {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      };
      
      stats.bookingStats = {
        total: totalBookings,
        pending: pendingBookings,
        approved: await Booking.countDocuments({ status: 'approved' }),
        rejected: await Booking.countDocuments({ status: 'rejected' })
      };
      
      stats.maintenanceStats = {
        pending: pendingMaintenance,
        inProgress: await Maintenance.countDocuments({ status: 'in-progress' }),
        completed: await Maintenance.countDocuments({ status: 'completed' })
      };
      
      // Revenue stats
      const revenueData = await Booking.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            avgBookingValue: { $avg: '$totalAmount' }
          }
        }
      ]);
      
      stats.revenueStats = revenueData[0] || { totalRevenue: 0, avgBookingValue: 0 };
      
    } else if (userRole === 'warden') {
      // Warden gets booking and maintenance stats
      const pendingBookings = await Booking.countDocuments({ status: 'pending' });
      const todayCheckIns = await Booking.countDocuments({
        status: 'approved',
        checkIn: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      });
      
      const todayCheckOuts = await Booking.countDocuments({
        status: 'approved',
        checkOut: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      });
      
      stats.wardenStats = {
        pendingBookings,
        todayCheckIns,
        todayCheckOuts,
        pendingMaintenance: await Maintenance.countDocuments({ status: 'pending' })
      };
      
    } else if (userRole === 'student') {
      // Student gets their own booking stats
      const userBookings = await Booking.find({ student: req.user.id });
      const activeBooking = await Booking.findOne({
        student: req.user.id,
        status: 'approved',
        checkIn: { $lte: new Date() },
        checkOut: { $gte: new Date() }
      }).populate('bed', 'bedId floor room bedNumber');
      
      stats.studentStats = {
        totalBookings: userBookings.length,
        pendingBookings: userBookings.filter(b => b.status === 'pending').length,
        approvedBookings: userBookings.filter(b => b.status === 'approved').length,
        rejectedBookings: userBookings.filter(b => b.status === 'rejected').length,
        activeBooking
      };
    }
    
    // Get recent notifications for all users
    const recentNotifications = await Notification.find({
      recipient: req.user.id
    })
    .populate('sender', 'name role')
    .sort({ createdAt: -1 })
    .limit(5);
    
    const unreadNotifications = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });
    
    stats.notificationStats = {
      recent: recentNotifications,
      unreadCount: unreadNotifications
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
}

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Private
const activities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const userRole = req.user.role;
    
    let activities = [];
    
    if (userRole === 'admin' || userRole === 'warden') {
      // Get recent bookings
      const recentBookings = await Booking.find()
        .populate('student', 'name rollNo')
        .populate('bed', 'bedId')
        .sort({ createdAt: -1 })
        .limit(limit);
      
      // Get recent maintenance requests
      const recentMaintenance = await Maintenance.find()
        .populate('bed', 'bedId')
        .populate('reportedBy', 'name role')
        .sort({ createdAt: -1 })
        .limit(limit);
      
      // Get recent user registrations
      const recentUsers = await User.find()
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(limit);
      
      // Combine and format activities
      activities = [
        ...recentBookings.map(booking => ({
          type: 'booking',
          title: `New booking request`,
          description: `${booking.student.name} requested bed ${booking.bed.bedId}`,
          timestamp: booking.createdAt,
          status: booking.status,
          user: booking.student.name
        })),
        ...recentMaintenance.map(maintenance => ({
          type: 'maintenance',
          title: `Maintenance request`,
          description: `${maintenance.type} issue reported for bed ${maintenance.bed.bedId}`,
          timestamp: maintenance.createdAt,
          status: maintenance.status,
          priority: maintenance.priority,
          user: maintenance.reportedBy.name
        })),
        ...recentUsers.map(user => ({
          type: 'user',
          title: `New user registration`,
          description: `${user.name} registered as ${user.role}`,
          timestamp: user.createdAt,
          status: 'active',
          user: user.name
        }))
      ];
      
    } else if (userRole === 'student') {
      // Get student's own activities
      const userBookings = await Booking.find({ student: req.user.id })
        .populate('bed', 'bedId')
        .sort({ createdAt: -1 })
        .limit(limit);
      
      activities = userBookings.map(booking => ({
        type: 'booking',
        title: `Booking ${booking.status}`,
        description: `Your booking request for bed ${booking.bed.bedId}`,
        timestamp: booking.createdAt,
        status: booking.status
      }));
    }
    
    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    activities = activities.slice(0, limit);
    
    res.status(200).json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    console.error('Dashboard activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message
    });
  }
}

// @desc    Get quick actions based on user role
// // @route   GET /api/dashboard/quick-actions
// // @access  Private
const quickActions = async (req, res) => {
  try {
    const userRole = req.user.role;
    let quickActions = [];
    
    if (userRole === 'admin') {
      const pendingBookings = await Booking.countDocuments({ status: 'pending' });
      const pendingMaintenance = await Maintenance.countDocuments({ status: 'pending' });
      const inactiveUsers = await User.countDocuments({ isActive: false });
      
      quickActions = [
        {
          title: 'Approve Bookings',
          description: `${pendingBookings} pending requests`,
          action: 'approve-bookings',
          count: pendingBookings,
          priority: pendingBookings > 0 ? 'high' : 'low'
        },
        {
          title: 'Review Maintenance',
          description: `${pendingMaintenance} pending requests`,
          action: 'review-maintenance',
          count: pendingMaintenance,
          priority: pendingMaintenance > 0 ? 'medium' : 'low'
        },
        {
          title: 'Manage Users',
          description: `${inactiveUsers} inactive users`,
          action: 'manage-users',
          count: inactiveUsers,
          priority: 'low'
        },
        {
          title: 'Generate Reports',
          description: 'Create system reports',
          action: 'generate-reports',
          priority: 'low'
        }
      ];
      
    } else if (userRole === 'warden') {
      const pendingBookings = await Booking.countDocuments({ status: 'pending' });
      const pendingMaintenance = await Maintenance.countDocuments({ status: 'pending' });
      
      quickActions = [
        {
          title: 'Approve Bookings',
          description: `${pendingBookings} pending requests`,
          action: 'approve-bookings',
          count: pendingBookings,
          priority: pendingBookings > 0 ? 'high' : 'low'
        },
        {
          title: 'Schedule Maintenance',
          description: `${pendingMaintenance} pending requests`,
          action: 'schedule-maintenance',
          count: pendingMaintenance,
          priority: pendingMaintenance > 0 ? 'medium' : 'low'
        },
        {
          title: 'Manual Assignment',
          description: 'Assign beds manually',
          action: 'manual-assignment',
          priority: 'low'
        },
        {
          title: 'Check-in/Check-out',
          description: 'Process student movements',
          action: 'checkin-checkout',
          priority: 'medium'
        }
      ];
      
    } else if (userRole === 'student') {
      const userPendingBookings = await Booking.countDocuments({
        student: req.user.id,
        status: 'pending'
      });
      
      const availableBeds = await Bed.countDocuments({ status: 'available' });
      
      quickActions = [
        {
          title: 'Browse Available Beds',
          description: `${availableBeds} beds available`,
          action: 'browse-beds',
          count: availableBeds,
          priority: 'high'
        },
        {
          title: 'Track Bookings',
          description: `${userPendingBookings} pending requests`,
          action: 'track-bookings',
          count: userPendingBookings,
          priority: userPendingBookings > 0 ? 'medium' : 'low'
        },
        {
          title: 'Update Profile',
          description: 'Manage your information',
          action: 'update-profile',
          priority: 'low'
        },
        {
          title: 'Download Documents',
          description: 'Access your receipts',
          action: 'download-documents',
          priority: 'low'
        }
      ];
    }
    
    res.status(200).json({
      success: true,
      data: { quickActions }
    });
  } catch (error) {
    console.error('Quick actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quick actions',
      error: error.message
    });
  }
}

// // @desc    Get building layout (floors, rooms, beds)
// // @route   GET /api/building-layout
// // @access  Public (for demo; add auth if needed)
const buildingLayout = async (req, res) => {
  try {
    // Fetch all beds, populate currentOccupant
    const beds = await Bed.find().populate('currentOccupant', 'name rollNo');
    // Fetch all pending bookings
    const pendingBookings = await Booking.find({ status: 'pending' }).populate('student', 'name rollNo');
    // Map bedId to pending booking
    const pendingMap = {};
    pendingBookings.forEach(booking => {
      pendingMap[booking.bed.toString()] = booking;
    });
    // Group beds by floor and room
    const layoutMap = {};
    beds.forEach(bed => {
      const floorId = `floor-${bed.floor}`;
      const roomId = `room-${bed.floor}-${bed.room}`;
      const floorNumber = bed.floor;
      const roomNumber = bed.room;
      // Check for pending booking
      let status = bed.status;
      let occupant = bed.currentOccupant ? {
        name: bed.currentOccupant.name,
        rollNo: bed.currentOccupant.rollNo
      } : null;
      if (pendingMap[bed._id.toString()]) {
        status = 'pending';
        occupant = {
          name: pendingMap[bed._id.toString()].student?.name || 'Pending',
          rollNo: pendingMap[bed._id.toString()].student?.rollNo || ''
        };
      }
      if (!layoutMap[floorId]) {
        layoutMap[floorId] = {
          id: floorId,
          floorNumber,
          rooms: {}
        };
      }
      if (!layoutMap[floorId].rooms[roomId]) {
        layoutMap[floorId].rooms[roomId] = {
          id: roomId,
          floorId,
          roomNumber,
          beds: [],
          capacity: 0
        };
      }
      layoutMap[floorId].rooms[roomId].beds.push({
        _id: bed._id,
        id: bed.bedId,
        floorId,
        roomId,
        bedNumber: bed.bedNumber,
        status,
        occupant
      });
      layoutMap[floorId].rooms[roomId].capacity += 1;
    });
    // Convert layoutMap to array structure expected by frontend
    const buildingLayout = Object.values(layoutMap).map(floor => ({
      ...floor,
      rooms: Object.values(floor.rooms)
    }));
    res.json(buildingLayout);
  } catch (error) {
    console.error('Error fetching building layout:', error);
    res.status(500).json({ message: 'Failed to fetch building layout' });
  }
};

module.exports = {
  stats,
  activities,
  quickActions,
  buildingLayout
};