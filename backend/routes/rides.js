const express = require('express');
const { body, validationResult } = require('express-validator');
const Ride = require('../models/Ride');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all rides
// @route   GET /api/rides
// @access  Public
router.get('/', async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate('poster', 'name email phone college')
      .populate('passengers.user', 'name phone college')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rides.length,
      data: rides
    });
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get rides by filters
// @route   GET /api/rides/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { from, to, date, college, vehicleType, status, maxPrice } = req.query;
    
    const rides = await Ride.findByFilters({
      from,
      to,
      date,
      college,
      vehicleType,
      status,
      maxPrice
    });

    res.json({
      success: true,
      count: rides.length,
      data: rides
    });
  } catch (error) {
    console.error('Search rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single ride
// @route   GET /api/rides/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('poster', 'name email phone college')
      .populate('passengers.user', 'name phone college');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.json({
      success: true,
      data: ride
    });
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new ride
// @route   POST /api/rides
// @access  Private
router.post('/', protect, [
  body('from').trim().notEmpty().withMessage('Starting location is required'),
  body('to').trim().notEmpty().withMessage('Destination is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format is required'),
  body('seatsAvailable').isInt({ min: 1, max: 8 }).withMessage('Seats must be between 1 and 8'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('vehicleType').isIn(['Auto', 'Car', 'Bike', 'Other']).withMessage('Valid vehicle type is required'),
  body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
  body('college').trim().notEmpty().withMessage('College name is required'),
  body('contactPhone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const rideData = {
      ...req.body,
      poster: req.user._id
    };

    const ride = await Ride.create(rideData);

    // Populate the created ride
    await ride.populate('poster', 'name email phone college');

    // Emit real-time event for new ride
    const io = req.app.get('io');
    if (io) {
      io.emit('new-ride-posted', {
        rideId: ride._id,
        ride: ride,
        poster: ride.poster
      });
    }

    res.status(201).json({
      success: true,
      message: 'Ride created successfully',
      data: ride
    });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update ride
// @route   PUT /api/rides/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if user is the ride poster
    if (ride.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this ride'
      });
    }

    ride = await Ride.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('poster', 'name email phone college')
      .populate('passengers.user', 'name phone college');

    res.json({
      success: true,
      message: 'Ride updated successfully',
      data: ride
    });
  } catch (error) {
    console.error('Update ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete ride
// @route   DELETE /api/rides/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if user is the ride poster
    if (ride.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this ride'
      });
    }

    await Ride.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Ride deleted successfully'
    });
  } catch (error) {
    console.error('Delete ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Join ride
// @route   POST /api/rides/:id/join
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if user is already in the ride
    if (ride.isPassenger(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this ride'
      });
    }

    // Check if ride is full
    if (ride.seatsFilled >= ride.seatsAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Ride is full'
      });
    }

    await ride.addPassenger(req.user._id);

    // Populate the updated ride
    await ride.populate('poster', 'name email phone college')
      .populate('passengers.user', 'name phone college');

    // Emit real-time event for user joining ride
    const io = req.app.get('io');
    if (io) {
      io.to(`ride-${ride._id}`).emit('user-joined-ride', {
        rideId: ride._id,
        userId: req.user._id,
        userName: req.user.name,
        posterId: ride.poster._id,
        ride: ride
      });
      
      io.to(`user-${ride.poster._id}`).emit('user-joined-your-ride', {
        rideId: ride._id,
        userId: req.user._id,
        userName: req.user.name,
        ride: ride
      });
    }

    res.json({
      success: true,
      message: 'Successfully joined the ride',
      data: ride
    });
  } catch (error) {
    console.error('Join ride error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @desc    Leave ride
// @route   POST /api/rides/:id/leave
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if user is in the ride
    if (!ride.isPassenger(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not in this ride'
      });
    }

    await ride.removePassenger(req.user._id);

    // Populate the updated ride
    await ride.populate('poster', 'name email phone college')
      .populate('passengers.user', 'name phone college');

    // Emit real-time event for user leaving ride
    const io = req.app.get('io');
    if (io) {
      io.to(`ride-${ride._id}`).emit('user-left-ride', {
        rideId: ride._id,
        userId: req.user._id,
        userName: req.user.name,
        posterId: ride.poster._id,
        ride: ride
      });
      
      io.to(`user-${ride.poster._id}`).emit('user-left-your-ride', {
        rideId: ride._id,
        userId: req.user._id,
        userName: req.user.name,
        ride: ride
      });
    }

    res.json({
      success: true,
      message: 'Successfully left the ride',
      data: ride
    });
  } catch (error) {
    console.error('Leave ride error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @desc    Get user's rides
// @route   GET /api/rides/user/:userId
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const { type } = req.query; // 'posted' or 'joined'
    let rides;

    if (type === 'posted') {
      rides = await Ride.find({ poster: req.params.userId })
        .populate('poster', 'name email phone college')
        .populate('passengers.user', 'name phone college')
        .sort({ createdAt: -1 });
    } else if (type === 'joined') {
      rides = await Ride.find({ 
        'passengers.user': req.params.userId,
        poster: { $ne: req.params.userId }
      })
        .populate('poster', 'name email phone college')
        .populate('passengers.user', 'name phone college')
        .sort({ createdAt: -1 });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please specify type: posted or joined'
      });
    }

    res.json({
      success: true,
      count: rides.length,
      data: rides
    });
  } catch (error) {
    console.error('Get user rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
