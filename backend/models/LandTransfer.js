import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  stage: {
    type: String,
    enum: [
      'agreement_signed',
      'stamp_duty_paid',
      'documents_verified',
      'surveyor_approved',
      'sub_registrar_approved',
      'tehsildar_approved',
      'mutation_initiated',
      'field_verification_complete',
      'mutation_completed'
    ],
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approverRole: String,
  digitalSignature: String, // Encrypted signature hash
  timestamp: {
    type: Date,
    default: Date.now
  },
  remarks: String,
  attachments: [{
    name: String,
    url: String,
    hash: String
  }],
  blockchainTxHash: String
});

const landTransferSchema = new mongoose.Schema({
  transferId: {
    type: String,
    unique: true,
    index: true
  },
  
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  
  propertyId: String, // Denormalized for quick access
  
  // Parties involved
  seller: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: { type: String, required: true },
    phone: String,
    email: String,
    aadhaarHash: String, // Privacy-compliant hashed Aadhaar
    address: String,
    consent: {
      given: { type: Boolean, default: false },
      timestamp: Date,
      ipAddress: String
    }
  },
  
  buyer: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: { type: String, required: true },
    phone: String,
    email: String,
    aadhaarHash: String,
    address: String,
    consent: {
      given: { type: Boolean, default: false },
      timestamp: Date,
      ipAddress: String
    }
  },
  
  // Witnesses
  witnesses: [{
    name: String,
    phone: String,
    aadhaarHash: String,
    address: String,
    signature: String,
    signedAt: Date
  }],
  
  // Transfer details
  transferType: {
    type: String,
    enum: ['sale', 'gift', 'inheritance', 'partition', 'exchange', 'lease'],
    required: true
  },
  
  saleAmount: {
    type: Number,
    required: function() { return this.transferType === 'sale'; }
  },
  
  marketValue: Number,
  guidanceValue: Number,
  
  // Financials
  financials: {
    stampDuty: {
      amount: Number,
      paid: { type: Boolean, default: false },
      paidDate: Date,
      receiptNumber: String,
      receiptUrl: String
    },
    registrationFee: {
      amount: Number,
      paid: { type: Boolean, default: false },
      paidDate: Date,
      receiptNumber: String
    },
    mutationFee: {
      amount: Number,
      paid: { type: Boolean, default: false },
      paidDate: Date,
      receiptNumber: String
    }
  },
  
  // Current stage
  currentStage: {
    type: String,
    enum: [
      'initiated',
      'agreement_signed',
      'stamp_duty_paid',
      'documents_submitted',
      'documents_verified',
      'surveyor_verification',
      'sub_registrar_review',
      'registration_complete',
      'mutation_initiated',
      'field_verification',
      'tehsildar_approval',
      'mutation_completed',
      'transfer_complete',
      'cancelled',
      'rejected'
    ],
    default: 'initiated'
  },
  
  // Stage history
  stageHistory: [{
    stage: String,
    enteredAt: { type: Date, default: Date.now },
    exitedAt: Date,
    duration: Number // in milliseconds
  }],
  
  // Approvals
  approvals: [approvalSchema],
  
  // Required approvals tracking
  requiredApprovals: {
    surveyor: { required: { type: Boolean, default: true }, completed: { type: Boolean, default: false } },
    subRegistrar: { required: { type: Boolean, default: true }, completed: { type: Boolean, default: false } },
    tehsildar: { required: { type: Boolean, default: true }, completed: { type: Boolean, default: false } }
  },
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['sale_agreement', 'sale_deed', 'stamp_paper', 'identity_seller', 
             'identity_buyer', 'witness_id', 'tax_receipt', 'encumbrance_cert',
             'mutation_form', 'field_report', 'other']
    },
    name: String,
    url: String,
    publicId: String,
    hash: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date
  }],
  
  // Dates
  agreementDate: Date,
  registrationDate: Date,
  mutationDate: Date,
  completionDate: Date,
  
  // Blockchain
  blockchain: {
    initiationTxHash: String,
    registrationTxHash: String,
    mutationTxHash: String,
    completionTxHash: String,
    propertyTokenId: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'rejected', 'on_hold', 'disputed'],
    default: 'active'
  },
  
  // Rejection/Cancellation details
  rejection: {
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    stage: String,
    rejectedAt: Date
  },
  
  cancellation: {
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    stage: String,
    cancelledAt: Date
  },
  
  // Notifications sent
  notifications: [{
    type: { type: String },
    recipient: String,
    sentAt: Date,
    channel: String // 'sms', 'email', 'app'
  }],
  
  // Metadata
  applicationNumber: String, // Government application number
  registrationNumber: String, // Final registration number
  mutationNumber: String,
  
  // Created by
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  notes: String,
  
  // Audit trail
  auditLog: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String
  }]
  
}, { timestamps: true });

