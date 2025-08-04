const Bed = require('../models/Bed');
const Booking = require('../models/Booking');

// @desc    Get all beds
// @route   GET /api/beds
// @access  Public
exports.getBeds = async (req, res) => {
  try {
    const { floor, status, room, search } = req.query;
    
    // Build query
    let query = {};
    
    if (floor && floor !== 'all') {
      query.floor = parseInt(floor);
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (room && room !== 'all') {
      query.room = parseInt(room);
    }
    
    if (search) {
      query.bedId = { $regex: search, $options: 'i' };
    }
    
    const beds = await Bed.find(query)
      .populate('currentOccupant', 'name rollNo email phone')
      .sort({ floor: 1, room: 1, bedNumber: 1 });
    
    // Group beds by floor and room for better organization
    const groupedBeds = beds.reduce((acc, bed) => {
      const floorKey = `floor-${bed.floor}`;
      const roomKey = `room-${bed.room}`;
      
      if (!acc[floorKey]) {
        acc[floorKey] = {
          floorNumber: bed.floor,
          rooms: {}
        };
      }
      
      if (!acc[floorKey].rooms[roomKey]) {
        acc[floorKey].rooms[roomKey] = {
          roomNumber: bed.room,
          beds: []
        };
      }
      
      acc[floorKey].rooms[roomKey].beds.push(bed);
      
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      data: {
        beds,
        groupedBeds,
        total: beds.length
      }
    });
  } catch (error) {
    console.error('Get beds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch beds',
      error: error.message
    });
  }
};

// @desc    Get single bed
// @route   GET /api/beds/:id
// @access  Public
exports.getBed = async (req, res) => {

  try {
    const bed = await Bed.findById(req.params.id)
      .populate('currentOccupant', 'name rollNo email phone checkIn checkOut');
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: 'Bed not found'
      });
    }
    
    // Get booking history for this bed
    const bookingHistory = await Booking.find({ bed: bed._id })
      .populate('student', 'name rollNo email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.status(200).json({
      success: true,
      data: {
        bed,
        bookingHistory
      }
    });
  } catch (error) {
    console.error('Get bed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bed',
      error: error.message
    });
  }
};

// @desc    Update bed status
// @route   PUT /api/beds/:id/status
// @access  Private (Admin/Warden)
exports.updateBedStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const bed = await Bed.findById(req.params.id);
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: 'Bed not found'
      });
    }
    
    // Validate status transition
    const validTransitions = {
      'available': ['booked', 'reserved', 'maintenance'],
      'booked': ['occupied', 'available', 'maintenance'],
      'occupied': ['available', 'maintenance'],
      'reserved': ['available', 'booked', 'maintenance'],
      'maintenance': ['available']
    };
    
    if (!validTransitions[bed.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${bed.status} to ${status}`
      });
    }
    
    // Update bed status
    bed.status = status;
    
    // Clear occupant if bed becomes available
    if (status === 'available') {
      bed.currentOccupant = null;
    }
    
    // Set maintenance dates if status is maintenance
    if (status === 'maintenance') {
      bed.lastMaintenance = new Date();
    }
    
    await bed.save();
    
    res.status(200).json({
      success: true,
      message: 'Bed status updated successfully',
      data: { bed }
    });
  } catch (error) {
    console.error('Update bed status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bed status',
      error: error.message
    });
  }
};

// @desc    Assign bed to user
// @route   PUT /api/beds/:id/assign
// @access  Private (Admin/Warden)
exports.assignBed = async (req, res) => {
  try {
    const { userId, checkIn, checkOut } = req.body;
    
    const bed = await Bed.findById(req.params.id);
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: 'Bed not found'
      });
    }
    
    if (bed.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Bed is not available for assignment'
      });
    }
    
    // Create booking record
    const booking = await Booking.create({
      student: userId,
      bed: bed._id,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      emergencyContact: {
        name: 'Manual Assignment',
        phone: '0000000000'
      }
    });
    
    // Update bed
    bed.status = 'occupied';
    bed.currentOccupant = userId;
    await bed.save();
    
    await booking.populate('student', 'name rollNo email');
    
    res.status(200).json({
      success: true,
      message: 'Bed assigned successfully',
      data: { bed, booking }
    });
  } catch (error) {
    console.error('Assign bed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign bed',
      error: error.message
    });
  }
};

// @desc    Get bed statistics
// @route   GET /api/beds/stats
// @access  Private
exports.getBedStats = async (req, res) => {
  try {
    const totalBeds = await Bed.countDocuments();
    
    const statusStats = await Bed.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const floorStats = await Bed.aggregate([
      {
        $group: {
          _id: '$floor',
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
          },
          maintenance: {
            $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const occupancyRate = totalBeds > 0 
      ? ((statusStats.find(s => s._id === 'occupied')?.count || 0) / totalBeds * 100).toFixed(1)
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalBeds,
        occupancyRate: parseFloat(occupancyRate),
        statusBreakdown: statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        floorBreakdown: floorStats
      }
    });
  } catch (error) {
    console.error('Get bed stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bed statistics',
      error: error.message
    });
  }
};

// @desc    Get available beds
// @route   GET /api/beds/available
// @access  Public
exports.getAvailableBeds = async (req, res) => {
  try {
    const { checkIn, checkOut, floor, room } = req.query;
    
    let query = { status: 'available' };
    
    if (floor && floor !== 'all') {
      query.floor = parseInt(floor);
    }
    
    if (room && room !== 'all') {
      query.room = parseInt(room);
    }
    
    // If dates are provided, check for conflicts with existing bookings
    if (checkIn && checkOut) {
      const conflictingBookings = await Booking.find({
        status: { $in: ['approved', 'pending'] },
        $or: [
          {
            checkIn: { $lte: new Date(checkOut) },
            checkOut: { $gte: new Date(checkIn) }
          }
        ]
      }).distinct('bed');
      
      if (conflictingBookings.length > 0) {
        query._id = { $nin: conflictingBookings };
      }
    }
    
    const availableBeds = await Bed.find(query)
      .sort({ floor: 1, room: 1, bedNumber: 1 });
    
    res.status(200).json({
      success: true,
      data: {
        beds: availableBeds,
        total: availableBeds.length
      }
    });
  } catch (error) {
    console.error('Get available beds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available beds',
      error: error.message
    });
  }
};