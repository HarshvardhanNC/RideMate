const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ride = require('./models/Ride');
const User = require('./models/User');

dotenv.config();

async function runFullDiagnostic() {
  try {
    console.log('═══════════════════════════════════════════════');
    console.log('🔍 FULL DATABASE DIAGNOSTIC');
    console.log('═══════════════════════════════════════════════\n');

    // Step 1: Connection
    console.log('STEP 1: Testing MongoDB Connection');
    console.log('───────────────────────────────────────────────');
    console.log('📍 URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    console.log('📊 Database name:', mongoose.connection.name);
    console.log('');

    // Step 2: Check Collections
    console.log('STEP 2: Checking Collections');
    console.log('───────────────────────────────────────────────');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name).join(', '));
    console.log('');

    // Step 3: Count Documents
    console.log('STEP 3: Counting Documents');
    console.log('───────────────────────────────────────────────');
    const usersCount = await User.countDocuments();
    const ridesCount = await Ride.countDocuments();
    console.log(`👥 Users: ${usersCount}`);
    console.log(`🚗 Rides: ${ridesCount}`);
    console.log('');

    // Step 4: List All Rides
    console.log('STEP 4: Listing All Rides');
    console.log('───────────────────────────────────────────────');
    if (ridesCount === 0) {
      console.log('⚠️  NO RIDES FOUND IN DATABASE!');
      console.log('');
    } else {
      const rides = await Ride.find().sort({ createdAt: -1 });
      rides.forEach((ride, index) => {
        console.log(`\n🚗 Ride ${index + 1}/${ridesCount}:`);
        console.log(`   ID: ${ride._id}`);
        console.log(`   Route: ${ride.from} → ${ride.to}`);
        console.log(`   Date: ${new Date(ride.date).toLocaleDateString()}`);
        console.log(`   Time: ${ride.time}`);
        console.log(`   Seats: ${ride.seatsAvailable}, Price: ₹${ride.price}`);
        console.log(`   Vehicle: ${ride.vehicleType} (${ride.vehicleNumber})`);
        console.log(`   Status: ${ride.status}`);
        console.log(`   Created: ${new Date(ride.createdAt).toLocaleString()}`);
      });
      console.log('');
    }

    // Step 5: Test Creating a New Ride
    console.log('STEP 5: Testing Ride Creation');
    console.log('───────────────────────────────────────────────');
    
    // Find or create test user
    let testUser = await User.findOne();
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await User.create({
        name: 'Diagnostic Test User',
        email: 'diagnostic@test.com',
        password: 'password123',
        phone: '9999999999',
        college: 'Test College',
        year: '3rd Year'
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Using existing user:', testUser.email);
    }

    // Create test ride
    console.log('Creating test ride...');
    const timestamp = new Date().toISOString().substring(11, 19).replace(/:/g, '');
    const testRide = await Ride.create({
      from: 'Test Location A',
      to: 'Test Location B',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      time: '15:30',
      seatsAvailable: 3,
      price: 75,
      description: `Diagnostic test ride created at ${new Date().toLocaleString()}`,
      vehicleType: 'Car',
      vehicleNumber: `TEST-${timestamp}`,
      college: 'Test College',
      contactPhone: '9999999999',
      poster: testUser._id
    });

    console.log('✅ Test ride created successfully!');
    console.log('   ID:', testRide._id);
    console.log('   Vehicle:', testRide.vehicleNumber);
    console.log('');

    // Step 6: Verify Persistence
    console.log('STEP 6: Verifying Persistence');
    console.log('───────────────────────────────────────────────');
    
    // Wait a moment for database to persist
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCount = await Ride.countDocuments();
    console.log(`Previous count: ${ridesCount}`);
    console.log(`Current count: ${newCount}`);
    
    if (newCount > ridesCount) {
      console.log('✅ Ride persisted successfully!');
      console.log(`   Increase: +${newCount - ridesCount} ride(s)`);
    } else {
      console.log('❌ WARNING: Ride count did not increase!');
      console.log('   This means rides are NOT being saved to database!');
    }
    console.log('');

    // Step 7: Final Summary
    console.log('═══════════════════════════════════════════════');
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`✅ MongoDB Connection: Working`);
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`👥 Total Users: ${await User.countDocuments()}`);
    console.log(`🚗 Total Rides: ${await Ride.countDocuments()}`);
    console.log(`✅ Test Ride Creation: ${newCount > ridesCount ? 'Working' : 'FAILED'}`);
    console.log('');

    if (newCount <= ridesCount) {
      console.log('⚠️  PROBLEM DETECTED:');
      console.log('   Rides are being created but NOT persisting to database!');
      console.log('   Possible causes:');
      console.log('   1. MongoDB transaction/write concern issue');
      console.log('   2. Schema validation failing silently');
      console.log('   3. Connection closing before write completes');
      console.log('');
    }

    console.log('═══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ DIAGNOSTIC FAILED');
    console.error('───────────────────────────────────────────────');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run diagnostic
runFullDiagnostic();

