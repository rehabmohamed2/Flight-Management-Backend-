# Flight Management System API

A complete Node.js + Express backend for flight management with authentication, built with MongoDB.

## Features

- User authentication (Register, Login, JWT)
- Password reset with OTP or email link
- Flight management (CRUD operations)
- Booking system with seat management
- Role-based access control (Admin & User)
- Input validation & error handling
- Security middleware (Helmet, CORS, Rate Limiting)
- **Swagger UI Documentation** (Interactive API docs)
- **Postman Collection** (Ready-to-import)

## 📖 API Documentation

### Swagger UI (Interactive)
Access the Swagger documentation at:
```
http://localhost:5000/api-docs
```

### Postman Collection
Import the following files into Postman:
- `Flight-Management-API.postman_collection.json` - Complete API collection with all endpoints
- `Flight-Management.postman_environment.json` - Environment variables

### Full Documentation
See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API usage guide

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT & bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, express-rate-limit
- **Documentation**: Swagger UI, Postman Collection

## Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd backend_depi
```

2. Install dependencies
```bash
npm install
```

3. Create .env file
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

5. Start MongoDB (if running locally)
```bash
mongod
```

6. Run the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication Header Format
For protected routes:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Description**: Register a new account.

**Request Body**:
```json
{
  "name": "Rehab Mohamed",
  "email": "rehab@example.com",
  "password": "123456",
  "role": "user"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "u_123",
    "name": "Rehab Mohamed",
    "email": "rehab@example.com",
    "role": "user"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

**Description**: Login to existing account.

**Request Body**:
```json
{
  "email": "rehab@example.com",
  "password": "123456"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "u_123",
    "name": "Rehab Mohamed",
    "email": "rehab@example.com",
    "role": "user"
  }
}
```

---

### 3. Forgot Password (Send OTP or Link)
**POST** `/auth/forgot-password`

**Description**: Send OTP or reset link to user email.

**Request Body**:
```json
{
  "email": "rehab@example.com",
  "method": "otp"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "If this email exists, reset instructions have been sent."
}
```

---

### 4. Verify OTP
**POST** `/auth/verify-otp`

**Description**: Verify OTP and receive reset token.

**Request Body**:
```json
{
  "email": "rehab@example.com",
  "otp": "123456"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "reset_token_here"
}
```

---

### 5. Reset Password
**POST** `/auth/reset-password`

**Description**: Reset password using OTP or reset token.

**Using Token**:
```json
{
  "resetToken": "reset_token_here",
  "newPassword": "NewStrongPassword123"
}
```

**OR using OTP**:
```json
{
  "email": "rehab@example.com",
  "otp": "123456",
  "newPassword": "NewStrongPassword123"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please login."
}
```

---

### 6. Change Password (Authenticated)
**PATCH** `/auth/change-password`

**Auth Required**: ✅ Bearer Token

**Request Body**:
```json
{
  "currentPassword": "123456",
  "newPassword": "NewStrongPassword123"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 7. Get Current User
**GET** `/auth/me`

**Auth Required**: ✅ Bearer Token

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "u_123",
    "name": "Rehab Mohamed",
    "email": "rehab@example.com",
    "role": "user"
  }
}
```

---

## Flight Endpoints

### 1. Get All Flights
**GET** `/flights`

**Query Parameters** (optional):
- `origin` - Filter by origin city
- `destination` - Filter by destination city
- `date` - Filter by departure date (YYYY-MM-DD)

**Response** (200):
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "1",
      "flightNumber": "EG123",
      "origin": "Cairo",
      "destination": "Paris",
      "departureTime": "2025-10-30T09:00:00Z",
      "arrivalTime": "2025-10-30T14:00:00Z",
      "price": 350,
      "availableSeats": 20
    }
  ]
}
```

---

### 2. Get Single Flight
**GET** `/flights/:id`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "_id": "1",
    "flightNumber": "EG123",
    "origin": "Cairo",
    "destination": "Paris",
    "departureTime": "2025-10-30T09:00:00Z",
    "arrivalTime": "2025-10-30T14:00:00Z",
    "price": 350,
    "availableSeats": 20
  }
}
```

---

### 3. Create Flight
**POST** `/flights`

**Auth Required**: ✅ Admin Only

