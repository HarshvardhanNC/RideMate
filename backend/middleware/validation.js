const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 3 })
    .withMessage('Password must be at least 3 characters'),
  body('phone')
    .isLength({ min: 10, max: 15 })
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Ride validation rules
const validateRideCreation = [
  body('from')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Starting location must be between 2 and 100 characters'),
  body('to')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Destination must be between 2 and 100 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const rideDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (rideDate < today) {
        throw new Error('Ride date cannot be in the past');
      }
      return true;
    }),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time format (HH:MM)'),
  body('seatsAvailable')
    .isInt({ min: 1, max: 8 })
    .withMessage('Seats must be between 1 and 8'),
  body('price')
    .isFloat({ min: 10, max: 1000 })
    .withMessage('Price must be between ₹10 and ₹1000'),
  body('vehicleType')
    .isIn(['Auto', 'Car', 'Bike', 'Other'])
    .withMessage('Please select a valid vehicle type'),
  body('vehicleNumber')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Vehicle number must be between 5 and 20 characters'),
  body('college')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('College name must be between 2 and 100 characters'),
  body('contactPhone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Query validation
const validateRideSearch = [
  query('from')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('From location must be between 2 and 100 characters'),
  query('to')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('To location must be between 2 and 100 characters'),
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date format'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 10, max: 1000 })
    .withMessage('Max price must be between ₹10 and ₹1000'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateRideCreation,
  validateObjectId,
  validateRideSearch,
  handleValidationErrors
};
