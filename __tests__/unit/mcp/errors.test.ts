/**
 * @jest-environment node
 */

import {
  MCPError,
  MCPConnectionError,
  MCPTransportError,
  MCPToolExecutionError,
  MCPConfigError,
  MCPTimeoutError,
  isMCPError,
  formatMCPError,
  wrapError,
} from '@/lib/mcp/errors'

describe('MCP Errors', () => {
  describe('MCPError', () => {
    it('should create an MCPError with basic properties', () => {
      const error = new MCPError('connection_failed', 'Connection failed')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(MCPError)
      expect(error.name).toBe('MCPError')
      expect(error.type).toBe('connection_failed')
      expect(error.message).toBe('Connection failed')
    })

    it('should create an MCPError with optional properties', () => {
      const originalError = new Error('Network error')
      const error = new MCPError('connection_failed', 'Connection failed', {
        serverId: 'test-server',
        toolName: 'test-tool',
        originalError,
      })

      expect(error.serverId).toBe('test-server')
      expect(error.toolName).toBe('test-tool')
      expect(error.originalError).toBe(originalError)
    })

    it('should convert error to JSON', () => {
      const error = new MCPError('timeout', 'Operation timed out', {
        serverId: 'test-server',
      })

      const json = error.toJSON()

      expect(json).toHaveProperty('name', 'MCPError')
      expect(json).toHaveProperty('type', 'timeout')
      expect(json).toHaveProperty('message', 'Operation timed out')
      expect(json).toHaveProperty('serverId', 'test-server')
      expect(json).toHaveProperty('stack')
    })
  })

  describe('MCPConnectionError', () => {
    it('should create a connection error', () => {
      const error = new MCPConnectionError('Failed to connect', 'test-server')

      expect(error).toBeInstanceOf(MCPError)
      expect(error).toBeInstanceOf(MCPConnectionError)
      expect(error.name).toBe('MCPConnectionError')
      expect(error.type).toBe('connection_failed')
      expect(error.serverId).toBe('test-server')
    })
  })

  describe('MCPTransportError', () => {
    it('should create a transport error', () => {
      const error = new MCPTransportError('Transport failed', 'test-server')

      expect(error).toBeInstanceOf(MCPError)
      expect(error).toBeInstanceOf(MCPTransportError)
      expect(error.name).toBe('MCPTransportError')
      expect(error.type).toBe('transport_error')
    })
  })

  describe('MCPToolExecutionError', () => {
    it('should create a tool execution error', () => {
      const error = new MCPToolExecutionError(
        'Tool failed',
        'test-tool',
        'test-server'
      )

      expect(error).toBeInstanceOf(MCPError)
      expect(error).toBeInstanceOf(MCPToolExecutionError)
      expect(error.name).toBe('MCPToolExecutionError')
      expect(error.type).toBe('tool_execution_failed')
      expect(error.toolName).toBe('test-tool')
      expect(error.serverId).toBe('test-server')
    })
  })

  describe('MCPConfigError', () => {
    it('should create a config error', () => {
      const error = new MCPConfigError('Invalid config', 'test-server')

      expect(error).toBeInstanceOf(MCPError)
      expect(error).toBeInstanceOf(MCPConfigError)
      expect(error.name).toBe('MCPConfigError')
      expect(error.type).toBe('invalid_config')
    })
  })

  describe('MCPTimeoutError', () => {
    it('should create a timeout error', () => {
      const error = new MCPTimeoutError('Timed out', 'test-server', 'test-tool')

      expect(error).toBeInstanceOf(MCPError)
      expect(error).toBeInstanceOf(MCPTimeoutError)
      expect(error.name).toBe('MCPTimeoutError')
      expect(error.type).toBe('timeout')
      expect(error.serverId).toBe('test-server')
      expect(error.toolName).toBe('test-tool')
    })
  })

  describe('isMCPError', () => {
    it('should return true for MCP errors', () => {
      const error = new MCPError('unknown', 'Test error')
      expect(isMCPError(error)).toBe(true)
    })

    it('should return false for non-MCP errors', () => {
      const error = new Error('Regular error')
      expect(isMCPError(error)).toBe(false)
    })

    it('should return false for non-error values', () => {
      expect(isMCPError('string')).toBe(false)
      expect(isMCPError(123)).toBe(false)
      expect(isMCPError(null)).toBe(false)
      expect(isMCPError(undefined)).toBe(false)
    })
  })

  describe('formatMCPError', () => {
    it('should format MCP error with all details', () => {
      const error = new MCPToolExecutionError(
        'Tool failed',
        'test-tool',
        'test-server'
      )

      const formatted = formatMCPError(error)

      expect(formatted).toContain('[tool_execution_failed]')
      expect(formatted).toContain('Tool failed')
      expect(formatted).toContain('(server: test-server)')
      expect(formatted).toContain('(tool: test-tool)')
    })

    it('should format MCP error without optional details', () => {
      const error = new MCPError('unknown', 'Test error')

      const formatted = formatMCPError(error)

      expect(formatted).toContain('[unknown]')
      expect(formatted).toContain('Test error')
      expect(formatted).not.toContain('(server:')
      expect(formatted).not.toContain('(tool:')
    })

    it('should format regular Error', () => {
      const error = new Error('Regular error')
      const formatted = formatMCPError(error)

      expect(formatted).toBe('Regular error')
    })

    it('should format non-error values', () => {
      expect(formatMCPError('string error')).toBe('string error')
      expect(formatMCPError(123)).toBe('123')
    })
  })

  describe('wrapError', () => {
    it('should return MCP error as-is', () => {
      const original = new MCPError('timeout', 'Timed out')
      const wrapped = wrapError(original)

      expect(wrapped).toBe(original)
    })

    it('should wrap regular Error as MCP error', () => {
      const original = new Error('Regular error')
      const wrapped = wrapError(original, 'connection_failed', 'test-server')

      expect(wrapped).toBeInstanceOf(MCPError)
      expect(wrapped.type).toBe('connection_failed')
      expect(wrapped.message).toBe('Regular error')
      expect(wrapped.serverId).toBe('test-server')
      expect(wrapped.originalError).toBe(original)
    })

    it('should wrap non-error values', () => {
      const wrapped = wrapError('string error', 'unknown')

      expect(wrapped).toBeInstanceOf(MCPError)
      expect(wrapped.type).toBe('unknown')
      expect(wrapped.message).toBe('string error')
    })

    it('should use default type when not specified', () => {
      const wrapped = wrapError('error')

      expect(wrapped.type).toBe('unknown')
    })
  })
})
