# Flight Management System API Documentation

## 📚 Table of Contents
- [Getting Started](#getting-started)
- [Swagger UI](#swagger-ui)
- [Postman Collection](#postman-collection)
- [Authentication](#authentication)
- [Endpoints Overview](#endpoints-overview)

---

## 🚀 Getting Started

### Base URL
```
http://localhost:5000/api
```

### Authentication
Most endpoints require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📖 Swagger UI

Access the interactive API documentation at:
```
http://localhost:5000/api-docs
```

Features:
- Try out all endpoints directly in your browser
- View request/response schemas
- Test with authentication
- See example requests and responses

---

## 📮 Postman Collection

### Import Instructions:

1. **Import Collection:**
   - Open Postman
   - Click "Import"
   - Select `Flight-Management-API.postman_collection.json`

2. **Import Environment:**
   - Click "Import" again
   - Select `Flight-Management.postman_environment.json`

3. **Set Environment:**
   - Select "Flight Management - Local" from the environment dropdown

### Auto-saved Variables:
- `token` - Automatically saved after login/register
- `adminToken` - Saved when admin user logs in
- `userId` - Saved after registration
- `flightId` - Saved when creating a flight
- `bookingId` - Saved when creating a booking
- `resetToken` - Saved after OTP verification

---

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Rehab Mohamed",
  "email": "rehab@example.com",
  "password": "123456",
  "role": "user"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "rehab@example.com",
  "password": "123456"
}
```

Response includes JWT token - save this for subsequent requests!

---

## 📋 Endpoints Overview

### Authentication Endpoints (6)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | ❌ | Register new user |
| `/auth/login` | POST | ❌ | Login user |
| `/auth/forgot-password` | POST | ❌ | Request password reset |
| `/auth/verify-otp` | POST | ❌ | Verify OTP code |
| `/auth/reset-password` | POST | ❌ | Reset password with token/OTP |
| `/auth/change-password` | PATCH | ✅ | Change password (authenticated) |

### Flight Endpoints (3 public + 3 admin)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/flights` | GET | ❌ | Get all flights (with filters) |
| `/flights/:id` | GET | ❌ | Get single flight |
| `/flights` | POST | 🔐 Admin | Create flight |
| `/flights/:id` | PUT | 🔐 Admin | Update flight |
| `/flights/:id` | DELETE | 🔐 Admin | Delete flight |

**Query Parameters for GET /flights:**
- `origin` - Filter by origin city
- `destination` - Filter by destination city
- `date` - Filter by departure date

### Booking Endpoints (3 user + 2 admin)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/bookings` | POST | ✅ User | Book a flight |
| `/bookings/my-bookings` | GET | ✅ User | View my bookings |
| `/bookings/:id` | DELETE | ✅ User | Cancel my booking |
| `/bookings` | GET | 🔐 Admin | View all bookings |
| `/bookings/:id/status` | PATCH | 🔐 Admin | Update booking status |

### User Management Endpoints (Admin Only)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/users` | GET | 🔐 Admin | Get all users |
| `/users/:id` | GET | 🔐 Admin | Get single user |
| `/users/:id` | PUT | 🔐 Admin | Update user |
| `/users/:id` | DELETE | 🔐 Admin | Delete user |

---

## 💡 Usage Examples

### Example 1: Book a Flight

1. **Register/Login** to get JWT token
2. **Get Flights:**
   ```http
   GET /api/flights?origin=Cairo&destination=Paris
   ```
3. **Book Flight:**
   ```http
   POST /api/bookings
   Authorization: Bearer <your_token>
   Content-Type: application/json

   {
     "flightId": "68f7c14651b0ebbb9054756d",
     "seats": 2
   }
   ```

### Example 2: Admin - Create Flight

1. **Login as admin** to get admin token
2. **Create Flight:**
   ```http
   POST /api/flights
   Authorization: Bearer <admin_token>
   Content-Type: application/json

   {
     "flightNumber": "EG999",
     "origin": "Cairo",
     "destination": "Tokyo",
     "departureTime": "2025-11-05T08:00:00Z",
     "arrivalTime": "2025-11-05T20:00:00Z",
     "price": 750,
     "totalSeats": 200,
     "availableSeats": 200
   }
   ```

### Example 3: Password Reset Flow

1. **Request Reset:**
   ```http
   POST /api/auth/forgot-password

   {
     "email": "rehab@example.com",
     "method": "otp"
   }
   ```

2. **Check Console** for OTP (in development mode)

3. **Verify OTP:**
   ```http
   POST /api/auth/verify-otp

   {
     "email": "rehab@example.com",
     "otp": "641922"
   }
   ```

4. **Reset Password:**
   ```http
   POST /api/auth/reset-password

   {
     "resetToken": "<token_from_step_3>",
     "newPassword": "NewPassword123"
   }
   ```

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔑 Role-Based Access

### Public Access (No Auth)
- View flights
- Search/filter flights
- Register
- Login
- Password reset flow

### User Access (Requires Auth)
- Book flights
- View own bookings
- Cancel own bookings
- Update profile
- Change password

### Admin Access (Requires Admin Role)
- All user permissions
- Create/Update/Delete flights
- View all bookings
- Update any booking status
- Manage users

---

## 🛠️ Testing Tips

1. **Use Swagger UI** for quick testing without Postman
2. **Import Postman collection** for automated workflows
3. **Save tokens** in Postman environment variables
4. **Check console** for OTP codes during development
5. **Use filters** on GET /flights to test search functionality

---

## 📞 Support

For issues or questions:
- Check the Swagger UI documentation
- Review the Postman collection examples
- Refer to the main README.md file

---

**Version:** 1.0.0
**Last Updated:** 2025-10-21
