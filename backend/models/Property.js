import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['title_deed', 'sale_deed', 'survey_map', 'encumbrance_certificate', 
           'patta', 'khata', 'rto_extract', '7_12_extract', 'mutation_entry', 
           'identity_proof', 'sale_agreement', 'tax_receipt', 'other'],
    required: true
  },
  name: String,
  url: String,
  publicId: String, // Cloudinary public ID
  hash: String, // SHA-256 hash for blockchain verification
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
});

const ownershipHistorySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ownerName: String, // For historical records without user account
  ownerAadhaarHash: String, // Hashed Aadhaar for privacy
  acquiredDate: Date,
  transferredDate: Date,
  transferType: {
    type: String,
    enum: ['inheritance', 'sale', 'gift', 'partition', 'original_registration']
  },
  saleAmount: Number,
  transferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LandTransfer'
  },
  blockchainTxHash: String
});

const propertySchema = new mongoose.Schema({
  propertyId: {
    type: String,
    unique: true,
    index: true
  },
  surveyNumber: {
    type: String,
    required: true
  },
  subSurveyNumber: String,
  
  // Location details
  location: {
    state: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    taluk: String,
    village: String,
    ward: String,
    locality: String,
    address: String,
    pincode: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    geoJson: mongoose.Schema.Types.Mixed // Property boundary polygon
  },
  
  // Property details
  area: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['sq_feet', 'sq_meters', 'acres', 'hectares', 'guntha', 'cents'],
      default: 'sq_feet'
    }
  },
  
  propertyType: {
    type: String,
    enum: ['residential', 'commercial', 'agricultural', 'industrial', 'mixed'],
    required: true
  },
  
  landUse: {
    type: String,
    enum: ['vacant', 'built', 'cultivated', 'fallow', 'reserved']
  },
  
  // Current owner
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ownerName: String, // Denormalized for quick access
  ownerPhone: String,
  ownerEmail: String,
  
  // Ownership history
  ownershipHistory: [ownershipHistorySchema],
  
  // Documents
  documents: [documentSchema],
  
  // Valuation
  marketValue: {
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    valuationDate: Date,
    valuedBy: String
  },
  
  guidanceValue: { // Government registered value
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // Tax details
  propertyTax: {
    assessmentNumber: String,
    annualTax: Number,
    lastPaidDate: Date,
    dueDate: Date,
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending'
    }
  },
  
  // Encumbrance status
  encumbrance: {
    hasEncumbrance: {
      type: Boolean,
      default: false
    },
    details: String,
    mortgageTo: String,
    mortgageAmount: Number,
    clearanceDate: Date
  },
  
  // Verification status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_verification', 'verified', 'rejected', 'dispute'],
    default: 'draft'
  },
  
  verificationStatus: {
    documentsVerified: { type: Boolean, default: false },
    surveyVerified: { type: Boolean, default: false },
    titleVerified: { type: Boolean, default: false },
    taxVerified: { type: Boolean, default: false }
  },
  
  // Verification officials
  verifiedBy: {
    surveyor: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: Date,
      remarks: String
    },
    registrar: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: Date,
      remarks: String
    },
    tehsildar: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: Date,
      remarks: String
    }
  },
  
  // Blockchain anchoring
  blockchain: {
    propertyHash: String, // Hash of property data
    txHash: String, // Registration transaction hash
    blockNumber: Number,
    anchoredAt: Date,
    verified: {
      type: Boolean,
      default: false
    },
    lastVerifiedAt: Date
  },
  
  // Transfer status
  transferStatus: {
    type: String,
    enum: ['none', 'initiated', 'in_progress', 'completed', 'cancelled'],
    default: 'none'
  },
  activeTransfer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LandTransfer'
  },
  
  // Disputes
  disputes: [{
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String,
    status: {
      type: String,
      enum: ['open', 'under_investigation', 'resolved', 'escalated'],
      default: 'open'
    },
    raisedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    resolution: String
  }],
  
  // Metadata
  source: {
    type: String,
    enum: ['citizen_registration', 'government_import', 'migration'],
    default: 'citizen_registration'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  notes: String
  
}, { timestamps: true });

// Indexes
propertySchema.index({ surveyNumber: 1, 'location.district': 1 });
propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ currentOwner: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ 'blockchain.txHash': 1 });

// Generate property ID before saving
propertySchema.pre('save', async function(next) {
  if (!this.propertyId) {
    const stateCode = this.location.state?.substring(0, 2).toUpperCase() || 'XX';
    const districtCode = this.location.district?.substring(0, 3).toUpperCase() || 'XXX';
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments() + 1;
    this.propertyId = `PROP-${stateCode}-${districtCode}-${year}-${String(count).padStart(6, '0')}`;
  }
  next();
});

// Method to add ownership history entry
propertySchema.methods.addOwnershipEntry = function(ownerData) {
  this.ownershipHistory.push(ownerData);
  return this.save();
};

// Method to verify document
propertySchema.methods.verifyDocument = function(documentHash, verifierId) {
  const doc = this.documents.find(d => d.hash === documentHash);
  if (doc) {
    doc.verified = true;
    doc.verifiedBy = verifierId;
    doc.verifiedAt = new Date();
  }
  return this.save();
};

// Static method to find properties by location
propertySchema.statics.findByLocation = function(state, district, taluk) {
  const query = { 'location.state': state };
  if (district) query['location.district'] = district;
  if (taluk) query['location.taluk'] = taluk;
  return this.find(query);
};

// Static method to find nearby properties
propertySchema.statics.findNearby = function(longitude, latitude, maxDistance = 1000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

const Property = mongoose.model('Property', propertySchema);

export default Property;