**Request Body**:
```json
{
  "flightNumber": "EG123",
  "origin": "Cairo",
  "destination": "Paris",
  "departureTime": "2025-10-30T09:00:00Z",
  "arrivalTime": "2025-10-30T14:00:00Z",
  "price": 350,
  "availableSeats": 100
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "_id": "1",
    "flightNumber": "EG123",
    "origin": "Cairo",
    "destination": "Paris",
    "departureTime": "2025-10-30T09:00:00Z",
    "arrivalTime": "2025-10-30T14:00:00Z",
    "price": 350,
    "availableSeats": 100
  }
}
```

---

### 4. Update Flight
**PUT** `/flights/:id`

**Auth Required**: ✅ Admin Only

**Request Body**: (any field to update)
```json
{
  "price": 400,
  "availableSeats": 50
}
```

---

### 5. Delete Flight
**DELETE** `/flights/:id`

**Auth Required**: ✅ Admin Only

**Response** (200):
```json
{
  "success": true,
  "data": {}
}
```

---

## Booking Endpoints

### 1. Create Booking
**POST** `/bookings`

**Auth Required**: ✅ User or Admin

**Request Body**:
```json
{
  "flightId": "flight_id_here",
  "seats": 2
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "_id": "BKG123",
    "userId": {
      "_id": "u_123",
      "name": "Rehab Mohamed",
      "email": "rehab@example.com"
    },
    "flightId": {
      "_id": "1",
      "flightNumber": "EG123",
      "origin": "Cairo",
      "destination": "Paris"
    },
    "seats": 2,
    "status": "confirmed"
  }
}
```

---

### 2. Get My Bookings
**GET** `/bookings/my-bookings`

**Auth Required**: ✅ User or Admin

**Response** (200):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "BKG123",
      "flightId": {
        "flightNumber": "EG123",
        "origin": "Cairo",
        "destination": "Paris"
      },
      "seats": 2,
      "status": "confirmed"
    }
  ]
}
```

---

### 3. Get All Bookings
**GET** `/bookings`

**Auth Required**: ✅ Admin Only

**Response** (200):
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

---

### 4. Get Single Booking
**GET** `/bookings/:id`

**Auth Required**: ✅ User (own booking) or Admin

---

### 5. Update Booking
**PUT** `/bookings/:id`

**Auth Required**: ✅ User (own booking) or Admin

**Request Body**:
```json
{
  "seats": 3,
  "status": "confirmed"
}
```

---

### 6. Cancel Booking
**DELETE** `/bookings/:id`

**Auth Required**: ✅ User (own booking) or Admin

**Description**: Cancels booking and returns seats to flight.

**Response** (200):
```json
{
  "success": true,
  "data": {}
}
```

---

## User Management Endpoints (Admin Only)

### 1. Get All Users
**GET** `/users`

**Auth Required**: ✅ Admin Only

---

### 2. Get Single User
**GET** `/users/:id`

**Auth Required**: ✅ Admin Only

---

### 3. Update User
**PUT** `/users/:id`

**Auth Required**: ✅ Admin Only

---

### 4. Delete User
**DELETE** `/users/:id`

**Auth Required**: ✅ Admin Only

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Project Structure

```
backend_depi/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── flightController.js  # Flight CRUD
│   ├── bookingController.js # Booking logic
│   └── userController.js    # User management
├── middleware/
│   ├── auth.js             # JWT verification & authorization
│   └── errorHandler.js     # Global error handler
├── models/
│   ├── User.js             # User schema
│   ├── Flight.js           # Flight schema
│   └── Booking.js          # Booking schema
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── flightRoutes.js     # Flight endpoints
│   ├── bookingRoutes.js    # Booking endpoints
│   └── userRoutes.js       # User management endpoints
├── utils/
│   └── sendEmail.js        # Email utility
├── .env.example            # Environment variables template
├── .gitignore
├── app.js                  # Express app setup
├── package.json
├── server.js               # Server entry point
└── README.md
```

---

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Helmet.js for HTTP headers security
- CORS protection
- Rate limiting (100 requests per 10 minutes)
- Input validation
- MongoDB injection protection

---

## Email Configuration

The current implementation logs emails to the console. For production:

1. Install nodemailer: `npm install nodemailer`
2. Configure SMTP settings in `.env`
3. Update `utils/sendEmail.js` with actual email service

---

## Testing

You can test the API using:
- **Postman** - Import the collection
- **Thunder Client** (VS Code extension)
- **curl** commands

Example curl request:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'
```

---

## License

ISC

---

## Contributing

Feel free to submit issues and pull requests!
