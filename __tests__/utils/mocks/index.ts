/**
 * Test Utilities - Mocks
 * Centralized mocks for testing
 */

// Mock Supabase Client
export const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
}

// Mock Supabase Client Factory
export const createMockSupabaseClient = () => mockSupabaseClient

// Mock Next.js Router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}

// Mock Zustand Store
export const createMockStore = (initialState = {}) => {
  let state = initialState
  
  const getState = () => state
  const setState = (partial) => {
    state = typeof partial === 'function' ? partial(state) : { ...state, ...partial }
  }
  const subscribe = jest.fn()
  const destroy = jest.fn()
  
  return {
    getState,
    setState,
    subscribe,
    destroy,
  }
}

// Mock API Response
export const createMockApiResponse = (data, success = true, error = null) => ({
  success,
  data,
  error,
  status: success ? 200 : 400,
})

// Mock Fetch Response
export const createMockFetchResponse = (data, ok = true, status = 200) => ({
  ok,
  status,
  json: jest.fn().mockResolvedValue(data),
  text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  headers: new Headers(),
})

// Mock User
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  display_name: 'Test User',
  anonymous: false,
  premium: false,
  created_at: new Date().toISOString(),
}

// Mock Chat
export const mockChat = {
  id: 'test-chat-id',
  user_id: 'test-user-id',
  title: 'Test Chat',
  model: 'gpt-4o',
  pinned: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// Mock Message
export const mockMessage = {
  id: 'test-message-id',
  chat_id: 'test-chat-id',
  user_id: 'test-user-id',
  role: 'user',
  content: 'Test message',
  created_at: new Date().toISOString(),
}

// Mock Project
export const mockProject = {
  id: 'test-project-id',
  user_id: 'test-user-id',
  name: 'Test Project',
  created_at: new Date().toISOString(),
}

// Mock Model
export const mockModel = {
  id: 'gpt-4o',
  name: 'GPT-4o',
  provider: 'OpenAI',
  providerId: 'openai',
  contextWindow: 128000,
  vision: true,
  tools: true,
}

// Reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks()
  mockSupabaseClient.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  })
  mockSupabaseClient.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  })
}
