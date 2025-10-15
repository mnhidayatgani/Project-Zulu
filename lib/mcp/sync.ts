/**
 * MCP Master Sync Utility
 * 
 * Coordinates cross-device sync for all MCP data:
 * - Favorites
 * - Execution History
 * - Searches
 * 
 * Provides unified interface for sync operations
 */

import { createClient } from '@/lib/supabase/client'
import {
  setupFavoritesSync,
  syncFavoritesFromDB,
  syncFavoritesToDB,
} from './favorites-sync'
import {
  setupExecutionHistorySync,
  syncExecutionHistoryFromDB,
  syncExecutionHistoryToDB,
} from './execution-history-sync'
import {
  setupSearchesSync,
  syncSavedSearchesFromDB,
  syncSavedSearchesToDB,
  syncSearchHistoryFromDB,
} from './search-sync'

/**
 * Sync status for each data type
 */
export interface SyncStatus {
  favorites: {
    enabled: boolean
    lastSync?: Date
    synced: number
    errors: string[]
  }
  executions: {
    enabled: boolean
    lastSync?: Date
    synced: number
    errors: string[]
  }
  searches: {
    enabled: boolean
    lastSync?: Date
    synced: number
    errors: string[]
  }
}

/**
 * Sync direction
 */
export type SyncDirection = 'pull' | 'push' | 'bidirectional'

/**
 * Internal sync state
 */
interface SyncState {
  autoSyncEnabled: boolean
  lastSync?: Date
}

let syncState: SyncState | null = null

/**
 * Initialize sync state
 */
function initSyncState() {
  if (!syncState) {
    syncState = {
      autoSyncEnabled: typeof window !== 'undefined' 
        ? localStorage.getItem('mcp_auto_sync_enabled') !== 'false'
        : true
    }
  }
  return syncState
}

/**
 * Sync all data from Supabase to localStorage (PULL)
 * Use this when user logs in or switches devices
 */
export async function syncAllFromDB(): Promise<{
  success: boolean
  status: SyncStatus
}> {
  const status: SyncStatus = {
    favorites: { enabled: false, synced: 0, errors: [] },
    executions: { enabled: false, synced: 0, errors: [] },
    searches: { enabled: false, synced: 0, errors: [] }
  }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, status }
    }

    // Sync favorites
    try {
      const favResult = await syncFavoritesFromDB()
      status.favorites = {
        enabled: true,
        lastSync: new Date(),
        synced: favResult.synced,
        errors: favResult.error ? [favResult.error] : []
      }
    } catch (error) {
      status.favorites.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      )
    }

    // Sync execution history
    try {
      const execResult = await syncExecutionHistoryFromDB(500)
      status.executions = {
        enabled: true,
        lastSync: new Date(),
        synced: execResult.synced,
        errors: execResult.error ? [execResult.error] : []
      }
    } catch (error) {
      status.executions.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      )
    }

    // Sync saved searches
    try {
      const searchResult = await syncSavedSearchesFromDB()
      const historyResult = await syncSearchHistoryFromDB(100)
      status.searches = {
        enabled: true,
        lastSync: new Date(),
        synced: searchResult.synced + historyResult.synced,
        errors: [
          ...(searchResult.error ? [searchResult.error] : []),
          ...(historyResult.error ? [historyResult.error] : [])
        ]
      }
    } catch (error) {
      status.searches.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      )
    }

    // Store sync status
    localStorage.setItem('mcp-sync-status', JSON.stringify(status))
    localStorage.setItem('mcp-last-sync', new Date().toISOString())

    const success = 
      status.favorites.errors.length === 0 &&
      status.executions.errors.length === 0 &&
      status.searches.errors.length === 0

    return { success, status }
  } catch (error) {
    console.error('Failed to sync all from DB:', error)
    return { success: false, status }
  }
}

/**
 * Sync all data from localStorage to Supabase (PUSH)
 * Use this to backup local data to cloud
 */
