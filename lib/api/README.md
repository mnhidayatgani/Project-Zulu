# API Client Documentation

## Overview

The centralized API client provides a type-safe, feature-rich interface for making HTTP requests throughout the Zola application.

## Features

- ✅ **Type Safety**: Full TypeScript support with proper types
- ✅ **CSRF Protection**: Automatic CSRF token injection
- ✅ **Error Handling**: Standardized error responses
- ✅ **Retry Logic**: Automatic retries for failed requests
- ✅ **Timeouts**: Request timeout support
- ✅ **Interceptors**: Request/response interceptors
- ✅ **Resource Modules**: Organized API endpoints by domain

## Architecture

```
lib/api/
├── index.ts           # Main exports
├── client.ts          # Core API client
├── types.ts           # TypeScript types
└── resources/         # API resource modules
    ├── chat.ts        # Chat operations
    ├── user.ts        # User operations
    ├── models.ts      # Model operations
    ├── projects.ts    # Project operations
    └── system.ts      # System operations
```

## Basic Usage

### Using Resource Methods (Recommended)

```typescript
import { api } from '@/lib/api'

// Update chat model
const result = await api.chat.updateChatModel(chatId, modelId)
if (result.success) {
  console.log('Updated:', result.data)
} else {
  console.error('Error:', result.error.message)
}

// Get user rate limits
const limits = await api.user.checkRateLimits(userId, true)
if (limits.success) {
  console.log('Remaining:', limits.data?.remaining)
}

// Get all projects
const projects = await api.projects.getProjects()
if (projects.success) {
  projects.data?.forEach(project => console.log(project.name))
}
```

### Using Client Directly

```typescript
import { apiClient } from '@/lib/api'

// GET request
const response = await apiClient.get('/api/custom-endpoint', {
  params: { filter: 'active' }
})

// POST request
const result = await apiClient.post('/api/custom-action', {
  data: 'value'
})

// With custom options
const data = await apiClient.get('/api/data', {
  timeout: 5000,
  retries: 3,
  retryDelay: 2000
})
```

## API Response Format

All API methods return a standardized response:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

interface ApiError {
  message: string
  code?: string
  status?: number
  details?: unknown
}
```

### Success Response

```typescript
{
  success: true,
  data: { /* your data */ }
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    message: "Failed to update resource",
    code: "400",
    status: 400,
    details: { /* additional error info */ }
  }
}
```

## Resource Modules

### Chat API (`api.chat`)

```typescript
// Update chat model
await api.chat.updateChatModel(chatId: string, model: string)

// Toggle chat pin
await api.chat.toggleChatPin(chatId: string, pinned: boolean)

// Create new chat
await api.chat.createChat({ title?: string, model: string, projectId?: string })

// Delete chat
await api.chat.deleteChat(chatId: string)

// Update chat title
await api.chat.updateChatTitle(chatId: string, title: string)
```

### User API (`api.user`)

```typescript
// Create guest user
await api.user.createGuestUser(guestId: string)

// Check rate limits
await api.user.checkRateLimits(userId: string, isAuthenticated: boolean)

// Get user preferences
await api.user.getUserPreferences()

// Update user preferences
await api.user.updateUserPreferences(preferences: Record<string, unknown>)

// Manage favorite models
await api.user.getFavoriteModels()
await api.user.updateFavoriteModels(models: string[])

// Manage API keys
await api.user.getUserKeysStatus()
await api.user.saveUserKey(provider: string, key: string)
await api.user.deleteUserKey(provider: string)
```

### Models API (`api.models`)

```typescript
// Get all models
await api.models.getModels()

// Get all providers
await api.models.getProviders()

// Ollama integration
await api.models.getOllamaModels(baseURL: string)
await api.models.checkOllamaHealth(baseURL: string)
```

### Projects API (`api.projects`)

```typescript
// Get all projects
await api.projects.getProjects()

// Get single project
await api.projects.getProject(projectId: string)

// Create project
await api.projects.createProject({ name: string })

// Update project
await api.projects.updateProject(projectId: string, { name: string })

// Delete project
await api.projects.deleteProject(projectId: string)

