/**
 * API endpoint constants
 * Centralized API routes for better maintainability
 */

export const API_ROUTES = {
  // Chat endpoints
  CHAT: '/api/chat',
  CREATE_CHAT: '/api/create-chat',
  
  // User endpoints
  CREATE_GUEST: '/api/create-guest',
  USER_PREFERENCES: '/api/user-preferences',
  USER_KEYS: '/api/user-keys',
  USER_KEY_STATUS: '/api/user-key-status',
  
  // Project endpoints
  PROJECTS: '/api/projects',
  PROJECT_BY_ID: (id: string) => `/api/projects/${id}`,
  
  // Model endpoints
  MODELS: '/api/models',
  PROVIDERS: '/api/providers',
  
  // Settings endpoints
  UPDATE_CHAT_MODEL: '/api/update-chat-model',
  TOGGLE_CHAT_PIN: '/api/toggle-chat-pin',
  
  // Security
  CSRF: '/api/csrf',
  RATE_LIMITS: '/api/rate-limits',
  
  // Health check
  HEALTH: '/api/health',
} as const

/**
 * API request headers
 */
export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  JSON: 'application/json',
  AUTHORIZATION: 'Authorization',
} as const

/**
 * HTTP methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const

/**
 * API timeouts (in milliseconds)
 */
export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  LONG: 60000, // 60 seconds (for AI responses)
  SHORT: 10000, // 10 seconds
} as const

/**
 * API retry configuration
 */
export const API_RETRY = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 10000, // 10 seconds
} as const
