import mongoose from 'mongoose';
import Asset from './models/Asset';
import User from './models/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sampleAssets = [
  {
    name: 'MacBook Pro 16"',
    type: 'electronics',
    category: 'Computers',
    status: 'active',
    condition: 'excellent',
    currentValue: 2499,
    location: 'IT Department',
    notes: 'High-performance laptop for development work',
    serialNumber: 'MBP2024001',
    manufacturer: 'Apple',
    model: 'MacBook Pro 16-inch',
    purchaseDate: new Date('2024-01-15'),
    purchasePrice: 2499,
    warrantyExpiry: new Date('2027-01-15'),
    assignedTo: null,
    tags: ['laptop', 'development', 'high-performance']
  },
  {
    name: 'Dell XPS 15',
    type: 'electronics',
    category: 'Computers',
    status: 'active',
    condition: 'good',
    currentValue: 1899,
    location: 'Marketing Department',
    notes: 'Design and content creation laptop',
    serialNumber: 'DXP2024002',
    manufacturer: 'Dell',
    model: 'XPS 15 9520',
    purchaseDate: new Date('2024-02-20'),
    purchasePrice: 1899,
    warrantyExpiry: new Date('2027-02-20'),
    assignedTo: null,
    tags: ['laptop', 'design', 'marketing']
  },
  {
    name: 'iPhone 15 Pro',
    type: 'electronics',
    category: 'Mobile Devices',
    status: 'active',
    condition: 'excellent',
    currentValue: 999,
    location: 'Sales Department',
    notes: 'Company phone for sales team',
    serialNumber: 'IPH2024003',
    manufacturer: 'Apple',
    model: 'iPhone 15 Pro',
    purchaseDate: new Date('2024-03-10'),
    purchasePrice: 999,
    warrantyExpiry: new Date('2027-03-10'),
    assignedTo: null,
    tags: ['phone', 'mobile', 'sales']
  },
  {
    name: 'Samsung 4K Monitor',
    type: 'electronics',
    category: 'Displays',
    status: 'active',
    condition: 'excellent',
    currentValue: 599,
    location: 'Design Department',
    notes: '4K monitor for design work',
    serialNumber: 'SAM2024004',
    manufacturer: 'Samsung',
    model: 'LU28R550UQRXZA',
    purchaseDate: new Date('2024-01-30'),
    purchasePrice: 599,
    warrantyExpiry: new Date('2027-01-30'),
    assignedTo: null,
    tags: ['monitor', '4k', 'design']
  },
  {
    name: 'HP LaserJet Pro',
    type: 'equipment',
    category: 'Printers',
    status: 'active',
    condition: 'good',
    currentValue: 299,
    location: 'Office',
    notes: 'Office printer for general use',
    serialNumber: 'HP2024005',
    manufacturer: 'HP',
    model: 'LaserJet Pro M404n',
    purchaseDate: new Date('2024-02-15'),
    purchasePrice: 299,
    warrantyExpiry: new Date('2027-02-15'),
    assignedTo: null,
    tags: ['printer', 'office', 'laserjet']
  },
  {
    name: 'iPad Pro 12.9"',
    type: 'electronics',
    category: 'Tablets',
    status: 'maintenance',
    condition: 'fair',
    currentValue: 1099,
    location: 'IT Department',
    notes: 'Tablet for presentations and design work',
    serialNumber: 'IPD2024006',
    manufacturer: 'Apple',
    model: 'iPad Pro 12.9-inch',
    purchaseDate: new Date('2024-01-20'),
    purchasePrice: 1099,
    warrantyExpiry: new Date('2027-01-20'),
    assignedTo: null,
    tags: ['tablet', 'presentations', 'design']
  },
  {
    name: 'Microsoft Surface Pro',
    type: 'electronics',
    category: 'Computers',
    status: 'active',
    condition: 'excellent',
    currentValue: 1299,
    location: 'Engineering Department',
    notes: '2-in-1 laptop for engineering work',
    serialNumber: 'MSP2024007',
    manufacturer: 'Microsoft',
    model: 'Surface Pro 9',
    purchaseDate: new Date('2024-03-05'),
    purchasePrice: 1299,
    warrantyExpiry: new Date('2027-03-05'),
    assignedTo: null,
    tags: ['laptop', '2-in-1', 'engineering']
  },
  {
    name: 'Logitech MX Master 3',
    type: 'electronics',
    category: 'Accessories',
    status: 'active',
    condition: 'excellent',
    currentValue: 99,
    location: 'Design Department',
    notes: 'Wireless mouse for design work',
    serialNumber: 'LOG2024008',
    manufacturer: 'Logitech',
    model: 'MX Master 3',
    purchaseDate: new Date('2024-02-25'),
    purchasePrice: 99,
    warrantyExpiry: new Date('2026-02-25'),
    assignedTo: null,
    tags: ['mouse', 'wireless', 'design']
  },
  {
    name: 'Ergonomic Office Chair',
    type: 'furniture',
    category: 'Seating',
    status: 'active',
    condition: 'excellent',
    currentValue: 299,
    location: 'HR Department',
    notes: 'Ergonomic chair for employee comfort',
    serialNumber: 'CHA2024009',
    manufacturer: 'Herman Miller',
    model: 'Aeron',
    purchaseDate: new Date('2024-01-10'),
    purchasePrice: 299,
    warrantyExpiry: new Date('2029-01-10'),
    assignedTo: null,
    tags: ['chair', 'ergonomic', 'office']
  },
  {
    name: 'Standing Desk',
    type: 'furniture',
    category: 'Desks',
    status: 'active',
    condition: 'good',
    currentValue: 399,
    location: 'Engineering Department',
    notes: 'Adjustable standing desk for health',
    serialNumber: 'DSK2024010',
    manufacturer: 'Uplift Desk',
    model: 'V2 Commercial',
    purchaseDate: new Date('2024-02-05'),
    purchasePrice: 399,
    warrantyExpiry: new Date('2029-02-05'),
    assignedTo: null,
    tags: ['desk', 'standing', 'adjustable']
  },
  {
    name: 'Adobe Creative Suite License',
    type: 'software',
    category: 'Design Software',
    status: 'active',
    condition: 'excellent',
    currentValue: 599,
    location: 'Design Department',
    notes: 'Annual license for design team',
    serialNumber: 'ADB2024011',
    manufacturer: 'Adobe',
    model: 'Creative Suite 2024',
    purchaseDate: new Date('2024-01-01'),
    purchasePrice: 599,
    warrantyExpiry: new Date('2025-01-01'),
    assignedTo: null,
    tags: ['software', 'design', 'adobe']
  },
  {
    name: 'Company Vehicle - Tesla Model 3',
    type: 'vehicle',
    category: 'Electric Vehicles',
    status: 'active',
    condition: 'excellent',
    currentValue: 45000,
    location: 'Fleet Management',
    notes: 'Company car for executive travel',
    serialNumber: 'TES2024012',
    manufacturer: 'Tesla',
    model: 'Model 3 Long Range',
    purchaseDate: new Date('2024-03-01'),
    purchasePrice: 45000,
    warrantyExpiry: new Date('2029-03-01'),
    assignedTo: null,
    tags: ['vehicle', 'electric', 'tesla']
  }
];

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

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/company-assets';
    await mongoose.connect(mongoURI);
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await Asset.deleteMany({});
    await User.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`👤 Created user: ${user.firstName} ${user.lastName} (${user.role})`);
    }

    // Create assets
    for (const assetData of sampleAssets) {
      const asset = new Asset(assetData);
      await asset.save();
      console.log(`💻 Created asset: ${asset.name}`);
    }

    // Assign some assets to users
    const assets = await Asset.find({});
    const users = await User.find({});
    
    if (assets.length > 0 && users.length > 0) {
      // Assign first asset to admin user
      await Asset.findByIdAndUpdate(assets[0]._id, { assignedTo: users[0]._id });

      // Assign second asset to manager user
      if (assets.length > 1 && users.length > 1) {
        await Asset.findByIdAndUpdate(assets[1]._id, { assignedTo: users[1]._id });
      }
      
      // Assign third asset to employee user
      if (assets.length > 2 && users.length > 2) {
        await Asset.findByIdAndUpdate(assets[2]._id, { assignedTo: users[2]._id });
      }
    }



  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
} 