/**
 * Supabase Persistence for MCP Searches
 * 
 * Syncs saved searches and search history between localStorage and Supabase
 */

import { createClient } from '@/lib/supabase/client'
import type { SavedSearch, SearchFilters } from './search'
import {
  loadSavedSearches as getLocalSavedSearches,
  saveSearch as saveLocalSearch,
  deleteSavedSearch as deleteLocalSavedSearch,
  loadSearchHistory as getLocalSearchHistory,
} from './search'

/**
 * Database types
 */
export interface DBSavedSearch {
  id: string
  user_id: string
  name: string
  query?: string
  filters: SearchFilters
  use_count: number
  last_used_at?: string
  created_at: string
  updated_at: string
}

export interface DBSearchHistory {
  id: string
  user_id: string
  query: string
  filters: SearchFilters
  result_count: number
  searched_at: string
}

/**
 * Sync saved searches from Supabase to localStorage
 */
export async function syncSavedSearchesFromDB(): Promise<{
  success: boolean
  synced: number
  error?: string
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, synced: 0, error: 'Not authenticated' }
    }

    // Fetch saved searches from Supabase
    const { data: dbSearches, error } = await supabase
      .from('mcp_saved_searches')
      .select('*')
      .eq('user_id', user.id)
      .order('last_used_at', { ascending: false, nullsFirst: false })

    if (error) {
      throw error
    }

    if (!dbSearches || dbSearches.length === 0) {
      return { success: true, synced: 0 }
    }

    // Convert DB searches to local format
    const localSearches: SavedSearch[] = dbSearches.map(dbSearch => ({
      id: dbSearch.id,
      name: dbSearch.name,
      query: dbSearch.query,
      filters: dbSearch.filters,
      savedAt: new Date(dbSearch.created_at)
    }))

    // Save to localStorage
    localStorage.setItem('mcp-saved-searches', JSON.stringify(localSearches))

    return { success: true, synced: localSearches.length }
  } catch (error) {
    console.error('Failed to sync saved searches from DB:', error)
    return {
      success: false,
      synced: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Sync saved searches from localStorage to Supabase
 */
export async function syncSavedSearchesToDB(): Promise<{
  success: boolean
  synced: number
  error?: string
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, synced: 0, error: 'Not authenticated' }
    }

    // Get local saved searches
    const localSearches = getLocalSavedSearches()
    
    if (localSearches.length === 0) {
      return { success: true, synced: 0 }
    }

    // Convert to DB format
    const dbSearches = localSearches.map(search => ({
      id: search.id,
      user_id: user.id,
      name: search.name,
      query: search.query,
      filters: search.filters,
      use_count: 0
    }))

    // Upsert to Supabase
    const { error } = await supabase
      .from('mcp_saved_searches')
      .upsert(dbSearches, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

    if (error) {
      throw error
    }

    return { success: true, synced: dbSearches.length }
  } catch (error) {
    console.error('Failed to sync saved searches to DB:', error)
    return {
      success: false,
      synced: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Save search and sync to Supabase
 */
export async function saveSearchWithSync(
  name: string,
  query: string,
  filters: SearchFilters
): Promise<boolean> {
  try {
    // Save locally first
    const search = saveLocalSearch(name, query, filters)

    // Sync to Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return true // Local save succeeded
    }

    const { error } = await supabase
      .from('mcp_saved_searches')
      .insert({
        id: search.id,
        user_id: user.id,
        name,
        query,
        filters,
        use_count: 0
      })

    if (error && error.code !== '23505') { // Ignore duplicates
      console.error('Failed to sync saved search to DB:', error)
    }

    return true
  } catch (error) {
    console.error('Failed to save search with sync:', error)
    return false
  }
}

/**
 * Delete saved search and sync to Supabase
 */
export async function deleteSavedSearchWithSync(searchId: string): Promise<boolean> {
  try {
    // Delete locally
    deleteLocalSavedSearch(searchId)

    // Delete from Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return true
    }

    const { error } = await supabase
      .from('mcp_saved_searches')
      .delete()
      .eq('id', searchId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to delete saved search from DB:', error)
    }

    return true
  } catch (error) {
    console.error('Failed to delete saved search with sync:', error)
    return false
  }
}

/**
 * Sync search history from Supabase to localStorage
 */
export async function syncSearchHistoryFromDB(limit = 100): Promise<{
  success: boolean
  synced: number
  error?: string
}> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, synced: 0, error: 'Not authenticated' }
    }

    // Fetch search history from Supabase
    const { data: dbHistory, error } = await supabase
      .from('mcp_search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    if (!dbHistory || dbHistory.length === 0) {
      return { success: true, synced: 0 }
    }

    // Convert to local format
    const localHistory = dbHistory.map(dbItem => ({
      query: dbItem.query,
      filters: dbItem.filters,
      resultCount: dbItem.result_count,
      timestamp: new Date(dbItem.searched_at)
    }))

    // Save to localStorage
    localStorage.setItem('mcp-search-history', JSON.stringify(localHistory))

    return { success: true, synced: localHistory.length }
  } catch (error) {
    console.error('Failed to sync search history from DB:', error)
    return {
      success: false,
      synced: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Record search to history and sync to Supabase
 */
export async function recordSearchWithSync(
  query: string,
  filters: SearchFilters,
  resultCount: number
): Promise<void> {
  try {
    // Record locally (handled by search.ts)
    
    // Record to Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return
    }

    const { error } = await supabase
      .from('mcp_search_history')
      .insert({
        user_id: user.id,
        query,
        filters,
        result_count: resultCount
      })

    if (error) {
      console.error('Failed to record search to DB:', error)
    }
  } catch (error) {
    console.error('Failed to record search with sync:', error)
  }
}

/**
 * Increment saved search use count
 */
export async function incrementSearchUseCount(searchId: string): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return
    }

    const { error } = await supabase
      .from('mcp_saved_searches')
      .update({
        use_count: supabase.rpc('increment', { amount: 1 }),
        last_used_at: new Date().toISOString()
      })
      .eq('id', searchId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to increment search use count:', error)
    }
  } catch (error) {
    console.error('Failed to increment search use count:', error)
  }
}

/**
 * Setup bidirectional sync for searches
 */
export async function setupSearchesSync(): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return
    }

    // Sync from DB on startup
    await syncSavedSearchesFromDB()
    await syncSearchHistoryFromDB(100)

    // Setup realtime subscription for saved searches
    const channel = supabase
      .channel('mcp_searches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mcp_saved_searches',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Saved searches changed:', payload)
          // Re-sync from DB
          syncSavedSearchesFromDB()
        }
      )
      .subscribe()

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        channel.unsubscribe()
      })
    }
  } catch (error) {
    console.error('Failed to setup searches sync:', error)
  }
}

/**
 * Clear all search history
 */
export async function clearSearchHistoryWithSync(): Promise<boolean> {
  try {
    // Clear localStorage
    localStorage.removeItem('mcp-search-history')

    // Clear Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return true
    }

    const { error } = await supabase
      .from('mcp_search_history')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to clear search history in DB:', error)
    }

    return true
  } catch (error) {
    console.error('Failed to clear search history with sync:', error)
    return false
  }
}
