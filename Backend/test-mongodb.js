const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Sample users data
const sampleUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin',
    department: 'IT',
    position: 'System Administrator',
    employeeId: 'EMP001',
    phone: '+1234567890',
    isActive: true
  },
  {
    firstName: 'Manager',
    lastName: 'User',
    email: 'manager@company.com',
    password: 'manager123',
    role: 'manager',
    department: 'Operations',
    position: 'Operations Manager',
    employeeId: 'EMP002',
    phone: '+1234567891',
    isActive: true
  },
  {
    firstName: 'Employee',
    lastName: 'User',
    email: 'employee@company.com',
    password: 'employee123',
    role: 'employee',
    department: 'IT',
    position: 'Software Developer',
    employeeId: 'EMP003',
    phone: '+1234567892',
    isActive: true
  }
];

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, required: true, enum: ['admin', 'manager', 'employee'], default: 'employee' },
  department: { type: String, required: true, trim: true },
  position: { type: String, required: false, trim: true },
  employeeId: { type: String, required: true, unique: true, trim: true },
  phone: { type: String, trim: true },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

async function testMongoDB() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/company-assets';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');
    
    // Create users
    console.log('👤 Creating users...');
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.role})`);
    }
    
    // Verify users were created
    const users = await User.find({});
    console.log(`📊 Total users in database: ${users.length}`);
    
    // Show user details
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@company.com / admin123');
    console.log('Manager: manager@company.com / manager123');
    console.log('Employee: employee@company.com / employee123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB is not running. Please start MongoDB first:');
      console.log('1. Install MongoDB: https://www.mongodb.com/try/download/community');
      console.log('2. Start MongoDB service');
      console.log('3. Or use MongoDB Atlas (cloud)');
    }
    
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testMongoDB(); 