/**
 * MCP Configuration Management
 * 
 * Default configuration and configuration utilities for MCP
 */

import { MCPConfig, MCPServerConfig } from './types'

/**
 * Default MCP configuration
 */
export const DEFAULT_MCP_CONFIG: Required<MCPConfig> = {
  maxClients: 10,
  timeout: 30000, // 30 seconds
  autoReconnect: true,
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
}

/**
 * Get MCP configuration with defaults
 */
export function getMCPConfig(config?: Partial<MCPConfig>): Required<MCPConfig> {
  return {
    ...DEFAULT_MCP_CONFIG,
    ...config,
  }
}

/**
 * Example MCP server configurations
 * These are sample configurations that users can use as templates
 */
export const EXAMPLE_MCP_SERVERS: MCPServerConfig[] = [
  {
    id: 'filesystem',
    name: 'Filesystem MCP',
    description: 'Access and manipulate files on the local filesystem',
    transport: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', 'stdio'],
      env: {},
    },
    enabled: false,
    tags: ['filesystem', 'files', 'local'],
    version: '1.0.0',
    author: 'Anthropic',
  },
  {
    id: 'github',
    name: 'GitHub MCP',
    description: 'Interact with GitHub repositories, issues, and pull requests',
    transport: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github', 'stdio'],
      env: {
        // GITHUB_TOKEN should be provided by user
      },
    },
    enabled: false,
    tags: ['github', 'git', 'repositories'],
    version: '1.0.0',
    author: 'Anthropic',
  },
  {
    id: 'fetch',
    name: 'Fetch MCP',
    description: 'Fetch and read web pages and APIs',
    transport: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-fetch', 'stdio'],
      env: {},
    },
    enabled: false,
    tags: ['web', 'http', 'api'],
    version: '1.0.0',
    author: 'Anthropic',
  },
  {
    id: 'memory',
    name: 'Memory MCP',
    description: 'Persistent memory and knowledge graph for AI conversations',
    transport: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory', 'stdio'],
      env: {},
    },
    enabled: false,
    tags: ['memory', 'knowledge', 'persistence'],
    version: '1.0.0',
    author: 'Anthropic',
  },
]

/**
 * Validate MCP server configuration
 */
export function validateMCPServerConfig(config: Partial<MCPServerConfig>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!config.id) {
    errors.push('Server ID is required')
  }

  if (!config.name) {
    errors.push('Server name is required')
  }

  if (!config.description) {
    errors.push('Server description is required')
  }

  if (!config.transport) {
    errors.push('Transport configuration is required')
  } else {
    const { transport } = config

    if (!transport.type) {
      errors.push('Transport type is required')
    }

    if (transport.type === 'stdio') {
      if (!transport.command) {
        errors.push('Command is required for stdio transport')
      }
    } else if (transport.type === 'sse' || transport.type === 'websocket') {
      if (!transport.url) {
        errors.push('URL is required for SSE/WebSocket transport')
      }
    } else {
      errors.push('Invalid transport type')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Environment variable keys for MCP configuration
 */
export const MCP_ENV_KEYS = {
  MAX_CLIENTS: 'MCP_MAX_CLIENTS',
  TIMEOUT: 'MCP_TIMEOUT',
  AUTO_RECONNECT: 'MCP_AUTO_RECONNECT',
  RETRY_ATTEMPTS: 'MCP_RETRY_ATTEMPTS',
  RETRY_DELAY: 'MCP_RETRY_DELAY',
} as const

/**
 * Load MCP configuration from environment variables
 */
export function loadMCPConfigFromEnv(): Partial<MCPConfig> {
  const config: Partial<MCPConfig> = {}

  const maxClients = process.env[MCP_ENV_KEYS.MAX_CLIENTS]
  if (maxClients) {
    config.maxClients = parseInt(maxClients, 10)
  }

  const timeout = process.env[MCP_ENV_KEYS.TIMEOUT]
  if (timeout) {
    config.timeout = parseInt(timeout, 10)
  }

  const autoReconnect = process.env[MCP_ENV_KEYS.AUTO_RECONNECT]
  if (autoReconnect) {
    config.autoReconnect = autoReconnect === 'true'
  }

  const retryAttempts = process.env[MCP_ENV_KEYS.RETRY_ATTEMPTS]
  if (retryAttempts) {
    config.retryAttempts = parseInt(retryAttempts, 10)
  }

  const retryDelay = process.env[MCP_ENV_KEYS.RETRY_DELAY]
  if (retryDelay) {
    config.retryDelay = parseInt(retryDelay, 10)
  }

  return config
}
