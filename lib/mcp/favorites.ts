/**
 * MCP Tool Favorites Management
 * 
 * Features:
 * - Add/remove favorites
 * - Organize into collections
 * - Persist to localStorage
 * - Share collections
 * - Quick access management
 */

export interface FavoriteTool {
  serverId: string
  serverName: string
  toolName: string
  toolDescription?: string
  addedAt: string
  lastUsed?: string
  useCount: number
  tags: string[]
  notes?: string
}

export interface FavoriteCollection {
  id: string
  name: string
  description?: string
  tools: FavoriteTool[]
  createdAt: string
  updatedAt: string
  color?: string
  icon?: string
  isPublic: boolean
  shareCode?: string
}

export interface FavoritesState {
  favorites: FavoriteTool[]
  collections: FavoriteCollection[]
  quickAccess: string[] // tool identifiers in quick access bar
}

const STORAGE_KEY = 'mcp-favorites'
const MAX_QUICK_ACCESS = 8
const MAX_COLLECTIONS = 20

/**
 * Get tool identifier
 */
export function getToolId(serverId: string, toolName: string): string {
  return `${serverId}:${toolName}`
}

/**
 * Parse tool identifier
 */
export function parseToolId(toolId: string): { serverId: string; toolName: string } {
  const [serverId, toolName] = toolId.split(':')
  return { serverId, toolName }
}

/**
 * Load favorites from localStorage
 */
export function loadFavorites(): FavoritesState {
  if (typeof window === 'undefined') {
    return {
      favorites: [],
      collections: [],
      quickAccess: []
    }
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return {
        favorites: [],
        collections: [],
        quickAccess: []
      }
    }

    const state = JSON.parse(data) as FavoritesState
    
    // Validate and clean data
    return {
      favorites: Array.isArray(state.favorites) ? state.favorites : [],
      collections: Array.isArray(state.collections) ? state.collections : [],
      quickAccess: Array.isArray(state.quickAccess) ? state.quickAccess : []
    }
  } catch (error) {
    console.error('Failed to load favorites:', error)
    return {
      favorites: [],
      collections: [],
      quickAccess: []
    }
  }
}

/**
 * Save favorites to localStorage
 */
export function saveFavorites(state: FavoritesState): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save favorites:', error)
  }
}

/**
 * Add tool to favorites
 */
export function addFavorite(
  tool: Omit<FavoriteTool, 'addedAt' | 'useCount'>
): FavoritesState {
  const state = loadFavorites()
  const toolId = getToolId(tool.serverId, tool.toolName)

  // Check if already exists
  const exists = state.favorites.some(
    f => getToolId(f.serverId, f.toolName) === toolId
  )

  if (exists) {
    return state
  }

  const newFavorite: FavoriteTool = {
    ...tool,
    addedAt: new Date().toISOString(),
    useCount: 0
  }

  const newState = {
    ...state,
    favorites: [...state.favorites, newFavorite]
  }

  saveFavorites(newState)
  return newState
}

/**
 * Remove tool from favorites
 */
export function removeFavorite(serverId: string, toolName: string): FavoritesState {
  const state = loadFavorites()
  const toolId = getToolId(serverId, toolName)

  const newState = {
    ...state,
    favorites: state.favorites.filter(
      f => getToolId(f.serverId, f.toolName) !== toolId
    ),
    quickAccess: state.quickAccess.filter(id => id !== toolId),
    collections: state.collections.map(col => ({
      ...col,
      tools: col.tools.filter(
        t => getToolId(t.serverId, t.toolName) !== toolId
      )
    }))
  }

  saveFavorites(newState)
  return newState
}

/**
 * Check if tool is favorited
 */
export function isFavorite(serverId: string, toolName: string): boolean {
  const state = loadFavorites()
  const toolId = getToolId(serverId, toolName)
  return state.favorites.some(
    f => getToolId(f.serverId, f.toolName) === toolId
  )
}

/**
 * Update favorite tool
 */
export function updateFavorite(
  serverId: string,
  toolName: string,
  updates: Partial<FavoriteTool>
): FavoritesState {
  const state = loadFavorites()
  const toolId = getToolId(serverId, toolName)

  const newState = {
    ...state,
    favorites: state.favorites.map(f => {
      if (getToolId(f.serverId, f.toolName) === toolId) {
        return { ...f, ...updates }
      }
      return f
    })
  }

  saveFavorites(newState)
  return newState
}

