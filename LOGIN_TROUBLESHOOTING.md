# 🔧 Login Troubleshooting Guide

## 🚨 **Common Login Issues & Solutions**

### **1. "Failed to login" Error**

**Most Common Causes:**
- ❌ Backend not running
- ❌ Wrong email/password
- ❌ User doesn't exist in database
- ❌ Database connection issues

## 🧪 **Test Your Login System**

### **Quick Test Commands:**

```bash
# 1. Test backend login validation
cd backend
node test-login.js

# 2. Test login API directly
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 📋 **Sample Login Credentials**

### **Test Users (After running setup.js):**

| Role | Email | Password | College |
|------|-------|----------|---------|
| **Admin** | `admin@ridemate.com` | `admin123456` | RideMate Admin |
| **User** | `john@example.com` | `password123` | IIT Bombay |
| **User** | `jane@example.com` | `password123` | IIT Bombay |
| **User** | `mike@example.com` | `password123` | IIT Delhi |
| **User** | `sarah@example.com` | `password123` | No college |
| **User** | `david@example.com` | `password123` | No college |

## 🔍 **Step-by-Step Debugging**

### **Step 1: Check Backend Status**
```bash
cd backend
npm run dev
# Should see: "🚀 RideMate API Server running on port 5000"
```

### **Step 2: Test API Health**
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"OK","message":"RideMate API is running"}
```

### **Step 3: Check Database Setup**
```bash
cd backend
node setup.js
# This creates sample users if they don't exist
```

### **Step 4: Test Login API**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "college": "IIT Bombay",
    "year": "3rd Year"
  }
}
```

### **Step 5: Check Frontend**
```bash
cd frontend
npm run dev
# Should see: "Local: http://localhost:5173"
```

## 🛠️ **Common Fixes**

### **1. Backend Not Running**
```bash
# Start backend
cd backend
npm run dev

# Check if running
curl http://localhost:5000/api/health
```

### **2. Database Not Set Up**
```bash
# Setup database with sample users
cd backend
node setup.js

# Create admin user
node create-admin.js
```

### **3. Wrong Credentials**
- ✅ Use exact email: `john@example.com`
- ✅ Use exact password: `password123`
- ✅ Check for typos in email/password

### **4. User Doesn't Exist**
```bash
# Check if users exist in database
cd backend
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect('mongodb://localhost:27017/ridemate').then(async () => {
  const users = await User.find();
  console.log('Users in database:', users.map(u => u.email));
  process.exit(0);
});
"
```

### **5. Environment Variables Missing**
```bash
# Check .env file in backend directory
cat backend/.env

# Should contain:
# JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure_12345
# MONGODB_URI=mongodb://localhost:27017/ridemate
```

## 🔧 **Manual Database Check**

### **Check Users in MongoDB Compass:**
1. **Connect to**: `mongodb://localhost:27017/ridemate`
2. **Open**: `users` collection
3. **Look for**: Sample users with emails like `john@example.com`

### **Check User Password:**
```javascript
// In MongoDB Compass, run this query:
db.users.findOne({email: "john@example.com"})
// Should return user object with hashed password
```

## 🎯 **Quick Test Scenarios**

### **Test 1: Valid Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### **Test 2: Invalid Email**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"password123"}'
```

### **Test 3: Invalid Password**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"wrongpassword"}'
```

## 📱 **Frontend Debugging**

### **Check Browser Console:**
1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Try login and check for errors**
4. **Look for network errors in Network tab**

### **Check Network Requests:**
1. **Open Network tab** in dev tools
2. **Try login**
3. **Look for POST request to `/api/auth/login`**
4. **Check response status and body**

## 🚨 **Error Messages & Solutions**

### **"Invalid credentials"**
- ✅ Check email spelling
- ✅ Check password spelling
- ✅ Verify user exists in database

### **"User not found"**
- ✅ Run `node setup.js` to create sample users
- ✅ Check database connection
- ✅ Verify email exists in users collection

### **"Token generation failed"**
- ✅ Check JWT_SECRET in .env file
- ✅ Restart backend server
- ✅ Verify environment variables

### **"Database connection error"**
- ✅ Start MongoDB service
- ✅ Check MONGODB_URI in .env
- ✅ Verify MongoDB is running on port 27017

## 🎉 **Success Indicators**

### **Backend Working:**
- ✅ Server running on port 5000
- ✅ Health check returns OK
- ✅ Login API returns token and user data

### **Frontend Working:**
- ✅ Login form submits without errors
- ✅ Success notification appears
- ✅ User redirected to home page
- ✅ User data stored in localStorage

### **Database Working:**
- ✅ Users exist in database
- ✅ Password comparison works
- ✅ JWT tokens generated successfully

## 🔄 **Reset Everything**

### **Complete Reset:**
```bash
# 1. Stop all servers
# 2. Clear database
cd backend
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ridemate').then(async () => {
  await mongoose.connection.db.dropDatabase();
  console.log('Database cleared');
  process.exit(0);
});
"

# 3. Setup fresh data
node setup.js
node create-admin.js

# 4. Start servers
npm run dev
# In another terminal:
cd frontend && npm run dev
```

The login should now work with the test credentials! Try logging in with `john@example.com` / `password123` 🎉
