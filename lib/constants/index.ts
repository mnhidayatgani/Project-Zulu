/**
 * Constants Index
 * Centralized exports for all application constants
 * 
 * Usage:
 * import { APP, USER_LIMITS, API_ROUTES } from '@/lib/constants'
 */

// App-wide constants
export * from './app'

// Model constants
export * from './models'

// API constants
export * from './api'

// Storage constants
export * from './storage'

// Prompt suggestions
export * from './suggestions'

/**
 * Re-export for backwards compatibility
 * These can be gradually migrated to the new structure
 */
export { APP_NAME, APP_DOMAIN } from './app'
export { MODEL_DEFAULT, FREE_MODELS_IDS, NON_AUTH_ALLOWED_MODELS } from './models'
export { API_ROUTES, HTTP_METHODS, API_HEADERS } from './api'
export { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from './storage'
export { SUGGESTIONS } from './suggestions'
