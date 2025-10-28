const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ride = require('./models/Ride');
const User = require('./models/User');

dotenv.config();

async function testRideCreation() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('👤 Creating test user...');
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '9876543210',
        college: 'Test College',
        year: '3rd Year'
      });
      console.log('✅ Test user created:', testUser._id);
    } else {
      console.log('✅ Test user found:', testUser._id);
    }
    console.log('');

    // Create a test ride
    console.log('🚗 Creating test ride...');
    const testRide = {
      from: 'College Campus',
      to: 'Central Station',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      time: '10:30',
      seatsAvailable: 3,
      price: 50,
      description: 'Test ride created by script',
      vehicleType: 'Auto',
      vehicleNumber: 'TEST-123',
      college: 'Test College',
      contactPhone: '9876543210',
      poster: testUser._id
    };

    console.log('📦 Ride data:', JSON.stringify(testRide, null, 2));
    
    const ride = await Ride.create(testRide);
    console.log('✅ Ride created successfully!');
    console.log('   Ride ID:', ride._id);
    console.log('   From:', ride.from);
    console.log('   To:', ride.to);
    console.log('');

    // Verify ride was saved
    console.log('🔍 Verifying ride in database...');
    const savedRide = await Ride.findById(ride._id).populate('poster', 'name email');
    
    if (savedRide) {
      console.log('✅ Ride found in database!');
      console.log('   ID:', savedRide._id);
      console.log('   Posted by:', savedRide.poster.name);
      console.log('   Route:', savedRide.from, '→', savedRide.to);
    } else {
      console.log('❌ Ride NOT found in database!');
    }
    console.log('');

    // Count total rides
    const totalRides = await Ride.countDocuments();
    console.log('📊 Total rides in database:', totalRides);
    console.log('');

    console.log('✅ Test complete!');
    console.log('💡 Check the database with: node check-database.js');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    process.exit(1);
  }
}

// Run test
testRideCreation();

