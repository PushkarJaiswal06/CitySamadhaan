import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: function() {
      return this.role && !['citizen', 'call_center_agent'].includes(this.role.name);
    },
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number']
  },
  password: {
    type: String,
    required: function() {
      return this.authMethod === 'password';
    },
    minlength: 8,
    select: false
  },
  authMethod: {
    type: String,
    enum: ['password', 'otp'],
    default: 'otp'
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  address: {
    street: String,
    area: String,
    wardNumber: String,
    city: String,
    state: { type: String, default: 'Maharashtra' },
    pincode: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    }
  },
  profilePicture: {
    url: String,
    publicId: String
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'mr', 'ta', 'te', 'kn', 'gu'],
    default: 'en'
  },
  isVerified: {
    phone: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    aadhaar: { type: Boolean, default: false }
  },
  aadhaarHash: {
    type: String,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  refreshToken: {
    type: String,
    select: false
  },
  metadata: {
    complaintsCreated: { type: Number, default: 0 },
    complaintsResolved: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ phone: 1 }, { unique: true });
// Note: email index with unique+sparse is defined in the field definition
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ 'address.location': '2dsphere' });
userSchema.index({ isActive: 1 });

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;

  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return await this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

const User = mongoose.model('User', userSchema);

export default User;
