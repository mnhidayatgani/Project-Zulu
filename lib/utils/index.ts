/**
 * Utility Functions Index
 * Centralized exports for all utility modules
 * 
 * Usage:
 * import { formatRelativeTime, truncate, formatNumber } from '@/lib/utils'
 */

// Date utilities
export * from './date'

// String utilities
export * from './string'

// Number utilities
export * from './number'

// Logger (in utils directory)
export * from './logger'

// Re-export commonly used utilities from lib/utils.ts for backwards compatibility
export { cn, debounce, isDev } from '../utils'
