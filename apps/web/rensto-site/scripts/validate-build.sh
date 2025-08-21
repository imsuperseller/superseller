#!/bin/bash

echo "🔨 Validating Build Process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run build
echo "🔨 Running build..."
npm run build

# Check build output
if [ -d ".next" ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build validation complete"
