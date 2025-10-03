#!/bin/bash

echo "🚀 Deploying Rensto Admin Dashboard to admin.rensto.com"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to admin dashboard directory
cd "$(dirname "$0")/.."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

# Set environment variables
echo "🔧 Setting environment variables..."
vercel env add AIRTABLE_API_KEY production
vercel env add ADMIN_SECRET_KEY production
vercel env add NEXT_PUBLIC_APP_URL production

# Configure custom domain
echo "🌐 Configuring custom domain..."
vercel domains add admin.rensto.com

echo "✅ Admin Dashboard deployment complete!"
echo ""
echo "🔗 Access your admin dashboard at: https://admin.rensto.com"
echo "📧 Demo credentials: admin@rensto.com / admin123"
echo ""
echo "📊 Features:"
echo "- Real-time metrics from Airtable"
echo "- Customer management"
echo "- Project tracking"
echo "- System monitoring"
echo "- Secure authentication"
