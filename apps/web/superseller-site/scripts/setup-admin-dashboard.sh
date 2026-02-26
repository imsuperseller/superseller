#!/bin/bash

echo "🚀 Setting up Admin Dashboard with Airtable Integration"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Airtable Configuration
AIRTABLE_API_KEY=patYourAirtableApiKeyHere

# Admin Dashboard Configuration  
ADMIN_SECRET_KEY=your-admin-secret-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
EOF
    echo "✅ .env.local created"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

echo "🎉 Admin Dashboard setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your actual Airtable API key"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3001/admin/login"
echo "4. Use demo credentials: shai@superseller.agency / admin123"
echo ""
echo "🔗 Admin Dashboard Features:"
echo "- Real-time metrics from Airtable data"
echo "- Customer management integration"
echo "- Project tracking integration"
echo "- Progress monitoring integration"
echo "- Secure authentication"
echo "- Responsive design"
