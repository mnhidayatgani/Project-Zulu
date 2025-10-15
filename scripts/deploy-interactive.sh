#!/bin/bash

# MCP Schema Deployment Helper
# Interactive script to help deploy SQL schema to Supabase

set -e

PROJECT_REF="bxlwowlthbyyhcvdjcwz"
SCHEMA_FILE="supabase/mcp_schema.sql"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       MCP SCHEMA DEPLOYMENT - INTERACTIVE HELPER               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Error: Schema file not found: $SCHEMA_FILE"
    exit 1
fi

LINES=$(wc -l < "$SCHEMA_FILE")
echo "✅ Schema file found: $SCHEMA_FILE ($LINES lines)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 DEPLOYMENT OPTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Option 1: Copy SQL to clipboard (recommended)"
echo "Option 2: Display SQL content"
echo "Option 3: Open Supabase SQL Editor URL"
echo "Option 4: Save SQL to temporary file"
echo "Option 5: Exit"
echo ""

read -p "Choose option (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📋 Copying SQL to clipboard..."
        if command -v xclip &> /dev/null; then
            cat "$SCHEMA_FILE" | xclip -selection clipboard
            echo "✅ SQL copied to clipboard!"
        elif command -v pbcopy &> /dev/null; then
            cat "$SCHEMA_FILE" | pbcopy
            echo "✅ SQL copied to clipboard!"
        else
            echo "⚠️  Clipboard tool not found. Displaying SQL instead:"
            echo ""
            cat "$SCHEMA_FILE"
        fi
        echo ""
        echo "Next steps:"
        echo "1. Open: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
        echo "2. Paste the SQL (Ctrl+V or Cmd+V)"
        echo "3. Click 'Run' or press Ctrl+Enter"
        ;;
    2)
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "SQL SCHEMA CONTENT"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        cat "$SCHEMA_FILE"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        ;;
    3)
        echo ""
        echo "🌐 Opening Supabase SQL Editor..."
        URL="https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
        echo "URL: $URL"
        echo ""
        if command -v xdg-open &> /dev/null; then
            xdg-open "$URL"
        elif command -v open &> /dev/null; then
            open "$URL"
        else
            echo "Please open this URL manually:"
            echo "$URL"
        fi
        ;;
    4)
        TEMP_FILE="/tmp/mcp_schema_$(date +%s).sql"
        cp "$SCHEMA_FILE" "$TEMP_FILE"
        echo ""
        echo "✅ SQL saved to: $TEMP_FILE"
        echo ""
        echo "You can:"
        echo "  - View: cat $TEMP_FILE"
        echo "  - Copy: cat $TEMP_FILE | pbcopy (or xclip)"
        ;;
    5)
        echo ""
        echo "👋 Exiting. Run this script again when ready to deploy."
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid option. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 WHAT WILL BE CREATED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Tables (6):"
echo "  ✓ mcp_favorites            - Store favorite MCP tools"
echo "  ✓ mcp_favorite_collections - Organize favorites into collections"
echo "  ✓ mcp_collection_items     - Items in collections"
echo "  ✓ mcp_saved_searches       - Saved search queries"
echo "  ✓ mcp_search_history       - Search history (last 100)"
echo "  ✓ mcp_execution_history    - Tool execution logs (last 500)"
echo ""
echo "Features:"
echo "  ✓ 13 indexes for performance"
echo "  ✓ Row Level Security (RLS) policies"
echo "  ✓ 3 helper functions"
echo "  ✓ Auto-update triggers"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After deployment, verify with:"
echo "  npm run test:sync"
echo ""
echo "Expected output:"
echo "  ✅ Database connected"
echo "  ✅ Ready - mcp_favorites"
echo "  ✅ Ready - mcp_favorite_collections"
echo "  ✅ Ready - mcp_collection_items"
echo "  ✅ Ready - mcp_saved_searches"
echo "  ✅ Ready - mcp_search_history"
echo "  ✅ Ready - mcp_execution_history"
echo ""
