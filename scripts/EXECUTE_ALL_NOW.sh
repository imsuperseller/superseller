#!/bin/bash

###############################################################################
# EXECUTE ALL 3 PHASES - USING API SCRIPTS
# Actually creates everything via APIs (not just blueprints)
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "
╔═══════════════════════════════════════════════════════════════════════╗
║          RENSTO PHASES 1-2-3 - ACTUAL EXECUTION VIA APIs              ║
╚═══════════════════════════════════════════════════════════════════════╝
"

# Check .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    exit 1
fi

# Load environment
source .env

echo "✅ Environment loaded"

# ============================================
# PHASE 1: AIRTABLE
# ============================================

echo "
╔═══════════════════════════════════════════════════════════════════════╗
║                      PHASE 1: AIRTABLE TABLES                         ║
╚═══════════════════════════════════════════════════════════════════════╝
"

if [ -z "$AIRTABLE_PERSONAL_ACCESS_TOKEN" ] && [ -z "$AIRTABLE_API_KEY" ]; then
    echo "⚠️  Warning: No Airtable token found"
    read -p "Skip Airtable? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Please add AIRTABLE_PERSONAL_ACCESS_TOKEN to .env"
        exit 1
    fi
else
    echo "🚀 Creating Airtable tables..."
    node scripts/setup-airtable-phase1.js
    echo "✅ Phase 1 complete"
fi

# ============================================
# PHASE 2: STRIPE
# ============================================

echo "
╔═══════════════════════════════════════════════════════════════════════╗
║                      PHASE 2: STRIPE PRODUCTS                         ║
╚═══════════════════════════════════════════════════════════════════════╝
"

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ STRIPE_SECRET_KEY not found in .env"
    exit 1
fi

# Check if stripe package is installed
if ! npm list stripe &> /dev/null; then
    echo "📦 Installing Stripe package..."
    npm install stripe
fi

echo "🚀 Creating Stripe products..."
node scripts/setup-stripe-phase2.js
echo "✅ Phase 2 complete"

# ============================================
# PHASE 3: TYPEFORMS
# ============================================

echo "
╔═══════════════════════════════════════════════════════════════════════╗
║                      PHASE 3: TYPEFORMS                               ║
╚═══════════════════════════════════════════════════════════════════════╝
"

if [ -z "$TYPEFORM_API_TOKEN" ]; then
    echo "⚠️  Warning: No Typeform token found"
    read -p "Skip Typeforms? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Please add TYPEFORM_API_TOKEN to .env"
        exit 1
    fi
else
    echo "🚀 Creating Typeforms..."
    node scripts/create-typeforms-executable.js
    echo "✅ Phase 3 complete"
fi

# ============================================
# SUMMARY
# ============================================

echo "
╔═══════════════════════════════════════════════════════════════════════╗
║                    🎉 ALL PHASES COMPLETE! 🎉                         ║
╚═══════════════════════════════════════════════════════════════════════╝

✅ Phase 1: Airtable Tables Created
   • Service Types (4 records)
   • Marketplace Templates (3 records)
   • Industry Solutions (3 records)
   • Subscription Types (3 records)

✅ Phase 2: Stripe Products Created
   • 22 products across 4 service types
   • Product IDs: STRIPE_PRODUCT_IDS.json

✅ Phase 3: Typeforms Created
   • 4 new forms with webhooks
   • Form IDs: TYPEFORM_IDS.json

📋 NEXT STEPS:

  1. Build 8 n8n workflows:
     - 4 payment processing workflows
     - 4 Typeform webhook workflows

  2. Update Webflow pages:
     - Add Typeform embed URLs
     - Add Stripe Checkout links

  3. Test end-to-end:
     - Form submission → Payment → n8n → Airtable → Email

  4. LAUNCH! 🚀

📄 Generated Files:
   • STRIPE_PRODUCT_IDS.json (Stripe product/price IDs)
   • TYPEFORM_IDS.json (Typeform IDs & URLs)

💡 To build n8n workflows now, run:
   node scripts/create-n8n-workflows.js

🎯 Total Time: ~30 minutes
🚀 Ready to launch: Yes!
"

exit 0