/**
 * Increment use count
 */
export function incrementUseCount(serverId: string, toolName: string): void {
  updateFavorite(serverId, toolName, {
    useCount: (loadFavorites().favorites.find(
      f => getToolId(f.serverId, f.toolName) === getToolId(serverId, toolName)
    )?.useCount || 0) + 1,
    lastUsed: new Date().toISOString()
  })
}

/**
 * Get all favorites
 */
export function getFavorites(): FavoriteTool[] {
  return loadFavorites().favorites
}

/**
 * Get favorite by tool identifier
 */
export function getFavorite(serverId: string, toolName: string): FavoriteTool | undefined {
  const state = loadFavorites()
  const toolId = getToolId(serverId, toolName)
  return state.favorites.find(
    f => getToolId(f.serverId, f.toolName) === toolId
  )
}

/**
 * Sort favorites
 */
export function sortFavorites(
  favorites: FavoriteTool[],
  sortBy: 'name' | 'recent' | 'popular' | 'added'
): FavoriteTool[] {
  const sorted = [...favorites]

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.toolName.localeCompare(b.toolName))
    
    case 'recent':
      return sorted.sort((a, b) => {
        const aTime = a.lastUsed || a.addedAt
        const bTime = b.lastUsed || b.addedAt
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })
    
    case 'popular':
      return sorted.sort((a, b) => b.useCount - a.useCount)
    
    case 'added':
      return sorted.sort((a, b) => 
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      )
    
    default:
      return sorted
  }
}

// ==================== COLLECTIONS ====================

/**
 * Create new collection
 */
export function createCollection(
  name: string,
  options?: Partial<Omit<FavoriteCollection, 'id' | 'createdAt' | 'updatedAt' | 'tools'>>
): FavoriteCollection {
  const state = loadFavorites()

  if (state.collections.length >= MAX_COLLECTIONS) {
    throw new Error(`Maximum ${MAX_COLLECTIONS} collections allowed`)
  }

  const collection: FavoriteCollection = {
    id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    tools: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: false,
    ...options
  }

  const newState = {
    ...state,
    collections: [...state.collections, collection]
  }

  saveFavorites(newState)
  return collection
}

/**
 * Delete collection
 */
export function deleteCollection(collectionId: string): FavoritesState {
  const state = loadFavorites()

  const newState = {
    ...state,
    collections: state.collections.filter(c => c.id !== collectionId)
  }

  saveFavorites(newState)
  return newState
}

/**
 * Update collection
 */
