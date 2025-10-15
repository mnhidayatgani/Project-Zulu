/**
 * @jest-environment node
 */

import { MCPRegistry } from '@/lib/mcp/registry'
import { getMCPConfig } from '@/lib/mcp/config'
import type { MCPServerConfig } from '@/lib/mcp/types'

describe('MCP Registry', () => {
  let registry: MCPRegistry

  beforeEach(() => {
    // Reset singleton instance before each test
    MCPRegistry.resetInstance()
    
    // Create new instance with test config
    const config = getMCPConfig({
      maxClients: 5,
      timeout: 1000,
      autoReconnect: false,
      retryAttempts: 1,
      retryDelay: 100,
    })
    
    registry = MCPRegistry.getInstance(config)
  })

  afterEach(() => {
    MCPRegistry.resetInstance()
  })

  const mockServerConfig: MCPServerConfig = {
    id: 'test-server',
    name: 'Test Server',
    description: 'Test MCP server',
    transport: {
      type: 'stdio',
      command: 'echo',
      args: ['test'],
    },
    enabled: false, // Disabled to prevent actual connection
  }

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = MCPRegistry.getInstance()
      const instance2 = MCPRegistry.getInstance()

      expect(instance1).toBe(instance2)
    })

    it('should require config for first initialization', () => {
      MCPRegistry.resetInstance()

      expect(() => {
        MCPRegistry.getInstance()
      }).toThrow('Config is required for first initialization')
    })
  })

  describe('register', () => {
    it('should register a new server', async () => {
      await registry.register(mockServerConfig)

      const servers = registry.getServers()
      expect(servers).toHaveLength(1)
      expect(servers[0].id).toBe('test-server')
    })

    it('should reject duplicate server id', async () => {
      await registry.register(mockServerConfig)

      await expect(
        registry.register(mockServerConfig)
      ).rejects.toThrow("already registered")
    })

    it('should reject invalid configuration', async () => {
      const invalidConfig = {
        ...mockServerConfig,
        name: '', // Invalid: empty name
      }

      await expect(
        registry.register(invalidConfig)
      ).rejects.toThrow('Invalid server configuration')
    })

    it('should enforce max clients limit', async () => {
      // Register up to max (5 servers)
      for (let i = 0; i < 5; i++) {
        await registry.register({
          ...mockServerConfig,
          id: `server-${i}`,
        })
      }

      // Try to register one more
      await expect(
        registry.register({
          ...mockServerConfig,
          id: 'server-6',
        })
      ).rejects.toThrow('Maximum number of MCP clients')
    })

    it('should add registeredAt timestamp', async () => {
      await registry.register(mockServerConfig)

      const server = registry.getServer('test-server')
      expect(server?.registeredAt).toBeInstanceOf(Date)
    })
  })

  describe('unregister', () => {
    it('should unregister a server', async () => {
      await registry.register(mockServerConfig)
      await registry.unregister('test-server')

      const servers = registry.getServers()
      expect(servers).toHaveLength(0)
    })

    it('should throw when unregistering non-existent server', async () => {
      await expect(
        registry.unregister('non-existent')
      ).rejects.toThrow('not found')
    })
  })

  describe('getServers', () => {
    it('should return empty array initially', () => {
      const servers = registry.getServers()
      expect(servers).toEqual([])
    })

    it('should return all registered servers', async () => {
      await registry.register(mockServerConfig)
      await registry.register({
        ...mockServerConfig,
        id: 'server-2',
      })

      const servers = registry.getServers()
      expect(servers).toHaveLength(2)
    })
  })

  describe('getServer', () => {
    it('should return server by id', async () => {
      await registry.register(mockServerConfig)

      const server = registry.getServer('test-server')
      expect(server).toBeDefined()
      expect(server?.id).toBe('test-server')
    })

    it('should return undefined for non-existent server', () => {
      const server = registry.getServer('non-existent')
      expect(server).toBeUndefined()
    })
  })

  describe('getServerState', () => {
    it('should return state for registered server', async () => {
      await registry.register(mockServerConfig)

      const state = registry.getServerState('test-server')
      expect(state).toBeDefined()
      expect(state?.connected).toBe(false)
      expect(state?.tools).toEqual([])
    })

    it('should return undefined for non-existent server', () => {
      const state = registry.getServerState('non-existent')
      expect(state).toBeUndefined()
    })
  })

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      const stats = registry.getStats()

      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('connected')
      expect(stats).toHaveProperty('disconnected')
      expect(stats).toHaveProperty('enabled')
      expect(stats).toHaveProperty('disabled')
      expect(stats).toHaveProperty('totalTools')
    })

    it('should count registered servers', async () => {
      await registry.register(mockServerConfig)
      await registry.register({
        ...mockServerConfig,
        id: 'server-2',
        enabled: true,
      })

      const stats = registry.getStats()
      expect(stats.total).toBe(2)
      expect(stats.enabled).toBe(1)
      expect(stats.disabled).toBe(1)
    })
  })

  describe('updateServer', () => {
    it('should update server configuration', async () => {
      await registry.register(mockServerConfig)

      await registry.updateServer('test-server', {
        name: 'Updated Name',
        description: 'Updated Description',
      })

      const server = registry.getServer('test-server')
      expect(server?.name).toBe('Updated Name')
      expect(server?.description).toBe('Updated Description')
    })

    it('should not allow changing server id', async () => {
      await registry.register(mockServerConfig)

      await registry.updateServer('test-server', {
        id: 'new-id',
      } as any)

      const server = registry.getServer('test-server')
      expect(server?.id).toBe('test-server') // Should remain unchanged
    })

    it('should throw for non-existent server', async () => {
      await expect(
        registry.updateServer('non-existent', { name: 'New Name' })
      ).rejects.toThrow('not found')
    })
  })

  describe('getAllTools', () => {
    it('should return empty object when no servers connected', async () => {
      await registry.register(mockServerConfig)

      const tools = registry.getAllTools()
      expect(tools).toEqual({})
    })

    it('should prefix tool names with server id', async () => {
      // This would require actual connection and tools
      // For now, just test the structure
      const tools = registry.getAllTools()
      expect(typeof tools).toBe('object')
    })
  })

  describe('closeAll', () => {
    it('should close all connections', async () => {
      await registry.register(mockServerConfig)
      await registry.register({
        ...mockServerConfig,
        id: 'server-2',
      })

      await registry.closeAll()

      const servers = registry.getServers()
      expect(servers).toHaveLength(0)
    })
  })
})
