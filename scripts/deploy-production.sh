#!/bin/bash

# 🚀 RENSTO PRODUCTION DEPLOYMENT SCRIPT
# Deploy the complete SaaS platform to production

set -e

echo "🚀 Starting Rensto Production Deployment..."

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v mongod &> /dev/null; then
        print_warning "MongoDB is not installed - please install MongoDB Community Edition"
    fi
    
    print_success "Dependencies check completed"
}

# Deploy API Server
deploy_api() {
    print_status "Deploying API Server..."
    
    cd /Users/shaifriedman/New\ Rensto/rensto/apps/api
    
    # Install dependencies
    print_status "Installing API dependencies..."
    npm install
    
    # Build the API
    print_status "Building API..."
    npm run build
    
    # Start the API server
    print_status "Starting API server..."
    nohup node server.js > /tmp/rensto-api.log 2>&1 &
    
    # Wait for API to start
    sleep 5
    
    # Check if API is running
    if curl -s http://localhost:3000/health > /dev/null; then
        print_success "API server deployed successfully"
    else
        print_error "API server failed to start"
        exit 1
    fi
}

# Deploy Frontend
deploy_frontend() {
    print_status "Deploying Frontend..."
    
    cd /Users/shaifriedman/New\ Rensto/rensto/apps/web/rensto-site
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Build the frontend
    print_status "Building frontend..."
    npm run build
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    npx vercel --prod --yes
    
    print_success "Frontend deployed successfully"
}

# Setup MongoDB
setup_mongodb() {
    print_status "Setting up MongoDB..."
    
    # Check if MongoDB is running
    if ! pgrep -x "mongod" > /dev/null; then
        print_status "Starting MongoDB..."
        brew services start mongodb-community
        sleep 5
    fi
    
    # Create database and collections
    print_status "Creating database and collections..."
    mongosh --eval "
        use rensto-saas;
        db.createCollection('customers');
        db.createCollection('subscriptions');
        db.createCollection('usage');
        print('Database and collections created successfully');
    "
    
    print_success "MongoDB setup completed"
}

# Setup Stripe Webhooks
setup_stripe() {
    print_status "Setting up Stripe webhooks..."
    
    print_warning "Please configure Stripe webhooks manually:"
    print_warning "1. Go to Stripe Dashboard > Webhooks"
    print_warning "2. Add endpoint: https://api.rensto.com/api/subscriptions/webhook"
    print_warning "3. Select events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted"
    print_warning "4. Copy webhook secret to environment variables"
    
    print_success "Stripe webhook setup instructions provided"
}

# Main deployment function
main() {
    print_status "Starting Rensto Production Deployment..."
    
    # Check dependencies
    check_dependencies
    
    # Setup MongoDB
    setup_mongodb
    
    # Deploy API
    deploy_api
    
    # Deploy Frontend
    deploy_frontend
    
    # Setup Stripe
    setup_stripe
    
    print_success "🎉 Rensto Production Deployment Completed!"
    print_status "API Server: http://localhost:3000"
    print_status "Health Check: http://localhost:3000/health"
    print_status "Frontend: https://rensto.com"
    print_status "Admin Dashboard: https://admin.rensto.com"
    
    print_warning "Next steps:"
    print_warning "1. Configure Stripe webhooks"
    print_warning "2. Set up production environment variables"
    print_warning "3. Configure DNS for production domains"
    print_warning "4. Test all functionality"
}

# Run main function
main "$@"
