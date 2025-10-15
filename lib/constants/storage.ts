/**
 * LocalStorage and SessionStorage keys
 * Centralized storage keys for consistency
 */

/**
 * LocalStorage keys
 */
export const LOCAL_STORAGE_KEYS = {
  // User preferences
  THEME: 'theme',
  FAVORITE_MODELS: 'favorite_models',
  SYSTEM_PROMPT: 'system_prompt',
  
  // Chat state
  ACTIVE_CHAT: 'active_chat_id',
  DRAFT_MESSAGE: 'draft_message',
  CHAT_HISTORY: 'chat_history',
  
  // UI state
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  SIDEBAR_WIDTH: 'sidebar_width',
  
  // User session
  USER_ID: 'user_id',
  GUEST_ID: 'guest_id',
  ANONYMOUS: 'anonymous',
  
  // Feature flags
  ONBOARDING_COMPLETED: 'onboarding_completed',
  BETA_FEATURES: 'beta_features_enabled',
  
  // Cache
  MODELS_CACHE: 'models_cache',
  PROVIDERS_CACHE: 'providers_cache',
  CACHE_TIMESTAMP: 'cache_timestamp',
} as const

/**
 * SessionStorage keys (cleared on tab close)
 */
export const SESSION_STORAGE_KEYS = {
  CSRF_TOKEN: 'csrf_token',
  TEMP_CHAT_STATE: 'temp_chat_state',
  FORM_DATA: 'form_data_backup',
} as const

/**
 * Cache durations (in milliseconds)
 */
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const

/**
 * Storage quota limits
 */
export const STORAGE_LIMITS = {
  MAX_CHAT_HISTORY: 100,
  MAX_DRAFT_SIZE: 10000, // characters
  MAX_CACHE_SIZE: 5 * 1024 * 1024, // 5MB
} as const
