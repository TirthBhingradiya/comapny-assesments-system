# Vercel Deployment Guide

## Fixing BODY_NOT_A_STRING_FROM_FUNCTION Error

The `BODY_NOT_A_STRING_FROM_FUNCTION` error occurs when your frontend is deployed on Vercel but the backend API is not accessible. Here's how to fix it:

### 1. Environment Variables Setup

In your Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

Replace `https://your-backend-domain.com` with your actual backend URL.

### 2. Backend Deployment Options

#### Option A: Deploy Backend to Vercel (Recommended)
1. Create a new Vercel project for your backend
2. Set the root directory to `Backend/`
3. Configure the build settings:
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist` (if using TypeScript)
   - Install Command: `npm install`

#### Option B: Deploy Backend to Other Platforms
- **Railway**: Easy deployment with automatic environment variables
- **Render**: Free tier available with automatic deployments
- **Heroku**: Paid service with good performance
- **DigitalOcean App Platform**: Good for production apps

### 3. CORS Configuration

Update your backend CORS settings in `Backend/src/app.ts`:

```typescript
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://localhost:3006',
      'http://localhost:3007',
      'http://localhost:3008',
      'http://localhost:3009',
      'http://localhost:3010',
      // Add your Vercel domain here
      'https://your-app-name.vercel.app',
      'https://your-custom-domain.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 4. Database Configuration

Make sure your MongoDB connection string is properly configured in your backend environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### 5. Testing the Fix

1. Deploy your backend first
2. Update the `NEXT_PUBLIC_API_URL` in Vercel environment variables
3. Redeploy your frontend
4. Test the application

### 6. Fallback Mechanism

The updated code includes fallback mechanisms that will:
- Show a warning when the backend is unavailable
- Display demo data instead of crashing
- Disable actions that require backend connectivity
- Provide clear error messages to users

### 7. Troubleshooting

If you still get the error:

1. **Check Network Tab**: Open browser dev tools and check if API calls are failing
2. **Verify Environment Variables**: Ensure `NEXT_PUBLIC_API_URL` is set correctly in Vercel
3. **Test Backend Directly**: Try accessing your backend API directly in the browser
4. **Check CORS**: Ensure your backend allows requests from your Vercel domain
5. **Database Connection**: Verify your MongoDB connection is working

### 8. Production Checklist

- [ ] Backend deployed and accessible
- [ ] Environment variables configured in Vercel
- [ ] CORS settings updated to include Vercel domain
- [ ] Database connection working
- [ ] All API endpoints responding correctly
- [ ] Frontend deployed successfully
- [ ] Application tested end-to-end

### 9. Monitoring

After deployment, monitor your application for:
- API response times
- Error rates
- User experience
- Database performance

Use Vercel Analytics and your backend monitoring tools to track performance. 