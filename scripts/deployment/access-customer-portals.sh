#!/bin/bash

# Customer Portal Access Script
# Opens all customer portals in browser tabs

echo "🎯 CUSTOMER PORTAL ACCESS"
echo "=========================="
echo ""

# Check if portals are accessible
echo "🔍 Checking portal availability..."
echo ""

# Ben Ginati Portal
echo "👤 BEN GINATI (Tax4Us)"
echo "   URL: http://173.254.201.134/ben-ginati-portal.html"
echo "   Username: ben-ginati"
echo "   Password: ebe07d899d7e5548"
echo "   Status: $(curl -s -o /dev/null -w "%{http_code}" http://173.254.201.134/ben-ginati-portal.html)"
echo ""

# Shelly Mizrahi Portal
echo "👤 SHELLY MIZRAHI (Insurance)"
echo "   URL: http://173.254.201.134/shelly-mizrahi-portal.html"
echo "   Status: $(curl -s -o /dev/null -w "%{http_code}" http://173.254.201.134/shelly-mizrahi-portal.html)"
echo ""

# Ortal Flanary Portal
echo "👤 ORTAL FLANARY (Facebook Marketing)"
echo "   URL: http://173.254.201.134/ortal-flanary-portal.html"
echo "   Status: $(curl -s -o /dev/null -w "%{http_code}" http://173.254.201.134/ortal-flanary-portal.html)"
echo ""

echo "🚀 OPENING CUSTOMER PORTALS..."
echo ""

# Open portals in browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Opening Ben Ginati Portal..."
    open "http://173.254.201.134/ben-ginati-portal.html"
    
    echo "📱 Opening Shelly Mizrahi Portal..."
    open "http://173.254.201.134/shelly-mizrahi-portal.html"
    
    echo "📱 Opening Ortal Flanary Portal..."
    open "http://173.254.201.134/ortal-flanary-portal.html"
    
    echo ""
    echo "✅ All customer portals opened in browser tabs!"
    echo ""
    echo "🎯 NEXT STEPS:"
    echo "1. Use the chat agent in each portal"
    echo "2. Complete missing requirements"
    echo "3. Test agent functionality"
    echo "4. Validate business value"
    echo ""
    echo "💡 CHAT AGENT COMMANDS:"
    echo "   /status - Check project status"
    echo "   /upload [file] - Upload missing files"
    echo "   /credentials [platform] - Provide credentials"
    echo "   /approve [content] - Approve content"
    echo "   /help - Get help with any task"
    echo "   /next - See next required action"
    echo ""
else
    echo "🌐 Customer Portal URLs:"
    echo "   Ben Ginati: http://173.254.201.134/ben-ginati-portal.html"
    echo "   Shelly Mizrahi: http://173.254.201.134/shelly-mizrahi-portal.html"
    echo "   Ortal Flanary: http://173.254.201.134/ortal-flanary-portal.html"
    echo ""
    echo "📱 Please open these URLs in your browser"
fi

echo "🎯 Ready to complete customer onboarding with chat agent support!"
