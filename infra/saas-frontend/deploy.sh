#!/bin/bash

# Lead Enrichment SaaS Frontend Deployment Script
echo "🚀 Deploying Lead Enrichment SaaS Frontend..."

# Navigate to frontend directory
cd /Users/shaifriedman/New\ Rensto/rensto/infra/saas-frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Start the application
    echo "🚀 Starting application..."
    npm start
    
    echo "🌐 Application is running at: http://localhost:3000"
    echo "📋 Next steps:"
    echo "   1. Test the lead enrichment form"
    echo "   2. Verify webhook integration with n8n"
    echo "   3. Test end-to-end workflow"
    echo "   4. Deploy to production (Vercel/Netlify)"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
