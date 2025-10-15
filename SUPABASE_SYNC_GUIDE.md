# 🔄 Supabase Schema Sync - Quick Guide

## ✅ Status

**Setup Complete:**
- ✅ Supabase CLI installed (v2.51.0)
- ✅ Migration file created: `supabase/migrations/20251016070917_mcp_tables.sql`
- ✅ Config file exists: `supabase/config.toml`
- ✅ Environment variables configured

**Ready to Deploy:** MCP Schema (6 tables + indexes + RLS policies)

---

## 🚀 Deployment Options

### Option 1: Supabase Dashboard (EASIEST - 2 minutes) ⭐

**Perfect for:** First-time deployment, quick testing

1. **Open SQL Editor:**
   ```
   https://supabase.com/dashboard/project/rpmltjzddmotersynzqi/sql/new
   ```

2. **Copy migration SQL:**
   ```bash
   cat supabase/migrations/20251016070917_mcp_tables.sql
   ```

3. **Paste into editor and click "Run"**

4. **Verify:**
   ```bash
   npm run test:sync
   ```

---

### Option 2: Supabase CLI (Best for CI/CD) 🔧

**Prerequisites:** Access token from Supabase Dashboard

1. **Get Access Token:**
   - Go to: https://supabase.com/dashboard/account/tokens
   - Generate new token
   - Copy token

2. **Set environment variable:**
   ```bash
   export SUPABASE_ACCESS_TOKEN="your_token_here"
   ```

3. **Link project:**
   ```bash
   supabase link --project-ref rpmltjzddmotersynzqi
   ```

4. **Push migration:**
   ```bash
   supabase db push
   ```

5. **Verify:**
   ```bash
   npm run test:sync
   ```

---

### Option 3: Direct psql (Advanced) 💻

**Prerequisites:** Database password from Supabase

1. **Get Database URL:**
   - Supabase Dashboard → Project Settings → Database
   - Copy "Connection String" (Transaction mode)

2. **Execute migration:**
   ```bash
   psql "your_connection_string_here" \
     -f supabase/migrations/20251016070917_mcp_tables.sql
   ```

3. **Verify:**
   ```bash
   npm run test:sync
   ```

---

### Option 4: REST API Script (Automated) 🤖

**Use our deployment script:**

```bash
chmod +x scripts/deploy-schema-rest.js
node scripts/deploy-schema-rest.js
```

This will:
- Read migration file
- Split into statements
- Execute via Supabase REST API
- Show progress and results

---

## 📊 What Gets Created

### Tables (6):
1. **mcp_favorites** - User's favorite MCP tools
2. **mcp_favorite_collections** - Collections of favorites
3. **mcp_collection_items** - Items in each collection
4. **mcp_saved_searches** - Saved search queries
5. **mcp_search_history** - Recent searches (last 100)
6. **mcp_execution_history** - Tool execution logs (last 500)

### Features:
- ✅ Row Level Security (RLS) enabled
- ✅ User-scoped policies (users can only see their own data)
- ✅ Indexes for performance
- ✅ Automatic timestamps
- ✅ Cascading deletes on user removal

---

## 🧪 Verification

After deployment, run:

```bash
# Test database connection and tables
npm run test:sync

# Check in Supabase Dashboard
# https://supabase.com/dashboard/project/rpmltjzddmotersynzqi/editor
```

Expected output:
```
✅ Database connected
✅ Ready - mcp_favorites
✅ Ready - mcp_favorite_collections
✅ Ready - mcp_collection_items
✅ Ready - mcp_saved_searches
✅ Ready - mcp_search_history
✅ Ready - mcp_execution_history
```

---

## 🔍 Troubleshooting

### "Table already exists" error
✅ This is fine! It means tables are already created.

### "Permission denied" error
- Check if SERVICE_ROLE key is set in `.env.local`
- Verify RLS policies allow your operations

### "Connection timeout"
- Check internet connection
- Verify Supabase project is active
- Check firewall settings

### Tables not showing in Dashboard
- Refresh browser
- Check in Table Editor: https://supabase.com/dashboard/project/rpmltjzddmotersynzqi/editor
- Look under "public" schema

---

## 📝 Files Created

```
supabase/
├── config.toml                          # Supabase configuration
├── .gitignore                           # Ignore temp files
├── migrations/
│   └── 20251016070917_mcp_tables.sql   # MCP schema migration
└── mcp_schema.sql                       # Original schema (backup)

scripts/
├── deploy-schema-rest.js                # REST API deployment
├── deploy-mcp-to-supabase.js           # Supabase client deployment
├── sync-schema-simple.sh               # Simple sync script
└── test-sync.js                        # Verification script
```

---

## 🎯 Recommended: Option 1 (Dashboard)

For quick deployment right now:

1. Copy SQL:
   ```bash
   cat supabase/migrations/20251016070917_mcp_tables.sql
   ```

2. Go to SQL Editor:
   https://supabase.com/dashboard/project/rpmltjzddmotersynzqi/sql/new

3. Paste and Run

4. Test:
   ```bash
   npm run test:sync
   ```

**Done in 2 minutes! 🎉**

---

## 🔗 Useful Links

- **Project Dashboard:** https://supabase.com/dashboard/project/rpmltjzddmotersynzqi
- **SQL Editor:** https://supabase.com/dashboard/project/rpmltjzddmotersynzqi/sql/new
- **Table Editor:** https://supabase.com/dashboard/project/rpmltjzddmotersynzqi/editor
- **API Settings:** https://supabase.com/dashboard/project/rpmltjzddmotersynzqi/settings/api
- **Database Settings:** https://supabase.com/dashboard/project/rpmltjzddmotersynzqi/settings/database

---

## 💡 Next Steps After Deployment

1. **Test Sync System:**
   ```bash
   npm run dev
   # Open http://localhost:3000
   # Test MCP sync components
   ```

2. **Verify RLS Policies:**
   - Create test favorite
   - Check only your user can see it
   - Try from different browser (should not see)

3. **Enable Auto-Sync:**
   - Go to Settings → Sync
   - Toggle "Auto-sync" ON
   - Should sync every 30 seconds

4. **Integration:**
   - Add MCPSyncStatus to header
   - Add MCPSyncButton to toolbar
   - Add MCPSyncSettings to settings dialog

---

**Last Updated:** 2025-10-16  
**Status:** Ready for deployment  
**Recommended:** Dashboard method (Option 1)
