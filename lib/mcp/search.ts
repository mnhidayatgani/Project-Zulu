/**
 * Advanced Search & Filtering for MCP Tools
 * 
 * Features:
 * - Full-text search across tools
 * - Multi-criteria filtering
 * - Search history tracking
 * - Saved search queries
 * - Search suggestions
 */

export interface SearchFilter {
  query: string
  providers?: string[]
  categories?: string[]
  tags?: string[]
  capabilities?: string[]
  status?: 'enabled' | 'disabled' | 'all'
  hasInput?: boolean
  hasOutput?: boolean
  requiresAuth?: boolean
  minRating?: number
  sortBy?: 'relevance' | 'name' | 'rating' | 'popularity' | 'recent'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult<T> {
  item: T
  score: number
  matches: SearchMatch[]
}

export interface SearchMatch {
  field: string
  value: string
  indices: [number, number][]
}

export interface SavedSearch {
  id: string
  name: string
  filter: SearchFilter
  createdAt: string
  lastUsed?: string
  useCount: number
}

export interface SearchHistory {
  query: string
  filter: SearchFilter
  timestamp: string
  resultCount: number
}

const STORAGE_KEY_SAVED = 'mcp-saved-searches'
const STORAGE_KEY_HISTORY = 'mcp-search-history'
const MAX_HISTORY = 50
const MAX_SAVED = 20

/**
 * Perform full-text search on an item
 */
export function searchText(
  text: string,
  query: string
): { matches: boolean; score: number; indices: [number, number][] } {
  if (!query || !text) {
    return { matches: false, score: 0, indices: [] }
  }

  const normalizedText = text.toLowerCase()
  const normalizedQuery = query.toLowerCase()
  
  // Exact match
  if (normalizedText === normalizedQuery) {
    return { 
      matches: true, 
      score: 100,
      indices: [[0, text.length]]
    }
  }

  // Contains match
  if (normalizedText.includes(normalizedQuery)) {
    const index = normalizedText.indexOf(normalizedQuery)
    return {
      matches: true,
      score: 80,
      indices: [[index, index + normalizedQuery.length]]
    }
  }

  // Fuzzy match (words)
  const queryWords = normalizedQuery.split(/\s+/)
  const textWords = normalizedText.split(/\s+/)
  
  const matchingWords = queryWords.filter(qw =>
    textWords.some(tw => tw.includes(qw) || qw.includes(tw))
  )

  if (matchingWords.length > 0) {
    const score = (matchingWords.length / queryWords.length) * 60
    return {
      matches: true,
      score,
      indices: [] // Complex to calculate for fuzzy
    }
  }

  // Character similarity (Levenshtein-like)
  const similarity = calculateSimilarity(normalizedText, normalizedQuery)
  if (similarity > 0.5) {
    return {
      matches: true,
      score: similarity * 40,
      indices: []
    }
  }

  return { matches: false, score: 0, indices: [] }
}

/**
 * Calculate text similarity (0-1)
 */
function calculateSimilarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b
  const shorter = a.length > b.length ? b : a
  
  if (longer.length === 0) {
    return 1.0
  }

  const costs = new Array(shorter.length + 1)
  for (let i = 0; i <= shorter.length; i++) {
    costs[i] = i
  }

  for (let i = 1; i <= longer.length; i++) {
    const newCosts = [i]
    for (let j = 1; j <= shorter.length; j++) {
      const cost = longer[i - 1] === shorter[j - 1] ? 0 : 1
      newCosts[j] = Math.min(
        costs[j] + 1,
        newCosts[j - 1] + 1,
        costs[j - 1] + cost
      )
    }
    costs.splice(0, costs.length, ...newCosts)
  }

  const distance = costs[shorter.length]
  return (longer.length - distance) / longer.length
}

/**
 * Search and filter tools
 */
