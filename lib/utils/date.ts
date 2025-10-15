/**
 * Date and time formatting utilities
 */

/**
 * Format date to relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`
}

/**
 * Format date to localized date string
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date))
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format time only
 */
export function formatTime(date: Date | string | number): string {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  const today = new Date()
  const target = new Date(date)
  
  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  )
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string | number): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const target = new Date(date)
  
  return (
    yesterday.getFullYear() === target.getFullYear() &&
    yesterday.getMonth() === target.getMonth() &&
    yesterday.getDate() === target.getDate()
  )
}

/**
 * Get smart date label (Today, Yesterday, or formatted date)
 */
export function getSmartDateLabel(date: Date | string | number): string {
  if (isToday(date)) {
    return 'Today'
  }
  if (isYesterday(date)) {
    return 'Yesterday'
  }
  return formatDate(date, { month: 'short', day: 'numeric', year: 'numeric' })
}
