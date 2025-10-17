# 🚀 RideMate Backend Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- MongoDB Compass (for database visualization)

## Step 1: Install Dependencies
```bash
cd backend
npm install
```

## Step 2: Environment Configuration
Create a `.env` file in the backend directory:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ridemate

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure_12345
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

## Step 3: Start MongoDB
### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string and update MONGODB_URI in .env

## Step 4: Setup Database with Sample Data
```bash
# Run the setup script to create sample data
node setup.js
```

## Step 5: Start the Server
```bash
npm run dev
# or
npm start
```

## Step 6: Test API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get All Rides
```bash
curl http://localhost:5000/api/rides
```

### Register User
```bash
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
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📊 MongoDB Compass Setup

### 1. Install MongoDB Compass
Download from: https://www.mongodb.com/products/compass

### 2. Connect to Database
- **Connection String**: `mongodb://localhost:27017/ridemate`
- **Database Name**: `ridemate`

### 3. Explore Collections

#### Users Collection
- View user profiles
- Check authentication data
- See user statistics

#### Rides Collection
- View ride details
- Check passenger relationships
- See ride status and availability

### 4. Sample Queries in Compass

#### Find all active rides
```javascript
{ "status": "active" }
```

#### Find rides by college
```javascript
{ "college": "IIT Bombay" }
```

#### Find rides with available seats
```javascript
{ "seatsFilled": { $lt: "$seatsAvailable" } }
```

#### Find users by year
```javascript
{ "year": "3rd Year" }
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Rides
- `GET /api/rides` - Get all rides
- `GET /api/rides/search` - Search rides with filters
- `GET /api/rides/:id` - Get single ride
- `POST /api/rides` - Create ride (Protected)
- `PUT /api/rides/:id` - Update ride (Protected)
- `DELETE /api/rides/:id` - Delete ride (Protected)
- `POST /api/rides/:id/join` - Join ride (Protected)
- `POST /api/rides/:id/leave` - Leave ride (Protected)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/college/:college` - Get users by college

## 🎯 Testing with Postman

1. Import the API collection
2. Set up environment variables
3. Test authentication flow
4. Test ride operations
5. Verify data in MongoDB Compass

## 📈 Monitoring

### Check Database Connection
```bash
# In MongoDB Compass, run:
db.stats()
```

### View Collections
```bash
# List all collections
show collections
```

### Count Documents
```bash
# Count users
db.users.countDocuments()

# Count rides
db.rides.countDocuments()
```

## 🚨 Troubleshooting

### MongoDB Connection Issues
1. Check if MongoDB is running
2. Verify connection string
3. Check firewall settings

### Authentication Issues
1. Verify JWT_SECRET is set
2. Check token format in headers
3. Ensure user exists in database

### API Issues
1. Check server logs
2. Verify request format
3. Check CORS settings

## 📝 Next Steps

1. **Frontend Integration**: Connect React app to API
2. **Real-time Features**: Add WebSocket support
3. **File Uploads**: Add profile image upload
4. **Email Notifications**: Add email service
5. **Deployment**: Deploy to cloud platform

## 🔗 Useful Links

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
