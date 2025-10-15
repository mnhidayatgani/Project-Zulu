/**
 * MCP Server Discovery
 * 
 * Discover available MCP servers from various sources:
 * - Public registry
 * - Local network discovery
 * - Community recommendations
 */

import type { MCPServerConfig } from './types'

/**
 * Discoverable server metadata
 */
export interface DiscoverableServer {
  /** Server configuration */
  config: MCPServerConfig
  /** Category (e.g., 'Development', 'Productivity', 'AI Tools') */
  category: string
  /** Popularity score (0-100) */
  popularity: number
  /** Number of downloads/installs */
  downloads: number
  /** Average rating (0-5) */
  rating: number
  /** Number of ratings */
  ratingCount: number
  /** Homepage URL */
  homepage?: string
  /** Repository URL */
  repository?: string
  /** Documentation URL */
  documentation?: string
  /** Screenshot URLs */
  screenshots?: string[]
  /** Whether it's verified/official */
  verified: boolean
  /** When it was published */
  publishedAt: Date
  /** Last update date */
  updatedAt: Date
  /** Compatible platforms */
  platforms: ('web' | 'desktop' | 'mobile')[]
  /** Required dependencies */
  dependencies?: string[]
  /** Install instructions */
  installInstructions?: string
}

/**
 * Discovery filter options
 */
export interface DiscoveryFilters {
  /** Search query */
  query?: string
  /** Filter by category */
  category?: string
  /** Filter by tags */
  tags?: string[]
  /** Only show verified servers */
  verifiedOnly?: boolean
  /** Minimum rating */
  minRating?: number
  /** Sort by */
  sortBy?: 'popularity' | 'rating' | 'recent' | 'name'
  /** Sort direction */
  sortDirection?: 'asc' | 'desc'
  /** Limit results */
  limit?: number
  /** Offset for pagination */
  offset?: number
}

/**
 * Public MCP Server Registry
 * 
 * This is a curated list of popular MCP servers.
 * In production, this would be fetched from a remote API.
 */
