const mongoose = require('mongoose');

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

const User = mongoose.model('User', userSchema);

async function checkAndAddUsers() {
  try {
    console.log('🔍 Checking MongoDB connection...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/company-assets';
    await mongoose.connect(mongoURI);

    // Check existing users
    const existingUsers = await User.find({});

    existingUsers.forEach(user => {
    });
    
    // Add more real employee data if needed
    const realEmployees = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@company.com',
        password: 'password123',
        role: 'employee',
        department: 'IT',
        position: 'Software Developer',
        employeeId: 'EMP101',
        phone: '+1234567890',
        isActive: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Marketing',
        position: 'Marketing Specialist',
        employeeId: 'EMP102',
        phone: '+1234567891',
        isActive: true
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@company.com',
        password: 'password123',
        role: 'employee',
        department: 'Sales',
        position: 'Sales Representative',
        employeeId: 'EMP103',
        phone: '+1234567892',
        isActive: true
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@company.com',
        password: 'password123',
        role: 'employee',
        department: 'HR',
        position: 'HR Coordinator',
        employeeId: 'EMP104',
        phone: '+1234567893',
        isActive: true
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@company.com',
        password: 'password123',
        role: 'employee',
        department: 'IT',
        position: 'System Administrator',
        employeeId: 'EMP105',
        phone: '+1234567894',
        isActive: true
      }
    ];
    
    // Check if we need to add more employees
    const employeeCount = existingUsers.filter(u => u.role === 'employee').length;
    console.log(`\n👥 Current employee count: ${employeeCount}`);
    
    if (employeeCount < 3) {
      console.log('\n➕ Adding more employee data...');
      
      for (const employeeData of realEmployees) {
        // Check if user already exists
        const existingUser = await User.findOne({ email: employeeData.email });
        if (!existingUser) {
          const user = new User(employeeData);
          await user.save();
          console.log(`✅ Added employee: ${user.firstName} ${user.lastName} (${user.email})`);
        } else {
          console.log(`⚠️ Employee already exists: ${employeeData.email}`);
        }
      }
    }
    
    // Show final user list
    const finalUsers = await User.find({});
    console.log(`\n📋 Final user count: ${finalUsers.length}`);
    console.log('\n👥 Employees available for assignment:');
    
    finalUsers.filter(u => u.role === 'employee').forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.department} - ${user.position}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkAndAddUsers(); 