const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RideMate API',
      version: '1.0.0',
      description: 'A secure, production-ready RESTful API for student ride-sharing platform',
      contact: {
        name: 'RideMate Team',
        email: 'support@ridemate.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.ridemate.com' 
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'phone', 'college', 'year'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name',
              minLength: 2,
              maxLength: 50
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            phone: {
              type: 'string',
              pattern: '^[0-9]{10}$',
              description: '10-digit phone number'
            },
            college: {
              type: 'string',
              description: 'College name',
              minLength: 2,
              maxLength: 100
            },
            year: {
              type: 'string',
              enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate', 'Other'],
              description: 'Academic year'
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'User rating'
            },
            totalRides: {
              type: 'number',
              description: 'Total rides posted'
            },
            joinedRides: {
              type: 'number',
              description: 'Total rides joined'
            }
          }
        },
        Ride: {
          type: 'object',
          required: ['from', 'to', 'date', 'time', 'seatsAvailable', 'price', 'vehicleType', 'college'],
          properties: {
            _id: {
              type: 'string',
              description: 'Ride ID'
            },
            poster: {
              $ref: '#/components/schemas/User',
              description: 'User who posted the ride'
            },
            from: {
              type: 'string',
              description: 'Starting location',
              minLength: 2,
              maxLength: 100
            },
            to: {
              type: 'string',
              description: 'Destination',
              minLength: 2,
              maxLength: 100
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Ride date'
            },
            time: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
              description: 'Ride time in HH:MM format'
            },
            seatsAvailable: {
              type: 'integer',
              minimum: 1,
              maximum: 8,
              description: 'Total seats available'
            },
            seatsFilled: {
              type: 'integer',
              minimum: 0,
              description: 'Number of seats filled'
            },
            price: {
              type: 'number',
              minimum: 10,
              maximum: 1000,
              description: 'Price per person in ₹'
            },
            vehicleType: {
              type: 'string',
              enum: ['Auto', 'Car', 'Bike', 'Other'],
              description: 'Type of vehicle'
            },
            vehicleNumber: {
              type: 'string',
              description: 'Vehicle registration number'
            },
            status: {
              type: 'string',
              enum: ['active', 'full', 'completed', 'cancelled'],
              description: 'Ride status'
            },
            passengers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: {
                    $ref: '#/components/schemas/User'
                  },
                  joinedAt: {
                    type: 'string',
                    format: 'date-time'
                  },
                  status: {
                    type: 'string',
                    enum: ['joined', 'left']
                  }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './models/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
