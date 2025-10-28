const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ride = require('./models/Ride');
const User = require('./models/User');

dotenv.config();

async function checkDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 URI:', process.env.MONGODB_URI?.substring(0, 30) + '...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Users
    const usersCount = await User.countDocuments();
    console.log('👥 USERS:');
    console.log(`   Total users: ${usersCount}`);
    
    if (usersCount > 0) {
      const users = await User.find().select('name email college').limit(5);
      console.log('   Sample users:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.college}`);
      });
    }
    console.log('');

    // Check Rides
    const ridesCount = await Ride.countDocuments();
    console.log('🚗 RIDES:');
    console.log(`   Total rides: ${ridesCount}`);
    
    if (ridesCount > 0) {
      const rides = await Ride.find()
        .populate('poster', 'name email')
        .sort({ createdAt: -1 })
        .limit(10);
      
      console.log('   All rides in database:');
      rides.forEach((ride, index) => {
        console.log(`   ${index + 1}. ${ride.from} → ${ride.to}`);
        console.log(`      Posted by: ${ride.poster?.name || 'Unknown'}`);
        console.log(`      Date: ${new Date(ride.date).toLocaleDateString()}`);
        console.log(`      Time: ${ride.time}`);
        console.log(`      Seats: ${ride.seatsAvailable}, Price: ₹${ride.price}`);
        console.log(`      Created: ${new Date(ride.createdAt).toLocaleString()}`);
        console.log(`      ID: ${ride._id}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  No rides found in database!');
      console.log('   💡 Run: node add-sample-rides.js to add sample data');
    }

    // Check by status
    const activeRides = await Ride.countDocuments({ status: 'active' });
    const fullRides = await Ride.countDocuments({ status: 'full' });
    const completedRides = await Ride.countDocuments({ status: 'completed' });
    
    console.log('📊 RIDES BY STATUS:');
    console.log(`   Active: ${activeRides}`);
    console.log(`   Full: ${fullRides}`);
    console.log(`   Completed: ${completedRides}`);
    console.log('');

    // Recent rides (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentRides = await Ride.countDocuments({ 
      createdAt: { $gte: yesterday } 
    });
    console.log('📅 RECENT ACTIVITY:');
    console.log(`   Rides created in last 24h: ${recentRides}`);
    console.log('');

    console.log('✅ Database check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run check
checkDatabase();

