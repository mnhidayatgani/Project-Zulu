# MCP (Model Context Protocol) Integration

Complete guide for MCP integration in Zola.

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [API Reference](#api-reference)
7. [UI Components](#ui-components)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Overview

MCP (Model Context Protocol) is an open protocol that standardizes how AI applications interact with external tools and data sources. Zola's MCP integration allows you to:

- Register multiple MCP servers
- Enable/disable servers dynamically
- Automatically load tools into chat conversations
- Manage server lifecycle
- Monitor connection status

### Key Features

✅ **Multi-Server Support**: Connect to multiple MCP servers simultaneously (up to 10 by default)  
✅ **Transport Support**: stdio (local commands) and SSE (remote servers)  
✅ **Robust Error Handling**: Automatic retries, timeouts, and graceful degradation  
✅ **Registry Pattern**: Centralized server management  
✅ **UI Management**: Full CRUD interface for server configuration  
✅ **Chat Integration**: Tools automatically available in AI conversations  

---

## Architecture

### Component Structure

```
lib/mcp/                          # Core MCP library
├── types.ts                      # TypeScript type definitions
├── errors.ts                     # Error classes and handling
├── config.ts                     # Configuration management
├── client.ts                     # Enhanced MCP client
├── registry.ts                   # Server registry (singleton)
├── load-mcp-from-local.ts        # Local server loader
├── load-mcp-from-url.ts          # Remote server loader
└── index.ts                      # Module exports

app/api/mcp/                      # MCP API routes
├── route.ts                      # GET - List servers
├── register/route.ts             # POST - Register server
├── [serverId]/route.ts           # GET/PUT/DELETE - Manage server
└── [serverId]/toggle/route.ts    # POST - Enable/disable

app/components/mcp/               # MCP UI components
├── mcp-tool-badge.tsx            # Badge for MCP tools
├── mcp-server-list.tsx           # Server list display
├── mcp-register-dialog.tsx       # Registration form
├── mcp-manager.tsx               # Main management UI
└── index.ts                      # Component exports
```

### Data Flow

```
User Action → UI Component → API Route → Registry → Client → MCP Server
                                   ↓                    ↓
                              Database/State     Tool Execution
                                   ↓                    ↓
                              UI Update         Chat Integration
```

---

## Installation

MCP support is built into Zola. No additional installation required!

### Prerequisites

- Zola running (see main README.md)
- Node.js 18+ (for local MCP servers via stdio)
- Environment variables configured

### Environment Variables

Optional configuration via environment variables:

```bash
# MCP Configuration (optional)
MCP_MAX_CLIENTS=10              # Maximum concurrent MCP clients
MCP_TIMEOUT=30000               # Timeout in milliseconds
MCP_AUTO_RECONNECT=true         # Auto-reconnect on disconnect
MCP_RETRY_ATTEMPTS=3            # Number of retry attempts
MCP_RETRY_DELAY=1000            # Delay between retries (ms)
```

---

## Configuration

### Default Configuration

```typescript
{
  maxClients: 10,        // Max concurrent MCP servers
  timeout: 30000,        // 30 seconds
  autoReconnect: true,   // Auto-reconnect on failure
  retryAttempts: 3,      // Retry 3 times
  retryDelay: 1000       // 1 second between retries
}
```

### Server Configuration

Each MCP server requires:

```typescript
{
  id: string              // Unique identifier
  name: string            // Human-readable name
  description: string     // What does this server provide?
  transport: {
    type: 'stdio' | 'sse' | 'websocket'
    
    // For stdio:
    command?: string      // e.g., 'npx'
    args?: string[]       // e.g., ['-y', '@modelcontextprotocol/server-filesystem']
    env?: Record<string, string>  // Environment variables
    
    // For SSE/WebSocket:
    url?: string          // Server URL
  }
  enabled: boolean        // Enable/disable server
  tags?: string[]         // Optional categorization
  version?: string        // Optional version
  icon?: string           // Optional icon URL
  author?: string         // Optional author info
}
```

---

## Usage

### 1. Via UI (Recommended)

#### Register a Server

1. Open Settings → MCP Servers
2. Click "Add MCP Server"
3. Fill in the form:
   - **Server ID**: `filesystem`
   - **Name**: `Filesystem MCP`
   - **Description**: `Access local files`
   - **Transport**: `stdio`
   - **Command**: `npx`
   - **Args**: `-y, @modelcontextprotocol/server-filesystem, stdio`
4. Click "Register Server"

#### Manage Servers

- **Enable/Disable**: Toggle the switch
- **Delete**: Click trash icon
- **View Status**: See connection state and tool count

### 2. Via API

#### List Servers

```typescript
GET /api/mcp

Response:
{
  success: true,
  data: {
    servers: [...],
    stats: {
      total: 2,
      connected: 1,
      disconnected: 1,
      enabled: 2,
      disabled: 0,
      totalTools: 5
    }
  }
}
```

#### Register Server

```typescript
POST /api/mcp/register

Body:
{
  id: "my-server",
  name: "My MCP Server",
  description: "Custom tools",
  transport: {
    type: "stdio",
    command: "npx",
    args: ["-y", "my-mcp-package"]
  },
  enabled: true
}

Response:
{
  success: true,
  data: {
    server: {...},
    state: {...}
  }
}
```

#### Get Server Details

```typescript
GET /api/mcp/{serverId}

Response:
{
  success: true,
  data: {
    server: {...},
    state: {
      connected: true,
      error: undefined,
      tools: [...]
    }
  }
}
```

#### Update Server

```typescript
PUT /api/mcp/{serverId}

Body:
{
  name: "Updated Name",
  description: "Updated description"
}
```

#### Delete Server

```typescript
DELETE /api/mcp/{serverId}

Response:
{
  success: true,
  message: "Server unregistered successfully"
}
```

#### Toggle Server

```typescript
POST /api/mcp/{serverId}/toggle

Body:
{
  enabled: true
}
```

### 3. Programmatic Usage

```typescript
import { getMCPRegistry, getMCPConfig } from '@/lib/mcp'

// Get registry instance
const config = getMCPConfig()
const registry = getMCPRegistry(config)

// Register a server
await registry.register({
  id: 'my-server',
  name: 'My Server',
  description: 'Custom tools',
  transport: {
    type: 'stdio',
    command: 'node',
    args: ['server.js']
  },
  enabled: true
})

// Get all tools
const tools = registry.getAllTools()

// Get statistics
const stats = registry.getStats()

// Unregister
await registry.unregister('my-server')
```

---

## API Reference

### Core Classes

#### `MCPRegistry`

Singleton class for managing multiple MCP servers.

```typescript
// Get instance
const registry = MCPRegistry.getInstance(config)

// Methods
await registry.register(serverConfig)      // Register new server
await registry.unregister(serverId)        // Remove server
await registry.connect(serverId)           // Connect to server
await registry.disconnect(serverId)        // Disconnect from server
await registry.enableServer(serverId)      // Enable server
await registry.disableServer(serverId)     // Disable server
await registry.updateServer(serverId, updates)  // Update config
registry.getServers()                      // Get all servers
registry.getServer(serverId)               // Get specific server
registry.getServerState(serverId)          // Get server state
registry.getConnectedServers()             // Get connected only
registry.getAllTools()                     // Get all available tools
registry.getStats()                        // Get statistics
await registry.closeAll()                  // Close all connections
```

#### `EnhancedMCPClient`

Wrapper around AI SDK's MCP client with enhanced features.

```typescript
const client = new EnhancedMCPClient(serverConfig, config)

// Methods
await client.connect()                     // Connect to server
await client.getTools()                    // Get available tools
await client.executeTool(name, args)       // Execute a tool
client.getState()                          // Get client state
client.isConnected()                       // Check connection
client.getServerConfig()                   // Get config
await client.close()                       // Close connection
```

### Error Types

```typescript
MCPError                 // Base error class
MCPConnectionError       // Connection failed
MCPTransportError        // Transport error
MCPToolExecutionError    // Tool execution failed
MCPConfigError           // Invalid configuration
MCPTimeoutError          // Operation timed out
```

### Configuration Functions

```typescript
getMCPConfig(override?: Partial<MCPConfig>): Required<MCPConfig>
validateMCPServerConfig(config: Partial<MCPServerConfig>): ValidationResult
loadMCPConfigFromEnv(): Partial<MCPConfig>
```

---

## UI Components

### MCPManager

Main component for MCP management.

```typescript
import { MCPManager } from '@/app/components/mcp'

<MCPManager />
```

Features:
- Server list with status
- Registration dialog
- Enable/disable toggles
- Delete functionality
- About MCP tab

### MCPServerList

Display list of registered servers.

```typescript
import { MCPServerList } from '@/app/components/mcp'

<MCPServerList />
```

### MCPRegisterDialog

Form to register new servers.

```typescript
import { MCPRegisterDialog } from '@/app/components/mcp'

<MCPRegisterDialog onSuccess={() => {
  console.log('Server registered!')
}} />
```

### MCPToolBadge

Badge to identify MCP tools.

```typescript
import { MCPToolBadge } from '@/app/components/mcp'

<MCPToolBadge serverId="filesystem" serverName="Filesystem MCP" />
```

---

## Testing

### Running Tests

```bash
# All MCP tests
npm test -- __tests__/unit/mcp/

# Specific test file
npm test -- __tests__/unit/mcp/registry.test.ts

# With coverage
npm run test:coverage
```

### Test Coverage

- **errors.test.ts**: 19 tests - Error handling
- **config.test.ts**: 26 tests - Configuration
- **registry.test.ts**: 19 tests - Registry operations
- **Total**: 64 tests, 100% passing

---

## Troubleshooting

### Common Issues

#### 1. Server Won't Connect

**Symptoms**: Server shows "Disconnected" status

**Solutions**:
- Check if command exists: `which npx`
- Verify MCP package is accessible
- Check environment variables
- Look at server logs in console
- Try disabling and re-enabling

#### 2. Tools Not Available in Chat

**Symptoms**: MCP tools don't appear in chat

**Solutions**:
- Ensure server is enabled and connected
- Check tool count in server list
- Refresh the page
- Check console for errors
- Verify chat API integration

#### 3. Connection Timeout

**Symptoms**: "Connection timed out" error

**Solutions**:
- Increase timeout: `MCP_TIMEOUT=60000`
- Check network connectivity
- Verify server URL (for SSE)
- Check firewall settings

#### 4. Maximum Clients Reached

**Symptoms**: "Maximum number of MCP clients reached"

**Solutions**:
- Increase limit: `MCP_MAX_CLIENTS=20`
- Unregister unused servers
- Check for zombie connections

### Debug Mode

Enable debug logging:

```typescript
// In browser console
localStorage.setItem('DEBUG_MCP', 'true')

// Check logs
console.log('MCP tools:', registry.getAllTools())
console.log('MCP stats:', registry.getStats())
```

---

## Example MCP Servers

### Filesystem

Access local files:

```bash
Command: npx
Args: -y, @modelcontextprotocol/server-filesystem, stdio
```

### GitHub

Interact with GitHub:

```bash
Command: npx
Args: -y, @modelcontextprotocol/server-github, stdio
Env: GITHUB_TOKEN=your_token
```

### Fetch

Fetch web content:

```bash
Command: npx
Args: -y, @modelcontextprotocol/server-fetch, stdio
```

### Memory

Persistent memory:

```bash
Command: npx
Args: -y, @modelcontextprotocol/server-memory, stdio
```

---

## Learn More

- [MCP Specification](https://modelcontextprotocol.io)
- [Available MCP Servers](https://github.com/modelcontextprotocol)
- [Create Your Own MCP Server](https://modelcontextprotocol.io/docs/building-servers)
- [AI SDK MCP Integration](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling#model-context-protocol)

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
