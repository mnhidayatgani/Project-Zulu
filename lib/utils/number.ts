/**
 * Number formatting and manipulation utilities
 */

/**
 * Format number with commas for thousands
 */
export function formatNumber(n: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(n)
}

/**
 * Format number as currency
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format number as percentage
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1_000_000) return `${(num / 1000).toFixed(1)}K`
  if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  return `${(num / 1_000_000_000).toFixed(1)}B`
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Round number to specified decimal places
 */
export function round(value: number, decimals = 0): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Check if number is in range (inclusive)
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Generate random number between min and max
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Calculate percentage of value from total
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Sum array of numbers
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0)
}

/**
 * Calculate average of array of numbers
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return sum(numbers) / numbers.length
}

/**
 * Find median of array of numbers
 */
export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0
  
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

/**
 * Calculate exponential moving average
 */
export function exponentialMovingAverage(
  current: number,
  previous: number,
  smoothing = 2,
  periods = 10
): number {
  const multiplier = smoothing / (periods + 1)
  return current * multiplier + previous * (1 - multiplier)
}
