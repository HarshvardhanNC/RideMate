const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  poster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Ride poster is required']
  },
  from: {
    type: String,
    required: [true, 'Starting location is required'],
    trim: true,
    maxlength: [100, 'Starting location cannot be more than 100 characters']
  },
  to: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    maxlength: [100, 'Destination cannot be more than 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Ride date is required']
  },
  time: {
    type: String,
    required: [true, 'Ride time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)']
  },
  seatsAvailable: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [1, 'At least 1 seat must be available'],
    max: [8, 'Maximum 8 seats allowed']
  },
  seatsFilled: {
    type: Number,
    default: 0,
    min: 0
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['Auto', 'Car', 'Bike', 'Other']
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'full', 'completed', 'cancelled'],
    default: 'active'
  },
  passengers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['joined', 'left'],
      default: 'joined'
    }
  }],
  college: {
    type: String,
    required: [true, 'College name is required'],
    trim: true
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  whatsappContact: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit WhatsApp number']
  },
  pickupPoints: [{
    location: {
      type: String,
      required: true,
      trim: true
    },
    time: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)']
    }
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
rideSchema.index({ poster: 1 });
rideSchema.index({ from: 1, to: 1 });
rideSchema.index({ date: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ college: 1 });
rideSchema.index({ 'passengers.user': 1 });

// Virtual for available seats
rideSchema.virtual('availableSeats').get(function() {
  return this.seatsAvailable - this.seatsFilled;
});

// Virtual for ride status color
rideSchema.virtual('statusColor').get(function() {
  const filledPercentage = (this.seatsFilled / this.seatsAvailable) * 100;
  if (filledPercentage >= 100) return 'red';
  if (filledPercentage >= 75) return 'orange';
  if (filledPercentage >= 50) return 'yellow';
  return 'green';
});

// Pre-save middleware to update status based on seats
rideSchema.pre('save', function(next) {
  if (this.seatsFilled >= this.seatsAvailable) {
    this.status = 'full';
  } else if (this.status === 'full' && this.seatsFilled < this.seatsAvailable) {
    this.status = 'active';
  }
  next();
});

// Method to add passenger
rideSchema.methods.addPassenger = function(userId) {
  if (this.seatsFilled >= this.seatsAvailable) {
    throw new Error('No seats available');
  }
  
  const existingPassenger = this.passengers.find(p => 
    p.user.toString() === userId.toString() && p.status === 'joined'
  );
  
  if (existingPassenger) {
    throw new Error('User already joined this ride');
  }
  
  this.passengers.push({
    user: userId,
    joinedAt: new Date(),
    status: 'joined'
  });
  
  this.seatsFilled += 1;
  return this.save();
};

// Method to remove passenger
rideSchema.methods.removePassenger = function(userId) {
  const passengerIndex = this.passengers.findIndex(p => 
    p.user.toString() === userId.toString() && p.status === 'joined'
  );
  
  if (passengerIndex === -1) {
    throw new Error('User not found in this ride');
  }
  
  this.passengers[passengerIndex].status = 'left';
  this.seatsFilled = Math.max(0, this.seatsFilled - 1);
  return this.save();
};

// Method to check if user is passenger
rideSchema.methods.isPassenger = function(userId) {
  return this.passengers.some(p => 
    p.user.toString() === userId.toString() && p.status === 'joined'
  );
};

// Static method to find rides by filters
rideSchema.statics.findByFilters = function(filters) {
  const query = {};
  
  if (filters.from) query.from = new RegExp(filters.from, 'i');
  if (filters.to) query.to = new RegExp(filters.to, 'i');
  if (filters.date) {
    const startDate = new Date(filters.date);
    const endDate = new Date(filters.date);
    endDate.setDate(endDate.getDate() + 1);
    query.date = { $gte: startDate, $lt: endDate };
  }
  if (filters.college) query.college = new RegExp(filters.college, 'i');
  if (filters.vehicleType) query.vehicleType = filters.vehicleType;
  if (filters.status) query.status = filters.status;
  if (filters.maxPrice) query.price = { $lte: filters.maxPrice };
  
  return this.find(query)
    .populate('poster', 'name email phone college')
    .populate('passengers.user', 'name phone college')
    .sort({ date: 1, time: 1 });
};

// Ensure virtual fields are serialized
rideSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Ride', rideSchema);
