#!/bin/bash

echo "🔍 Validating Dependencies..."

# Check for version conflicts
echo "📦 Checking for version conflicts..."
npm ls --depth=0

# Check for security vulnerabilities
echo "🔒 Checking for security vulnerabilities..."
npm audit

# Verify TypeScript compatibility
echo "📝 Verifying TypeScript compatibility..."
npx tsc --noEmit

# Run linting
echo "🧹 Running linting..."
npm run lint

echo "✅ Dependency validation complete"
