# Company Assets Management System - Setup Guide

## Issues Fixed

1. **Frontend Routing Issue**: The main page now properly redirects to login/signup instead of showing assets directly
2. **Authentication Flow**: Added proper authentication context and guards
3. **API Error Handling**: Improved error messages for 500 errors and network issues
4. **MongoDB Connection**: Added proper environment configuration

## Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **npm** or **yarn**

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up MongoDB:**
   
   **Option A: Local MongoDB**
   - Download and install MongoDB Community Server
   - Start MongoDB service: `net start MongoDB`
   
   **Option B: MongoDB Atlas (Recommended)**
   - Create free account at https://www.mongodb.com/atlas
   - Get connection string and update `.env` file

4. **Environment Variables:**
   The `.env` file should contain:
   ```
   NODE_ENV=development
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/company-assets
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```

6. **Test backend:**
   ```bash
   curl http://localhost:4000/api/health
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start frontend development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## Authentication Flow

### New User Flow:
1. Visit `http://localhost:3000`
2. Redirected to `/login`
3. Click "Create new account" to go to `/signup`
4. Fill out registration form
5. Automatically logged in and redirected to `/dashboard`

### Existing User Flow:
1. Visit `http://localhost:3000`
2. Redirected to `/login`
3. Enter credentials
4. Redirected to `/dashboard`

## Troubleshooting

### 500 Error (Server Error)
- **Cause**: MongoDB connection failed
- **Solution**: 
  1. Ensure MongoDB is running
  2. Check `.env` file configuration
  3. Verify MongoDB connection string

### Network Error
- **Cause**: Backend server not running
- **Solution**: Start backend with `npm run dev`

### Authentication Issues
- **Cause**: JWT token expired or invalid
- **Solution**: Clear browser storage and login again

## File Structure

```
company-assets-managment-system/
├── Backend/
│   ├── src/
│   │   ├── app.ts              # Main server file
│   │   ├── config/
│   │   │   └── database.ts     # MongoDB connection
│   │   ├── routes/             # API routes
│   │   └── models/             # Database models
│   └── .env                    # Environment variables
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── AuthContext.tsx # Authentication context
│   │   │   ├── AuthGuard.tsx   # Route protection
│   │   │   └── ErrorBoundary.tsx # Error handling
│   │   ├── login/page.tsx      # Login page
│   │   ├── signup/page.tsx     # Signup page
│   │   └── page.tsx            # Main redirect page
│   └── lib/
│       └── api.ts              # API client
└── SETUP.md                    # This file
```

## Features

- ✅ User authentication (login/signup)
- ✅ Protected routes
- ✅ Error handling and boundaries
- ✅ Responsive design
- ✅ API integration
- ✅ MongoDB database
- ✅ JWT token management

## Next Steps

1. Set up MongoDB (local or Atlas)
2. Start backend server
3. Start frontend server
4. Test authentication flow
5. Add assets and test CRUD operations 