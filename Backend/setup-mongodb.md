# MongoDB Setup Guide

## Issue: 500 Error - MongoDB Connection Failed

The backend is failing to connect to MongoDB, which is causing the 500 error. Here's how to fix it:

### Option 1: Install MongoDB Locally

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Download the Windows version
   - Install with default settings

2. **Start MongoDB Service:**
   ```powershell
   # Start MongoDB service
   net start MongoDB
   ```

3. **Verify MongoDB is running:**
   ```powershell
   # Check if MongoDB is running on port 27017
   netstat -an | findstr 27017
   ```

### Option 2: Use MongoDB Atlas (Cloud)

1. **Create free MongoDB Atlas account:**
   - Go to: https://www.mongodb.com/atlas
   - Create a free cluster

2. **Update .env file:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/company-assets
   ```

### Option 3: Use Docker (if available)

```powershell
# Pull and run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Test Connection

After setting up MongoDB, test the backend:

```powershell
# Start the backend
npm run dev

# Test the health endpoint
curl http://localhost:4000/api/health
```

### Expected Response

If MongoDB is connected successfully, you should see:
```json
{
  "status": "OK",
  "message": "Company Assets Management API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Troubleshooting

1. **Check if MongoDB is running:**
   ```powershell
   netstat -an | findstr 27017
   ```

2. **Check backend logs:**
   ```powershell
   npm run dev
   ```

3. **Verify .env file exists:**
   ```powershell
   Get-Content .env
   ``` 