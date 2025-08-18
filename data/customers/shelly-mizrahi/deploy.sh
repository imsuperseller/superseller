#!/bin/bash
# Rensto Production Deployment Script

echo "🚀 Deploying Rensto to production..."

# Build the website
echo "📦 Building website..."
npm run build

# Test the build
echo "🧪 Running tests..."
node scripts/test-website-functionality.js

# Deploy to hosting platform
echo "🌐 Deploying to hosting..."
# Add your deployment commands here
# Example for Netlify:
# netlify deploy --prod --dir=website

echo "✅ Deployment complete!"
echo "🌍 Website is live at: https://rensto.com"
