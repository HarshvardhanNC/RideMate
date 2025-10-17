const mongoose = require('mongoose');
const User = require('./models/User');
const Ride = require('./models/Ride');

// Sample data for testing
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '9876543210',
    college: 'IIT Bombay',
    year: '3rd Year',
    whatsapp: '9876543210'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    phone: '9876543211',
    college: 'IIT Bombay',
    year: '2nd Year',
    whatsapp: '9876543211'
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    phone: '9876543212',
    college: 'IIT Delhi',
    year: '4th Year',
    whatsapp: '9876543212'
  }
];

const sampleRides = [
  {
    from: 'IIT Bombay',
    to: 'Central Station',
    date: new Date('2024-01-15'),
    time: '08:30',
    seatsAvailable: 3,
    price: 50,
    description: 'Going to Central Station by auto, sharing fare for remaining 2 seats',
    vehicleType: 'Auto',
    vehicleNumber: 'MH-01-AB-1234',
    college: 'IIT Bombay',
    contactPhone: '9876543210',
    whatsappContact: '9876543210'
  },
  {
    from: 'IIT Delhi',
    to: 'Airport',
    date: new Date('2024-01-16'),
    time: '14:00',
    seatsAvailable: 2,
    price: 80,
    description: 'Airport drop by car, sharing fare for remaining 1 seat',
    vehicleType: 'Car',
    vehicleNumber: 'DL-01-CD-5678',
    college: 'IIT Delhi',
    contactPhone: '9876543212',
    whatsappContact: '9876543212'
  }
];

const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ridemate', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Ride.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    console.log(`Created ${users.length} users`);

    // Create sample rides with user references
    const rides = await Ride.create([
      {
        ...sampleRides[0],
        poster: users[0]._id
      },
      {
        ...sampleRides[1],
        poster: users[2]._id
      }
    ]);
    console.log(`Created ${rides.length} rides`);

    // Add some passengers to rides
    await rides[0].addPassenger(users[1]._id);
    console.log('Added passengers to rides');

    console.log('\n✅ Database setup complete!');
    console.log('\n📊 Sample Data Created:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🚗 Ride-sharing Posts: ${rides.length}`);
    console.log('\n🔗 MongoDB Compass Connection:');
    console.log('mongodb://localhost:27017/ridemate');
    console.log('\n📝 Collections to explore:');
    console.log('- users (student profiles)');
    console.log('- rides (ride-sharing posts)');
    console.log('\n💡 Ride-sharing Concept:');
    console.log('- Students post rides they are taking');
    console.log('- Other students can join to share fare');
    console.log('- Everyone splits the cost equally');

    process.exit(0);
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
