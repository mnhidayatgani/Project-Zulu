/**
 * @jest-environment node
 */
import { randomBytes } from 'crypto'

describe('Encryption', () => {
  // Store original env
  const originalEnv = process.env.ENCRYPTION_KEY
  let encryptKey: any
  let decryptKey: any
  let maskKey: any

  beforeAll(() => {
    // Set a valid 32-byte encryption key for tests
    const testKey = randomBytes(32).toString('base64')
    process.env.ENCRYPTION_KEY = testKey
  })

  beforeEach(() => {
    // Clear the module cache and reimport
    jest.resetModules()
    const encryption = require('@/lib/encryption')
    encryptKey = encryption.encryptKey
    decryptKey = encryption.decryptKey
    maskKey = encryption.maskKey
  })

  afterAll(() => {
    // Restore original env
    process.env.ENCRYPTION_KEY = originalEnv
    jest.resetModules()
  })

  describe('encryptKey', () => {
    it('should encrypt a plaintext string', () => {
      const plaintext = 'my-secret-api-key'
      const result = encryptKey(plaintext)

      expect(result).toHaveProperty('encrypted')
      expect(result).toHaveProperty('iv')
      expect(typeof result.encrypted).toBe('string')
      expect(typeof result.iv).toBe('string')
      expect(result.encrypted.length).toBeGreaterThan(0)
      expect(result.iv.length).toBeGreaterThan(0)
    })

    it('should produce different encrypted values for the same input', () => {
      const plaintext = 'my-secret-api-key'
      const result1 = encryptKey(plaintext)
      const result2 = encryptKey(plaintext)

      // Different IVs should produce different encrypted values
      expect(result1.iv).not.toBe(result2.iv)
      expect(result1.encrypted).not.toBe(result2.encrypted)
    })

    it('should include auth tag in encrypted string', () => {
      const plaintext = 'test-key'
      const result = encryptKey(plaintext)

      // Encrypted should have format: encryptedData:authTag
      expect(result.encrypted).toContain(':')
      const parts = result.encrypted.split(':')
      expect(parts).toHaveLength(2)
      expect(parts[0].length).toBeGreaterThan(0)
      expect(parts[1].length).toBeGreaterThan(0)
    })

    it('should handle empty strings', () => {
      const result = encryptKey('')

      expect(result).toHaveProperty('encrypted')
      expect(result).toHaveProperty('iv')
    })

    it('should handle long strings', () => {
      const longString = 'a'.repeat(1000)
      const result = encryptKey(longString)

      expect(result).toHaveProperty('encrypted')
      expect(result).toHaveProperty('iv')
      expect(result.encrypted.length).toBeGreaterThan(0)
    })

    it('should handle special characters', () => {
      const specialChars = 'sk-1234567890!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
      const result = encryptKey(specialChars)

      expect(result).toHaveProperty('encrypted')
      expect(result).toHaveProperty('iv')
    })

    it('should handle unicode characters', () => {
      const unicode = '🔐 密钥 clé ключ مفتاح'
      const result = encryptKey(unicode)

      expect(result).toHaveProperty('encrypted')
      expect(result).toHaveProperty('iv')
    })
  })

  describe('decryptKey', () => {
    it('should decrypt an encrypted string', () => {
      const plaintext = 'my-secret-api-key'
      const { encrypted, iv } = encryptKey(plaintext)
      const decrypted = decryptKey(encrypted, iv)

      expect(decrypted).toBe(plaintext)
    })

    it('should handle empty strings', () => {
      const { encrypted, iv } = encryptKey('')
      const decrypted = decryptKey(encrypted, iv)

      expect(decrypted).toBe('')
    })

    it('should handle long strings', () => {
      const longString = 'a'.repeat(1000)
      const { encrypted, iv } = encryptKey(longString)
      const decrypted = decryptKey(encrypted, iv)

      expect(decrypted).toBe(longString)
    })

    it('should handle special characters', () => {
      const specialChars = 'sk-1234567890!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
      const { encrypted, iv } = encryptKey(specialChars)
      const decrypted = decryptKey(encrypted, iv)

      expect(decrypted).toBe(specialChars)
    })

    it('should handle unicode characters', () => {
      const unicode = '🔐 密钥 clé ключ مفتاح'
      const { encrypted, iv } = encryptKey(unicode)
      const decrypted = decryptKey(encrypted, iv)

      expect(decrypted).toBe(unicode)
    })

    it('should fail with wrong IV', () => {
      const plaintext = 'my-secret-api-key'
      const { encrypted } = encryptKey(plaintext)
      const wrongIv = randomBytes(16).toString('hex')

      expect(() => {
        decryptKey(encrypted, wrongIv)
      }).toThrow()
    })

    it('should fail with tampered encrypted data', () => {
      const plaintext = 'my-secret-api-key'
      const { encrypted, iv } = encryptKey(plaintext)
      const tampered = encrypted.replace(/[a-f0-9]/, 'x')

      expect(() => {
        decryptKey(tampered, iv)
      }).toThrow()
    })

    it('should fail with tampered auth tag', () => {
      const plaintext = 'my-secret-api-key'
      const { encrypted, iv } = encryptKey(plaintext)
      const [encData, authTag] = encrypted.split(':')
      const tamperedAuthTag = authTag.replace(/[a-f0-9]/, 'x')
      const tampered = `${encData}:${tamperedAuthTag}`

      expect(() => {
        decryptKey(tampered, iv)
      }).toThrow()
    })
  })

  describe('maskKey', () => {
    it('should mask short keys completely', () => {
      expect(maskKey('abc')).toBe('***')
      expect(maskKey('12345678')).toBe('********')
    })

    it('should show first 4 and last 4 characters for longer keys', () => {
      expect(maskKey('sk-123456789')).toBe('sk-1****6789')
      expect(maskKey('abcdefghijklmnop')).toBe('abcd********mnop')
    })

    it('should handle empty string', () => {
      expect(maskKey('')).toBe('')
    })

    it('should handle single character', () => {
      expect(maskKey('a')).toBe('*')
    })

    it('should handle exact 9 characters', () => {
      expect(maskKey('123456789')).toBe('1234*6789')
    })

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(100)
      const masked = maskKey(longKey)
      
      expect(masked).toHaveLength(100)
      expect(masked.startsWith('aaaa')).toBe(true)
      expect(masked.endsWith('aaaa')).toBe(true)
      expect(masked.slice(4, -4)).toBe('*'.repeat(92))
    })

    it('should handle keys with special characters', () => {
      expect(maskKey('sk-proj-abc123def456')).toBe('sk-p************f456')
    })

    it('should preserve exact length', () => {
      const keys = ['abc', '123456', 'a'.repeat(50), 'sk-1234567890']
      keys.forEach(key => {
        expect(maskKey(key)).toHaveLength(key.length)
      })
    })
  })

  describe('encryption/decryption cycle', () => {
    it('should maintain data integrity through multiple cycles', () => {
      const plaintext = 'test-api-key-12345'
      
      // Encrypt -> Decrypt -> Encrypt -> Decrypt
      const { encrypted: enc1, iv: iv1 } = encryptKey(plaintext)
      const dec1 = decryptKey(enc1, iv1)
      const { encrypted: enc2, iv: iv2 } = encryptKey(dec1)
      const dec2 = decryptKey(enc2, iv2)

      expect(dec2).toBe(plaintext)
    })

    it('should handle multiple different keys', () => {
      const keys = [
        'sk-openai-12345',
        'claude-key-67890',
        'gemini-api-key-abcdef',
      ]

      const encrypted = keys.map(key => encryptKey(key))
      const decrypted = encrypted.map(({ encrypted, iv }) => 
        decryptKey(encrypted, iv)
      )

      expect(decrypted).toEqual(keys)
    })
  })
})
