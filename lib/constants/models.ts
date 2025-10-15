/**
 * Model-related constants
 * Default models, free models, and access configuration
 */

/**
 * Default model for new chats
 */
export const MODEL_DEFAULT = 'gpt-4.1-nano' as const

/**
 * Models available to non-authenticated users
 */
export const NON_AUTH_ALLOWED_MODELS = ['gpt-4.1-nano'] as const

/**
 * Free tier model IDs
 * These models don't require API keys or premium access
 */
export const FREE_MODELS_IDS = [
  'openrouter:deepseek/deepseek-r1:free',
  'openrouter:meta-llama/llama-3.3-8b-instruct:free',
  'pixtral-large-latest',
  'mistral-large-latest',
  'gpt-4.1-nano',
] as const

/**
 * Model categories for filtering and organization
 */
export const MODEL_CATEGORIES = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium',
} as const

/**
 * Model providers
 */
export const MODEL_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  MISTRAL: 'mistral',
  OPENROUTER: 'openrouter',
  OLLAMA: 'ollama',
} as const

export type ModelProvider = typeof MODEL_PROVIDERS[keyof typeof MODEL_PROVIDERS]
