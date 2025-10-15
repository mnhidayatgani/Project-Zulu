#!/bin/bash

# Simple MCP Schema Sync Script
# Deploys MCP tables directly to Supabase using psql or displays instructions

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          MCP Schema Deployment to Supabase                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if migration file exists
MIGRATION_FILE=$(find supabase/migrations -name "*_mcp_tables.sql" -type f | head -1)

if [ -z "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Error: MCP migration file not found${NC}"
    echo -e "${YELLOW}Expected: supabase/migrations/*_mcp_tables.sql${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found migration file: $MIGRATION_FILE${NC}\n"

# Load environment variables
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

PROJECT_REF="rpmltjzddmotersynzqi"
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"

echo -e "${BLUE}📡 Project: $PROJECT_REF${NC}"
echo -e "${BLUE}🔗 URL: $SUPABASE_URL${NC}\n"

# Check if we have database password
if [ -n "$SUPABASE_DB_PASSWORD" ]; then
    echo -e "${CYAN}🔐 Database password found, attempting direct deployment...${NC}\n"
    
    # Try to deploy using psql
    if command -v psql &> /dev/null; then
        DB_URL="postgresql://postgres.${PROJECT_REF}:${SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
        
        echo -e "${CYAN}🚀 Deploying schema with psql...${NC}"
        
        if psql "$DB_URL" -f "$MIGRATION_FILE"; then
            echo -e "\n${GREEN}✅ Schema deployed successfully!${NC}\n"
            
            # Verify tables
            echo -e "${CYAN}🔍 Verifying tables...${NC}\n"
            psql "$DB_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'mcp_%' ORDER BY table_name;"
            
            echo -e "\n${GREEN}🎉 Deployment complete!${NC}"
            exit 0
        else
            echo -e "${RED}❌ psql deployment failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  psql not installed${NC}"
    fi
fi

# If direct deployment didn't work, show manual instructions
echo -e "\n${CYAN}📋 Manual Deployment Instructions:${NC}\n"
echo -e "${YELLOW}Choose ONE of these methods:${NC}\n"

echo -e "${BLUE}Method 1: Supabase Dashboard (Recommended - 2 minutes)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Open SQL Editor:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo ""
echo "2. Copy the migration file content:"
echo "   cat $MIGRATION_FILE | pbcopy  # macOS"
echo "   cat $MIGRATION_FILE | xclip -selection clipboard  # Linux"
echo "   cat $MIGRATION_FILE  # Then copy manually"
echo ""
echo "3. Paste into SQL Editor and click 'Run'"
echo ""
echo "4. Verify tables created:"
echo "   npm run test:sync"
echo ""

echo -e "${BLUE}Method 2: Supabase CLI with Link (3 minutes)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Login to Supabase CLI:"
echo "   supabase login"
echo ""
echo "2. Link project:"
echo "   supabase link --project-ref $PROJECT_REF"
echo ""
echo "3. Push migration:"
echo "   supabase db push"
echo ""

echo -e "${BLUE}Method 3: Direct psql (1 minute)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Get your database password from Supabase Dashboard:"
echo "   Project Settings → Database → Connection String"
echo ""
echo "2. Run psql:"
echo "   psql 'postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:5432/postgres' \\"
echo "     -f $MIGRATION_FILE"
echo ""

echo -e "\n${YELLOW}📄 Migration file location:${NC} $MIGRATION_FILE"
echo -e "${YELLOW}📊 Tables to be created:${NC}"
echo "   • mcp_favorites"
echo "   • mcp_favorite_collections"
echo "   • mcp_collection_items"
echo "   • mcp_saved_searches"
echo "   • mcp_search_history"
echo "   • mcp_execution_history"
echo ""

echo -e "${CYAN}💡 Tip: After deployment, run 'npm run test:sync' to verify${NC}\n"
