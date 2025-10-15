/**
 * String manipulation and formatting utilities
 */

/**
 * Truncate string to specified length with ellipsis
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) {
    return str
  }
  return str.slice(0, length - suffix.length) + suffix
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Convert camelCase or PascalCase to readable text
 */
export function camelToReadable(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (match) => match.toUpperCase())
    .trim()
}

/**
 * Convert kebab-case or snake_case to readable text
 */
export function kebabToReadable(str: string): string {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/^./, (match) => match.toUpperCase())
}

/**
 * Generate initials from name
 */
export function getInitials(name: string, maxLength = 2): string {
  const words = name.trim().split(/\s+/)
  const initials = words
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('')
  
  return initials || '?'
}

/**
 * Slugify string for URLs
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, char => map[char])
}

/**
 * Count words in a string
 */
export function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(text: string, wordsPerMinute = 200): number {
  const words = countWords(text)
  return Math.ceil(words / wordsPerMinute)
}

/**
 * Highlight search term in text
 */
export function highlightText(text: string, query: string): string {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

/**
 * Check if string is valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if string is valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Generate random string
 */
export function randomString(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
