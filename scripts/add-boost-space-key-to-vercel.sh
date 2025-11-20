#!/bin/bash

# Add BOOST_SPACE_API_KEY to Vercel Environment Variables
# This script adds the Boost.space API key to all Vercel environments

set -e

API_KEY="88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba"
ENV_VAR_NAME="BOOST_SPACE_API_KEY"

echo "🔑 Adding BOOST_SPACE_API_KEY to Vercel..."
echo ""

cd "$(dirname "$0")/../apps/web/rensto-site" || exit 1

# Check if already exists
echo "Checking existing environment variables..."
if vercel env ls 2>/dev/null | grep -q "$ENV_VAR_NAME"; then
    echo "⚠️  $ENV_VAR_NAME already exists in Vercel"
    echo "   To update it, remove it first or update via Vercel Dashboard"
    echo ""
    echo "Current values:"
    vercel env ls 2>/dev/null | grep "$ENV_VAR_NAME" || true
    exit 0
fi

# Add to Production
echo "📦 Adding to Production environment..."
echo "$API_KEY" | vercel env add "$ENV_VAR_NAME" production 2>&1 || {
    echo "❌ Failed to add to Production. You may need to run this manually."
    echo "   Command: echo '$API_KEY' | vercel env add $ENV_VAR_NAME production"
}

# Add to Preview
echo "📦 Adding to Preview environment..."
echo "$API_KEY" | vercel env add "$ENV_VAR_NAME" preview 2>&1 || {
    echo "⚠️  Failed to add to Preview. You may need to run this manually."
}

# Add to Development
echo "📦 Adding to Development environment..."
echo "$API_KEY" | vercel env add "$ENV_VAR_NAME" development 2>&1 || {
    echo "⚠️  Failed to add to Development. You may need to run this manually."
}

echo ""
echo "✅ Environment variable added!"
echo ""
echo "⚠️  IMPORTANT: You must redeploy for the changes to take effect:"
echo "   cd apps/web/rensto-site"
echo "   vercel --prod"
echo ""
echo "Or trigger a redeploy via Git:"
echo "   git commit --allow-empty -m 'Trigger redeploy for BOOST_SPACE_API_KEY'"
echo "   git push"

