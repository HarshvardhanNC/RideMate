const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [3, 'Password must be at least 3 characters'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    minlength: [10, 'Phone number must be at least 10 characters'],
    maxlength: [15, 'Phone number cannot be more than 15 characters']
  },
  college: {
    type: String,
    trim: true,
    maxlength: [100, 'College name cannot be more than 100 characters']
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate', 'Other']
  },
  whatsapp: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit WhatsApp number']
  },
  role: {
    type: String,
    enum: ['passenger', 'driver'],
    default: 'passenger'
  },
  profilePicture: {
    type: String,
    default: null
  },
  preferences: {
    vehicleTypes: [{
      type: String,
      enum: ['Auto', 'Car', 'Bike', 'Other']
    }],
    maxPrice: {
      type: Number,
      default: 100
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      whatsapp: {
        type: Boolean,
        default: true
      }
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ phone: 1 });
userSchema.index({ college: 1 });
userSchema.index({ role: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get signed JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    college: this.college,
    year: this.year,
    whatsapp: this.whatsapp,
    role: this.role,
    profilePicture: this.profilePicture,
    preferences: this.preferences,
    isVerified: this.isVerified,
    lastActive: this.lastActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Method to update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to create user
userSchema.statics.create = async function(userData) {
  try {
    const user = new this(userData);
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

// Virtual for user's full profile URL
userSchema.virtual('profileUrl').get(function() {
  return `/api/users/${this._id}`;
});

// Virtual for user's ride statistics
userSchema.virtual('rideStats').get(function() {
  return {
    totalRidesPosted: 0, // Will be populated by aggregation
    totalRidesJoined: 0, // Will be populated by aggregation
    averageRating: 0 // Will be populated by aggregation
  };
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.password;
    delete ret.verificationToken;
    return ret;
  }
});

// Ensure virtual fields are serialized for toObject
userSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.password;
    delete ret.verificationToken;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
