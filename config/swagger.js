const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flight Management System API',
      version: '1.0.0',
      description: 'Complete Flight Management Backend with Authentication, Booking System, and Admin Panel',
      contact: {
        name: 'API Support',
        email: 'support@flightmanagement.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://your-production-url.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              example: 'Rehab Mohamed'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'rehab@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: '123456'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user',
              example: 'user'
            },
            phoneNumber: {
              type: 'string',
              example: '+201234567890'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              example: '1990-01-01'
            },
            passportNumber: {
              type: 'string',
              example: 'A12345678'
            }
          }
        },
        Flight: {
          type: 'object',
          required: ['flightNumber', 'origin', 'destination', 'departureTime', 'arrivalTime', 'price', 'totalSeats', 'availableSeats'],
          properties: {
            flightNumber: {
              type: 'string',
              example: 'EG123'
            },
            origin: {
              type: 'string',
              example: 'Cairo'
            },
            destination: {
              type: 'string',
              example: 'Paris'
            },
            departureTime: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-30T09:00:00Z'
            },
            arrivalTime: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-30T14:00:00Z'
            },
            price: {
              type: 'number',
              minimum: 0,
              example: 350
            },
            totalSeats: {
              type: 'number',
              minimum: 0,
              example: 200
            },
            availableSeats: {
              type: 'number',
              minimum: 0,
              example: 20
            }
          }
        },
        Booking: {
          type: 'object',
          required: ['flightId', 'seats'],
          properties: {
            flightId: {
              type: 'string',
              example: '68f7c14651b0ebbb9054756d'
            },
            seats: {
              type: 'number',
              minimum: 1,
              example: 2
            },
            status: {
              type: 'string',
              enum: ['confirmed', 'cancelled', 'pending'],
              example: 'confirmed'
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
              example: 'Error message'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and account management endpoints'
      },
      {
        name: 'Flights',
        description: 'Flight browsing and search endpoints (Public & Admin)'
      },
      {
        name: 'Bookings',
        description: 'Flight booking management endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints (Admin only)'
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
