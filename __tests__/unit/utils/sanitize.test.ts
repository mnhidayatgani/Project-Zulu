/**
 * Unit Tests - lib/sanitize.ts
 * Tests for input sanitization
 */

import { sanitizeUserInput } from '@/lib/sanitize'

describe('Sanitize', () => {
  describe('sanitizeUserInput', () => {
    it('should return clean text unchanged', () => {
      const input = 'Hello, world!'
      expect(sanitizeUserInput(input)).toBe(input)
    })

    it('should remove script tags', () => {
      const input = 'Hello<script>alert("xss")</script>world'
      const result = sanitizeUserInput(input)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
    })

    it('should remove onclick handlers', () => {
      const input = '<div onclick="alert(\'xss\')">Click me</div>'
      const result = sanitizeUserInput(input)
      expect(result).not.toContain('onclick')
      expect(result).not.toContain('alert')
    })

    it('should remove javascript: URLs', () => {
      const input = '<a href="javascript:alert(\'xss\')">Link</a>'
      const result = sanitizeUserInput(input)
      expect(result).not.toContain('javascript:')
    })

    it('should allow safe HTML tags', () => {
      const input = '<p>Hello <strong>world</strong></p>'
      const result = sanitizeUserInput(input)
      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
      expect(result).toContain('Hello')
      expect(result).toContain('world')
    })

    it('should handle empty strings', () => {
      expect(sanitizeUserInput('')).toBe('')
    })

    it('should handle strings with only whitespace', () => {
      const input = '   '
      expect(sanitizeUserInput(input)).toBe(input)
    })

    it('should remove iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>'
      const result = sanitizeUserInput(input)
      expect(result).not.toContain('<iframe>')
    })

    it('should remove embed tags', () => {
      const input = '<embed src="evil.swf">'
      const result = sanitizeUserInput(input)
      expect(result).not.toContain('<embed>')
    })

    it('should remove object tags', () => {
      const input = '<object data="evil.swf"></object>'
      const result = sanitizeUserInput(input)
      expect(result).not.toContain('<object>')
    })

    it('should handle multiple XSS attempts', () => {
      const input = `
        <script>alert('xss')</script>
        <img src=x onerror="alert('xss')">
        <div onclick="alert('xss')">Click</div>
      `
      const result = sanitizeUserInput(input)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('onerror')
      expect(result).not.toContain('onclick')
      expect(result).not.toContain('alert')
    })

    it('should preserve line breaks and formatting', () => {
      const input = 'Line 1\nLine 2\n\nLine 3'
      const result = sanitizeUserInput(input)
      expect(result).toBe(input)
    })

    it('should handle special characters', () => {
      const input = 'Hello & goodbye < > " \' `'
      const result = sanitizeUserInput(input)
      expect(result).toContain('Hello')
      expect(result).toContain('goodbye')
    })
  })
})
