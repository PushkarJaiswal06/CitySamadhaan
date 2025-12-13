import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  smsKeywords: [{
    type: String,
    uppercase: true
  }],
  ivrMenuOption: {
    type: Number,
    min: 1,
    max: 12
  },
  headOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  defaultSLA: {
    P1: { type: Number, default: 4 },   // hours
    P2: { type: Number, default: 24 },  // hours
    P3: { type: Number, default: 72 },  // hours
    P4: { type: Number, default: 168 }  // hours (7 days)
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    complaintCount: { type: Number, default: 0 },
    resolvedCount: { type: Number, default: 0 },
    averageResolutionTime: { type: Number, default: 0 } // hours
  }
}, {
  timestamps: true
});

// Indexes
departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ name: 1 }, { unique: true });
departmentSchema.index({ isActive: 1 });

// Methods
departmentSchema.methods.incrementComplaintCount = async function() {
  this.metadata.complaintCount += 1;
  await this.save();
};

departmentSchema.methods.incrementResolvedCount = async function() {
  this.metadata.resolvedCount += 1;
  await this.save();
};

const Department = mongoose.model('Department', departmentSchema);

export default Department;
