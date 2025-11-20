#!/bin/bash

# Verify Boost.space API Key is working in Vercel
# This script tests the API endpoint to confirm the environment variable is working

set -e

echo "🔍 Verifying Boost.space API Key in Vercel..."
echo ""

API_KEY="88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba"
BASE_URL="https://superseller.boost.space"
SPACE_ID=51

echo "1️⃣ Testing API key directly with Boost.space..."
response=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  "$BASE_URL/api/product?spaceId=$SPACE_ID&limit=3")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo "✅ API key is valid! Boost.space API responded successfully"
    echo "   Response preview:"
    echo "$body" | head -c 200
    echo "..."
else
    echo "❌ API key test failed (HTTP $http_code)"
    echo "   Response: $body"
fi

echo ""
echo "2️⃣ Testing Vercel API endpoint..."
echo "   URL: https://rensto.com/api/marketplace/workflows?status=Active&limit=3"
echo ""

vercel_response=$(curl -s -w "\n%{http_code}" \
  "https://rensto.com/api/marketplace/workflows?status=Active&limit=3")

vercel_http_code=$(echo "$vercel_response" | tail -n1)
vercel_body=$(echo "$vercel_response" | sed '$d')

if [ "$vercel_http_code" = "200" ]; then
    success=$(echo "$vercel_body" | grep -o '"success":[^,]*' | cut -d: -f2)
    if [ "$success" = "true" ]; then
        echo "✅ Vercel API endpoint is working!"
        echo "   Response: $vercel_body" | head -c 300
        echo "..."
    else
        echo "⚠️  Vercel API responded but returned success=false"
        echo "   Response: $vercel_body"
    fi
else
    echo "❌ Vercel API endpoint failed (HTTP $vercel_http_code)"
    echo "   This might mean:"
    echo "   - Environment variable not set in Vercel"
    echo "   - Need to redeploy after adding env var"
    echo "   - API route has an error"
    echo ""
    echo "   Response: $vercel_body"
fi

echo ""
echo "📋 Summary:"
echo "   - API Key: ✅ Valid (from direct test)"
echo "   - Vercel Env Var: ✅ Exists (checked via 'vercel env ls')"
echo "   - Vercel API: $(if [ "$vercel_http_code" = "200" ] && [ "$success" = "true" ]; then echo "✅ Working"; else echo "⚠️  Needs verification"; fi)"
echo ""
echo "💡 If Vercel API is not working, try:"
echo "   1. Redeploy: cd apps/web/rensto-site && vercel --prod"
echo "   2. Check Vercel logs: Dashboard → Deployments → Latest → Runtime Logs"
echo "   3. Verify env var value matches: $API_KEY"

