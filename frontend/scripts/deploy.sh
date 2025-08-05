#!/bin/bash

# Deployment script for Company Assets Management System
# This script helps prepare and deploy the application

echo "🚀 Starting deployment preparation..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Check if environment variables are set
echo "📋 Checking environment variables..."

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_API_URL is not set"
    echo "   Please set it in your Vercel environment variables"
    echo "   Example: https://your-backend-domain.com"
else
    echo "✅ NEXT_PUBLIC_API_URL is set to: $NEXT_PUBLIC_API_URL"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Check for common issues
echo "🔍 Checking for common deployment issues..."

# Check if API URL is accessible (if set)
if [ ! -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "🌐 Testing backend connectivity..."
    if curl -s --max-time 10 "$NEXT_PUBLIC_API_URL/api/health" > /dev/null; then
        echo "✅ Backend is accessible"
    else
        echo "⚠️  Warning: Backend might not be accessible"
        echo "   Please ensure your backend is deployed and running"
    fi
fi

# Check for TypeScript errors
echo "🔍 Checking TypeScript..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ No TypeScript errors found"
else
    echo "❌ TypeScript errors found. Please fix them before deploying."
    exit 1
fi

# Check for linting errors
echo "🔍 Running linter..."
npm run lint

if [ $? -eq 0 ]; then
    echo "✅ No linting errors found"
else
    echo "⚠️  Linting warnings found. Consider fixing them."
fi

echo ""
echo "🎉 Deployment preparation completed!"
echo ""
echo "📝 Next steps:"
echo "1. Deploy your backend to a hosting platform (Railway, Render, Heroku, etc.)"
echo "2. Set NEXT_PUBLIC_API_URL in your Vercel environment variables"
echo "3. Deploy your frontend to Vercel"
echo "4. Test the application"
echo ""
echo "📚 For detailed instructions, see VERCEL_DEPLOYMENT.md" 