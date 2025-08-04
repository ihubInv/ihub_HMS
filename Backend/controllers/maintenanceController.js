const Maintenance = require('../models/Maintenance');
const Bed = require('../models/Bed');
const User = require('../models/user');
const Notification = require('../models/Notification');

// @desc    Create maintenance request
// @route   POST /api/maintenance
// @access  Private (Admin/Warden)
exports.createMaintenance = async (req, res) => {
  try {
    const {
      bedId,
      type,
      priority,
      description,
      assignedTo,
      estimatedCompletion
    } = req.body;

    // Find bed by bedId string
    const bed = await Bed.findOne({ bedId });
    
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: 'Bed not found'
      });
    }

    // Handle file uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          path: file.path,
          description: file.originalname,
          uploadedAt: new Date()
        });
      });
    }

    // Create maintenance request
    const maintenance = await Maintenance.create({
      bed: bed._id,
      type,
      priority,
      description,
      reportedBy: req.user.id,
      assignedTo,
      estimatedCompletion: new Date(estimatedCompletion),
      images
    });

    // Update bed status to maintenance if high priority
    if (priority === 'high' || priority === 'urgent') {
      bed.status = 'maintenance';
      bed.currentOccupant = null;
      await bed.save();
    }

    // Populate maintenance data
    await maintenance.populate([
      { path: 'bed', select: 'bedId floor room bedNumber' },
      { path: 'reportedBy', select: 'name role' }
    ]);

    // Create notifications for relevant users
    const admins = await User.find({ role: 'admin', isActive: true });
    
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      sender: req.user.id,
      type: 'maintenance',
      title: 'New Maintenance Request',
      message: `${type} maintenance required for bed ${bedId}. Priority: ${priority}`,
      priority: priority === 'urgent' ? 'high' : 'medium',
      actionRequired: true,
      relatedModel: 'Maintenance',
      relatedId: maintenance._id
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully',
      data: { maintenance }
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create maintenance request',
      error: error.message
    });
  }
};

// @desc    Get all maintenance requests
// @route   GET /api/maintenance
// @access  Private
exports.getMaintenanceRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, priority, type, search } = req.query;
    
    // Build query
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      
      // Find beds matching search
      const matchingBeds = await Bed.find({
        bedId: searchRegex
      }).select('_id');
      
      const bedIds = matchingBeds.map(bed => bed._id);
      
      query.$or = [
        { bed: { $in: bedIds } },
        { description: searchRegex },
        { assignedTo: searchRegex }
      ];
    }
    
    const maintenanceRequests = await Maintenance.find(query)
      .populate('bed', 'bedId floor room bedNumber')
      .populate('reportedBy', 'name role')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Maintenance.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        maintenanceRequests,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance requests',
      error: error.message
    });
  }
};

// @desc    Get single maintenance request
// @route   GET /api/maintenance/:id
// @access  Private
exports.getMaintenanceRequest = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('bed', 'bedId floor room bedNumber features')
      .populate('reportedBy', 'name role email');
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { maintenance }
    });
  } catch (error) {
    console.error('Get maintenance request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance request',
      error: error.message
    });
  }
};

// @desc    Update maintenance status
// @route   PUT /api/maintenance/:id/status
// @access  Private (Admin/Warden)
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { status, notes, cost } = req.body;
    
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('bed', 'bedId floor room bedNumber')
      .populate('reportedBy', 'name email');
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    // Validate status transition
    const validTransitions = {
      'pending': ['scheduled', 'in-progress', 'cancelled'],
      'scheduled': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };
    
    if (!validTransitions[maintenance.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${maintenance.status} to ${status}`
      });
    }
    
    // Update maintenance
    maintenance.status = status;
    if (notes) maintenance.notes = notes;
    if (cost !== undefined) maintenance.cost = cost;
    
    // Set timestamps based on status
    if (status === 'in-progress' && !maintenance.startedAt) {
      maintenance.startedAt = new Date();
    }
    
    if (status === 'completed') {
      maintenance.completedAt = new Date();
      
      // Update bed status back to available
      const bed = await Bed.findById(maintenance.bed._id);
      bed.status = 'available';
      bed.lastMaintenance = new Date();
      await bed.save();
    }
    
    await maintenance.save();
    
    // Create notification for reporter
    await Notification.create({
      recipient: maintenance.reportedBy._id,
      sender: req.user.id,
      type: 'maintenance',
      title: 'Maintenance Status Updated',
      message: `Maintenance request for bed ${maintenance.bed.bedId} is now ${status}`,
      priority: 'medium',
      relatedModel: 'Maintenance',
      relatedId: maintenance._id
    });
    
    res.status(200).json({
      success: true,
      message: 'Maintenance status updated successfully',
      data: { maintenance }
    });
  } catch (error) {
    console.error('Update maintenance status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update maintenance status',
      error: error.message
    });
  }
};

// @desc    Delete maintenance request
// @route   DELETE /api/maintenance/:id
// @access  Private (Admin only)
exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance request not found'
      });
    }
    
    // Only allow deletion of pending or cancelled requests
    if (!['pending', 'cancelled'].includes(maintenance.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete maintenance request in current status'
      });
    }
    
    await Maintenance.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Maintenance request deleted successfully'
    });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete maintenance request',
      error: error.message
    });
  }
};

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats
// @access  Private (Admin/Warden)
exports.getMaintenanceStats = async (req, res) => {
  try {
    const totalRequests = await Maintenance.countDocuments();
    
    const statusStats = await Maintenance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const priorityStats = await Maintenance.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const typeStats = await Maintenance.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgCost: { $avg: '$cost' }
        }
      }
    ]);
    
    const avgResolutionTime = await Maintenance.aggregate([
      {
        $match: {
          status: 'completed',
          startedAt: { $exists: true },
          completedAt: { $exists: true }
        }
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$completedAt', '$startedAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$resolutionTime' }
        }
      }
    ]);
    
    const totalCost = await Maintenance.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$cost' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        statusBreakdown: statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        priorityBreakdown: priorityStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        typeBreakdown: typeStats,
        avgResolutionTime: avgResolutionTime[0]?.avgDays || 0,
        totalCost: totalCost[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get maintenance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance statistics',
      error: error.message
    });
  }
};