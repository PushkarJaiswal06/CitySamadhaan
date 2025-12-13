import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true,
    required: true
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComplaintCategory',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    trim: true,
    maxlength: 2000
  },
  location: {
    address: {
      type: String,
      required: true
    },
    area: String,
    wardNumber: String,
    city: String,
    pincode: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    }
  },
  priority: {
    type: String,
    enum: ['P1', 'P2', 'P3', 'P4'],
    default: 'P3',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'pending',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  media: [{
    type: { type: String, enum: ['image', 'video', 'audio'] },
    url: String,
    publicId: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  source: {
    type: String,
    enum: ['web', 'mobile', 'sms', 'ivr', 'call_center'],
    required: true,
    default: 'web'
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'mr', 'ta', 'te', 'kn', 'gu'],
    default: 'en'
  },
  sla: {
    expectedResolutionTime: Date,
    actualResolutionTime: Date,
    breached: { type: Boolean, default: false }
  },
  updates: [{
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
      required: true
    },
    comment: String,
    media: [{
      type: { type: String, enum: ['image', 'video'] },
      url: String,
      publicId: String
    }],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionNote: String,
    resolutionMedia: [{
      type: { type: String, enum: ['image', 'video'] },
      url: String,
      publicId: String
    }],
    citizenRating: {
      type: Number,
      min: 1,
      max: 5
    },
    citizenFeedback: String
  },
  blockchain: {
    anchored: { type: Boolean, default: false },
    transactionHash: String,
    blockNumber: Number,
    anchoredAt: Date,
    merkleRoot: String
  },
  metadata: {
    viewCount: { type: Number, default: 0 },
    escalated: { type: Boolean, default: false },
    escalationReason: String
  }
}, {
  timestamps: true
});

// Indexes
// Note: complaintId index with unique is defined in the field definition
complaintSchema.index({ citizen: 1, createdAt: -1 });
complaintSchema.index({ department: 1, status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ 'location.coordinates': '2dsphere' });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ 'sla.expectedResolutionTime': 1 });

// Generate unique complaint ID
complaintSchema.pre('save', async function(next) {
  if (!this.complaintId) {
    const count = await mongoose.model('Complaint').countDocuments();
    const year = new Date().getFullYear();
    this.complaintId = `CMP${year}${String(count + 1).padStart(6, '0')}`;
  }

  // Calculate SLA
  if (!this.sla.expectedResolutionTime) {
    const category = await mongoose.model('ComplaintCategory').findById(this.category);
    if (category) {
      this.sla.expectedResolutionTime = new Date(Date.now() + category.slaHours * 60 * 60 * 1000);
    }
  }

  next();
});

// Method to add update
complaintSchema.methods.addUpdate = async function(userId, status, comment, media = []) {
  this.updates.push({
    updatedBy: userId,
    status,
    comment,
    media,
    timestamp: new Date()
  });
  this.status = status;
  
  if (status === 'resolved') {
    this.resolution.resolvedAt = new Date();
    this.resolution.resolvedBy = userId;
    this.sla.actualResolutionTime = new Date();
  }
  
  await this.save();
};

// Check SLA breach
complaintSchema.methods.checkSLABreach = function() {
  if (this.status !== 'resolved' && this.status !== 'closed') {
    if (new Date() > this.sla.expectedResolutionTime) {
      this.sla.breached = true;
    }
  }
  return this.sla.breached;
};

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
