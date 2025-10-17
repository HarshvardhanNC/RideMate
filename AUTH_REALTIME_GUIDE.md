# 🔐 Authentication & Real-time Features Guide

## 🎯 Overview

RideMate now includes comprehensive JWT authentication with user roles and real-time updates via WebSocket. This guide covers all the implemented features and how to use them.

## ✅ Implemented Features

### 1. 🔐 JWT Authentication System

#### **Enhanced JWT Middleware**
- **Token Verification**: Secure JWT token validation
- **Role-based Access**: User and Admin role separation
- **Token Expiration**: Automatic token expiry handling
- **Rate Limiting**: Protection against brute force attacks
- **Optional Authentication**: Flexible auth for public endpoints

#### **Authentication Endpoints**
```
POST /api/auth/register     - Register new user
POST /api/auth/login        - Login user (with rate limiting)
GET  /api/auth/me          - Get current user
PUT  /api/auth/profile     - Update user profile
PUT  /api/auth/password    - Change password
POST /api/auth/logout      - Logout user
POST /api/auth/refresh     - Refresh JWT token
PUT  /api/auth/verify      - Verify user account
```

#### **Admin-only Endpoints**
```
GET  /api/auth/stats       - Get user statistics
GET  /api/auth/users       - Get all users (paginated)
PUT  /api/auth/users/:id/role - Update user role
```

### 2. 👥 User Roles & Permissions

#### **User Roles**
- **`user`**: Regular student users (default)
- **`admin`**: Administrative users with full access

#### **Role-based Access Control**
- **User Access**: Can create, join, leave rides
- **Admin Access**: Can manage all users and rides
- **Verification**: Optional email verification system
- **College-based**: Users organized by college

### 3. 🔄 Real-time Updates (WebSocket)

#### **WebSocket Events**
- **Connection**: `connected` - User connected
- **Ride Events**: `new_ride`, `ride_update`, `ride_participant_update`
- **User Actions**: `ride_created`, `ride_joined`, `ride_left`
- **Notifications**: `passenger_joined`, `passenger_left`
- **System**: `system_announcement`, `college_notification`

#### **Real-time Features**
- **Live Ride Updates**: Instant notifications when rides change
- **College Notifications**: Users get notified of rides in their college
- **Participant Tracking**: Real-time join/leave notifications
- **Admin Notifications**: System-wide announcements
- **Typing Indicators**: Ready for future chat features

### 4. 🏫 College-based Organization

#### **Smart Ride Filtering**
- **Same College Priority**: Rides from user's college shown first
- **College Rooms**: WebSocket rooms organized by college
- **Targeted Notifications**: Users only get relevant college updates

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
# Install dependencies
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Setup database with sample data
node setup.js

# Create admin user
node create-admin.js

# Test authentication features
node test-auth-realtime.js

# Start server
npm run dev
```

### 2. Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### 3. Environment Variables

**Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/ridemate
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure_12345
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
```

## 🧪 Testing the Features

### 1. Authentication Testing

```bash
# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210",
    "college": "Test College",
    "year": "3rd Year"
  }'

# Test user login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Admin Access Testing

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ridemate.com",
    "password": "admin123456"
  }'

# Get admin statistics (use token from login)
curl -X GET http://localhost:5000/api/auth/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Real-time Testing

1. **Open multiple browser tabs** with the app
2. **Login with different users** in different tabs
3. **Create a ride** in one tab
4. **Watch real-time notifications** in other tabs
5. **Join/leave rides** and see instant updates

## 📱 Frontend Integration

### 1. WebSocket Hook Usage

```jsx
import { useWebSocket } from '../hooks/useWebSocket';

const MyComponent = () => {
  const { isConnected, joinRideRoom, leaveRideRoom } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      joinRideRoom('ride-id-123');
    }
    
    return () => {
      leaveRideRoom('ride-id-123');
    };
  }, [isConnected]);

  return (
    <div>
      Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
};
```

### 2. Authentication Context

```jsx
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, token, login, logout } = useAuth();

  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      // User logged in, WebSocket will auto-connect
    }
  };

  return (
    <div>
      {user ? (
        <div>Welcome, {user.name}!</div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};
```

## 🔒 Security Features

### 1. JWT Security
- **Secure Token Generation**: Cryptographically secure tokens
- **Token Expiration**: Automatic expiry (7 days default)
- **Token Refresh**: Secure token refresh mechanism
- **Rate Limiting**: Protection against brute force attacks

### 2. Password Security
- **bcrypt Hashing**: Industry-standard password hashing
- **Salt Rounds**: 12 rounds for maximum security
- **Password Validation**: Minimum 6 characters required

### 3. Input Validation
- **Express Validator**: Comprehensive input validation
- **SQL Injection Protection**: Mongoose ODM protection
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Secure cross-origin requests

## 📊 Admin Dashboard Features

### 1. User Management
- **View All Users**: Paginated user list
- **Role Management**: Change user roles
- **User Statistics**: Total, verified, admin counts
- **Recent Users**: New registrations tracking

### 2. Ride Management
- **All Rides**: View all rides with filters
- **Status Management**: Update ride status
- **Ride Statistics**: Analytics and insights
- **College Analytics**: Rides by college

### 3. System Administration
- **Real-time Monitoring**: WebSocket connections
- **System Announcements**: Broadcast messages
- **Database Management**: Direct database access

## 🎯 Production Deployment

### 1. Environment Setup
```env
NODE_ENV=production
JWT_SECRET=your_production_jwt_secret_very_long_and_secure
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ridemate
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Security Checklist
- ✅ Strong JWT secret (32+ characters)
- ✅ HTTPS enabled
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Input validation active
- ✅ Error handling implemented
- ✅ Logging configured

### 3. Monitoring
- **WebSocket Connections**: Monitor active connections
- **Authentication Logs**: Track login attempts
- **Error Tracking**: Monitor API errors
- **Performance Metrics**: Response times and throughput

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check CORS configuration
   - Verify JWT token is valid
   - Ensure backend is running on correct port

2. **Authentication Errors**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure user exists in database

3. **Real-time Notifications Not Working**
   - Check WebSocket connection status
   - Verify user is in correct college room
   - Check browser console for errors

### Debug Commands

```bash
# Test database connection
node -e "require('./config/database')().then(() => console.log('DB OK')).catch(console.error)"

# Test JWT token generation
node -e "const User = require('./models/User'); User.findOne().then(u => console.log(u.getSignedJwtToken()))"

# Check WebSocket connections
# Look for "User connected via WebSocket" in server logs
```

## 🎉 Success!

Your RideMate application now has:
- ✅ **Complete JWT Authentication**
- ✅ **Role-based Access Control**
- ✅ **Real-time WebSocket Updates**
- ✅ **College-based Organization**
- ✅ **Admin Dashboard Features**
- ✅ **Production-ready Security**

The application is now ready for production deployment with enterprise-level authentication and real-time features! 🚀
