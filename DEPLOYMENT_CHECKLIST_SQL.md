# SQL Schema Deployment Checklist

**Status**: ⏳ Ready for Deployment  
**Time Required**: 5-10 minutes  
**Difficulty**: Easy

---

## ✅ Pre-Deployment Checklist

- [x] SQL schema file ready (`supabase/mcp_schema.sql`)
- [x] Supabase project configured (bxlwowlthbyyhcvdjcwz)
- [x] Test script available (`npm run test:sync`)
- [x] Interactive helper created (`./scripts/deploy-interactive.sh`)
- [x] Documentation complete
- [x] All code committed and pushed

---

## 📋 Deployment Steps

### Step 1: Access Supabase SQL Editor (1 min)

**URL**: https://supabase.com/dashboard/project/bxlwowlthbyyhcvdjcwz/sql/new

**Actions**:
- [ ] Open URL in browser
- [ ] Login to Supabase (if needed)
- [ ] Click "New Query" or use direct URL
- [ ] Verify you're in correct project (bxlwowlthbyyhcvdjcwz)

### Step 2: Copy SQL Schema (1 min)

**Option A - Interactive Script** (Recommended):
```bash
cd /root/zola
./scripts/deploy-interactive.sh
# Choose option 1 (Copy to clipboard)
```

**Option B - Manual Copy**:
```bash
cd /root/zola
cat supabase/mcp_schema.sql
# Select all and copy (Ctrl+A, Ctrl+C)
```

**Option C - Direct View**:
- Open file: `/root/zola/supabase/mcp_schema.sql`
- Select all (392 lines)
- Copy to clipboard

**Verification**:
- [ ] All 392 lines copied
- [ ] Includes header comment
- [ ] Ends with "END OF SCHEMA"

### Step 3: Paste and Execute (2 min)

**Actions**:
- [ ] Click in SQL Editor
- [ ] Clear any existing content
- [ ] Paste SQL schema (Ctrl+V or Cmd+V)
- [ ] Verify all content pasted (scroll to end)
- [ ] Click "Run" button (bottom right)
- [ ] Or press Ctrl+Enter (Cmd+Enter)

**Wait for Execution**:
- Typical time: 5-10 seconds
- Progress indicator should show
- Wait for completion message

### Step 4: Verify Success (1 min)

**Success Messages**:
- [ ] "Success. No rows returned" ✅
- [ ] Or "Success. Rows affected: 0" ✅
- [ ] No error messages
- [ ] No red text in output

**If Errors**:
- Read error message carefully
- Check if table already exists (normal if re-running)
- Verify full SQL was pasted
- Check Supabase logs for details

### Step 5: Run Test Script (2 min)

**Command**:
```bash
cd /root/zola
npm run test:sync
```

**Expected Output**:
```
🧪 Testing MCP Sync System
==================================================

📡 Test 1: Database Connection
   ✅ Database connected

📊 Test 2: MCP Tables
   ✅ Ready - mcp_favorites
   ✅ Ready - mcp_favorite_collections
   ✅ Ready - mcp_collection_items
   ✅ Ready - mcp_saved_searches
   ✅ Ready - mcp_search_history
   ✅ Ready - mcp_execution_history

📦 Test 3: Sync Modules
   ✅ lib/mcp/sync.ts (410 lines)
   ✅ lib/mcp/favorites-sync.ts (411 lines)
   ✅ lib/mcp/execution-history-sync.ts (407 lines)
   ✅ lib/mcp/search-sync.ts (421 lines)

📋 Summary
==================================================
✅ All tests passed!
```

**Checklist**:
- [ ] Database connected ✅
- [ ] All 6 tables show "Ready" ✅
- [ ] All 4 sync modules found ✅
- [ ] "All tests passed!" message ✅

---

## 🧪 Post-Deployment Testing

### Test 1: Start Dev Server (2 min)

```bash
cd /root/zola
npm run dev
```

**Verification**:
- [ ] Server starts without errors
- [ ] Port 3000 accessible
- [ ] No console errors

### Test 2: Browser Console Test (3 min)

Open: http://localhost:3000

**Console Commands**:
```javascript
// Import sync functions
import { setupMCPSync, forceSyncNow, getSyncStats } from '@/lib/mcp/sync'

// Initialize sync system
await setupMCPSync()
// Expected: No errors

// Force immediate sync
const result = await forceSyncNow()
console.log('Sync result:', result)
// Expected: { success: true, pulled: {...}, pushed: {...} }

// Get statistics
const stats = await getSyncStats()
console.log('Stats:', stats)
// Expected: { favorites: 0, collections: 0, ... }
```

**Checklist**:
- [ ] setupMCPSync() completes without error
- [ ] forceSyncNow() returns success
- [ ] getSyncStats() returns object with counts
- [ ] No console errors

### Test 3: UI Components (5 min)

**Settings Tab**:
- [ ] Open Settings dialog
- [ ] Click "Sync" tab
- [ ] Panel loads without error
- [ ] Auto-sync toggle works
- [ ] Statistics display (all 0 initially)
- [ ] Manual sync button visible