export const PUBLIC_SERVER_REGISTRY: DiscoverableServer[] = [
  {
    config: {
      id: 'filesystem-mcp',
      name: 'Filesystem MCP',
      description: 'Access and manipulate files on your local filesystem. Read, write, search, and manage files and directories.',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/directory'],
      },
      enabled: false,
      tags: ['filesystem', 'files', 'storage'],
      version: '1.0.0',
      icon: '📁',
      author: 'Anthropic',
    },
    category: 'Development',
    popularity: 95,
    downloads: 50000,
    rating: 4.8,
    ratingCount: 1250,
    repository: 'https://github.com/modelcontextprotocol/servers',
    documentation: 'https://modelcontextprotocol.io/docs/servers/filesystem',
    verified: true,
    publishedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-11-01'),
    platforms: ['web', 'desktop'],
    dependencies: ['Node.js 18+'],
    installInstructions: 'Specify the directory path you want to allow access to.',
  },
  {
    config: {
      id: 'github-mcp',
      name: 'GitHub MCP',
      description: 'Interact with GitHub repositories, issues, pull requests, and more. Search code, manage repos, and automate workflows.',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: {
          GITHUB_TOKEN: 'your_github_token',
        },
      },
      enabled: false,
      tags: ['github', 'git', 'code', 'development'],
      version: '1.2.0',
      icon: '🐙',
      author: 'Anthropic',
    },
    category: 'Development',
    popularity: 92,
    downloads: 45000,
    rating: 4.7,
    ratingCount: 980,
    homepage: 'https://github.com/modelcontextprotocol/servers',
    repository: 'https://github.com/modelcontextprotocol/servers',
    documentation: 'https://modelcontextprotocol.io/docs/servers/github',
    verified: true,
    publishedAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-11-05'),
    platforms: ['web', 'desktop'],
    dependencies: ['Node.js 18+', 'GitHub Token'],
    installInstructions: 'Requires a GitHub personal access token with appropriate permissions.',
  },
  {
    config: {
      id: 'slack-mcp',
      name: 'Slack MCP',
      description: 'Send messages, read channels, manage workspaces, and automate Slack workflows directly from your AI assistant.',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-slack'],
        env: {
          SLACK_BOT_TOKEN: 'your_slack_bot_token',
        },
      },
      enabled: false,
      tags: ['slack', 'messaging', 'collaboration', 'productivity'],
      version: '1.1.0',
      icon: '💬',
      author: 'Anthropic',
    },
    category: 'Productivity',
    popularity: 88,
    downloads: 38000,
    rating: 4.6,
    ratingCount: 750,
    repository: 'https://github.com/modelcontextprotocol/servers',
    documentation: 'https://modelcontextprotocol.io/docs/servers/slack',
    verified: true,
    publishedAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-10-28'),
    platforms: ['web', 'desktop'],
    dependencies: ['Node.js 18+', 'Slack Bot Token'],
    installInstructions: 'Create a Slack app and obtain a bot token with necessary scopes.',
  },
  {
    config: {
      id: 'postgres-mcp',
      name: 'PostgreSQL MCP',
      description: 'Query and manage PostgreSQL databases. Execute SQL, manage schemas, and analyze data.',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-postgres'],
        env: {
          POSTGRES_URL: 'postgresql://user:pass@localhost:5432/db',
        },
      },
      enabled: false,
      tags: ['database', 'postgresql', 'sql', 'data'],
      version: '1.0.0',
      icon: '🐘',
      author: 'Anthropic',
    },
    category: 'Database',
    popularity: 85,
    downloads: 32000,
    rating: 4.7,
    ratingCount: 620,
    repository: 'https://github.com/modelcontextprotocol/servers',
    documentation: 'https://modelcontextprotocol.io/docs/servers/postgres',
    verified: true,
    publishedAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-11-02'),
    platforms: ['web', 'desktop'],
    dependencies: ['Node.js 18+', 'PostgreSQL'],
    installInstructions: 'Provide a valid PostgreSQL connection string.',
  },
  {
    config: {
      id: 'brave-search-mcp',
      name: 'Brave Search MCP',
      description: 'Search the web using Brave Search API. Get real-time information, news, and web results.',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-brave-search'],
        env: {
          BRAVE_API_KEY: 'your_brave_api_key',
        },
      },
      enabled: false,
      tags: ['search', 'web', 'information'],
      version: '1.0.0',
      icon: '🔍',
      author: 'Anthropic',
    },
    category: 'Web & API',
    popularity: 82,
    downloads: 28000,
    rating: 4.5,
    ratingCount: 540,
    repository: 'https://github.com/modelcontextprotocol/servers',
    documentation: 'https://modelcontextprotocol.io/docs/servers/brave-search',
    verified: true,
    publishedAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-10-30'),
    platforms: ['web', 'desktop'],
    dependencies: ['Node.js 18+', 'Brave API Key'],
    installInstructions: 'Obtain a Brave Search API key from brave.com/search/api.',
  },
  {
    config: {
      id: 'google-maps-mcp',
      name: 'Google Maps MCP',
      description: 'Access Google Maps services. Get directions, search places, geocode addresses, and calculate distances.',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-google-maps'],
        env: {
          GOOGLE_MAPS_API_KEY: 'your_google_maps_key',
        },
      },
      enabled: false,
      tags: ['maps', 'location', 'navigation', 'places'],
      version: '1.0.0',
      icon: '🗺️',
      author: 'Anthropic',
    },
    category: 'Web & API',
    popularity: 78,
    downloads: 24000,
    rating: 4.6,
    ratingCount: 480,
    repository: 'https://github.com/modelcontextprotocol/servers',
    documentation: 'https://modelcontextprotocol.io/docs/servers/google-maps',
    verified: true,
    publishedAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-11-01'),
    platforms: ['web', 'desktop', 'mobile'],
    dependencies: ['Node.js 18+', 'Google Maps API Key'],
    installInstructions: 'Create a Google Cloud project and enable Maps APIs.',
  },
  {
    config: {
      id: 'memory-mcp',
      name: 'Memory MCP',
      description: 'Persistent memory for AI conversations. Store and recall information across chat sessions.',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
      },
      enabled: false,
      tags: ['memory', 'persistence', 'ai', 'context'],
      version: '1.0.0',
      icon: '🧠',
      author: 'Anthropic',
    },
    category: 'AI Tools',
    popularity: 90,
    downloads: 42000,
    rating: 4.8,
    ratingCount: 890,
    repository: 'https://github.com/modelcontextprotocol/servers',
    documentation: 'https://modelcontextprotocol.io/docs/servers/memory',
    verified: true,
    publishedAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-11-03'),
    platforms: ['web', 'desktop'],
    dependencies: ['Node.js 18+'],
    installInstructions: 'No additional configuration required.',
  },
  {
    config: {
      id: 'puppeteer-mcp',
      name: 'Puppeteer MCP',
      description: 'Browser automation with Puppeteer. Scrape websites, take screenshots, generate PDFs, and automate web tasks.',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-puppeteer'],
      },
      enabled: false,
      tags: ['automation', 'browser', 'scraping', 'testing'],
      version: '1.1.0',
      icon: '🤖',
      author: 'Anthropic',
    },
    category: 'Development',
    popularity: 86,
    downloads: 35000,
    rating: 4.7,
    ratingCount: 710,
    repository: 'https://github.com/modelcontextprotocol/servers',
    documentation: 'https://modelcontextprotocol.io/docs/servers/puppeteer',
    verified: true,
    publishedAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-11-04'),
    platforms: ['desktop'],
    dependencies: ['Node.js 18+', 'Chromium'],
    installInstructions: 'Chromium will be downloaded automatically on first run.',
  },
]

