/**
 * Legacy config file
 * Constants have been moved to lib/constants/
 * This file now re-exports for backwards compatibility
 * 
 * @deprecated Import from @/lib/constants instead
 */

// Re-export from new constants location
export {
  APP,
  USER_LIMITS,
  LIMITS,
  SYSTEM_PROMPT_DEFAULT,
} from './constants/app'

export {
  MODEL_DEFAULT,
  NON_AUTH_ALLOWED_MODELS,
  FREE_MODELS_IDS,
} from './constants/models'

export {
  SUGGESTIONS,
  type Suggestion,
} from './constants/suggestions'

// Backwards compatibility - flat exports
export const NON_AUTH_DAILY_MESSAGE_LIMIT = 5
export const AUTH_DAILY_MESSAGE_LIMIT = 1000
export const REMAINING_QUERY_ALERT_THRESHOLD = 2
export const DAILY_FILE_UPLOAD_LIMIT = 5
export const DAILY_LIMIT_PRO_MODELS = 500
export const MESSAGE_MAX_LENGTH = 10000
export const APP_NAME = 'Zola'
export const APP_DOMAIN = 'https://zola.chat'

