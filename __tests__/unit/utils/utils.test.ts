/**
 * Unit Tests - lib/utils.ts
 * Tests for utility functions
 */

import { cn, formatNumber, debounce } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('class1', false && 'class2', 'class3')
      expect(result).toBe('class1 class3')
    })

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toBe('class1 class2')
    })

    it('should handle objects', () => {
      const result = cn({ class1: true, class2: false, class3: true })
      expect(result).toBe('class1 class3')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('should handle small numbers', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(1)).toBe('1')
      expect(formatNumber(10)).toBe('10')
      expect(formatNumber(100)).toBe('100')
    })

    it('should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000')
      expect(formatNumber(-1000000)).toBe('-1,000,000')
    })

    it('should handle decimal numbers', () => {
      expect(formatNumber(1000.5)).toBe('1,000.5')
      expect(formatNumber(1000.123)).toBe('1,000.123')
    })

    it('should handle very large numbers', () => {
      expect(formatNumber(1000000000)).toBe('1,000,000,000')
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should debounce function calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should pass arguments to debounced function', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1', 'arg2')

      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should reset timer on each call', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      jest.advanceTimersByTime(50)

      debouncedFn()
      jest.advanceTimersByTime(50)

      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(50)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should allow multiple invocations after delay', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      jest.advanceTimersByTime(100)

      debouncedFn()
      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should work with different wait times', () => {
      const mockFn1 = jest.fn()
      const mockFn2 = jest.fn()
      const debouncedFn1 = debounce(mockFn1, 50)
      const debouncedFn2 = debounce(mockFn2, 200)

      debouncedFn1()
      debouncedFn2()

      jest.advanceTimersByTime(50)
      expect(mockFn1).toHaveBeenCalledTimes(1)
      expect(mockFn2).not.toHaveBeenCalled()

      jest.advanceTimersByTime(150)
      expect(mockFn2).toHaveBeenCalledTimes(1)
    })
  })
})