export async function syncAllToDB(): Promise<{
  success: boolean
  status: SyncStatus
}> {
  const status: SyncStatus = {
    favorites: { enabled: false, synced: 0, errors: [] },
    executions: { enabled: false, synced: 0, errors: [] },
    searches: { enabled: false, synced: 0, errors: [] }
  }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, status }
    }

    // Sync favorites
    try {
      const favResult = await syncFavoritesToDB()
      status.favorites = {
        enabled: true,
        lastSync: new Date(),
        synced: favResult.synced,
        errors: favResult.error ? [favResult.error] : []
      }
    } catch (error) {
      status.favorites.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      )
    }

    // Sync execution history
    try {
      const execResult = await syncExecutionHistoryToDB()
      status.executions = {
        enabled: true,
        lastSync: new Date(),
        synced: execResult.synced,
        errors: execResult.error ? [execResult.error] : []
      }
    } catch (error) {
      status.executions.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      )
    }

    // Sync saved searches
    try {
      const searchResult = await syncSavedSearchesToDB()
      status.searches = {
        enabled: true,
        lastSync: new Date(),
        synced: searchResult.synced,
        errors: searchResult.error ? [searchResult.error] : []
      }
    } catch (error) {
      status.searches.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      )
    }

    // Store sync status
    localStorage.setItem('mcp-sync-status', JSON.stringify(status))
    localStorage.setItem('mcp-last-sync', new Date().toISOString())

    const success = 
      status.favorites.errors.length === 0 &&
      status.executions.errors.length === 0 &&
      status.searches.errors.length === 0

    return { success, status }
  } catch (error) {
    console.error('Failed to sync all to DB:', error)
    return { success: false, status }
  }
}

/**
 * Setup automatic bidirectional sync for all data types
 * Call this once on app initialization
 */
export async function setupMCPSync(): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('Not authenticated, skipping sync setup')
      return
    }

    console.log('Setting up MCP cross-device sync...')

    // Setup sync for each data type
    await Promise.all([
      setupFavoritesSync(),
      setupExecutionHistorySync(),
      setupSearchesSync()
    ])

    // Do initial sync from DB (pull latest data)
    await syncAllFromDB()

    console.log('MCP sync setup complete')

    // Setup periodic background sync (every 5 minutes)
    if (typeof window !== 'undefined') {
      const syncInterval = setInterval(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Push local changes to DB
          await syncAllToDB()
        }
      }, 5 * 60 * 1000) // 5 minutes

      // Cleanup on page unload
      window.addEventListener('beforeunload', () => {
        clearInterval(syncInterval)
      })
    }
  } catch (error) {
    console.error('Failed to setup MCP sync:', error)
  }
}

/**
 * Get current sync status
 */
export function getSyncStatus(): SyncStatus | null {
  try {
    const statusStr = localStorage.getItem('mcp-sync-status')
    if (!statusStr) {
      return null
    }

    return JSON.parse(statusStr) as SyncStatus
  } catch (error) {
    console.error('Failed to get sync status:', error)
    return null
  }
}

/**
 * Get last sync time
 */
export function getLastSyncTime(): Date | null {
  try {
    const timeStr = localStorage.getItem('mcp-last-sync')
    if (!timeStr) {
      return null
    }

    return new Date(timeStr)
  } catch (error) {
    console.error('Failed to get last sync time:', error)
    return null
  }
}

/**
 * Force sync now (both directions)
 * Useful for manual sync button
 */
export async function forceSyncNow(): Promise<{
  success: boolean
  pulled: SyncStatus
  pushed: SyncStatus
}> {
  console.log('Forcing MCP sync...')

  // Pull from DB first (get latest)
  const pullResult = await syncAllFromDB()

  // Then push local changes
  const pushResult = await syncAllToDB()

  return {
    success: pullResult.success && pushResult.success,
    pulled: pullResult.status,
    pushed: pushResult.status
  }
}

