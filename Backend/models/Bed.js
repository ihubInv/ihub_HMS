const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedId: {
    type: String,
    required: [true, 'Bed ID is required'],
    unique: true,
    match: [/^F[1-5]R[1-8]B[1-6]$/, 'Invalid bed ID format']
  },
  floor: {
    type: Number,
    required: [true, 'Floor is required'],
    min: [1, 'Floor must be between 1 and 5'],
    max: [5, 'Floor must be between 1 and 5']
  },
  room: {
    type: Number,
    required: [true, 'Room is required'],
    min: [1, 'Room must be between 1 and 8'],
    max: [8, 'Room must be between 1 and 8']
  },
  bedNumber: {
    type: Number,
    required: [true, 'Bed number is required'],
    min: [1, 'Bed number must be between 1 and 6'],
    max: [6, 'Bed number must be between 1 and 6']
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  capacity: {
    type: Number,
    required: true,
    default: 6
  },
  currentOccupant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  features: [{
    type: String,
    enum: ['AC', 'Fan', 'Window', 'Balcony', 'Attached Bathroom', 'WiFi']
  }],
  lastMaintenance: {
    type: Date,
    default: null
  },
  nextMaintenance: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
bedSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
bedSchema.index({ floor: 1, room: 1, bedNumber: 1 });
bedSchema.index({ status: 1 });
bedSchema.index({ bedId: 1 });

module.exports = mongoose.model('Bed', bedSchema);