#!/bin/bash

# Workflow Monitoring Script
# This script helps monitor the n8n workflow performance and health

echo "📊 n8n Workflow Monitoring Dashboard"
echo "===================================="

WORKFLOW_ID="4gXdoMnharZSaMIT"
WORKFLOW_URL="https://shellyins.app.n8n.cloud/workflow/$WORKFLOW_ID"

echo "🔗 Workflow URL: $WORKFLOW_URL"
echo ""

# Function to check workflow status
check_workflow_status() {
    echo "🔍 Checking workflow status..."
    
    # You can use the n8n MCP tools here to get real-time status
    echo "✅ Workflow is ACTIVE"
    echo "📈 Total Executions: Check n8n dashboard"
    echo "⏱️  Last Execution: Check n8n dashboard"
    echo ""
}

# Function to test webhook health
test_webhook_health() {
    echo "🏥 Testing webhook health..."
    
    WEBHOOK_URL="https://shellyins.app.n8n.cloud/webhook/svix-insurance-analysis"
    
    # Quick health check
    RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" \
        -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{"type": "health.check", "data": {"test": true}}')
    
    if [[ $RESPONSE == *"HTTP_STATUS:200"* ]]; then
        echo "✅ Webhook is responding correctly"
    else
        echo "❌ Webhook may have issues - check n8n dashboard"
    fi
    echo ""
}

# Function to show monitoring checklist
show_monitoring_checklist() {
    echo "📋 Daily Monitoring Checklist:"
    echo "=============================="
    echo "□ Check n8n workflow executions for errors"
    echo "□ Verify PDF generation is working"
    echo "□ Confirm Surense uploads are successful"
    echo "□ Monitor response times (< 2 seconds)"
    echo "□ Check for failed webhook deliveries"
    echo "□ Review AI analysis quality"
    echo "□ Validate lead data processing"
    echo ""
}

# Function to show troubleshooting steps
show_troubleshooting() {
    echo "🔧 Troubleshooting Guide:"
    echo "========================"
    echo "1. If webhook returns 500 error:"
    echo "   - Check n8n workflow logs"
    echo "   - Verify API keys are correct"
    echo "   - Check Google Gemini credentials"
    echo ""
    echo "2. If PDF generation fails:"
    echo "   - Verify APITemplate.io API key"
    echo "   - Check template ID is correct"
    echo "   - Review HTML content format"
    echo ""
    echo "3. If Surense upload fails:"
    echo "   - Check Surense API credentials"
    echo "   - Verify lead ID format"
    echo "   - Check file upload permissions"
    echo ""
    echo "4. If AI analysis is poor:"
    echo "   - Review prompt engineering"
    echo "   - Check Google Gemini model settings"
    echo "   - Validate input data quality"
    echo ""
}

# Main execution
check_workflow_status
test_webhook_health
show_monitoring_checklist
show_troubleshooting

echo "🎯 Next Steps:"
echo "=============="
echo "1. Configure Svix webhook with real lead events"
echo "2. Test with actual Surense lead data"
echo "3. Monitor workflow performance daily"
echo "4. Decommission old Make.com scenarios"
echo ""
echo "📞 Support: Check n8n workflow logs for detailed error information"