// Indexes
landTransferSchema.index({ property: 1, status: 1 });
landTransferSchema.index({ 'seller.user': 1 });
landTransferSchema.index({ 'buyer.user': 1 });
landTransferSchema.index({ currentStage: 1 });
landTransferSchema.index({ 'blockchain.initiationTxHash': 1 });

// Generate transfer ID
landTransferSchema.pre('save', async function(next) {
  if (!this.transferId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments() + 1;
    this.transferId = `LT-${year}-${String(count).padStart(8, '0')}`;
  }
  next();
});

// Method to advance stage
landTransferSchema.methods.advanceStage = function(newStage, approvalData) {
  // Record exit from current stage
  const currentStageEntry = this.stageHistory.find(
    s => s.stage === this.currentStage && !s.exitedAt
  );
  if (currentStageEntry) {
    currentStageEntry.exitedAt = new Date();
    currentStageEntry.duration = currentStageEntry.exitedAt - currentStageEntry.enteredAt;
  }
  
  // Add new stage to history
  this.stageHistory.push({
    stage: newStage,
    enteredAt: new Date()
  });
  
  // Add approval if provided
  if (approvalData) {
    this.approvals.push(approvalData);
  }
  
  this.currentStage = newStage;
  
  // Add audit log
  this.auditLog.push({
    action: `Stage advanced to ${newStage}`,
    performedBy: approvalData?.approvedBy,
    details: { previousStage: currentStageEntry?.stage, newStage, approvalData }
  });
  
  return this.save();
};

// Method to add approval
landTransferSchema.methods.addApproval = function(approvalData) {
  this.approvals.push(approvalData);
  
  // Update required approvals tracking
  const roleMapping = {
    'surveyor_approved': 'surveyor',
    'sub_registrar_approved': 'subRegistrar',
    'tehsildar_approved': 'tehsildar'
  };
  
  if (roleMapping[approvalData.stage]) {
    this.requiredApprovals[roleMapping[approvalData.stage]].completed = true;
  }
  
  return this.save();
};

// Method to reject transfer
landTransferSchema.methods.reject = function(userId, reason, stage) {
  this.status = 'rejected';
  this.rejection = {
    rejectedBy: userId,
    reason,
    stage,
    rejectedAt: new Date()
  };
  
  this.auditLog.push({
    action: 'Transfer rejected',
    performedBy: userId,
    details: { reason, stage }
  });
  
  return this.save();
};

// Method to cancel transfer
landTransferSchema.methods.cancel = function(userId, reason) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy: userId,
    reason,
    stage: this.currentStage,
    cancelledAt: new Date()
  };
  
  this.auditLog.push({
    action: 'Transfer cancelled',
    performedBy: userId,
    details: { reason, stage: this.currentStage }
  });
  
  return this.save();
};

// Static method to find transfers by user (as buyer or seller)
landTransferSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { 'seller.user': userId },
      { 'buyer.user': userId }
    ]
  }).populate('property');
};

// Static method to find pending approvals for an official
landTransferSchema.statics.findPendingApprovals = function(role) {
  const stageMapping = {
    'surveyor': 'surveyor_verification',
    'sub_registrar': 'sub_registrar_review',
    'tehsildar': 'tehsildar_approval'
  };
  
  return this.find({
    status: 'active',
    currentStage: stageMapping[role]
  }).populate('property');
};

// Calculate stamp duty (approximate - varies by state)
landTransferSchema.methods.calculateStampDuty = function(state = 'default') {
  const rates = {
    'Maharashtra': 0.06, // 6%
    'Karnataka': 0.056, // 5.6%
    'Tamil Nadu': 0.07, // 7%
    'default': 0.06
  };
  
  const rate = rates[state] || rates.default;
  const value = Math.max(this.saleAmount || 0, this.guidanceValue || 0);
  
  return Math.round(value * rate);
};

const LandTransfer = mongoose.model('LandTransfer', landTransferSchema);

export default LandTransfer;
