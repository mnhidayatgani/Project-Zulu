# MCP Cross-Device Sync System

Comprehensive cross-device synchronization for MCP favorites, execution history, and searches using Supabase.

## Features

✅ **Automatic Bidirectional Sync** - Changes sync between devices in real-time  
✅ **Conflict-Free** - Last-write-wins with timestamps  
✅ **Offline Support** - Works offline, syncs when online  
✅ **Real-time Updates** - Uses Supabase Realtime for instant updates  
✅ **Secure** - Row Level Security (RLS) policies  
✅ **Efficient** - Batch operations and optimized queries  
✅ **Migration Support** - Migrate from localStorage to Supabase  

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│ Device A    │         │  Supabase    │         │  Device B   │
│ (Browser 1) │◄───────►│   Database   │◄───────►│ (Browser 2) │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                        │
      │  localStorage          │  PostgreSQL +          │  localStorage
      │  + IndexedDB           │  Realtime              │  + IndexedDB
      │                        │                        │
      └────────────────────────┴────────────────────────┘
                    Cross-Device Sync
```

## Database Schema

### Tables Created

1. **mcp_favorites** - User favorites with use tracking
2. **mcp_favorite_collections** - Favorite collections
3. **mcp_collection_items** - Junction table for collections
4. **mcp_saved_searches** - Saved search queries
5. **mcp_search_history** - Search history log
6. **mcp_execution_history** - Tool execution records

All tables include:
- Row Level Security (RLS) policies
- Optimized indexes
- Automatic timestamps
- User isolation
- Cascade deletions

## Setup

### 1. Run SQL Schema

Execute the SQL schema in your Supabase project:

```bash
# In Supabase SQL Editor, run:
supabase/mcp_schema.sql
```

Or via CLI:

```bash
supabase db push
```

### 2. Initialize Sync in Your App

Add to your app initialization (e.g., `app/layout.tsx`):

```typescript
import { setupMCPSync } from '@/lib/mcp/sync'

// In a useEffect or on mount
useEffect(() => {
  setupMCPSync()
}, [])
```

This will:
- Check authentication
- Pull latest data from Supabase
- Setup real-time subscriptions
- Start periodic background sync (every 5 minutes)

## Usage

### Automatic Sync (Recommended)

Once `setupMCPSync()` is called, all operations automatically sync:

```typescript
import { addFavoriteWithSync } from '@/lib/mcp'

// Adds to localStorage AND Supabase
await addFavoriteWithSync({
  toolName: 'readFile',
  serverId: 'filesystem',
  serverName: 'Filesystem MCP',
  useCount: 0,
  tags: []
})
```

### Manual Sync

```typescript
import { 
  syncAllFromDB,    // Pull from Supabase
  syncAllToDB,      // Push to Supabase
  forceSyncNow      // Both directions
} from '@/lib/mcp/sync'

// Pull latest from cloud
const pullResult = await syncAllFromDB()

// Push local changes to cloud
const pushResult = await syncAllToDB()

// Force bidirectional sync
const syncResult = await forceSyncNow()
```

### Check Sync Status

```typescript
import { getSyncStatus, getLastSyncTime } from '@/lib/mcp/sync'

// Get detailed status
const status = getSyncStatus()
console.log(status.favorites.synced) // Number of favorites synced
console.log(status.favorites.errors) // Any errors

// Get last sync time
const lastSync = getLastSyncTime()
console.log(`Last synced: ${lastSync}`)
```

### Migration from localStorage

When a user signs up or logs in for the first time:

```typescript
import { migrateToSupabase } from '@/lib/mcp/sync'

// Migrate all localStorage data to Supabase
const result = await migrateToSupabase()