export function updateCollection(
  collectionId: string,
  updates: Partial<FavoriteCollection>
): FavoritesState {
  const state = loadFavorites()

  const newState = {
    ...state,
    collections: state.collections.map(c => {
      if (c.id === collectionId) {
        return {
          ...c,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
      return c
    })
  }

  saveFavorites(newState)
  return newState
}

/**
 * Add tool to collection
 */
export function addToCollection(collectionId: string, tool: FavoriteTool): FavoritesState {
  const state = loadFavorites()
  const collection = state.collections.find(c => c.id === collectionId)

  if (!collection) {
    throw new Error('Collection not found')
  }

  const toolId = getToolId(tool.serverId, tool.toolName)
  const exists = collection.tools.some(
    t => getToolId(t.serverId, t.toolName) === toolId
  )

  if (exists) {
    return state
  }

  return updateCollection(collectionId, {
    tools: [...collection.tools, tool]
  })
}

/**
 * Remove tool from collection
 */
export function removeFromCollection(
  collectionId: string,
  serverId: string,
  toolName: string
): FavoritesState {
  const state = loadFavorites()
  const collection = state.collections.find(c => c.id === collectionId)

  if (!collection) {
    throw new Error('Collection not found')
  }

  const toolId = getToolId(serverId, toolName)

  return updateCollection(collectionId, {
    tools: collection.tools.filter(
      t => getToolId(t.serverId, t.toolName) !== toolId
    )
  })
}

/**
 * Get all collections
 */
export function getCollections(): FavoriteCollection[] {
  return loadFavorites().collections
}

/**
 * Get collection by ID
 */
export function getCollection(collectionId: string): FavoriteCollection | undefined {
  return loadFavorites().collections.find(c => c.id === collectionId)
}

// ==================== QUICK ACCESS ====================

/**
 * Add to quick access
 */
export function addToQuickAccess(serverId: string, toolName: string): FavoritesState {
  const state = loadFavorites()
  const toolId = getToolId(serverId, toolName)

  if (state.quickAccess.includes(toolId)) {
    return state
  }

  if (state.quickAccess.length >= MAX_QUICK_ACCESS) {
    throw new Error(`Maximum ${MAX_QUICK_ACCESS} tools in quick access`)
  }

  const newState = {
    ...state,
    quickAccess: [...state.quickAccess, toolId]
  }

  saveFavorites(newState)
  return newState
}

/**
 * Remove from quick access
 */
export function removeFromQuickAccess(serverId: string, toolName: string): FavoritesState {
  const state = loadFavorites()
  const toolId = getToolId(serverId, toolName)

  const newState = {
    ...state,
    quickAccess: state.quickAccess.filter(id => id !== toolId)
  }

  saveFavorites(newState)
  return newState
}

/**
 * Reorder quick access
 */
export function reorderQuickAccess(toolIds: string[]): FavoritesState {
  const state = loadFavorites()

  // Validate all IDs exist in favorites
  const validIds = toolIds.filter(id => {
    const { serverId, toolName } = parseToolId(id)
    return isFavorite(serverId, toolName)
  })

  const newState = {
    ...state,
    quickAccess: validIds.slice(0, MAX_QUICK_ACCESS)
  }

  saveFavorites(newState)
  return newState
}

/**
 * Get quick access tools
 */
export function getQuickAccess(): FavoriteTool[] {
  const state = loadFavorites()
  
  return state.quickAccess
    .map(toolId => {
      const { serverId, toolName } = parseToolId(toolId)
      return getFavorite(serverId, toolName)
    })
    .filter((tool): tool is FavoriteTool => tool !== undefined)
}

/**
 * Check if in quick access
 */
export function isInQuickAccess(serverId: string, toolName: string): boolean {
  const state = loadFavorites()
  const toolId = getToolId(serverId, toolName)
  return state.quickAccess.includes(toolId)
}

// ==================== SHARING ====================

/**
 * Generate share code for collection
 */
export function generateShareCode(collectionId: string): string {
  const collection = getCollection(collectionId)
  
  if (!collection) {
    throw new Error('Collection not found')
  }

  // Generate unique share code
  const shareCode = `mcp_${collectionId}_${Date.now().toString(36)}`
  
  updateCollection(collectionId, {
    shareCode,
    isPublic: true
  })

  return shareCode
}

/**
 * Export collection to JSON
 */
export function exportCollection(collectionId: string): string {
  const collection = getCollection(collectionId)
  
  if (!collection) {
    throw new Error('Collection not found')
  }

  return JSON.stringify(collection, null, 2)
}

/**
 * Import collection from JSON
 */
export function importCollection(jsonData: string): FavoriteCollection {
  try {
    const collection = JSON.parse(jsonData) as FavoriteCollection
    
    // Validate structure
    if (!collection.name || !Array.isArray(collection.tools)) {
      throw new Error('Invalid collection format')
    }

    // Create new collection with imported data
    return createCollection(collection.name, {
      description: collection.description,
      color: collection.color,
      icon: collection.icon,
      isPublic: false // Always import as private
    })
  } catch (error) {
    throw new Error('Failed to import collection: ' + (error as Error).message)
  }
}

// ==================== STATISTICS ====================

/**
 * Get favorites statistics
 */
export function getFavoritesStats() {
  const state = loadFavorites()
  
  return {
    totalFavorites: state.favorites.length,
    totalCollections: state.collections.length,
    quickAccessCount: state.quickAccess.length,
    totalUsage: state.favorites.reduce((sum, f) => sum + f.useCount, 0),
    mostUsed: sortFavorites(state.favorites, 'popular').slice(0, 5),
    recentlyUsed: sortFavorites(state.favorites, 'recent').slice(0, 5),
    recentlyAdded: sortFavorites(state.favorites, 'added').slice(0, 5)
  }
}

/**
 * Clear all favorites (with confirmation)
 */
export function clearAllFavorites(): void {
  if (typeof window === 'undefined') return

  const state: FavoritesState = {
    favorites: [],
    collections: [],
    quickAccess: []
  }

  saveFavorites(state)
}
