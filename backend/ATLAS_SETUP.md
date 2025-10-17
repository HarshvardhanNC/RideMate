# MongoDB Atlas Setup Guide

## Step 1: Create .env file in backend directory

Create a file named `.env` in `C:\Users\82LN00A1IN\Desktop\RideMate\RideMate\backend\` with this content:

```
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://ridemate-user:YOUR_PASSWORD@ridemate-cluster.xxxxx.mongodb.net/ridemate?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=30d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## Step 2: Replace the values

1. **MONGODB_URI**: Replace with your actual Atlas connection string
   - Replace `YOUR_PASSWORD` with your database user password
   - Replace `ridemate-cluster.xxxxx` with your actual cluster name
   - Replace `ridemate` with your database name

2. **JWT_SECRET**: Generate a random secret key (at least 32 characters)

## Step 3: Test the connection

After creating the .env file, restart your backend server:

```bash
cd "C:\Users\82LN00A1IN\Desktop\RideMate\RideMate\backend"
node server.js
```

You should see:
```
MongoDB Connected: ridemate-cluster-shard-00-00.xxxxx.mongodb.net
Database: ridemate
```

## Step 4: Verify in MongoDB Compass

1. Download MongoDB Compass
2. Use the same connection string from your .env file
3. Connect and verify your database is created
4. You should see collections: users, rides

## Troubleshooting

- **Connection timeout**: Check if your IP is whitelisted in Atlas
- **Authentication failed**: Verify username/password
- **Database not found**: Atlas will create it automatically on first connection