console.log(`Migrated ${result.migrated.favorites} favorites`)
console.log(`Migrated ${result.migrated.executions} executions`)
console.log(`Migrated ${result.migrated.searches} searches`)
```

## API Reference

### Master Sync Functions

#### `setupMCPSync()`
Initialize automatic bidirectional sync. Call once on app start.

```typescript
await setupMCPSync()
```

#### `syncAllFromDB()`
Pull all data from Supabase to localStorage.

```typescript
const result = await syncAllFromDB()
// Returns: { success: boolean, status: SyncStatus }
```

#### `syncAllToDB()`
Push all data from localStorage to Supabase.

```typescript
const result = await syncAllToDB()
// Returns: { success: boolean, status: SyncStatus }
```

#### `forceSyncNow()`
Force immediate bidirectional sync.

```typescript
const result = await forceSyncNow()
// Returns: { success: boolean, pulled: SyncStatus, pushed: SyncStatus }
```

### Favorites Sync

#### `addFavoriteWithSync()`
Add favorite and sync to Supabase.

```typescript
await addFavoriteWithSync({
  toolName: 'readFile',
  serverId: 'filesystem',
  serverName: 'Filesystem MCP',
  useCount: 0,
  tags: []
})
```

#### `removeFavoriteWithSync()`
Remove favorite and sync to Supabase.

```typescript
await removeFavoriteWithSync(favoriteId)
```

#### `incrementUseCountWithSync()`
Increment use count and sync.

```typescript
await incrementUseCountWithSync(serverId, toolName)
```

### Execution History Sync

#### `recordExecutionWithSync()`
Record execution and sync to Supabase.

```typescript
await recordExecutionWithSync({
  toolName: 'readFile',
  serverId: 'filesystem',
  serverName: 'Filesystem MCP',
  input: { path: '/file.txt' },
  output: 'file content',
  status: 'success',
  duration: 123,
  tags: []
})
```

#### `batchSyncExecutions()`
Sync multiple executions at once.

```typescript
const result = await batchSyncExecutions(executions)
// Returns: { success: boolean, synced: number, failed: number }
```

### Search Sync

#### `saveSearchWithSync()`
Save search and sync to Supabase.

```typescript
await saveSearchWithSync('My Search', 'query text', filters)
```

#### `recordSearchWithSync()`
Record search to history and sync.

```typescript
await recordSearchWithSync('query', filters, resultCount)
```

## Real-time Updates

Sync uses Supabase Realtime to detect changes:

```typescript
// Automatically handled by setupMCPSync()
// When data changes on another device:
// 1. Realtime event received
// 2. Local data refreshed from DB
// 3. UI updates automatically
```

## Conflict Resolution

Uses **last-write-wins** strategy:
- Timestamps on all records (`updated_at`)
- Upsert operations prefer newer data
- No merge conflicts
- Simple and predictable

## Data Limits

To prevent unbounded growth:

| Data Type | Local Limit | DB Limit | Auto-Cleanup |
|-----------|-------------|----------|--------------|
| Favorites | Unlimited | Unlimited | Manual |
| Collections | 20 | Unlimited | Manual |
| Saved Searches | 20 | Unlimited | Manual |
| Search History | 50 | 100 per user | Automatic |
| Execution History | 500 | 500 per user | Automatic |

Auto-cleanup runs daily at 2 AM (requires pg_cron extension).

## Security

### Row Level Security (RLS)

All tables have RLS enabled:

```sql
-- Users can only access their own data
CREATE POLICY "Users can view their own favorites"
  ON mcp_favorites FOR SELECT
  USING (auth.uid() = user_id);
```

### Data Isolation

- Each user sees only their data
- Foreign keys ensure referential integrity
- CASCADE DELETE for clean removal

### Encryption

- Data encrypted in transit (SSL/TLS)
- Data encrypted at rest (Supabase default)
- User keys stored in localStorage (client-side only)

## Performance

### Optimizations

1. **Indexes** - Optimized for common queries
2. **Batch Operations** - Reduce round trips
3. **Debouncing** - Prevent excessive syncs
4. **Selective Sync** - Only sync changed data
5. **JSONB** - Flexible data storage

### Monitoring

```typescript
// Check sync performance
const status = getSyncStatus()