**Header Badge**:
- [ ] Sync status badge visible in header
- [ ] Shows "Not synced" or "Synced" status
- [ ] Hover shows tooltip
- [ ] Badge updates (may take 5s)

**MCP Manager**:
- [ ] Navigate to MCP Manager page
- [ ] Sync button visible in header
- [ ] Click sync button
- [ ] Loading animation shows
- [ ] Success feedback appears

---

## 📊 What Was Created

### Tables (6)

1. **mcp_favorites**
   - Stores favorite MCP tools
   - User-specific
   - Use count tracking
   - Quick access support

2. **mcp_favorite_collections**
   - Organize favorites into collections
   - Public/private sharing
   - Custom colors and icons

3. **mcp_collection_items**
   - Junction table for collections
   - Maintains item order
   - Links favorites to collections

4. **mcp_saved_searches**
   - Saved search queries
   - Filter configurations
   - Use count tracking

5. **mcp_search_history**
   - Recent searches (last 100)
   - Result counts
   - Auto-cleanup

6. **mcp_execution_history**
   - Tool execution logs (last 500)
   - Input/output data
   - Duration and status
   - Auto-cleanup

### Indexes (13)

- User ID indexes (4)
- Server ID indexes (2)
- Tool name indexes (1)
- Composite indexes (6)

### Security

- Row Level Security (RLS) enabled on all tables
- User-scoped policies (SELECT, INSERT, UPDATE, DELETE)
- Secure by default

### Functions (3)

1. `increment_favorite_use_count()` - Track tool usage
2. `clean_old_search_history()` - Cleanup old searches
3. `clean_old_execution_history()` - Cleanup old executions

### Triggers (3)

- Auto-update `updated_at` on mcp_favorites
- Auto-update `updated_at` on mcp_favorite_collections
- Auto-update `updated_at` on mcp_saved_searches

---

## 🔧 Troubleshooting

### Issue: Table Already Exists

**Symptom**: Error message "table already exists"

**Solution**: This is normal if re-running the schema. Options:
1. Skip (tables already created - test with `npm run test:sync`)
2. Drop tables first (destructive - will lose data)
3. Use `CREATE TABLE IF NOT EXISTS` (already in schema)

**Action**:
- [ ] Run `npm run test:sync` to verify tables work
- [ ] If test passes, no action needed ✅

### Issue: Permission Denied

**Symptom**: Error message about permissions

**Solution**:
1. Verify you're logged into Supabase Dashboard
2. Check you're in the correct project
3. Verify you have owner/admin role
4. Try logging out and back in

### Issue: Syntax Error

**Symptom**: SQL syntax error message

**Solution**:
1. Verify full SQL was pasted (all 392 lines)
2. Check no extra characters added
3. Re-copy SQL and try again
4. Use interactive script: `./scripts/deploy-interactive.sh`

### Issue: Foreign Key Constraint

**Symptom**: Error about foreign key constraints

**Solution**:
1. Tables must be created in order
2. Run full schema at once (don't split)
3. Drop all tables and re-run if needed

---

## ✅ Success Criteria

### Deployment Success

- [ ] All 6 tables created
- [ ] All 13 indexes created
- [ ] All RLS policies applied
- [ ] All 3 functions created
- [ ] All 3 triggers applied
- [ ] Test script passes
- [ ] No errors in Supabase logs

### Functional Success

- [ ] setupMCPSync() works
- [ ] forceSyncNow() works
- [ ] getSyncStats() works
- [ ] Settings tab loads
- [ ] Header badge shows
- [ ] MCP Manager button works
- [ ] No console errors

---

## 📝 Post-Deployment Notes

### Data to Record

**Deployment Time**: _______________  
**Deployment Duration**: ___________ minutes  
**Any Issues**: _______________  
**Test Results**: ✅ Pass / ❌ Fail

### Next Steps After Success

1. **Phase 3: Testing & Polish** (30 min)
   - Test with real user data
   - Test cross-device sync
   - Verify error handling
   - Polish UI/UX

2. **Phase 4: Chat Integration** (1-2 hours)
   - Track tool executions in chat
   - Update favorites use count
   - Display execution history
   - Analytics integration

3. **Production Deployment**
   - Deploy to production Supabase
   - Test with production users
   - Monitor performance
   - Collect feedback

---

## 🎯 Quick Commands Reference

```bash
# Interactive deployment helper
./scripts/deploy-interactive.sh

# Test deployment
npm run test:sync

# Start dev server
npm run dev

# View SQL schema
cat supabase/mcp_schema.sql

# Check git status
git status

# View recent commits
git log --oneline -5
```

---

## 📚 Documentation Links

- **Deployment Guide**: `MCP_SYNC_DEPLOYMENT.md`
- **Phase 1 Summary**: `SESSION_SUMMARY_OPTION_A.md`
- **Phase 2 Summary**: `SESSION_SUMMARY_OPTION_A_PHASE2.md`
- **Quick Start**: `QUICK_START_OPTION_A.md`
- **Completion Summary**: `OPTION_A_COMPLETE.md`

---

**Ready to Deploy**: ✅ Yes  
**Estimated Time**: 5-10 minutes  
**Risk Level**: Low (uses IF NOT EXISTS, no data loss)

**Good luck with deployment!** 🚀
