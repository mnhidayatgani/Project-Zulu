/**
 * @jest-environment node
 */

import {
  DEFAULT_MCP_CONFIG,
  EXAMPLE_MCP_SERVERS,
  getMCPConfig,
  validateMCPServerConfig,
  loadMCPConfigFromEnv,
} from '@/lib/mcp/config'
import type { MCPConfig, MCPServerConfig } from '@/lib/mcp/types'

describe('MCP Configuration', () => {
  describe('DEFAULT_MCP_CONFIG', () => {
    it('should have all required properties', () => {
      expect(DEFAULT_MCP_CONFIG).toHaveProperty('maxClients')
      expect(DEFAULT_MCP_CONFIG).toHaveProperty('timeout')
      expect(DEFAULT_MCP_CONFIG).toHaveProperty('autoReconnect')
      expect(DEFAULT_MCP_CONFIG).toHaveProperty('retryAttempts')
      expect(DEFAULT_MCP_CONFIG).toHaveProperty('retryDelay')
    })

    it('should have reasonable default values', () => {
      expect(DEFAULT_MCP_CONFIG.maxClients).toBe(10)
      expect(DEFAULT_MCP_CONFIG.timeout).toBe(30000)
      expect(DEFAULT_MCP_CONFIG.autoReconnect).toBe(true)
      expect(DEFAULT_MCP_CONFIG.retryAttempts).toBe(3)
      expect(DEFAULT_MCP_CONFIG.retryDelay).toBe(1000)
    })
  })

  describe('getMCPConfig', () => {
    it('should return default config when no override provided', () => {
      const config = getMCPConfig()

      expect(config).toEqual(DEFAULT_MCP_CONFIG)
    })

    it('should merge override with defaults', () => {
      const override: Partial<MCPConfig> = {
        maxClients: 20,
        timeout: 60000,
      }

      const config = getMCPConfig(override)

      expect(config.maxClients).toBe(20)
      expect(config.timeout).toBe(60000)
      expect(config.autoReconnect).toBe(DEFAULT_MCP_CONFIG.autoReconnect)
      expect(config.retryAttempts).toBe(DEFAULT_MCP_CONFIG.retryAttempts)
    })

    it('should override all values when provided', () => {
      const override: MCPConfig = {
        maxClients: 5,
        timeout: 15000,
        autoReconnect: false,
        retryAttempts: 5,
        retryDelay: 2000,
      }

      const config = getMCPConfig(override)

      expect(config).toEqual(override)
    })
  })

  describe('EXAMPLE_MCP_SERVERS', () => {
    it('should have example servers', () => {
      expect(EXAMPLE_MCP_SERVERS).toBeInstanceOf(Array)
      expect(EXAMPLE_MCP_SERVERS.length).toBeGreaterThan(0)
    })

    it('should have valid server configurations', () => {
      EXAMPLE_MCP_SERVERS.forEach(server => {
        expect(server).toHaveProperty('id')
        expect(server).toHaveProperty('name')
        expect(server).toHaveProperty('description')
        expect(server).toHaveProperty('transport')
        expect(server).toHaveProperty('enabled')
      })
    })

    it('should have filesystem example', () => {
      const filesystem = EXAMPLE_MCP_SERVERS.find(s => s.id === 'filesystem')
      expect(filesystem).toBeDefined()
      expect(filesystem?.transport.type).toBe('stdio')
    })

    it('should have github example', () => {
      const github = EXAMPLE_MCP_SERVERS.find(s => s.id === 'github')
      expect(github).toBeDefined()
      expect(github?.transport.type).toBe('stdio')
    })
  })

  describe('validateMCPServerConfig', () => {
    const validConfig: MCPServerConfig = {
      id: 'test-server',
      name: 'Test Server',
      description: 'Test MCP server',
      transport: {
        type: 'stdio',
        command: 'npx',
        args: ['test'],
      },
      enabled: true,
    }

    it('should validate a valid config', () => {
      const result = validateMCPServerConfig(validConfig)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject config without id', () => {
      const config = { ...validConfig, id: '' }
      const result = validateMCPServerConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Server ID is required')
    })

    it('should reject config without name', () => {
      const config = { ...validConfig, name: '' }
      const result = validateMCPServerConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Server name is required')
    })

    it('should reject config without description', () => {
      const config = { ...validConfig, description: '' }
      const result = validateMCPServerConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Server description is required')
    })

    it('should reject config without transport', () => {
      const config = { ...validConfig, transport: undefined as any }
      const result = validateMCPServerConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Transport configuration is required')
    })

    it('should reject stdio transport without command', () => {
      const config = {
        ...validConfig,
        transport: { type: 'stdio' as const },
      }
      const result = validateMCPServerConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Command is required for stdio transport')
    })

    it('should reject sse transport without url', () => {
      const config = {
        ...validConfig,
        transport: { type: 'sse' as const },
      }
      const result = validateMCPServerConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('URL is required for SSE/WebSocket transport')
    })

    it('should validate sse transport with url', () => {
      const config = {
        ...validConfig,
        transport: {
          type: 'sse' as const,
          url: 'https://example.com',
        },
      }
      const result = validateMCPServerConfig(config)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should collect multiple errors', () => {
      const config = {
        id: '',
        name: '',
        description: '',
      } as any
      const result = validateMCPServerConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('loadMCPConfigFromEnv', () => {
    const originalEnv = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...originalEnv }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should load config from environment variables', () => {
      process.env.MCP_MAX_CLIENTS = '20'
      process.env.MCP_TIMEOUT = '60000'
      process.env.MCP_AUTO_RECONNECT = 'false'
      process.env.MCP_RETRY_ATTEMPTS = '5'
      process.env.MCP_RETRY_DELAY = '2000'

      const config = loadMCPConfigFromEnv()

      expect(config.maxClients).toBe(20)
      expect(config.timeout).toBe(60000)
      expect(config.autoReconnect).toBe(false)
      expect(config.retryAttempts).toBe(5)
      expect(config.retryDelay).toBe(2000)
    })

    it('should return empty config when no env vars set', () => {
      delete process.env.MCP_MAX_CLIENTS
      delete process.env.MCP_TIMEOUT

      const config = loadMCPConfigFromEnv()

      expect(config).toEqual({})
    })

    it('should parse boolean values correctly', () => {
      process.env.MCP_AUTO_RECONNECT = 'true'
      let config = loadMCPConfigFromEnv()
      expect(config.autoReconnect).toBe(true)

      process.env.MCP_AUTO_RECONNECT = 'false'
      config = loadMCPConfigFromEnv()
      expect(config.autoReconnect).toBe(false)
    })

    it('should parse integer values correctly', () => {
      process.env.MCP_MAX_CLIENTS = '15'
      process.env.MCP_TIMEOUT = '45000'

      const config = loadMCPConfigFromEnv()

      expect(config.maxClients).toBe(15)
      expect(config.timeout).toBe(45000)
    })
  })
})
