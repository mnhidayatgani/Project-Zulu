/**
 * @jest-environment jsdom
 */
import {
  validateFile,
  uploadFile,
  createAttachment,
  processFiles,
  FileUploadLimitError,
  checkFileUploadLimit,
  type Attachment,
} from '@/lib/file-handling'
import { createMockFile } from '@/__tests__/utils/helpers'

// Mock dependencies
jest.mock('@/components/ui/toast', () => ({
  toast: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/supabase/config', () => ({
  isSupabaseEnabled: false,
}))

// Use manual mock for file-type
jest.mock('file-type')

describe('File Handling', () => {
  let mockFileTypeFromBuffer: jest.Mock

  beforeAll(() => {
    const fileType = require('file-type')
    mockFileTypeFromBuffer = fileType.__mockFileTypeFromBuffer
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateFile', () => {
    it('should validate a file within size limit', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({ mime: 'image/jpeg' })

      const file = createMockFile('test.jpg', 1024, 'image/jpeg')
      const result = await validateFile(file)

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject file exceeding size limit', async () => {
      const file = createMockFile('large.jpg', 15 * 1024 * 1024, 'image/jpeg')
      const result = await validateFile(file)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('exceeds')
      expect(result.error).toContain('10MB')
    })

    it('should reject unsupported file types', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({ mime: 'video/mp4' })

      const file = createMockFile('video.mp4', 1024, 'video/mp4')
      const result = await validateFile(file)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('not supported')
    })

    it('should reject file when type detection fails', async () => {
      mockFileTypeFromBuffer.mockResolvedValue(null)

      const file = createMockFile('unknown.xyz', 1024, 'application/octet-stream')
      const result = await validateFile(file)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('not supported')
    })

    it('should accept image/jpeg', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({ mime: 'image/jpeg' })

      const file = createMockFile('image.jpg', 1024, 'image/jpeg')
      const result = await validateFile(file)

      expect(result.isValid).toBe(true)
    })

    it('should accept image/png', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({ mime: 'image/png' })

      const file = createMockFile('image.png', 1024, 'image/png')
      const result = await validateFile(file)

      expect(result.isValid).toBe(true)
    })

    it('should accept application/pdf', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({ mime: 'application/pdf' })

      const file = createMockFile('doc.pdf', 1024, 'application/pdf')
      const result = await validateFile(file)

      expect(result.isValid).toBe(true)
    })

    it('should accept text/plain', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({ mime: 'text/plain' })

      const file = createMockFile('doc.txt', 1024, 'text/plain')
      const result = await validateFile(file)

      expect(result.isValid).toBe(true)
    })
  })

  describe('uploadFile', () => {
    it('should upload file to storage', async () => {
      const mockSupabase = {
        storage: {
          from: jest.fn().mockReturnThis(),
          upload: jest.fn().mockResolvedValue({ error: null }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://example.com/file.jpg' },
          }),
        },
      }

      const file = createMockFile('test.jpg', 1024, 'image/jpeg')
      const url = await uploadFile(mockSupabase as any, file)

      expect(url).toBe('https://example.com/file.jpg')
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('chat-attachments')
      expect(mockSupabase.storage.upload).toHaveBeenCalled()
    })

    it('should throw error on upload failure', async () => {
      const mockSupabase = {
        storage: {
          from: jest.fn().mockReturnThis(),
          upload: jest.fn().mockResolvedValue({
            error: { message: 'Upload failed' },
          }),
          getPublicUrl: jest.fn(),
        },
      }

      const file = createMockFile('test.jpg', 1024, 'image/jpeg')

      await expect(uploadFile(mockSupabase as any, file)).rejects.toThrow(
        'Error uploading file: Upload failed'
      )
    })

    it('should generate unique file names', async () => {
      const mockSupabase = {
        storage: {
          from: jest.fn().mockReturnThis(),
          upload: jest.fn().mockResolvedValue({ error: null }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://example.com/file.jpg' },
          }),
        },
      }

      const file = createMockFile('test.jpg', 1024, 'image/jpeg')
      await uploadFile(mockSupabase as any, file)
      
      const uploadCall = mockSupabase.storage.upload.mock.calls[0]
      const filePath = uploadCall[0]
      
      expect(filePath).toMatch(/^uploads\/[a-z0-9]+\.jpg$/)
    })
  })

  describe('createAttachment', () => {
    it('should create attachment object', () => {
      const file = createMockFile('test.jpg', 1024, 'image/jpeg')
      const url = 'https://example.com/test.jpg'
      
      const attachment = createAttachment(file, url)

      expect(attachment).toEqual({
        name: 'test.jpg',
        contentType: 'image/jpeg',
        url: 'https://example.com/test.jpg',
      })
    })

    it('should handle different file types', () => {
      const file = createMockFile('document.pdf', 2048, 'application/pdf')
      const url = 'https://example.com/doc.pdf'
      
      const attachment = createAttachment(file, url)

      expect(attachment.name).toBe('document.pdf')
      expect(attachment.contentType).toBe('application/pdf')
    })

    it('should handle files with special characters in name', () => {
      const file = createMockFile('my file (1).jpg', 1024, 'image/jpeg')
      const url = 'https://example.com/file.jpg'
      
      const attachment = createAttachment(file, url)

      expect(attachment.name).toBe('my file (1).jpg')
    })
  })

  describe('processFiles', () => {
    it('should process valid files without Supabase', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({ mime: 'image/jpeg' })

      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/file')

      const file = createMockFile('test.jpg', 1024, 'image/jpeg')
      const attachments = await processFiles([file], 'chat-id', 'user-id')

      expect(attachments).toHaveLength(1)
      expect(attachments[0]).toMatchObject({
        name: 'test.jpg',
        contentType: 'image/jpeg',
      })
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file)
    })

    it('should skip invalid files', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({ mime: 'video/mp4' })
      const { toast } = require('@/components/ui/toast')

      const file = createMockFile('video.mp4', 1024, 'video/mp4')
      const attachments = await processFiles([file], 'chat-id', 'user-id')

      expect(attachments).toHaveLength(0)
      expect(toast).toHaveBeenCalled()
    })

    it('should process multiple valid files', async () => {
      mockFileTypeFromBuffer
        .mockResolvedValueOnce({ mime: 'image/jpeg' })
        .mockResolvedValueOnce({ mime: 'image/png' })

      global.URL.createObjectURL = jest.fn()
        .mockReturnValueOnce('blob:http://localhost/file1')
        .mockReturnValueOnce('blob:http://localhost/file2')

      const file1 = createMockFile('test1.jpg', 1024, 'image/jpeg')
      const file2 = createMockFile('test2.png', 1024, 'image/png')
      
      const attachments = await processFiles(
        [file1, file2],
        'chat-id',
        'user-id'
      )

      expect(attachments).toHaveLength(2)
      expect(attachments[0].name).toBe('test1.jpg')
      expect(attachments[1].name).toBe('test2.png')
    })

    it('should handle mixed valid and invalid files', async () => {
      mockFileTypeFromBuffer
        .mockResolvedValueOnce({ mime: 'image/jpeg' })
        .mockResolvedValueOnce({ mime: 'video/mp4' })

      global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/file')

      const validFile = createMockFile('test.jpg', 1024, 'image/jpeg')
      const invalidFile = createMockFile('video.mp4', 1024, 'video/mp4')
      
      const attachments = await processFiles(
        [validFile, invalidFile],
        'chat-id',
        'user-id'
      )

      expect(attachments).toHaveLength(1)
      expect(attachments[0].name).toBe('test.jpg')
    })
  })

  describe('FileUploadLimitError', () => {
    it('should create error with code', () => {
      const error = new FileUploadLimitError('Limit reached')

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Limit reached')
      expect(error.code).toBe('DAILY_FILE_LIMIT_REACHED')
    })

    it('should be throwable', () => {
      expect(() => {
        throw new FileUploadLimitError('Test error')
      }).toThrow('Test error')
    })
  })

  describe('checkFileUploadLimit', () => {
    it('should return 0 when Supabase is disabled', async () => {
      const count = await checkFileUploadLimit('user-id')
      expect(count).toBe(0)
    })

    it('should check upload count when Supabase is enabled', async () => {
      // Enable Supabase for this test
      const supabaseConfig = require('@/lib/supabase/config')
      supabaseConfig.isSupabaseEnabled = true

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({ count: 3, error: null }),
      }

      const { createClient } = require('@/lib/supabase/client')
      createClient.mockReturnValue(mockSupabase)

      const count = await checkFileUploadLimit('user-id')

      expect(count).toBe(3)
      expect(mockSupabase.from).toHaveBeenCalledWith('chat_attachments')
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-id')

      // Reset
      supabaseConfig.isSupabaseEnabled = false
    })

    it('should throw error when limit is reached', async () => {
      const supabaseConfig = require('@/lib/supabase/config')
      supabaseConfig.isSupabaseEnabled = true

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({ count: 100, error: null }),
      }

      const { createClient } = require('@/lib/supabase/client')
      createClient.mockReturnValue(mockSupabase)

      await expect(checkFileUploadLimit('user-id')).rejects.toThrow(
        FileUploadLimitError
      )

      // Reset
      supabaseConfig.isSupabaseEnabled = false
    })

    it('should throw error on database query failure', async () => {
      const supabaseConfig = require('@/lib/supabase/config')
      supabaseConfig.isSupabaseEnabled = true

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({
          count: null,
          error: { message: 'Database error' },
        }),
      }

      const { createClient } = require('@/lib/supabase/client')
      createClient.mockReturnValue(mockSupabase)

      await expect(checkFileUploadLimit('user-id')).rejects.toThrow(
        'Database error'
      )

      // Reset
      supabaseConfig.isSupabaseEnabled = false
    })
  })
})
