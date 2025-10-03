#!/usr/bin/env node

/**
 * 🔧 VERCEL ENVIRONMENT SETUP SCRIPT
 * ===================================
 * 
 * This script helps set up environment variables for the Local-IL Vercel deployment.
 * It provides instructions for adding the required environment variables.
 */

class VercelEnvironmentSetup {
    constructor() {
        this.projectPath = '/Users/shaifriedman/New Rensto/rensto/Customers/local-il';
        this.requiredEnvVars = [
            {
                name: 'VITE_API_KEY',
                description: 'Google Gemini API Key',
                example: 'AIzaSy...',
                required: true
            },
            {
                name: 'REACT_APP_STRIPE_PUBLISHABLE_KEY',
                description: 'Stripe Publishable Key',
                example: 'pk_test_...',
                required: true
            },
            {
                name: 'REACT_APP_QUICKBOOKS_TOKEN',
                description: 'QuickBooks Access Token',
                example: 'your_quickbooks_token',
                required: false
            },
            {
                name: 'REACT_APP_API_BASE_URL',
                description: 'API Base URL',
                example: 'https://api.rensto.com',
                required: false
            }
        ];
    }

    async generateSetupInstructions() {
        console.log('🔧 VERCEL ENVIRONMENT SETUP');
        console.log('============================');
        console.log('');
        console.log('📋 REQUIRED ENVIRONMENT VARIABLES:');
        console.log('===================================');
        console.log('');

        this.requiredEnvVars.forEach((envVar, index) => {
            console.log(`${index + 1}. ${envVar.name}`);
            console.log(`   Description: ${envVar.description}`);
            console.log(`   Example: ${envVar.example}`);
            console.log(`   Required: ${envVar.required ? '✅ Yes' : '❌ No'}`);
            console.log('');
        });

        console.log('🚀 SETUP COMMANDS:');
        console.log('==================');
        console.log('');

        this.requiredEnvVars.forEach((envVar) => {
            console.log(`# Add ${envVar.name}`);
            console.log(`cd "${this.projectPath}"`);
            console.log(`vercel env add ${envVar.name}`);
            console.log('');
        });

        console.log('📝 MANUAL SETUP INSTRUCTIONS:');
        console.log('==============================');
        console.log('');
        console.log('1. Go to Vercel Dashboard: https://vercel.com/dashboard');
        console.log('2. Select your "local-il-lead-portal" project');
        console.log('3. Go to Settings → Environment Variables');
        console.log('4. Add each environment variable:');
        console.log('');

        this.requiredEnvVars.forEach((envVar) => {
            console.log(`   • Name: ${envVar.name}`);
            console.log(`   • Value: [Your ${envVar.description}]`);
            console.log(`   • Environment: Production, Preview, Development`);
            console.log('');
        });

        console.log('🔍 GETTING API KEYS:');
        console.log('====================');
        console.log('');
        console.log('1. Google Gemini API Key:');
        console.log('   • Go to: https://makersuite.google.com/app/apikey');
        console.log('   • Create a new API key');
        console.log('   • Copy the key (starts with "AIzaSy...")');
        console.log('');
        console.log('2. Stripe Publishable Key:');
        console.log('   • Go to: https://dashboard.stripe.com/apikeys');
        console.log('   • Copy the "Publishable key" (starts with "pk_test_...")');
        console.log('');
        console.log('3. QuickBooks Token (Optional):');
        console.log('   • Use your existing QuickBooks integration');
        console.log('   • Or leave empty for demo mode');
        console.log('');

        console.log('✅ VERIFICATION:');
        console.log('================');
        console.log('');
        console.log('After setting up environment variables:');
        console.log('1. Redeploy the application: vercel --prod');
        console.log('2. Test the application: https://localil.rensto.com');
        console.log('3. Run integration tests: node scripts/test-local-il-integrations.js');
        console.log('');

        console.log('🎯 EXPECTED RESULT:');
        console.log('===================');
        console.log('• Gemini API integration working');
        console.log('• Stripe payment processing functional');
        console.log('• Lead generation working end-to-end');
        console.log('• All integration tests passing');
        console.log('');
    }
}

const setup = new VercelEnvironmentSetup();
setup.generateSetupInstructions();
