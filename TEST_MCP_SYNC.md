# 🧪 MCP Sync Testing Guide

**Status:** ✅ Integration Complete  
**Dev Server:** http://localhost:3000  
**Components:** All integrated and ready

---

## ✅ Pre-Test Checklist

- [x] Database schema deployed (6 tables)
- [x] Sync components created (3 components)
- [x] Header integration complete
- [x] Settings integration complete
- [x] Dev server running
- [x] No compilation errors

---

## 🎯 Test Plan

### Test 1: Visual Integration Check

**Header Sync Status (Logged In)**
1. Visit http://localhost:3000
2. Login to your account
3. Check top-right header
4. Should see: Sync status indicator (compact badge)

**Expected:**
- Badge showing sync status
- Tooltip on hover with details
- Green/yellow/red indicator based on status

**Settings Sync Tab**
1. Click user menu (top-right)
2. Click "Settings"
3. Look for "Sync" tab in sidebar
4. Click "Sync" tab

**Expected:**
- Sync tab visible (if Supabase enabled)
- Sync settings panel loads
- Shows sync statistics
- Auto-sync toggle present
- Manual sync button visible

---

### Test 2: Sync Functionality

**Browser Console Tests**

Open browser console (F12) and run:

```javascript
// Test 1: Import sync module
const { setupMCPSync, forceSyncNow, getSyncStatus } = await import('/lib/mcp/sync.js')

// Test 2: Initialize sync
await setupMCPSync()
console.log('✅ Sync initialized')

// Test 3: Check status
const status = getSyncStatus()
console.log('Sync status:', status)

// Test 4: Force sync
const result = await forceSyncNow()
console.log('Sync result:', result)
```

**Expected Results:**
```javascript
{
  favorites: { count: 0, lastSync: Date, errors: [] },
  executions: { count: 0, lastSync: Date, errors: [] },
  searches: { count: 0, lastSync: Date, errors: [] }
}
```

---

### Test 3: Database Operations

**Test Favorites Sync**

```javascript
// Import favorites module
const { addFavorite, getFavorites, removeFavorite } = await import('/lib/mcp/favorites-sync.js')

// Add a favorite
await addFavorite({
  toolName: 'test_tool',
  serverId: 'test_server',
  serverName: 'Test Server',
  description: 'Test tool for sync verification'
})
console.log('✅ Favorite added')

// Get all favorites
const favorites = await getFavorites()
console.log('Favorites:', favorites)

// Verify in Supabase
// Visit: https://supabase.com/dashboard/project/rpmltjzddmotersynzqi/editor
// Check mcp_favorites table - should see 1 row
```

**Test Execution History**

```javascript
const { trackToolExecution, getExecutionHistory } = await import('/lib/mcp/execution-history-sync.js')

// Track an execution
await trackToolExecution({
  serverId: 'test_server',
  serverName: 'Test Server',
  toolName: 'test_tool',
  input: { test: 'data' },
  output: { result: 'success' },
  duration: 1234,
  status: 'success'
})
console.log('✅ Execution tracked')

// Get history
const history = await getExecutionHistory()
console.log('Execution history:', history)
```

**Test Search Sync**

```javascript
const { addSearch, getRecentSearches } = await import('/lib/mcp/search-sync.js')

// Add a search
await addSearch({
  query: 'test query',
  filters: { category: 'tools' },
  resultCount: 5
})
console.log('✅ Search saved')

// Get recent searches
const searches = await getRecentSearches()
console.log('Recent searches:', searches)
```

---

### Test 4: Auto-Sync

**Enable Auto-Sync**
1. Go to Settings → Sync
2. Toggle "Auto-sync" ON
3. Wait 30 seconds
4. Check console for sync activity

**Expected:**
- Auto-sync runs every 30 seconds
- Console shows sync activity
- No errors in console
- Sync status updates in header

**Disable Auto-Sync**
1. Toggle "Auto-sync" OFF
2. Confirm sync stops

---

### Test 5: Manual Sync

**Using Sync Button**
1. Go to Settings → Sync
2. Click "Sync Now" button
3. Watch button state change
4. Check for success message

**Expected:**
- Button shows loading state
- Sync completes in <2 seconds
- Success message appears
- Stats update

---

### Test 6: Cross-Device Sync

**Test Data Persistence**
1. Add favorites on Device A
2. Open app on Device B (or incognito)
3. Login with same account
4. Check if favorites appear

**Expected:**
- Favorites sync across devices
- Data appears within 30 seconds
- No data loss
- RLS prevents seeing other users' data

---

### Test 7: Error Handling

**Test Offline Behavior**
1. Disconnect internet
2. Try to sync
3. Check error handling

**Expected:**
- Graceful error message
- No app crash
- Retry on reconnect

**Test Invalid Data**
```javascript
// Try to add favorite without required fields
await addFavorite({ toolName: 'test' })
// Should show validation error
```

---

### Test 8: Performance

**Measure Sync Speed**
```javascript
console.time('sync')
await forceSyncNow()
console.timeEnd('sync')
```

**Expected:**
- Initial sync: < 2 seconds
- Subsequent syncs: < 1 second
- No memory leaks
- No excessive CPU usage

---

## 📊 Test Results Template

```
Test 1: Visual Integration
  ✅ Header status visible
  ✅ Settings tab accessible
  ✅ Components render correctly

Test 2: Sync Functionality
  ✅ setupMCPSync works
  ✅ getSyncStatus returns data
  ✅ forceSyncNow executes

Test 3: Database Operations
  ✅ Favorites sync
  ✅ Execution tracking
  ✅ Search history

Test 4: Auto-Sync
  ✅ Enables correctly
  ✅ Runs every 30 seconds
  ✅ Disables correctly

Test 5: Manual Sync
  ✅ Button triggers sync
  ✅ UI updates correctly
  ✅ Stats refresh

Test 6: Cross-Device
  ✅ Data syncs across devices
  ✅ RLS policies work
  ⚠️  [Optional: Need 2nd device]

Test 7: Error Handling
  ✅ Offline errors handled
  ✅ Validation works
  ✅ No crashes

Test 8: Performance
  ✅ Sync speed acceptable
  ✅ No memory leaks
  ✅ CPU usage normal
```

---

## 🐛 Known Issues

None currently. Report any issues found during testing.

---

## 🔧 Troubleshooting

### Sync not working
1. Check dev server console for errors
2. Verify Supabase connection: `npm run test:sync`
3. Check browser console for errors
4. Verify user is logged in

### Components not visible
1. Verify `isSupabaseEnabled` returns true
2. Check if user is logged in
3. Clear browser cache
4. Restart dev server

### Database errors
1. Verify tables exist in Supabase
2. Check RLS policies
3. Verify user authentication
4. Check service role key

---

## ✅ Success Criteria

**All tests pass when:**
- ✅ Components render without errors
- ✅ Sync functions execute successfully
- ✅ Data persists to database
- ✅ Auto-sync works correctly
- ✅ Manual sync works
- ✅ Performance is acceptable
- ✅ No console errors

---

## 📝 Next Steps After Testing

1. **If all tests pass:**
   - Document any findings
   - Commit test results
   - Proceed to production deployment

2. **If issues found:**
   - Document issues
   - Create fix plan
   - Implement fixes
   - Re-test

---

**Testing Status:** Ready to start  
**Estimated Time:** 30-45 minutes  
**Required:** Browser, Supabase access, logged-in user
