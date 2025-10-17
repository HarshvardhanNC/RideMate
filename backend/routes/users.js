const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('college').optional().trim().notEmpty().withMessage('College name cannot be empty'),
  body('year').optional().isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate', 'Other']).withMessage('Please select a valid academic year'),
  body('whatsapp').optional().matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit WhatsApp number')
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

    // Check if user is updating their own profile or is admin
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const allowedUpdates = ['name', 'phone', 'college', 'year', 'whatsapp', 'preferences'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private
router.get('/:id/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's ride statistics
    const Ride = require('../models/Ride');
    
    const postedRides = await Ride.countDocuments({ poster: req.params.id });
    const joinedRides = await Ride.countDocuments({ 
      'passengers.user': req.params.id,
      poster: { $ne: req.params.id }
    });

    const stats = {
      totalRides: user.totalRides,
      joinedRides: user.joinedRides,
      postedRides,
      joinedRidesCount: joinedRides,
      rating: user.rating,
      lastActive: user.lastActive
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user preferences
// @route   PUT /api/users/:id/preferences
// @access  Private
router.put('/:id/preferences', protect, async (req, res) => {
  try {
    // Check if user is updating their own preferences
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update these preferences'
      });
    }

    const { notifications } = req.body;

    if (!notifications) {
      return res.status(400).json({
        success: false,
        message: 'Preferences data is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { preferences: { notifications } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get users by college
// @route   GET /api/users/college/:college
// @access  Public
router.get('/college/:college', async (req, res) => {
  try {
    const { college } = req.params;
    const users = await User.find({ 
      college: new RegExp(college, 'i') 
    }).select('name email college year rating totalRides joinedRides').sort({ rating: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users by college error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