/**
 * Discover MCP servers based on filters
 */
export function discoverServers(filters: DiscoveryFilters = {}): DiscoverableServer[] {
  let results = [...PUBLIC_SERVER_REGISTRY]

  // Apply search query
  if (filters.query) {
    const query = filters.query.toLowerCase()
    results = results.filter(
      (server) =>
        server.config.name.toLowerCase().includes(query) ||
        server.config.description.toLowerCase().includes(query) ||
        server.config.tags?.some((tag) => tag.toLowerCase().includes(query))
    )
  }

  // Filter by category
  if (filters.category) {
    results = results.filter((server) => server.category === filters.category)
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter((server) =>
      filters.tags!.some((tag) => server.config.tags?.includes(tag))
    )
  }

  // Filter verified only
  if (filters.verifiedOnly) {
    results = results.filter((server) => server.verified)
  }

  // Filter by minimum rating
  if (filters.minRating !== undefined) {
    results = results.filter((server) => server.rating >= filters.minRating!)
  }

  // Sort results
  const sortBy = filters.sortBy || 'popularity'
  const sortDirection = filters.sortDirection || 'desc'
  
  results.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'popularity':
        comparison = a.popularity - b.popularity
        break
      case 'rating':
        comparison = a.rating - b.rating
        break
      case 'recent':
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
        break
      case 'name':
        comparison = a.config.name.localeCompare(b.config.name)
        break
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  // Apply pagination
  if (filters.offset !== undefined || filters.limit !== undefined) {
    const start = filters.offset || 0
    const end = filters.limit ? start + filters.limit : undefined
    results = results.slice(start, end)
  }

  return results
}

/**
 * Get all available categories
 */
export function getServerCategories(): string[] {
  const categories = new Set<string>()
  PUBLIC_SERVER_REGISTRY.forEach((server) => {
    categories.add(server.category)
  })
  return Array.from(categories).sort()
}

/**
 * Get popular servers
 */
export function getPopularServers(limit: number = 5): DiscoverableServer[] {
  return discoverServers({
    sortBy: 'popularity',
    sortDirection: 'desc',
    limit,
  })
}

/**
 * Get recently updated servers
 */
export function getRecentServers(limit: number = 5): DiscoverableServer[] {
  return discoverServers({
    sortBy: 'recent',
    sortDirection: 'desc',
    limit,
  })
}

/**
 * Get recommended servers based on installed servers
 */
export function getRecommendedServers(
  installedServerIds: string[],
  limit: number = 3
): DiscoverableServer[] {
  // Simple recommendation: suggest servers in same category or with similar tags
  const installedServers = PUBLIC_SERVER_REGISTRY.filter((s) =>
    installedServerIds.includes(s.config.id)
  )

  if (installedServers.length === 0) {
    return getPopularServers(limit)
  }

  // Get categories and tags from installed servers
  const categories = new Set(installedServers.map((s) => s.category))
  const tags = new Set(
    installedServers.flatMap((s) => s.config.tags || [])
  )

  // Find servers with matching categories or tags
  const recommended = PUBLIC_SERVER_REGISTRY.filter(
    (server) =>
      !installedServerIds.includes(server.config.id) &&
      (categories.has(server.category) ||
        server.config.tags?.some((tag) => tags.has(tag)))
  )

  // Sort by popularity
  recommended.sort((a, b) => b.popularity - a.popularity)

  return recommended.slice(0, limit)
}

/**
 * Search servers by query
 */
export function searchServers(query: string, limit?: number): DiscoverableServer[] {
  return discoverServers({ query, limit })
}