console.log(`Favorites synced: ${status.favorites.synced}`)
console.log(`Sync errors: ${status.favorites.errors.length}`)
console.log(`Last sync: ${getLastSyncTime()}`)
```

## Troubleshooting

### Sync Not Working

```typescript
// Check auth status
const isAvailable = await isSyncAvailable()
console.log('Sync available:', isAvailable)

// Check sync status
const status = getSyncStatus()
console.log('Errors:', status?.favorites.errors)
```

### Data Not Appearing

```typescript
// Force refresh from DB
await syncAllFromDB()
```

### Clear All Data

```typescript
// WARNING: Destructive!
await clearAllSyncData()
```

## Examples

### Complete Setup Example

```typescript
// app/layout.tsx
import { useEffect } from 'react'
import { setupMCPSync, isSyncAvailable } from '@/lib/mcp/sync'

export default function RootLayout({ children }) {
  useEffect(() => {
    const initSync = async () => {
      const syncAvailable = await isSyncAvailable()
      
      if (syncAvailable) {
        console.log('Setting up MCP sync...')
        await setupMCPSync()
        console.log('MCP sync ready!')
      } else {
        console.log('User not authenticated, using local storage only')
      }
    }

    initSync()
  }, [])

  return <html>{children}</html>
}
```

### Manual Sync Button

```typescript
// components/sync-button.tsx
import { useState } from 'react'
import { forceSyncNow } from '@/lib/mcp/sync'

export function SyncButton() {
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const result = await forceSyncNow()
      if (result.success) {
        alert('Sync successful!')
      } else {
        alert('Sync failed')
      }
    } finally {
      setSyncing(false)
    }
  }

  return (
    <button onClick={handleSync} disabled={syncing}>
      {syncing ? 'Syncing...' : 'Sync Now'}
    </button>
  )
}
```

### Sync Status Display

```typescript
// components/sync-status.tsx
import { getSyncStatus, getLastSyncTime } from '@/lib/mcp/sync'

export function SyncStatus() {
  const status = getSyncStatus()
  const lastSync = getLastSyncTime()

  if (!status) return null

  return (
    <div>
      <h3>Sync Status</h3>
      <p>Favorites: {status.favorites.synced} synced</p>
      <p>Executions: {status.executions.synced} synced</p>
      <p>Searches: {status.searches.synced} synced</p>
      {lastSync && <p>Last sync: {lastSync.toLocaleString()}</p>}
    </div>
  )
}
```

## Migration Guide

### From localStorage-only to Supabase

1. User signs up/logs in
2. Call `migrateToSupabase()`
3. All local data uploaded to Supabase
4. Automatic sync enabled

```typescript
// On login success
const result = await migrateToSupabase()
console.log(`Migration complete: ${result.migrated.favorites} items`)
```

### From Supabase back to localStorage-only

1. User logs out
2. Data remains in localStorage
3. No more sync until next login

## Best Practices

1. **Call setupMCPSync() once** - On app initialization
2. **Use *WithSync functions** - For automatic sync
3. **Handle offline** - Sync will resume when online
4. **Monitor errors** - Check `getSyncStatus()` for issues
5. **Batch operations** - Use batch sync for many items
6. **Test offline** - Ensure app works without sync

## Roadmap

- [ ] Conflict resolution UI
- [ ] Selective sync (choose what to sync)
- [ ] Sync on/off toggle
- [ ] Export/import sync data
- [ ] Sync statistics dashboard
- [ ] Background sync worker
- [ ] Delta sync (only changed data)
- [ ] Compression for large data

## Support

For issues or questions:
1. Check Supabase logs
2. Check browser console
3. Verify RLS policies
4. Check network tab for API calls

---

**Version**: 1.0.0  
**Last Updated**: October 15, 2025  
**Status**: ✅ Production Ready