// Move chat to project
await api.projects.moveChatToProject(chatId: string, projectId: string | null)
```

### System API (`api.system`)

```typescript
// Get CSRF token
await api.system.getCsrfToken()

// Health check
await api.system.checkHealth()
```

## Advanced Configuration

### Custom Client Instance

```typescript
import { ApiClient } from '@/lib/api'

const customClient = new ApiClient({
  baseURL: '/api/v2',
  timeout: 10000,
  retries: 3,
  retryDelay: 2000,
  headers: {
    'X-Custom-Header': 'value'
  },
  onRequest: async (config) => {
    // Modify request before sending
    console.log('Sending request:', config)
    return config
  },
  onResponse: async (response, data) => {
    // Process response data
    console.log('Received:', data)
    return data
  },
  onError: async (error) => {
    // Handle errors globally
    console.error('API Error:', error)
  }
})
```

### Request Interceptors

```typescript
import { apiClient } from '@/lib/api'

apiClient.updateConfig({
  onRequest: async (config) => {
    // Add custom headers
    config.headers = {
      ...config.headers,
      'X-Request-ID': generateRequestId()
    }
    return config
  }
})
```

### Response Interceptors

```typescript
apiClient.updateConfig({
  onResponse: async (response, data) => {
    // Transform response data
    if (data && typeof data === 'object') {
      return {
        ...data,
        receivedAt: new Date().toISOString()
      }
    }
    return data
  }
})
```

### Error Interceptors

```typescript
apiClient.updateConfig({
  onError: async (error) => {
    // Log errors to monitoring service
    if (error.status === 401) {
      // Handle unauthorized
      window.location.href = '/auth'
    }
    
    // Show toast notification
    toast.error(error.message)
  }
})
```

## Error Handling Patterns

### Basic Error Handling

```typescript
const result = await api.chat.updateChatModel(chatId, model)

if (!result.success) {
  console.error('Failed:', result.error?.message)
  return
}

// Success - use result.data
console.log('Updated:', result.data)
```

### With Try-Catch

```typescript
try {
  const result = await api.user.checkRateLimits(userId, true)
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Unknown error')
  }
  
  return result.data
} catch (error) {
  console.error('Rate limit check failed:', error)
  throw error
}
```

### Handling Specific Error Codes

```typescript
const result = await api.user.saveUserKey(provider, key)

if (!result.success) {
  switch (result.error?.code) {
    case '401':
      toast.error('Please sign in first')
      break
    case '429':
      toast.error('Too many requests. Please try again later.')
      break
    case 'TIMEOUT':
      toast.error('Request timed out. Please check your connection.')
      break
    default:
      toast.error(result.error?.message || 'An error occurred')
  }
  return
}
```

## Retry Logic

The client automatically retries failed requests:

- **Server errors (5xx)**: Retried with exponential backoff
- **Network errors**: Retried with exponential backoff
- **Client errors (4xx)**: Not retried (invalid requests)
- **Timeout errors**: Retried

### Custom Retry Configuration

```typescript
// Per request
const result = await apiClient.get('/api/data', {
  retries: 5,
  retryDelay: 3000 // 3 seconds base delay
})

// Global configuration
apiClient.updateConfig({
  retries: 3,
  retryDelay: 1000
})
```

## Timeout Configuration

```typescript
// Per request
const result = await apiClient.post('/api/action', data, {
  timeout: 5000 // 5 seconds
})

// Global configuration
apiClient.updateConfig({
  timeout: 30000 // 30 seconds
})
```

## CSRF Protection

The client automatically:
1. Reads CSRF token from `csrf_token` cookie
2. Injects token in `x-csrf-token` header
3. Works with all state-changing requests (POST, PUT, PATCH, DELETE)

No additional configuration needed!

## Migration Guide

### From Direct `fetch()` Calls

**Before:**
```typescript
const response = await fetch('/api/projects')
if (!response.ok) {
  throw new Error('Failed to fetch')
}
const data = await response.json()
```

**After:**
```typescript
const result = await api.projects.getProjects()
if (!result.success) {
  console.error(result.error?.message)
  return
}
const data = result.data
```

### From `fetchClient()`

**Before:**
```typescript
const res = await fetchClient('/api/update-chat-model', {
  method: 'POST',
  body: JSON.stringify({ chatId, model })
})
const data = await res.json()
```

**After:**
```typescript
const result = await api.chat.updateChatModel(chatId, model)
// Result already contains parsed data and error handling
```

### From `lib/api.ts` Functions

**Before:**
```typescript
import { updateChatModel } from '@/lib/api'

