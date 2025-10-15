#!/bin/bash
echo "🚀 Zola Quick Start Script"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found!"
    echo "📝 Creating from template..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local"
    echo "⚠️  IMPORTANT: Edit .env.local and add your API keys!"
    echo ""
    read -p "Press Enter to continue after editing .env.local..."
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Make sure you edited .env.local with your API keys"
echo "   2. Run: npm run dev"
echo "   3. Open: http://localhost:3000"
echo ""
echo "💡 Tips:"
echo "   - Use Ctrl+C to stop the server"
echo "   - Changes auto-reload with Turbopack"
echo "   - Check DEV_WORKFLOW.md for more details"
echo ""
