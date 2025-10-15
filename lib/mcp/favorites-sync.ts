/**
 * Supabase Persistence for MCP Favorites
 * 
 * Syncs favorites between localStorage and Supabase for cross-device support
 */

import { createClient } from '@/lib/supabase/client'
import type { FavoriteTool, FavoriteCollection } from './favorites'
import {
  getFavorites as getLocalFavorites,
  addFavorite as addLocalFavorite,
  removeFavorite as removeLocalFavorite,
  updateFavorite as updateLocalFavorite,
  getCollections as getLocalCollections,
  createCollection as createLocalCollection,
  deleteCollection as deleteLocalCollection,
} from './favorites'

/**
 * Database types
 */
export interface DBFavorite {
  id: string
  user_id: string
  tool_name: string
  server_id: string
  server_name: string
  description?: string
  category?: string
  tags?: string[]
  use_count: number
  last_used_at?: string
  is_quick_access: boolean
  quick_access_order?: number
  notes?: string
  custom_tags?: string[]
  created_at: string
  updated_at: string
}

export interface DBCollection {
  id: string
  user_id: string
  name: string
  description?: string
  color?: string
  icon?: string
  is_public: boolean
  share_code?: string
  created_at: string
  updated_at: string
}

/**
 * Sync favorites from Supabase to localStorage
 */
