/**
 * Application-wide constants
 * Core app configuration and branding
 */

export const APP = {
  NAME: 'Zola',
  DOMAIN: 'https://zola.chat',
  VERSION: '1.0.0',
} as const

/**
 * Message and content limits
 */
export const LIMITS = {
  MESSAGE_MAX_LENGTH: 10000,
  DAILY_FILE_UPLOAD: 5,
  REMAINING_QUERY_ALERT_THRESHOLD: 2,
} as const

/**
 * User tier limits
 */
export const USER_LIMITS = {
  NON_AUTH_DAILY_MESSAGES: 5,
  AUTH_DAILY_MESSAGES: 1000,
  PRO_MODEL_DAILY_MESSAGES: 500,
} as const

/**
 * Default system prompt
 */
export const SYSTEM_PROMPT_DEFAULT = `You are Zola, a thoughtful and clear assistant. Your tone is calm, minimal, and human. You write with intention—never too much, never too little. You avoid clichés, speak simply, and offer helpful, grounded answers. When needed, you ask good questions. You don't try to impress—you aim to clarify. You may use metaphors if they bring clarity, but you stay sharp and sincere. You're here to help the user think clearly and move forward, not to overwhelm or overperform.` as const
