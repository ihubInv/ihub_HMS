const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  bed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed',
    required: [true, 'Bed is required']
  },
  type: {
    type: String,
    enum: ['plumbing', 'electrical', 'furniture', 'cleaning', 'painting', 'other'],
    required: [true, 'Maintenance type is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  assignedTo: {
    type: String,
    required: [true, 'Assignment is required']
  },
  estimatedCompletion: {
    type: Date,
    required: [true, 'Estimated completion date is required']
  },
  actualCompletion: {
    type: Date,
    default: null
  },
  scheduledFor: {
    type: Date,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  cost: {
    type: Number,
    default: 0,
    min: [0, 'Cost cannot be negative']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  images: [{
    path: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
maintenanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-set completion date when status changes to completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Auto-set start date when status changes to in-progress
  if (this.status === 'in-progress' && !this.startedAt) {
    this.startedAt = new Date();
  }
  
  next();
});

// Index for efficient queries
maintenanceSchema.index({ bed: 1, status: 1 });
maintenanceSchema.index({ status: 1, priority: -1, createdAt: -1 });
maintenanceSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);