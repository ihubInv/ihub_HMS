const Booking = require('../models/Booking');
const Bed = require('../models/Bed');
const User = require('../models/user');
const Notification = require('../models/Notification');

// @desc    Create booking request
// @route   POST /api/bookings
// @access  Private (Student)
exports.createBooking = async (req, res) => {
  try {
    const {
      bedId,
      checkIn,
      checkOut,
      emergencyContact,
      specialRequests,
      medicalConditions
    } = req.body;

    // Find bed by bedId string
    const bed = await Bed.findOne({ bedId });
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: 'Bed not found'
      });
    }

    if (bed.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Bed is not available for booking'
      });
    }

    // Check for date conflicts
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Check for existing bookings in the date range
    const conflictingBooking = await Booking.findOne({
      bed: bed._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Bed is already booked for the selected dates'
      });
    }

    // Check if user has any pending bookings
    const pendingBooking = await Booking.findOne({
      student: req.user.id,
      status: 'pending'
    });

    if (pendingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending booking request'
      });
    }

    // Handle file uploads
    const documents = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        documents.push({
          name: file.originalname,
          path: file.path,
          uploadedAt: new Date()
        });
      });
    }

    // Calculate duration and amount (example calculation)
    const duration = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const dailyRate = 500; // ₹500 per day
    const totalAmount = duration * dailyRate;

    // Create booking
    const booking = await Booking.create({
      student: req.user.id,
      bed: bed._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      emergencyContact,
      specialRequests,
      medicalConditions,
      documents,
      totalAmount
    });

    // Update bed status to reserved temporarily
    bed.status = 'reserved';
    await bed.save();

    // Populate booking data
    await booking.populate([
      { path: 'student', select: 'name rollNo email phone' },
      { path: 'bed', select: 'bedId floor room bedNumber' }
    ]);

    // Create notification for wardens and admins
    const wardens = await User.find({ role: { $in: ['warden', 'admin'] }, isActive: true });
    
    const notifications = wardens.map(warden => ({
      recipient: warden._id,
      sender: req.user.id,
      type: 'booking',
      title: 'New Booking Request',
      message: `${req.user.name} has requested bed ${bedId} from ${checkInDate.toLocaleDateString()} to ${checkOutDate.toLocaleDateString()}`,
      priority: 'high',
      actionRequired: true,
      relatedModel: 'Booking',
      relatedId: booking._id
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking request',
      error: error && typeof error === 'object' ? {
        message: error.message || 'No error message',
        stack: error.stack || 'No stack',
        ...error
      } : error || 'Unknown error'
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, floor, search } = req.query;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      
      // Find users matching search
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { rollNo: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      
      const userIds = matchingUsers.map(user => user._id);
      
      // Find beds matching search
      const matchingBeds = await Bed.find({
        bedId: searchRegex
      }).select('_id');
      
      const bedIds = matchingBeds.map(bed => bed._id);
      
      query.$or = [
        { student: { $in: userIds } },
        { bed: { $in: bedIds } }
      ];
    }
    
    if (floor && floor !== 'all') {
      const bedsOnFloor = await Bed.find({ floor: parseInt(floor) }).select('_id');
      const bedIds = bedsOnFloor.map(bed => bed._id);
      query.bed = { $in: bedIds };
    }
    
    const bookings = await Booking.find(query)
      .populate('student', 'name rollNo email phone')
      .populate('bed', 'bedId floor room bedNumber')
      .populate('approvedBy', 'name role')
      .populate('rejectedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Booking.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('student', 'name rollNo email phone')
      .populate('bed', 'bedId floor room bedNumber features')
      .populate('approvedBy', 'name role')
      .populate('rejectedBy', 'name role');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user can access this booking
    if (req.user.role === 'student' && booking.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// @desc    Approve booking
// @route   PUT /api/bookings/:id/approve
// @access  Private (Admin/Warden)
exports.approveBooking = async (req, res) => {
  try {
    const { remarks } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('student', 'name rollNo email')
      .populate('bed', 'bedId floor room bedNumber');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in pending status'
      });
    }
    
    // Update booking
    booking.status = 'approved';
    booking.approvedBy = req.user.id;
    booking.approvedAt = new Date();
    if (remarks) booking.remarks = remarks;
    
    await booking.save();
    
    // Update bed status
    const bed = await Bed.findById(booking.bed._id);
    bed.status = 'booked';
    bed.currentOccupant = booking.student._id;
    await bed.save();
    
    // Create notification for student
    await Notification.create({
      recipient: booking.student._id,
      sender: req.user.id,
      type: 'booking',
      title: 'Booking Approved',
      message: `Your booking request for bed ${booking.bed.bedId} has been approved. Check-in: ${booking.checkIn.toLocaleDateString()}`,
      priority: 'high',
      relatedModel: 'Booking',
      relatedId: booking._id
    });
    
    res.status(200).json({
      success: true,
      message: 'Booking approved successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve booking',
      error: error.message
    });
  }
};

// @desc    Reject booking
// @route   PUT /api/bookings/:id/reject
// @access  Private (Admin/Warden)
exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const booking = await Booking.findById(req.params.id)
      .populate('student', 'name rollNo email')
      .populate('bed', 'bedId floor room bedNumber');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not in pending status'
      });
    }
    
    // Update booking
    booking.status = 'rejected';
    booking.rejectedBy = req.user.id;
    booking.rejectedAt = new Date();
    booking.rejectionReason = reason;
    
    await booking.save();
    
    // Update bed status back to available
    const bed = await Bed.findById(booking.bed._id);
    bed.status = 'available';
    await bed.save();
    
    // Create notification for student
    await Notification.create({
      recipient: booking.student._id,
      sender: req.user.id,
      type: 'booking',
      title: 'Booking Rejected',
      message: `Your booking request for bed ${booking.bed.bedId} has been rejected. Reason: ${reason}`,
      priority: 'high',
      relatedModel: 'Booking',
      relatedId: booking._id
    });
    
    res.status(200).json({
      success: true,
      message: 'Booking rejected successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject booking',
      error: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Student - own booking only)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('bed', 'bedId');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns this booking
    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings'
      });
    }
    
    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled in current status'
      });
    }
    
    // Update booking
    booking.status = 'cancelled';
    await booking.save();
    
    // Update bed status back to available
    const bed = await Bed.findById(booking.bed._id);
    bed.status = 'available';
    bed.currentOccupant = null;
    await bed.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// @desc    Update booking (dates, requests, documents)
// @route   PUT /api/bookings/:id
// @access  Private (Student, Admin, Warden)
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only allow student to update their own booking
    if (req.user.role === 'student' && booking.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update your own bookings' });
    }

    // Only allow update if booking is pending or approved
    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking cannot be modified in current status' });
    }

    // Update fields
    const { checkIn, checkOut, emergencyContact, specialRequests, medicalConditions } = req.body;
    if (checkIn) booking.checkIn = new Date(checkIn);
    if (checkOut) booking.checkOut = new Date(checkOut);
    if (emergencyContact) booking.emergencyContact = emergencyContact;
    if (specialRequests) booking.specialRequests = specialRequests;
    if (medicalConditions) booking.medicalConditions = medicalConditions;

    // Handle new documents
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        booking.documents.push({
          name: file.originalname,
          path: file.path,
          uploadedAt: new Date()
        });
      });
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private (Admin/Warden)
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    
    const statusStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const monthlyStats = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    const recentBookings = await Booking.find()
      .populate('student', 'name rollNo')
      .populate('bed', 'bedId')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        statusBreakdown: statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        monthlyStats,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics',
      error: error.message
    });
  }
};