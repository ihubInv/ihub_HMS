const Booking = require('../models/Booking');
const Bed = require('../models/Bed');
const User = require('../models/user');
const Maintenance = require('../models/Maintenance');

// Helper function to convert data to CSV
function convertToCSV(data) {
  let csv = 'Report Generated At,' + data.generatedAt + '\n\n';
  if (data.summary) {
    csv += 'Summary\n';
    Object.entries(data.summary).forEach(([key, value]) => {
      csv += `${key},${value}\n`;
    });
    csv += '\n';
  }
  return csv;
}

// @desc    Generate occupancy report
exports.getOccupancyReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const totalBeds = await Bed.countDocuments();
    const occupiedBeds = await Bed.countDocuments({ status: 'occupied' });
    const availableBeds = await Bed.countDocuments({ status: 'available' });
    const maintenanceBeds = await Bed.countDocuments({ status: 'maintenance' });
    const floorOccupancy = await Bed.aggregate([
      { $group: {
          _id: '$floor',
          total: { $sum: 1 },
          occupied: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
          available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    const monthlyTrends = await Booking.aggregate([
      { $match: { status: 'approved', ...dateFilter } },
      { $group: {
          _id: {
            year: { $year: '$checkIn' },
            month: { $month: '$checkIn' }
          },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const reportData = {
      generatedAt: new Date(),
      summary: {
        totalBeds,
        occupiedBeds,
        availableBeds,
        maintenanceBeds,
        occupancyRate: ((occupiedBeds / totalBeds) * 100).toFixed(2)
      },
      floorOccupancy,
      monthlyTrends
    };
    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=occupancy-report.csv');
      return res.send(csv);
    }
    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    console.error('Occupancy report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate occupancy report', error: error.message });
  }
};

// @desc    Generate financial report
exports.getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    const revenueData = await Booking.aggregate([
      { $match: { status: 'approved', ...dateFilter } },
      { $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const maintenanceCosts = await Maintenance.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      { $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          totalCost: { $sum: '$cost' },
          requestCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const paymentStatus = await Booking.aggregate([
      { $match: { ...dateFilter } },
      { $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      }
    ]);
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalExpenses = maintenanceCosts.reduce((sum, item) => sum + item.totalCost, 0);
    const reportData = {
      generatedAt: new Date(),
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        totalBookings: revenueData.reduce((sum, item) => sum + item.bookingCount, 0)
      },
      monthlyRevenue: revenueData,
      maintenanceCosts,
      paymentStatus
    };
    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=financial-report.csv');
      return res.send(csv);
    }
    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    console.error('Financial report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate financial report', error: error.message });
  }
};

// @desc    Generate demographics report
exports.getDemographicsReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    const registrationTrends = await User.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const roleDistribution = await User.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } }
        }
      }
    ]);
    const userStatus = await User.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: '$isActive',
          count: { $sum: 1 }
        }
      }
    ]);
    const reportData = {
      generatedAt: new Date(),
      summary: {
        totalUsers: await User.countDocuments(dateFilter),
        activeUsers: await User.countDocuments({ ...dateFilter, isActive: true }),
        inactiveUsers: await User.countDocuments({ ...dateFilter, isActive: false })
      },
      registrationTrends,
      roleDistribution,
      userStatus
    };
    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=demographics-report.csv');
      return res.send(csv);
    }
    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    console.error('Demographics report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate demographics report', error: error.message });
  }
};

// @desc    Generate maintenance report
exports.getMaintenanceReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    const maintenanceByType = await Maintenance.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgCost: { $avg: '$cost' },
          totalCost: { $sum: '$cost' }
        }
      }
    ]);
    const maintenanceByPriority = await Maintenance.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: '$priority',
          count: { $sum: 1 },
          avgResolutionTime: {
            $avg: {
              $divide: [
                { $subtract: ['$completedAt', '$startedAt'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      }
    ]);
    const maintenanceByStatus = await Maintenance.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    const monthlyTrends = await Maintenance.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalCost: { $sum: '$cost' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const reportData = {
      generatedAt: new Date(),
      summary: {
        totalRequests: await Maintenance.countDocuments(dateFilter),
        completedRequests: await Maintenance.countDocuments({ ...dateFilter, status: 'completed' }),
        pendingRequests: await Maintenance.countDocuments({ ...dateFilter, status: 'pending' }),
        totalCost: await Maintenance.aggregate([
          { $match: dateFilter },
          { $group: { _id: null, total: { $sum: '$cost' } } }
        ]).then(result => result[0]?.total || 0)
      },
      maintenanceByType,
      maintenanceByPriority,
      maintenanceByStatus,
      monthlyTrends
    };
    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=maintenance-report.csv');
      return res.send(csv);
    }
    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    console.error('Maintenance report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate maintenance report', error: error.message });
  }
};

// @desc    Generate booking history report
exports.getBookingsReport = async (req, res) => {
  try {
    const { startDate, endDate, status, format = 'json' } = req.query;
    let matchFilter = {};
    if (startDate && endDate) {
      matchFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (status && status !== 'all') {
      matchFilter.status = status;
    }
    const bookingStats = await Booking.aggregate([
      { $match: matchFilter },
      { $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);
    const monthlyBookings = await Booking.aggregate([
      { $match: matchFilter },
      { $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const avgDuration = await Booking.aggregate([
      { $match: { ...matchFilter, status: 'approved' } },
      { $project: {
          duration: {
            $divide: [
              { $subtract: ['$checkOut', '$checkIn'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      { $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);
    const recentBookings = await Booking.find(matchFilter)
      .populate('student', 'name rollNo email')
      .populate('bed', 'bedId floor room bedNumber')
      .sort({ createdAt: -1 })
      .limit(50);
    const reportData = {
      generatedAt: new Date(),
      filters: { startDate, endDate, status },
      summary: {
        totalBookings: await Booking.countDocuments(matchFilter),
        totalRevenue: bookingStats.reduce((sum, item) => sum + item.totalAmount, 0),
        avgBookingDuration: avgDuration[0]?.avgDuration || 0
      },
      bookingStats,
      monthlyBookings,
      recentBookings: format === 'json' ? recentBookings : recentBookings.length
    };
    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings-report.csv');
      return res.send(csv);
    }
    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    console.error('Booking report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate booking report', error: error.message });
  }
}; 