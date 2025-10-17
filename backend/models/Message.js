const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: [true, 'Ride ID is required'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
messageSchema.index({ rideId: 1, createdAt: -1 });
messageSchema.index({ userId: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for formatted time
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
});

// Virtual for formatted date
messageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Static method to get messages for a ride with pagination
messageSchema.statics.getMessagesForRide = function(rideId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({ rideId })
    .populate('userId', 'name email profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Static method to get latest messages for a ride
messageSchema.statics.getLatestMessages = function(rideId, limit = 50) {
  return this.find({ rideId })
    .populate('userId', 'name email profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to delete all messages for a ride
messageSchema.statics.deleteMessagesForRide = function(rideId) {
  return this.deleteMany({ rideId });
};

// Static method to get message count for a ride
messageSchema.statics.getMessageCount = function(rideId) {
  return this.countDocuments({ rideId });
};

// Method to get message with user info
messageSchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Include virtual fields
  obj.formattedTime = this.formattedTime;
  obj.formattedDate = this.formattedDate;
  
  // Remove sensitive data
  delete obj.__v;
  
  return obj;
};

module.exports = mongoose.model('Message', messageSchema);
