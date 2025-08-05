# Backend Deployment Guide

## Quick Deployment Options

### 1. Railway (Recommended - Free Tier Available)

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect your GitHub** repository
3. **Create a new project** and select your repository
4. **Set the root directory** to `Backend/`
5. **Add environment variables**:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   ```
6. **Deploy** - Railway will automatically detect it's a Node.js app

### 2. Render (Free Tier Available)

1. **Sign up** at [render.com](https://render.com)
2. **Create a new Web Service**
3. **Connect your GitHub** repository
4. **Configure the service**:
   - **Name**: `company-assets-backend`
   - **Root Directory**: `Backend/`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Add environment variables** (same as above)
6. **Deploy**

### 3. Heroku (Paid)

1. **Install Heroku CLI** and login
2. **Create a new app**: `heroku create your-app-name`
3. **Set environment variables**:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   heroku config:set JWT_SECRET=your_jwt_secret_key
   heroku config:set NODE_ENV=production
   ```
4. **Deploy**: `git push heroku main`

### 4. DigitalOcean App Platform

1. **Create a new app** in DigitalOcean
2. **Connect your repository**
3. **Set the source directory** to `Backend/`
4. **Configure environment variables**
5. **Deploy**

## Environment Variables

Make sure to set these environment variables in your hosting platform:

```bash
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_super_secret_jwt_key_here

# Optional
NODE_ENV=production
PORT=4000
```

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)

1. **Sign up** at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create a free cluster**
3. **Create a database user**
4. **Get your connection string**
5. **Add your IP to the whitelist** (or use 0.0.0.0/0 for all IPs)

### Option 2: Local MongoDB

For development only. Not recommended for production.

## Testing Your Deployment

After deployment, test your backend:

1. **Health Check**: `GET https://your-backend-url.com/api/health`
2. **Should return**:
   ```json
   {
     "status": "OK",
     "message": "Company Assets Management API is running",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "environment": "production"
   }
   ```

## CORS Configuration

The backend is already configured to allow:
- All localhost ports (development)
- All Vercel domains (`*.vercel.app`)
- Common custom domains (`.com`, `.net`, `.org`, `.io`, `.dev`)

If you need to add more domains, update the CORS configuration in `src/app.ts`.

## Troubleshooting

### Common Issues

1. **Port Issues**: Make sure your hosting platform uses the `PORT` environment variable
2. **MongoDB Connection**: Verify your connection string and network access
3. **Environment Variables**: Double-check all required variables are set
4. **Build Errors**: Check the build logs for any missing dependencies

### Debug Commands

```bash
# Check if the app starts locally
cd Backend
npm install
npm start

# Test the health endpoint
curl http://localhost:4000/api/health

# Check environment variables
echo $MONGODB_URI
echo $JWT_SECRET
```

## Performance Optimization

For production deployments:

1. **Enable compression** (already included)
2. **Set up proper logging**
3. **Configure rate limiting**
4. **Set up monitoring**
5. **Use a CDN for static assets**

## Security Checklist

- [ ] JWT_SECRET is a strong, random string
- [ ] MongoDB connection uses authentication
- [ ] CORS is properly configured
- [ ] Environment variables are set
- [ ] No sensitive data in code
- [ ] HTTPS is enabled (automatic on most platforms)

## Next Steps

After deploying your backend:

1. **Get your backend URL** (e.g., `https://your-app.railway.app`)
2. **Update your frontend environment variables** in Vercel
3. **Redeploy your frontend**
4. **Test the complete application** 