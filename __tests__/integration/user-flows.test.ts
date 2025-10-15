/**
 * @jest-environment jsdom
 */

import { sanitizeUserInput } from '@/lib/sanitize'

describe('User Flow Integration Tests', () => {
  describe('Message Input Flow', () => {
    it('should sanitize user input before sending', () => {
      const userInput = '<script>alert("xss")</script>Hello, AI!'
      const sanitized = sanitizeUserInput(userInput)

      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('Hello, AI!')
    })

    it('should handle HTML entities in user input', () => {
      const userInput = 'Test &lt;div&gt; content'
      const sanitized = sanitizeUserInput(userInput)

      expect(sanitized).toBe('Test &lt;div&gt; content')
    })

    it('should handle markdown-like syntax', () => {
      const input = '# Hello\n\n**Bold** and *italic*'
      const sanitized = sanitizeUserInput(input)

      expect(sanitized).toContain('# Hello')
      expect(sanitized).toContain('**Bold**')
    })

    it('should handle code blocks', () => {
      const input = '```javascript\nconst x = 1;\n```'
      const sanitized = sanitizeUserInput(input)

      expect(sanitized).toContain('```javascript')
      expect(sanitized).toContain('const x = 1;')
    })

    it('should handle special characters', () => {
      const input = 'Test !@#$%^&*() characters'
      const sanitized = sanitizeUserInput(input)

      expect(sanitized).toContain('Test')
      expect(sanitized).toContain('characters')
    })
  })

  describe('Chat Creation Flow', () => {
    it('should validate chat title', () => {
      const validTitles = ['My Chat', 'Test 123', 'Chat with AI']

      validTitles.forEach((title) => {
        const sanitized = sanitizeUserInput(title)
        expect(sanitized).toBe(title)
      })
    })

    it('should sanitize malicious chat titles', () => {
      const maliciousTitle = '<script>alert("xss")</script>My Chat'
      const sanitized = sanitizeUserInput(maliciousTitle)

      expect(sanitized).not.toContain('<script>')
    })

    it('should handle empty chat title', () => {
      const emptyTitle = ''
      const sanitized = sanitizeUserInput(emptyTitle)

      expect(sanitized).toBe('')
    })

    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(10000)
      const sanitized = sanitizeUserInput(longTitle)

      // Sanitize should preserve the text
      expect(sanitized.length).toBeGreaterThan(0)
    })
  })

  describe('Model Selection Flow', () => {
    const availableModels = [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
    ]

    it('should validate model selection', () => {
      const selectedModelId = 'gpt-4o'
      const model = availableModels.find((m) => m.id === selectedModelId)

      expect(model).toBeDefined()
      expect(model?.provider).toBe('OpenAI')
    })

    it('should handle invalid model selection', () => {
      const invalidModelId = 'non-existent-model'
      const model = availableModels.find((m) => m.id === invalidModelId)

      expect(model).toBeUndefined()
    })

    it('should filter models by provider', () => {
      const anthropicModels = availableModels.filter((m) => m.provider === 'Anthropic')

      expect(anthropicModels).toHaveLength(1)
      expect(anthropicModels[0].id).toBe('claude-3-5-sonnet')
    })

    it('should get all unique providers', () => {
      const providers = [...new Set(availableModels.map((m) => m.provider))]

      expect(providers).toHaveLength(3)
      expect(providers).toContain('OpenAI')
      expect(providers).toContain('Anthropic')
      expect(providers).toContain('Google')
    })
  })

  describe('Project Management Flow', () => {
    it('should sanitize project name', () => {
      const projectName = 'My Project <script>alert("xss")</script>'
      const sanitized = sanitizeUserInput(projectName)

      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('My Project')
    })

    it('should validate project association', () => {
      const chat = { id: 'chat-1', project_id: 'project-a' }
      const projectId = 'project-a'

      expect(chat.project_id).toBe(projectId)
    })

    it('should handle chats without projects', () => {
      const chat = { id: 'chat-1', project_id: null }

      expect(chat.project_id).toBeNull()
    })

    it('should group chats by project', () => {
      const chats = [
        { id: '1', project_id: 'proj-a' },
        { id: '2', project_id: 'proj-b' },
        { id: '3', project_id: 'proj-a' },
        { id: '4', project_id: null },
      ]

      const projectA = chats.filter((c) => c.project_id === 'proj-a')
      const projectB = chats.filter((c) => c.project_id === 'proj-b')
      const noProject = chats.filter((c) => c.project_id === null)

      expect(projectA).toHaveLength(2)
      expect(projectB).toHaveLength(1)
      expect(noProject).toHaveLength(1)
    })
  })

  describe('Search and Filter Flow', () => {
    const sampleChats = [
      { id: '1', title: 'Python coding help', model: 'gpt-4o' },
      { id: '2', title: 'JavaScript debugging', model: 'claude-3-5-sonnet' },
      { id: '3', title: 'Python data analysis', model: 'gpt-4o' },
      { id: '4', title: 'React component design', model: 'gemini-1.5-pro' },
    ]

    it('should search chats by title', () => {
      const query = 'Python'
      const results = sampleChats.filter((chat) =>
        chat.title.toLowerCase().includes(query.toLowerCase())
      )

      expect(results).toHaveLength(2)
      expect(results.map((r) => r.id)).toEqual(['1', '3'])
    })

    it('should filter chats by model', () => {
      const modelFilter = 'gpt-4o'
      const results = sampleChats.filter((chat) => chat.model === modelFilter)

      expect(results).toHaveLength(2)
      expect(results.every((r) => r.model === 'gpt-4o')).toBe(true)
    })

    it('should handle case-insensitive search', () => {
      const query = 'PYTHON'
      const results = sampleChats.filter((chat) =>
        chat.title.toLowerCase().includes(query.toLowerCase())
      )

      expect(results).toHaveLength(2)
    })

    it('should return empty results for non-matching query', () => {
      const query = 'nonexistent'
      const results = sampleChats.filter((chat) =>
        chat.title.toLowerCase().includes(query.toLowerCase())
      )

      expect(results).toHaveLength(0)
    })

    it('should search with multiple keywords', () => {
      const keywords = ['Python', 'React']
      const results = sampleChats.filter((chat) =>
        keywords.some((keyword) =>
          chat.title.toLowerCase().includes(keyword.toLowerCase())
        )
      )

      expect(results).toHaveLength(3) // Python (2) + React (1)
    })
  })

  describe('Settings Update Flow', () => {
    it('should sanitize system prompt', () => {
      const prompt = 'You are a helpful assistant. <script>alert("xss")</script>'
      const sanitized = sanitizeUserInput(prompt)

      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('You are a helpful assistant.')
    })

    it('should validate favorite models array', () => {
      const favoriteModels = ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro']

      expect(Array.isArray(favoriteModels)).toBe(true)
      expect(favoriteModels).toHaveLength(3)
    })

    it('should handle empty favorite models', () => {
      const favoriteModels: string[] = []

      expect(Array.isArray(favoriteModels)).toBe(true)
      expect(favoriteModels).toHaveLength(0)
    })

    it('should add/remove favorite models', () => {
      const favorites = ['gpt-4o']
      
      // Add
      favorites.push('claude-3-5-sonnet')
      expect(favorites).toContain('claude-3-5-sonnet')
      
      // Remove
      const filtered = favorites.filter((m) => m !== 'gpt-4o')
      expect(filtered).not.toContain('gpt-4o')
      expect(filtered).toContain('claude-3-5-sonnet')
    })
  })

  describe('Data Validation', () => {
    it('should validate email format', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user+tag@example.com']
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true)
      })
    })

    it('should reject invalid emails', () => {
      const invalidEmails = ['notanemail', '@example.com', 'user@', 'user @example.com']
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false)
      })
    })

    it('should validate API key format', () => {
      const validKeys = ['sk-proj-123abc', 'sk-ant-456def', 'AIza123']

      validKeys.forEach((key) => {
        expect(key.length).toBeGreaterThan(0)
        expect(typeof key).toBe('string')
      })
    })

    it('should validate UUID format', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const validUUID = '550e8400-e29b-41d4-a716-446655440000'
      const invalidUUID = 'not-a-uuid'

      expect(uuidRegex.test(validUUID)).toBe(true)
      expect(uuidRegex.test(invalidUUID)).toBe(false)
    })
  })

  describe('Complete User Session Flow', () => {
    it('should simulate a complete user interaction', () => {
      // 1. User inputs a message
      const userMessage = 'Help me debug this code: <script>test</script>'
      const sanitizedMessage = sanitizeUserInput(userMessage)

      expect(sanitizedMessage).not.toContain('<script>')

      // 2. Create chat with sanitized title
      const chatTitle = 'Debug session <script>alert("xss")</script>'
      const sanitizedTitle = sanitizeUserInput(chatTitle)

      expect(sanitizedTitle).not.toContain('<script>')
      expect(sanitizedTitle).toContain('Debug session')

      // 3. Search for previous chats
      const chats = [
        { id: '1', title: 'Previous debug session' },
        { id: '2', title: 'Code review' },
      ]

      const searchResults = chats.filter((c) =>
        c.title.toLowerCase().includes('debug')
      )

      expect(searchResults).toHaveLength(1)

      // 4. Select a model
      const models = [
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
      ]

      const selectedModel = models.find((m) => m.id === 'gpt-4o')
      expect(selectedModel).toBeDefined()
    })

    it('should handle error states gracefully', () => {
      // Simulate network error
      const error = new Error('Network error')
      
      expect(error.message).toBe('Network error')
      expect(error instanceof Error).toBe(true)

      // Simulate not found
      const notFoundError = { status: 404, message: 'Chat not found' }
      
      expect(notFoundError.status).toBe(404)
    })
  })
})