export function searchTools<T extends Record<string, any>>(
  items: T[],
  filter: SearchFilter,
  searchableFields: (keyof T)[]
): SearchResult<T>[] {
  let results: SearchResult<T>[] = []

  // Full-text search
  if (filter.query) {
    for (const item of items) {
      let totalScore = 0
      const matches: SearchMatch[] = []

      for (const field of searchableFields) {
        const value = item[field]
        if (typeof value === 'string') {
          const searchResult = searchText(value, filter.query)
          if (searchResult.matches) {
            totalScore += searchResult.score
            matches.push({
              field: field as string,
              value,
              indices: searchResult.indices
            })
          }
        } else if (Array.isArray(value)) {
          for (const v of value) {
            if (typeof v === 'string') {
              const searchResult = searchText(v, filter.query)
              if (searchResult.matches) {
                totalScore += searchResult.score * 0.5 // Array matches worth less
                matches.push({
                  field: field as string,
                  value: v,
                  indices: searchResult.indices
                })
              }
            }
          }
        }
      }

      if (totalScore > 0) {
        results.push({
          item,
          score: totalScore,
          matches
        })
      }
    }
  } else {
    // No query, include all items
    results = items.map(item => ({
      item,
      score: 0,
      matches: []
    }))
  }

  // Apply filters
  results = results.filter(result => {
    const item = result.item

    // Provider filter
    if (filter.providers && filter.providers.length > 0) {
      const provider = item.provider || item.providerId
      if (provider && !filter.providers.includes(provider)) {
        return false
      }
    }

    // Category filter
    if (filter.categories && filter.categories.length > 0) {
      const category = item.category
      if (!category || !filter.categories.includes(category)) {
        return false
      }
    }

    // Tags filter
    if (filter.tags && filter.tags.length > 0) {
      const tags = item.tags || []
      if (!filter.tags.some(tag => tags.includes(tag))) {
        return false
      }
    }

    // Capabilities filter
    if (filter.capabilities && filter.capabilities.length > 0) {
      const capabilities = item.capabilities || []
      if (!filter.capabilities.some(cap => capabilities.includes(cap))) {
        return false
      }
    }

    // Status filter
    if (filter.status && filter.status !== 'all') {
      const enabled = item.enabled ?? true
      if (filter.status === 'enabled' && !enabled) return false
      if (filter.status === 'disabled' && enabled) return false
    }

    // Has input filter
    if (filter.hasInput !== undefined) {
      const hasInput = item.inputSchema || item.parameters
      if (filter.hasInput && !hasInput) return false
      if (!filter.hasInput && hasInput) return false
    }

    // Has output filter
    if (filter.hasOutput !== undefined) {
      const hasOutput = item.outputSchema || item.returnType
      if (filter.hasOutput && !hasOutput) return false
      if (!filter.hasOutput && hasOutput) return false
    }

    // Requires auth filter
    if (filter.requiresAuth !== undefined) {
      const requiresAuth = item.requiresAuth ?? false
      if (filter.requiresAuth !== requiresAuth) return false
    }

    // Min rating filter
    if (filter.minRating !== undefined) {
      const rating = item.rating || 0
      if (rating < filter.minRating) return false
    }

    return true
  })

  // Sort results
  const sortBy = filter.sortBy || 'relevance'
  const sortOrder = filter.sortOrder || 'desc'

  results.sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'relevance':
        comparison = b.score - a.score
        break

      case 'name':
        const nameA = a.item.name || ''
        const nameB = b.item.name || ''
        comparison = nameA.localeCompare(nameB)
        break

      case 'rating':
        const ratingA = a.item.rating || 0
        const ratingB = b.item.rating || 0
        comparison = ratingB - ratingA
        break

      case 'popularity':
        const popA = a.item.popularity || a.item.downloadCount || 0
        const popB = b.item.popularity || b.item.downloadCount || 0
        comparison = popB - popA
        break

      case 'recent':
        const dateA = new Date(a.item.createdAt || a.item.updatedAt || 0).getTime()
        const dateB = new Date(b.item.createdAt || b.item.updatedAt || 0).getTime()
        comparison = dateB - dateA
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  return results
}

// ==================== SAVED SEARCHES ====================

/**
 * Load saved searches
 */
export function loadSavedSearches(): SavedSearch[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(STORAGE_KEY_SAVED)
    if (!data) return []

    const searches = JSON.parse(data)
    return Array.isArray(searches) ? searches : []
  } catch (error) {
    console.error('Failed to load saved searches:', error)
    return []
  }
}

/**
 * Save search
 */
export function saveSearch(name: string, filter: SearchFilter): SavedSearch {
  const searches = loadSavedSearches()

  if (searches.length >= MAX_SAVED) {
    throw new Error(`Maximum ${MAX_SAVED} saved searches allowed`)
  }

  const savedSearch: SavedSearch = {
    id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    filter,
    createdAt: new Date().toISOString(),
    useCount: 0
  }

  const updated = [...searches, savedSearch]

  try {
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save search:', error)
    throw error
  }

  return savedSearch
}

/**
 * Delete saved search
 */
export function deleteSavedSearch(searchId: string): void {
  const searches = loadSavedSearches()
  const updated = searches.filter(s => s.id !== searchId)

  try {
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to delete saved search:', error)
  }
}

