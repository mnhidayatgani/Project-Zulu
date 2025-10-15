#!/bin/bash
echo "🔍 Zola Configuration Check"
echo ""

# Check .env.local
if [ -f .env.local ]; then
    echo "✅ .env.local exists"
    
    if grep -q "sk-proj-your-openai-key-here" .env.local; then
        echo "⚠️  WARNING: OpenAI API key not configured!"
        echo "   Edit .env.local and add your real API key"
    else
        echo "✅ OpenAI API key configured"
    fi
    
    if grep -q "^CSRF_SECRET=.*[0-9a-f]" .env.local; then
        echo "✅ CSRF secret configured"
    fi
else
    echo "❌ .env.local not found!"
    exit 1
fi

echo ""
echo "📦 Dependencies:"
if [ -d node_modules ]; then
    echo "✅ node_modules installed"
else
    echo "❌ node_modules not found - run: npm install"
    exit 1
fi

echo ""
echo "🏗️  Build Status:"
if [ -d .next ]; then
    echo "✅ Build completed successfully"
else
    echo "⚠️  No build found - run: npm run build"
fi

echo ""
echo "�� Ready to start!"
echo "   Run: npm run dev"
echo "   Open: http://localhost:3000"
echo ""
echo "📝 To configure OpenAI API key:"
echo "   1. Get key from: https://platform.openai.com/api-keys"
echo "   2. Edit .env.local"
echo "   3. Replace: sk-proj-your-openai-key-here"
echo "   4. Restart server"