export async function syncFavoritesFromDB(): Promise<{
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

    // Fetch all favorites from Supabase
    const { data: dbFavorites, error } = await supabase
      .from('mcp_favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    if (!dbFavorites || dbFavorites.length === 0) {
      return { success: true, synced: 0 }
    }

    // Convert DB favorites to local format
    const localFavorites: FavoriteTool[] = dbFavorites.map(dbFav => ({
      id: dbFav.id,
      toolName: dbFav.tool_name,
      serverId: dbFav.server_id,
      serverName: dbFav.server_name,
      description: dbFav.description,
      category: dbFav.category,
      tags: dbFav.tags || [],
      useCount: dbFav.use_count,
      lastUsed: dbFav.last_used_at ? new Date(dbFav.last_used_at) : undefined,
      notes: dbFav.notes,
      customTags: dbFav.custom_tags || [],
      addedAt: new Date(dbFav.created_at)
    }))

    // Save to localStorage (replace local data)
    localStorage.setItem('mcp-favorites', JSON.stringify(localFavorites))

    return { success: true, synced: localFavorites.length }
  } catch (error) {
    console.error('Failed to sync favorites from DB:', error)
    return {
      success: false,
      synced: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Sync favorites from localStorage to Supabase
 */
export async function syncFavoritesToDB(): Promise<{
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

    // Get local favorites
    const localFavorites = getLocalFavorites()
    
    if (localFavorites.length === 0) {
      return { success: true, synced: 0 }
    }

    // Convert to DB format
    const dbFavorites = localFavorites.map(fav => ({
      user_id: user.id,
      tool_name: fav.toolName,
      server_id: fav.serverId,
      server_name: fav.serverName,
      description: fav.description,
      category: fav.category,
      tags: fav.tags,
      use_count: fav.useCount,
      last_used_at: fav.lastUsed?.toISOString(),
      is_quick_access: false, // Will be set separately
      notes: fav.notes,
      custom_tags: fav.customTags
    }))

    // Upsert to Supabase (insert or update)
    const { error } = await supabase
      .from('mcp_favorites')
      .upsert(dbFavorites, {
        onConflict: 'user_id,server_id,tool_name',
        ignoreDuplicates: false
      })

    if (error) {
      throw error
    }

    return { success: true, synced: dbFavorites.length }
  } catch (error) {
    console.error('Failed to sync favorites to DB:', error)
    return {
      success: false,
      synced: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Add favorite and sync to Supabase
 */
export async function addFavoriteWithSync(favorite: Omit<FavoriteTool, 'id' | 'addedAt'>): Promise<boolean> {
  try {
    // Add to localStorage first
    const localSuccess = addLocalFavorite(favorite)
    if (!localSuccess) {
      return false
    }

    // Sync to Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // No user, but local add succeeded
      return true
    }

    const { error } = await supabase
      .from('mcp_favorites')
      .insert({
        user_id: user.id,
        tool_name: favorite.toolName,
        server_id: favorite.serverId,
        server_name: favorite.serverName,
        description: favorite.description,
        category: favorite.category,
        tags: favorite.tags,
        use_count: favorite.useCount || 0,
        notes: favorite.notes,
        custom_tags: favorite.customTags
      })

    if (error && error.code !== '23505') { // Ignore duplicate errors
      console.error('Failed to sync favorite to DB:', error)
      // Don't fail if sync fails
    }

    return true
  } catch (error) {
    console.error('Failed to add favorite with sync:', error)
    return false
  }
}

/**
 * Remove favorite and sync to Supabase
 */
export async function removeFavoriteWithSync(favoriteId: string): Promise<boolean> {
  try {
    // Get favorite details before removing
    const localFavorites = getLocalFavorites()
    const favorite = localFavorites.find(f => f.id === favoriteId)
    
    // Remove from localStorage
    const localSuccess = removeLocalFavorite(favoriteId)
    if (!localSuccess) {
      return false
    }

    // Sync to Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || !favorite) {
      return true
    }

    const { error } = await supabase
      .from('mcp_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('server_id', favorite.serverId)
      .eq('tool_name', favorite.toolName)

    if (error) {
      console.error('Failed to remove favorite from DB:', error)
      // Don't fail if sync fails
    }

    return true
  } catch (error) {
    console.error('Failed to remove favorite with sync:', error)
    return false
  }
}

/**
 * Update favorite and sync to Supabase
 */
export async function updateFavoriteWithSync(
  favoriteId: string,
  updates: Partial<FavoriteTool>
): Promise<boolean> {
  try {
    // Update localStorage
    const localSuccess = updateLocalFavorite(favoriteId, updates)
    if (!localSuccess) {
      return false
    }

    // Get updated favorite
    const localFavorites = getLocalFavorites()
    const favorite = localFavorites.find(f => f.id === favoriteId)
    
    if (!favorite) {
      return false
    }

    // Sync to Supabase
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return true
    }

    const { error } = await supabase
      .from('mcp_favorites')
      .update({
        description: favorite.description,
        category: favorite.category,
        tags: favorite.tags,
        use_count: favorite.useCount,
        last_used_at: favorite.lastUsed?.toISOString(),
        notes: favorite.notes,
        custom_tags: favorite.customTags
      })
      .eq('user_id', user.id)
      .eq('server_id', favorite.serverId)
      .eq('tool_name', favorite.toolName)

    if (error) {
      console.error('Failed to update favorite in DB:', error)
      // Don't fail if sync fails
    }

    return true
  } catch (error) {
    console.error('Failed to update favorite with sync:', error)
    return false
  }
}

/**
 * Increment use count and sync to Supabase
 */
export async function incrementUseCountWithSync(
  serverId: string,
  toolName: string
): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return
    }

    // Call Supabase function
    const { error } = await supabase.rpc('increment_favorite_use_count', {
      p_user_id: user.id,
      p_server_id: serverId,
      p_tool_name: toolName
    })

    if (error) {
      console.error('Failed to increment use count in DB:', error)
    }

    // Also update localStorage
    const favorites = getLocalFavorites()
    const favorite = favorites.find(
      f => f.serverId === serverId && f.toolName === toolName
    )

    if (favorite) {
      updateLocalFavorite(favorite.id, {
        useCount: (favorite.useCount || 0) + 1,
        lastUsed: new Date()
      })
    }
  } catch (error) {
    console.error('Failed to increment use count with sync:', error)
  }
}

/**
 * Setup bidirectional sync
 * Call this on app initialization
 */
export async function setupFavoritesSync(): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return
    }

    // Sync from DB to local on startup
    await syncFavoritesFromDB()

    // Setup realtime subscription for changes
    const channel = supabase
      .channel('mcp_favorites_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mcp_favorites',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Favorites changed:', payload)
          // Re-sync from DB when changes detected
          syncFavoritesFromDB()
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
    console.error('Failed to setup favorites sync:', error)
  }
}