/**
 * Clear all sync data (both local and remote)
 * WARNING: This is destructive!
 */
export async function clearAllSyncData(): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return false
    }

    // Clear localStorage
    localStorage.removeItem('mcp-favorites')
    localStorage.removeItem('mcp-execution-history')
    localStorage.removeItem('mcp-saved-searches')
    localStorage.removeItem('mcp-search-history')
    localStorage.removeItem('mcp-sync-status')
    localStorage.removeItem('mcp-last-sync')

    // Clear Supabase (in parallel)
    await Promise.all([
      supabase.from('mcp_favorites').delete().eq('user_id', user.id),
      supabase.from('mcp_favorite_collections').delete().eq('user_id', user.id),
      supabase.from('mcp_saved_searches').delete().eq('user_id', user.id),
      supabase.from('mcp_search_history').delete().eq('user_id', user.id),
      supabase.from('mcp_execution_history').delete().eq('user_id', user.id)
    ])

    return true
  } catch (error) {
    console.error('Failed to clear all sync data:', error)
    return false
  }
}

/**
 * Check if user is authenticated and sync is available
 */
export async function isSyncAvailable(): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch (error) {
    return false
  }
}

/**
 * Migrate data from localStorage-only to Supabase
 * Call this after user signs up or logs in for first time
 */
export async function migrateToSupabase(): Promise<{
  success: boolean
  migrated: {
    favorites: number
    executions: number
    searches: number
  }
}> {
  console.log('Migrating MCP data to Supabase...')

  const result = await syncAllToDB()

  return {
    success: result.success,
    migrated: {
      favorites: result.status.favorites.synced,
      executions: result.status.executions.synced,
      searches: result.status.searches.synced
    }
  }
}

/**
 * Get sync statistics
 */
export async function getSyncStats(): Promise<{
  favorites: number
  collections: number
  searches: number
  history: number
  executions: number
  totalSize: number
}> {
  try {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        favorites: 0,
        collections: 0,
        searches: 0,
        history: 0,
        executions: 0,
        totalSize: 0
      }
    }

    // Get counts from all tables
    const [
      favoritesResult,
      collectionsResult,
      searchesResult,
      historyResult,
      executionsResult
    ] = await Promise.all([
      supabase.from('mcp_favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('mcp_favorite_collections').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('mcp_saved_searches').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('mcp_search_history').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('mcp_execution_history').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    ])

    // Estimate total size (rough approximation)
    const totalSize = 
      ((favoritesResult.count || 0) * 500) + // ~500 bytes per favorite
      ((collectionsResult.count || 0) * 300) + // ~300 bytes per collection
      ((searchesResult.count || 0) * 200) + // ~200 bytes per search
      ((historyResult.count || 0) * 150) + // ~150 bytes per history item
      ((executionsResult.count || 0) * 1000) // ~1KB per execution

    return {
      favorites: favoritesResult.count || 0,
      collections: collectionsResult.count || 0,
      searches: searchesResult.count || 0,
      history: historyResult.count || 0,
      executions: executionsResult.count || 0,
      totalSize
    }
  } catch (error) {
    console.error('Failed to get sync stats:', error)
    return {
      favorites: 0,
      collections: 0,
      searches: 0,
      history: 0,
      executions: 0,
      totalSize: 0
    }
  }
}

/**
 * Enable or disable auto-sync
 */
export async function setAutoSync(enabled: boolean): Promise<void> {
  const state = initSyncState()
  state.autoSyncEnabled = enabled
  
  // Save preference to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('mcp_auto_sync_enabled', enabled ? 'true' : 'false')
  }

  console.log('Auto-sync', enabled ? 'enabled' : 'disabled')
}

/**
 * Check if auto-sync is enabled
 */
export function isAutoSyncEnabled(): boolean {
  const state = initSyncState()
  return state.autoSyncEnabled

  return true
}
