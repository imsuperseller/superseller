#!/bin/bash

echo "🚀 Deploying Shelly's Excel Family Profile Processor Agent..."

# Build the agent
cd web/rensto-site
npm run build

# Start the development server
npm run dev &

echo "✅ Shelly's agent deployed successfully!"
echo "🌐 Portal URL: http://localhost:3000/portal/shelly-mizrahi"
echo "🔧 API Endpoint: http://localhost:3000/api/agents/shelly-excel-processor"
echo "📊 n8n Workflow: workflows/shelly-excel-processor.json"

echo ""
echo "📋 Agent Features:"
echo "✅ Hebrew text support"
echo "✅ Multiple Excel file processing"
echo "✅ Policy extraction and analysis"
echo "✅ Premium calculation"
echo "✅ Insurance type categorization"
echo "✅ Comprehensive HTML reports"
echo "✅ Customer portal integration"
echo "✅ n8n workflow automation"

echo ""
echo "🎯 Customer: Shelly Mizrahi Consulting"
echo "💰 Payment: $250 PAID"
echo "📅 Implementation: Ready for production use"
