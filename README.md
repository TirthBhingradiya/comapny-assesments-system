# Company Assets Management System

A modern, full-stack web application for managing company assets with role-based access control and comprehensive asset tracking capabilities.

## 🚀 Features

### User Roles & Authentication
- **Admin**: Full system access - manage all assets, users, and organizational structure
- **Manager**: Team management - assign assets to employees, track returns, review status
- **Employee**: Personal asset view - see assigned assets, request support

### Asset Management
- **CRUD Operations**: Create, read, update, and delete assets
- **Asset Allocation**: Assign assets to employees with tracking
- **Asset Logs**: Complete history of assignments and returns
- **Maintenance Tracking**: Record maintenance history and costs
- **Image Upload**: Support for asset images
- **Search & Filter**: Advanced search and filtering capabilities

### Frontend Features
- **Modern UI**: Responsive design with Tailwind CSS
- **Role-based Dashboards**: Different interfaces for each user role
- **Real-time Updates**: Live data updates with React Query
- **Form Validation**: Comprehensive client-side validation
- **Toast Notifications**: User-friendly feedback system

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **JWT** authentication
- **bcryptjs** for password hashing
- **multer** for file uploads
- **helmet** for security headers

### Frontend
- **Next.js 14** with **TypeScript**
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Hook Form** for form management
- **Heroicons** for icons
- **React Hot Toast** for notifications

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/company-assets
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## 🚀 Usage

### Demo Accounts

The system comes with pre-configured demo accounts:

#### Admin Account
- **Email**: admin@company.com
- **Password**: admin123
- **Capabilities**: Full system access

#### Manager Account
- **Email**: manager@company.com
- **Password**: manager123
- **Capabilities**: Team management, asset allocation

#### Employee Account
- **Email**: employee@company.com
- **Password**: employee123
- **Capabilities**: View assigned assets

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/change-password` - Change password

#### Assets
- `GET /api/assets` - Get all assets (with filtering)
- `GET /api/assets/:id` - Get single asset
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `POST /api/assets/:id/maintenance` - Add maintenance record
- `GET /api/assets/stats/overview` - Get asset statistics

#### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `PATCH /api/users/:id/toggle-status` - Toggle user status (admin only)

## 📁 Project Structure

```
company-assets-managment-system/
├── Backend/
│   ├── src/
│   │   ├── app.ts                 # Main Express application
│   │   ├── config/
│   │   │   └── database.ts        # MongoDB connection
│   │   ├── models/
│   │   │   ├── Asset.ts           # Asset model
│   │   │   └── User.ts            # User model
│   │   ├── routes/
│   │   │   ├── assetRoutes.ts     # Asset endpoints
│   │   │   ├── userRoutes.ts      # User endpoints
│   │   │   └── authRoutes.ts      # Authentication endpoints
│   │   ├── middleware/
│   │   │   ├── auth.ts            # Authentication middleware
│   │   │   └── upload.ts          # File upload middleware
│   │   └── types/
│   │       └── express.d.ts       # TypeScript declarations
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── frontend/
│       ├── app/
│       │   ├── login/             # Login page
│       │   ├── signup/            # Signup page
│       │   ├── dashboard/         # Employee dashboard
│       │   ├── admin/             # Admin dashboard
│       │   └── manager/           # Manager dashboard
│       ├── components/
│       │   └── AssetCard.tsx      # Asset card component
│       ├── lib/
│       │   └── api.ts             # API service
│       ├── package.json
│       └── tailwind.config.js
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/company-assets
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Build the Next.js application:
   ```bash
   npm run build
   ```

2. Deploy to Vercel or your preferred platform

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for each user role
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Comprehensive server-side validation
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Security Headers**: Helmet.js for additional security

## 📊 Database Schema

### User Model
```typescript
{
  firstName: string
  lastName: string
  email: string (unique)
  password: string (hashed)
  role: 'admin' | 'manager' | 'employee'
  department: string
  position: string
  employeeId: string (unique)
  phone?: string
  avatar?: string
  isActive: boolean
  lastLogin?: Date
}
```

### Asset Model
```typescript
{
  name: string
  type: 'equipment' | 'furniture' | 'electronics' | 'vehicle' | 'software' | 'other'
  category: string
  serialNumber?: string (unique)
  model?: string
  manufacturer?: string
  purchaseDate: Date
  purchasePrice: number
  currentValue: number
  location: string
  assignedTo?: ObjectId (ref: User)
  status: 'active' | 'maintenance' | 'retired' | 'lost' | 'stolen'
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  warrantyExpiry?: Date
  maintenanceHistory: Array<{
    date: Date
    description: string
    cost: number
    performedBy: string
  }>
  notes?: string
  images?: string[]
  tags: string[]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using Next.js, Express.js, and MongoDB** 