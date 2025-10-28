const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ride = require('./models/Ride');
const User = require('./models/User');

dotenv.config();

const sampleRides = [
  {
    from: 'College Campus',
    to: 'Central Station',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    time: '08:30',
    seatsAvailable: 3,
    price: 50,
    description: 'Going to Central Station by auto, sharing fare',
    vehicleType: 'Auto',
    vehicleNumber: 'MH-01-AB-1234',
    college: 'IIT Bombay',
    contactPhone: '9876543210',
    whatsappContact: '9876543210'
  },
  {
    from: 'College Campus',
    to: 'Airport',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    time: '14:00',
    seatsAvailable: 2,
    price: 80,
    description: 'Airport drop by car, comfortable ride',
    vehicleType: 'Car',
    vehicleNumber: 'MH-02-CD-5678',
    college: 'IIT Bombay',
    contactPhone: '9876543211',
    whatsappContact: '9876543211'
  },
  {
    from: 'Andheri Station',
    to: 'College Campus',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    time: '07:00',
    seatsAvailable: 4,
    price: 40,
    description: 'Morning ride to college',
    vehicleType: 'Auto',
    vehicleNumber: 'MH-01-EF-9012',
    college: 'IIT Bombay',
    contactPhone: '9876543212',
    whatsappContact: '9876543212'
  },
  {
    from: 'College Campus',
    to: 'Mall Area',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    time: '18:00',
    seatsAvailable: 3,
    price: 35,
    description: 'Evening shopping trip',
    vehicleType: 'Car',
    vehicleNumber: 'MH-03-GH-3456',
    college: 'IIT Bombay',
    contactPhone: '9876543213',
    whatsappContact: '9876543213'
  },
  {
    from: 'Bandra Station',
    to: 'College Campus',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    time: '08:00',
    seatsAvailable: 2,
    price: 60,
    description: 'Regular morning commute',
    vehicleType: 'Car',
    vehicleNumber: 'MH-01-IJ-7890',
    college: 'IIT Bombay',
    contactPhone: '9876543214',
    whatsappContact: '9876543214'
  }
];

async function addSampleRides() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if there are any existing rides
    const existingRidesCount = await Ride.countDocuments();
    console.log(`📊 Existing rides in database: ${existingRidesCount}`);

    if (existingRidesCount > 0) {
      console.log('ℹ️  Database already has rides. Skipping sample data creation.');
      console.log('💡 Use --force flag to add sample rides anyway.');
      
      // Show existing rides
      const rides = await Ride.find().limit(5);
      console.log('\n📦 Sample of existing rides:');
      rides.forEach((ride, index) => {
        console.log(`   ${index + 1}. ${ride.from} → ${ride.to} (${ride.seatsAvailable} seats, ₹${ride.price})`);
      });
      
      process.exit(0);
    }

    // Find first user or create a sample user
    let sampleUser = await User.findOne();
    
    if (!sampleUser) {
      console.log('👤 No users found. Creating sample user...');
      sampleUser = await User.create({
        name: 'Sample User',
        email: 'sample@ridemate.com',
        password: 'password123',
        phone: '9876543210',
        college: 'IIT Bombay',
        year: '3rd Year',
        whatsapp: '9876543210'
      });
      console.log('✅ Sample user created');
    }

    console.log('\n🚗 Adding sample rides...');
    
    // Add poster to each ride
    const ridesWithPoster = sampleRides.map(ride => ({
      ...ride,
      poster: sampleUser._id
    }));

    const createdRides = await Ride.create(ridesWithPoster);
    
    console.log(`✅ Successfully added ${createdRides.length} sample rides!`);
    console.log('\n📦 Created rides:');
    createdRides.forEach((ride, index) => {
      console.log(`   ${index + 1}. ${ride.from} → ${ride.to}`);
      console.log(`      Date: ${ride.date.toDateString()}, Time: ${ride.time}`);
      console.log(`      Seats: ${ride.seatsAvailable}, Price: ₹${ride.price}`);
    });

    console.log('\n🎉 Sample data setup complete!');
    console.log('💡 You can now view these rides on the Live Rides page');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample rides:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  addSampleRides();
}

module.exports = addSampleRides;

