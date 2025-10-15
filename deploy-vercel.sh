#!/bin/bash

# Project Zulu - Vercel CLI Deployment Helper
# This script helps you deploy to Vercel via CLI

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║         🚀 PROJECT ZULU - VERCEL CLI DEPLOYMENT 🚀              ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
    echo ""
fi

# Check if logged in
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo ""
    echo "⚠️  You are not logged in to Vercel!"
    echo ""
    echo "Please run: vercel login"
    echo ""
    echo "Options:"
    echo "  1. vercel login           (email or browser)"
    echo "  2. vercel login --github  (login with GitHub)"
    echo ""
    exit 1
fi

VERCEL_USER=$(vercel whoami 2>/dev/null || echo "Unknown")
echo "✅ Logged in as: $VERCEL_USER"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found!"
    echo "You'll need to add environment variables after deployment."
    echo ""
fi

# Display what will be deployed
echo "📦 Deployment Information:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Project: Project Zulu (AI Chat Interface)"
echo "  Version: 1.0.0"
echo "  Branch: main"
echo "  Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
echo "  Directory: $(pwd)"
echo ""

# Count environment variables
if [ -f .env.local ]; then
    ENV_COUNT=$(grep -c "^[A-Z]" .env.local || echo 0)
    echo "  Environment Variables: $ENV_COUNT found in .env.local"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask for confirmation
echo "🎯 Deployment Mode: PRODUCTION"
echo ""
read -p "Ready to deploy to production? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 0
fi

echo ""
echo "🚀 Starting deployment..."
echo ""

# Deploy to production
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
vercel --prod

DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🎉 Deployment Complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. ✅ Test your deployment URL"
    echo "2. 🔧 Add environment variables if not done yet:"
    echo "      • Visit: https://vercel.com/dashboard"
    echo "      • Project → Settings → Environment Variables"
    echo "      • Add all variables from .env.local"
    echo "3. 🔄 Redeploy if you added env vars: vercel --prod"
    echo "4. 🌐 Configure Supabase redirect:"
    echo "      • Visit: https://supabase.com/dashboard"
    echo "      • Add redirect URL: https://your-app.vercel.app/auth/callback"
    echo "5. 🧪 Test all features"
    echo "6. 📊 Monitor Vercel analytics"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✨ Success! Your app is now live!"
    echo ""
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Common issues:"
    echo "  • Environment variables not set"
    echo "  • Build errors"
    echo "  • Authentication issues"
    echo ""
    echo "📖 Check deployment logs above for details"
    echo ""
    echo "💡 Tips:"
    echo "  • Add environment variables in Vercel dashboard"
    echo "  • Run: vercel logs <deployment-url>"
    echo "  • Check: https://vercel.com/dashboard"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 1
fi
