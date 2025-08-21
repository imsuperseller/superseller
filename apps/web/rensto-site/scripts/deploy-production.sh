#!/bin/bash

# Production Deployment Script for Rensto Business System
# This script prepares and deploys the application to production

set -e

echo "🚀 Starting Production Deployment for Rensto Business System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Checking prerequisites..."

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version)
print_status "npm version: $NPM_VERSION"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Please create it with your production environment variables."
    print_status "You can copy .env.example and update the values for production."
    exit 1
fi

print_status "Installing dependencies..."
npm ci --production=false

print_status "Running linting..."
npm run lint

print_status "Running type checking..."
npm run type-check

print_status "Building for production..."
npm run build

print_status "Running tests..."
npm run test

print_success "Build completed successfully!"

print_status "Production build details:"
echo "  - Build time: $(date)"
echo "  - Node.js version: $NODE_VERSION"
echo "  - npm version: $NPM_VERSION"
echo "  - Build size: $(du -sh .next | cut -f1)"

print_status "Deployment options:"

echo "1. Deploy to Vercel (recommended)"
echo "2. Deploy to Netlify"
echo "3. Deploy to AWS"
echo "4. Deploy to Docker"
echo "5. Manual deployment"

read -p "Choose deployment option (1-5): " DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        print_status "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            print_error "Vercel CLI not found. Please install it with: npm i -g vercel"
            exit 1
        fi
        ;;
    2)
        print_status "Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod
        else
            print_error "Netlify CLI not found. Please install it with: npm i -g netlify-cli"
            exit 1
        fi
        ;;
    3)
        print_status "Deploying to AWS..."
        print_warning "AWS deployment requires additional setup. Please refer to AWS documentation."
        ;;
    4)
        print_status "Building Docker image..."
        docker build -t rensto-business-system .
        print_success "Docker image built successfully!"
        print_status "Run with: docker run -p 3000:3000 rensto-business-system"
        ;;
    5)
        print_status "Manual deployment instructions:"
        echo "1. Upload the .next folder to your server"
        echo "2. Install dependencies: npm ci --production"
        echo "3. Set environment variables"
        echo "4. Start the server: npm start"
        ;;
    *)
        print_error "Invalid option selected."
        exit 1
        ;;
esac

print_success "Deployment completed successfully!"
print_status "Your Rensto Business System is now live in production!"

echo ""
print_status "Post-deployment checklist:"
echo "✅ Verify all environment variables are set"
echo "✅ Test the admin dashboard functionality"
echo "✅ Verify customer portal access"
echo "✅ Test payment processing (if enabled)"
echo "✅ Monitor system health and performance"
echo "✅ Set up monitoring and alerting"
echo "✅ Configure SSL certificates"
echo "✅ Set up backup and recovery procedures"

print_success "🎉 Rensto Business System is ready for production use!"
