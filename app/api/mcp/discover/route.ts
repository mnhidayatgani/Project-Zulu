/**
 * MCP Discovery API Route
 * 
 * API endpoints for discovering and searching MCP servers
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  discoverServers,
  getServerCategories,
  getPopularServers,
  getRecentServers,
  getRecommendedServers,
  type DiscoveryFilters,
} from '@/lib/mcp/discovery'

/**
 * GET /api/mcp/discover
 * 
 * Discover and search for MCP servers
 * 
 * Query parameters:
 * - q: Search query
 * - category: Filter by category
 * - tags: Comma-separated tags
 * - verifiedOnly: true/false
 * - minRating: Minimum rating (0-5)
 * - sortBy: popularity|rating|recent|name
 * - sortDirection: asc|desc
 * - limit: Number of results
 * - offset: Pagination offset
 * - action: categories|popular|recent|recommended
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Check for special actions
    const action = searchParams.get('action')
    
    if (action === 'categories') {
      const categories = getServerCategories()
      return NextResponse.json({
        categories,
        count: categories.length,
      })
    }
    
    if (action === 'popular') {
      const limit = parseInt(searchParams.get('limit') || '5')
      const servers = getPopularServers(limit)
      return NextResponse.json({
        servers,
        count: servers.length,
      })
    }
    
    if (action === 'recent') {
      const limit = parseInt(searchParams.get('limit') || '5')
      const servers = getRecentServers(limit)
      return NextResponse.json({
        servers,
        count: servers.length,
      })
    }
    
    if (action === 'recommended') {
      const installedIds = searchParams.get('installed')?.split(',') || []
      const limit = parseInt(searchParams.get('limit') || '3')
      const servers = getRecommendedServers(installedIds, limit)
      return NextResponse.json({
        servers,
        count: servers.length,
      })
    }
    
    // Build discovery filters
    const filters: DiscoveryFilters = {}
    
    if (searchParams.has('q')) {
      filters.query = searchParams.get('q')!
    }
    
    if (searchParams.has('category')) {
      filters.category = searchParams.get('category')!
    }
    
    if (searchParams.has('tags')) {
      filters.tags = searchParams.get('tags')!.split(',')
    }
    
    if (searchParams.has('verifiedOnly')) {
      filters.verifiedOnly = searchParams.get('verifiedOnly') === 'true'
    }
    
    if (searchParams.has('minRating')) {
      filters.minRating = parseFloat(searchParams.get('minRating')!)
    }
    
    if (searchParams.has('sortBy')) {
      filters.sortBy = searchParams.get('sortBy') as any
    }
    
    if (searchParams.has('sortDirection')) {
      filters.sortDirection = searchParams.get('sortDirection') as any
    }
    
    if (searchParams.has('limit')) {
      filters.limit = parseInt(searchParams.get('limit')!)
    }
    
    if (searchParams.has('offset')) {
      filters.offset = parseInt(searchParams.get('offset')!)
    }
    
    // Discover servers
    const servers = discoverServers(filters)
    
    return NextResponse.json({
      servers,
      count: servers.length,
      filters,
    })
  } catch (error) {
    console.error('Error discovering MCP servers:', error)
    return NextResponse.json(
      {
        error: 'Failed to discover servers',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/mcp/discover
 * 
 * Advanced search with complex filters (future)
 */
export async function POST(request: NextRequest) {
  try {
    const filters: DiscoveryFilters = await request.json()
    const servers = discoverServers(filters)
    
    return NextResponse.json({
      servers,
      count: servers.length,
      filters,
    })
  } catch (error) {
    console.error('Error discovering MCP servers:', error)
    return NextResponse.json(
      {
        error: 'Failed to discover servers',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