try {
  const data = await updateChatModel(chatId, model)
  console.log(data)
} catch (error) {
  console.error(error)
}
```

**After:**
```typescript
import { api } from '@/lib/api'

const result = await api.chat.updateChatModel(chatId, model)
if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error)
}
```

## Best Practices

1. **Always check `success` before accessing `data`**
   ```typescript
   const result = await api.chat.updateChatModel(chatId, model)
   if (result.success) {
     // Safe to use result.data
   }
   ```

2. **Use resource methods instead of client directly**
   ```typescript
   // Good
   await api.projects.getProjects()
   
   // Avoid (unless necessary)
   await apiClient.get('/api/projects')
   ```

3. **Handle errors gracefully**
   ```typescript
   if (!result.success) {
     toast.error(result.error?.message || 'An error occurred')
     return
   }
   ```

4. **Use TypeScript types**
   ```typescript
   const result = await api.models.getModels()
   if (result.success && result.data) {
     // result.data is typed as ModelsResponse
     result.data.models.forEach(model => {
       console.log(model.name) // TypeScript knows this exists
     })
   }
   ```

5. **Configure retries and timeouts appropriately**
   ```typescript
   // Short-lived operations
   await apiClient.post('/api/quick-action', data, {
     timeout: 5000,
     retries: 1
   })
   
   // Long-running operations
   await apiClient.post('/api/heavy-operation', data, {
     timeout: 60000,
     retries: 0
   })
   ```

## Testing

### Mock API Responses

```typescript
import { ApiClient } from '@/lib/api'

// Create mock client
const mockClient = new ApiClient({
  onRequest: async (config) => {
    // Intercept and return mock data
    return config
  }
})
```

### Unit Tests

```typescript
import { api } from '@/lib/api'

describe('Chat API', () => {
  it('should update chat model', async () => {
    const result = await api.chat.updateChatModel('chat-123', 'gpt-4')
    
    expect(result.success).toBe(true)
    expect(result.data?.model).toBe('gpt-4')
  })
  
  it('should handle errors', async () => {
    const result = await api.chat.updateChatModel('invalid', 'model')
    
    expect(result.success).toBe(false)
    expect(result.error?.message).toBeDefined()
  })
})
```

## Troubleshooting

### Issue: CSRF Token Not Found

**Solution**: Ensure CSRF token is set in cookies before making requests.

```typescript
// Initialize CSRF token
const csrf = await api.system.getCsrfToken()
```

### Issue: Request Timeout

**Solution**: Increase timeout or check network connectivity.

```typescript
const result = await apiClient.get('/api/slow-endpoint', {
  timeout: 60000 // 60 seconds
})
```

### Issue: Retries Not Working

**Solution**: Check error status code (4xx errors are not retried).

```typescript
// Only 5xx and network errors are retried by default
```

## Contributing

When adding new API endpoints:

1. Add types to `lib/api/types.ts`
2. Create/update resource module in `lib/api/resources/`
3. Export from `lib/api/index.ts`
4. Update this documentation
5. Add tests

Example:

```typescript
// lib/api/resources/analytics.ts
export async function trackEvent(
  event: string,
  data: Record<string, unknown>
): Promise<ApiResponse<{ success: boolean }>> {
  return apiClient.post('/api/analytics/track', { event, data })
}
```

## Support

For issues or questions:
- Check [CLAUDE.md](../CLAUDE.md) for project context
- Review [PHASE3_PLAN.md](../../PHASE3_PLAN.md) for refactoring details
- Create an issue on GitHub

---

**Last Updated**: October 15, 2025  
**Version**: 1.0.0  
**Phase**: 3C - API & Data Layer
