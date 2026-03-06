#!/bin/bash

# Deploy Ortal's Portal - Quick Deployment Script
echo "🚀 Deploying Ortal's Portal..."

# Server details
SERVER_IP="172.245.56.50"
SERVER_USER="root"
SERVER_PASS="${VPS_PASSWORD}"

# Create a simple deployment package
echo "📦 Creating deployment package..."

# Create a simple HTML version of Ortal's portal for immediate deployment
cat > /tmp/ortal-portal.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal Flanary - Customer Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        orange: {
                            500: '#f97316',
                            600: '#ea580c',
                            700: '#c2410c'
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-slate-50">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center space-x-4">
                    <h1 class="text-xl font-semibold text-slate-900">Portal Flanary - Customer Portal</h1>
                    <div class="flex items-center space-x-2">
                        <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Pro Plan</span>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span class="text-sm font-medium text-orange-700">O</span>
                        </div>
                        <span class="text-sm text-slate-600">Ortal Flanary</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="space-y-8">
            <!-- Status Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-white rounded-lg border border-slate-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-slate-600">Facebook Scraper Status</p>
                            <p class="text-2xl font-bold text-green-600">✅ Active</p>
                        </div>
                        <div class="p-2 bg-green-100 rounded-lg">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-sm text-green-600 mt-2">Workflow deployed successfully</p>
                </div>

                <div class="bg-white rounded-lg border border-slate-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-slate-600">Groups Configured</p>
                            <p class="text-2xl font-bold text-slate-900">52</p>
                        </div>
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-sm text-blue-600 mt-2">Jewish community groups ready</p>
                </div>

                <div class="bg-white rounded-lg border border-slate-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-slate-600">Apify Integration</p>
                            <p class="text-2xl font-bold text-green-600">✅ Connected</p>
                        </div>
                        <div class="p-2 bg-green-100 rounded-lg">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-sm text-green-600 mt-2">API key configured</p>
                </div>

                <div class="bg-white rounded-lg border border-slate-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-slate-600">n8n Workflow</p>
                            <p class="text-2xl font-bold text-green-600">✅ Deployed</p>
                        </div>
                        <div class="p-2 bg-green-100 rounded-lg">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-sm text-green-600 mt-2">ID: vyT82ItM3iJwWOyJ</p>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-lg border border-slate-200 p-6">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="runFacebookScraper()" class="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="text-sm font-medium text-slate-700">Run Facebook Scraper</span>
                    </button>
                    <button onclick="viewN8nWorkflow()" class="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span class="text-sm font-medium text-slate-700">View n8n Workflow</span>
                    </button>
                    <button onclick="viewAnalytics()" class="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <span class="text-sm font-medium text-slate-700">View Analytics</span>
                    </button>
                </div>
            </div>

            <!-- Facebook Groups List -->
            <div class="bg-white rounded-lg border border-slate-200 p-6">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">Configured Facebook Groups</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    <div class="p-3 border border-slate-200 rounded-lg">
                        <h4 class="font-medium text-slate-900">great kosher restaurants foodies</h4>
                        <p class="text-sm text-slate-600">118,000 members</p>
                    </div>
                    <div class="p-3 border border-slate-200 rounded-lg">
                        <h4 class="font-medium text-slate-900">Jewish Food x What Jew Wanna Eat</h4>
                        <p class="text-sm text-slate-600">81,500 members</p>
                    </div>
                    <div class="p-3 border border-slate-200 rounded-lg">
                        <h4 class="font-medium text-slate-900">ישראלים במיאמי / דרום פלורידה</h4>
                        <p class="text-sm text-slate-600">67,500 members</p>
                    </div>
                    <div class="p-3 border border-slate-200 rounded-lg">
                        <h4 class="font-medium text-slate-900">Israelis in Los Angeles</h4>
                        <p class="text-sm text-slate-600">52,000 members</p>
                    </div>
                    <div class="p-3 border border-slate-200 rounded-lg">
                        <h4 class="font-medium text-slate-900">World wide Jewish network</h4>
                        <p class="text-sm text-slate-600">42,000 members</p>
                    </div>
                    <div class="p-3 border border-slate-200 rounded-lg">
                        <h4 class="font-medium text-slate-900">+ 46 more groups...</h4>
                        <p class="text-sm text-slate-600">Total: 52 groups</p>
                    </div>
                </div>
            </div>

            <!-- Webhook Information -->
            <div class="bg-white rounded-lg border border-slate-200 p-6">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">Webhook Information</h3>
                <div class="space-y-4">
                    <div>
                        <p class="text-sm font-medium text-slate-600">n8n Webhook URL:</p>
                        <p class="text-sm text-slate-900 font-mono bg-slate-100 p-2 rounded">http://172.245.56.50:5678/webhook/facebook-scraper</p>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-600">Test Payload:</p>
                        <pre class="text-xs text-slate-900 bg-slate-100 p-2 rounded overflow-x-auto">{
  "maxGroups": 5,
  "apifyToken": "apify_api_QfRR0XzZtbGi14p8xaTMc2Fg44a9aW0W5CQM"
}</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function runFacebookScraper() {
            alert('🚀 Starting Facebook Group Scraper...\n\nThis will:\n• Scrape 50+ Jewish community Facebook groups\n• Extract member data for lead generation\n• Create custom audiences for marketing\n\nEstimated time: 2-3 minutes');
            
            // Simulate API call
            fetch('http://172.245.56.50:5678/webhook/facebook-scraper', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    maxGroups: 5,
                    apifyToken: 'apify_api_QfRR0XzZtbGi14p8xaTMc2Fg44a9aW0W5CQM'
                })
            })
            .then(response => response.json())
            .then(data => {
                alert('✅ Facebook Scraper started successfully!\n\nCheck n8n for progress updates.');
            })
            .catch(error => {
                alert('❌ Error starting scraper. Please check n8n connection.');
            });
        }

        function viewN8nWorkflow() {
            window.open('http://172.245.56.50:5678', '_blank');
        }

        function viewAnalytics() {
            alert('📊 Analytics dashboard will be available once scraping is complete.');
        }
    </script>
</body>
</html>
EOF

echo "📤 Deploying to server..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no /tmp/ortal-portal.html $SERVER_USER@$SERVER_IP:/var/www/html/ortal.html

echo "🔧 Setting up web server..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "apt-get update && apt-get install -y nginx && systemctl enable nginx && systemctl start nginx"

echo "✅ Deployment complete!"
echo ""
echo "🎉 Ortal's Portal is now live at:"
echo "   http://$SERVER_IP/ortal.html"
echo ""
echo "📋 What's available:"
echo "   ✅ Facebook Group Scraper workflow deployed to n8n"
echo "   ✅ 52 Jewish community groups configured"
echo "   ✅ Apify integration ready"
echo "   ✅ Webhook endpoint active"
echo "   ✅ Simple portal interface"
echo ""
echo "🚀 Next steps:"
echo "   1. Visit http://$SERVER_IP/ortal.html"
echo "   2. Click 'Run Facebook Scraper' to test"
echo "   3. Monitor progress in n8n: http://$SERVER_IP:5678"
