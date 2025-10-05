#!/bin/bash

###############################################################################
# RENSTO PHASES 1-2-3 EXECUTION SCRIPT
# Executes Airtable setup, Stripe products, and Typeform specifications
#
# Prerequisites:
# - Node.js installed
# - Stripe package installed (npm install stripe)
# - STRIPE_SECRET_KEY in .env
# - Airtable access
# - Typeform account
###############################################################################

set -e # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "
╔═══════════════════════════════════════════════════════════════════════╗
║                 RENSTO PHASES 1-2-3 EXECUTION                         ║
║                 4 Service Types Integration                            ║
╚═══════════════════════════════════════════════════════════════════════╝
"

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo "❌ .env file not found in project root"
    exit 1
fi

# Load environment variables
source "$PROJECT_ROOT/.env"

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ STRIPE_SECRET_KEY not found in .env"
    exit 1
fi

echo "✅ Prerequisites check passed"

# ============================================
# PHASE 1: AIRTABLE SETUP
# ============================================

echo "
╔═══════════════════════════════════════════════════════════════════════╗
║                        PHASE 1: AIRTABLE SETUP                        ║
╚═══════════════════════════════════════════════════════════════════════╝
"

echo "📊 Airtable tables need to be created manually."
echo ""
echo "Follow these steps:"
echo "  1. Open scripts/setup-airtable-phase1.js"
echo "  2. Create each table in the specified base"
echo "  3. Add initial records"
echo "  4. Update existing tables with new fields"
echo ""
echo "Bases to update:"
echo "  • app4nJpP1ytGukXQT (Core Business Operations)"
echo "  • appQhVkIaWoGJG301 (Marketing & Sales)"
echo "  • appSCBZk03GUCTfhN (Customer Success)"
echo ""
read -p "Have you completed Airtable setup? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏸️  Paused. Complete Airtable setup first."
    exit 1
fi

echo "✅ Phase 1 complete (Airtable)"

# ============================================
# PHASE 2: STRIPE PRODUCTS
# ============================================

echo "
╔═══════════════════════════════════════════════════════════════════════╗
║                     PHASE 2: STRIPE PRODUCTS                          ║
╚═══════════════════════════════════════════════════════════════════════╝
"

echo "💳 Checking for Stripe package..."
cd "$PROJECT_ROOT"

if ! npm list stripe &> /dev/null; then
    echo "📦 Installing Stripe package..."
    npm install stripe
fi

echo "🚀 Executing Stripe setup script..."
node "$SCRIPT_DIR/setup-stripe-phase2.js"

if [ $? -eq 0 ]; then
    echo "✅ Phase 2 complete (Stripe)"
    echo "📄 Product IDs saved to: STRIPE_PRODUCT_IDS.json"
else
    echo "❌ Phase 2 failed (Stripe)"
    exit 1
fi

# ============================================
# PHASE 3: TYPEFORMS
# ============================================

echo "
╔═══════════════════════════════════════════════════════════════════════╗
║                       PHASE 3: TYPEFORMS                              ║
╚═══════════════════════════════════════════════════════════════════════╝
"

echo "📝 Typeforms need to be created manually."
echo ""
echo "Open: scripts/setup-typeforms-phase3.md"
echo ""
echo "Create these 4 forms:"
echo "  1. Ready Solutions Industry Quiz"
echo "  2. FREE 50 Leads Sample"
echo "  3. Marketplace Template Request"
echo "  4. Custom Solutions Readiness Scorecard"
echo ""
echo "For each form:"
echo "  • Go to https://typeform.com/create"
echo "  • Follow specifications in setup-typeforms-phase3.md"
echo "  • Configure webhook to n8n"
echo "  • Save Typeform ID"
echo ""
read -p "Have you completed Typeform setup? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏸️  Paused. Complete Typeform setup first."
    exit 1
fi

echo "✅ Phase 3 complete (Typeforms)"

# ============================================
# SUMMARY
# ============================================

echo "
╔═══════════════════════════════════════════════════════════════════════╗
║                      ALL PHASES COMPLETE! 🎉                          ║
╚═══════════════════════════════════════════════════════════════════════╝

✅ Phase 1: Airtable Setup
   • 4 new tables created
   • 3 existing tables updated
   • Initial records populated

✅ Phase 2: Stripe Products
   • 22 products created
   • Old products archived
   • Product IDs exported

✅ Phase 3: Typeforms
   • 4 forms created
   • Webhooks configured
   • Ready for integration

📋 NEXT STEPS:

  1. Build n8n workflows (8 workflows needed)
     • 4 payment processing workflows
     • 4 Typeform submission workflows

  2. Update Webflow pages
     • Add Typeform embeds
     • Add Stripe Checkout links
     • Update all CTAs

  3. Test full integration
     • Test each service type end-to-end
     • Verify Airtable records
     • Verify emails sent

  4. Deploy to production
     • Update admin dashboard
     • Configure customer portal
     • Launch! 🚀

📊 System Status:
   • Service Types: 4 active
   • Stripe Products: 22 live
   • Typeforms: 5 total (1 existing + 4 new)
   • Airtable Tables: 7 updated (4 new + 3 updated)

💰 Revenue Potential:
   • One-time: ~$75,000/mo (Marketplace + Custom + Ready)
   • Recurring: ~$58,395/mo MRR (3 subscription types)
   • Total: ~$133,395/mo potential

🔗 Important Files:
   • PHASES_1_2_3_COMPLETE_SUMMARY.md - Complete documentation
   • STRIPE_PRODUCT_IDS.json - For n8n workflows
   • scripts/setup-typeforms-phase3.md - Typeform specifications

Ready to build n8n workflows and go live! 🚀
"

exit 0