/**
 * Update saved search
 */
export function updateSavedSearch(
  searchId: string,
  updates: Partial<SavedSearch>
): void {
  const searches = loadSavedSearches()
  const updated = searches.map(s => {
    if (s.id === searchId) {
      return { ...s, ...updates }
    }
    return s
  })

  try {
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to update saved search:', error)
  }
}

/**
 * Use saved search (increment count)
 */
export function useSavedSearch(searchId: string): SavedSearch | undefined {
  const searches = loadSavedSearches()
  const search = searches.find(s => s.id === searchId)

  if (search) {
    updateSavedSearch(searchId, {
      lastUsed: new Date().toISOString(),
      useCount: search.useCount + 1
    })
  }

  return search
}

// ==================== SEARCH HISTORY ====================

/**
 * Load search history
 */
export function loadSearchHistory(): SearchHistory[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(STORAGE_KEY_HISTORY)
    if (!data) return []

    const history = JSON.parse(data)
    return Array.isArray(history) ? history : []
  } catch (error) {
    console.error('Failed to load search history:', error)
    return []
  }
}

/**
 * Add to search history
 */
export function addToSearchHistory(
  query: string,
  filter: SearchFilter,
  resultCount: number
): void {
  if (!query.trim()) return

  const history = loadSearchHistory()

  // Check if already exists (recent duplicate)
  const existingIndex = history.findIndex(
    h => h.query === query && JSON.stringify(h.filter) === JSON.stringify(filter)
  )

  if (existingIndex !== -1) {
    // Move to front
    history.splice(existingIndex, 1)
  }

  const entry: SearchHistory = {
    query,
    filter,
    timestamp: new Date().toISOString(),
    resultCount
  }

  const updated = [entry, ...history].slice(0, MAX_HISTORY)

  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save search history:', error)
  }
}

/**
 * Clear search history
 */
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY)
  } catch (error) {
    console.error('Failed to clear search history:', error)
  }
}

/**
 * Get recent searches (unique queries)
 */
export function getRecentSearches(limit: number = 10): string[] {
  const history = loadSearchHistory()
  const uniqueQueries = new Set<string>()

  for (const entry of history) {
    if (entry.query && uniqueQueries.size < limit) {
      uniqueQueries.add(entry.query)
    }
  }

  return Array.from(uniqueQueries)
}

// ==================== SEARCH SUGGESTIONS ====================

/**
 * Generate search suggestions based on items
 */
export function generateSearchSuggestions<T extends Record<string, any>>(
  items: T[],
  query: string,
  fields: (keyof T)[],
  limit: number = 5
): string[] {
  if (!query || query.length < 2) {
    return []
  }

  const suggestions = new Set<string>()
  const normalizedQuery = query.toLowerCase()

  for (const item of items) {
    for (const field of fields) {
      const value = item[field]
      
      if (typeof value === 'string') {
        const normalizedValue = value.toLowerCase()
        if (normalizedValue.includes(normalizedQuery) && value !== query) {
          suggestions.add(value)
          if (suggestions.size >= limit) {
            return Array.from(suggestions)
          }
        }
      } else if (Array.isArray(value)) {
        for (const v of value) {
          if (typeof v === 'string') {
            const normalizedValue = v.toLowerCase()
            if (normalizedValue.includes(normalizedQuery) && v !== query) {
              suggestions.add(v)
              if (suggestions.size >= limit) {
                return Array.from(suggestions)
              }
            }
          }
        }
      }
    }
  }

  return Array.from(suggestions)
}

/**
 * Get popular search terms
 */
export function getPopularSearches(limit: number = 10): { query: string; count: number }[] {
  const history = loadSearchHistory()
  const queryCounts = new Map<string, number>()

  for (const entry of history) {
    if (entry.query) {
      queryCounts.set(entry.query, (queryCounts.get(entry.query) || 0) + 1)
    }
  }

  return Array.from(queryCounts.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Highlight search matches in text
 */
export function highlightMatches(
  text: string,
  indices: [number, number][]
): { text: string; highlighted: boolean }[] {
  if (indices.length === 0) {
    return [{ text, highlighted: false }]
  }

  const parts: { text: string; highlighted: boolean }[] = []
  let lastIndex = 0

  for (const [start, end] of indices) {
    if (start > lastIndex) {
      parts.push({ text: text.slice(lastIndex, start), highlighted: false })
    }
    parts.push({ text: text.slice(start, end), highlighted: true })
    lastIndex = end
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlighted: false })
  }

  return parts
}
