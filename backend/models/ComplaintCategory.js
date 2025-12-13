import mongoose from 'mongoose';

const complaintCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  defaultPriority: {
    type: String,
    enum: ['P1', 'P2', 'P3', 'P4'],
    default: 'P3'
  },
  smsKeywords: [{
    type: String,
    uppercase: true
  }],
  requiredFields: [{
    field: String,
    type: { type: String, enum: ['text', 'location', 'image', 'date'] },
    required: Boolean
  }],
  slaHours: {
    type: Number,
    required: true,
    default: 72
  },
  autoAssignmentRules: {
    enabled: { type: Boolean, default: false },
    criteria: { type: String },
    assignTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    totalComplaints: { type: Number, default: 0 },
    resolvedComplaints: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
complaintCategorySchema.index({ department: 1 });
complaintCategorySchema.index({ name: 1, department: 1 }, { unique: true, sparse: true });
complaintCategorySchema.index({ isActive: 1 });

const ComplaintCategory = mongoose.model('ComplaintCategory', complaintCategorySchema);

export default ComplaintCategory;
