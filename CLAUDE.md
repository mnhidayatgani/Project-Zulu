# CLAUDE.md - AI Agent Context Guide

> **Last Updated**: 2025-10-15  
> **Project**: Zola - Open-source AI Chat Interface  
> **Purpose**: Comprehensive context for AI agents working on this codebase

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Key Architecture Patterns](#key-architecture-patterns)
5. [Core Features](#core-features)
6. [API Routes](#api-routes)
7. [Database Schema](#database-schema)
8. [State Management](#state-management)
9. [AI/ML Integration](#aiml-integration)
10. [Authentication & Security](#authentication--security)
11. [Development Workflow](#development-workflow)
12. [Configuration Files](#configuration-files)
13. [Third-Party Integrations](#third-party-integrations)
14. [Key Files Reference](#key-files-reference)
15. [Agent Memory System](#agent-memory-system)

---

## 📖 Project Overview

**Zola** is an open-source, multi-model AI chat interface built with Next.js 15. It supports multiple AI providers (OpenAI, Anthropic, Google, Mistral, Perplexity, X.AI, OpenRouter) and local models via Ollama.

### Key Characteristics
- **Multi-provider support**: Switch between AI providers seamlessly
- **BYOK (Bring Your Own Key)**: Users can use their own API keys
- **Self-hostable**: Can be deployed on Vercel, Docker, or self-hosted
- **Local AI support**: Ollama integration for running models locally
- **File uploads**: Support for image and file attachments
- **Projects & organization**: Organize chats into projects
- **Guest mode**: Try without authentication (limited access)
- **Responsive UI**: Light/dark themes, mobile-friendly

### Website
- **Production**: https://zola.chat
- **GitHub**: https://github.com/ibelick/zola

---

## 🛠 Tech Stack

### Core Framework
- **Next.js 15** (with Turbopack) - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Radix UI-based component library
- **prompt-kit** - AI-specific UI components
- **motion-primitives** - Animation components
- **Framer Motion** (via motion package) - Animations
- **Lucide React** - Icons
- **Phosphor Icons** - Additional icons

### State Management
- **Zustand 5** - Lightweight state management
- **TanStack Query 5** - Server state management
- **React Context** - Provider-based state

### AI/ML SDKs
- **Vercel AI SDK 4** - Core AI integration
- **@ai-sdk/openai** - OpenAI models
- **@ai-sdk/anthropic** - Claude models
- **@ai-sdk/google** - Gemini models
- **@ai-sdk/mistral** - Mistral models
- **@ai-sdk/perplexity** - Perplexity models
- **@ai-sdk/xai** - Grok models
- **@openrouter/ai-sdk-provider** - OpenRouter integration

### Backend & Database
- **Supabase** - PostgreSQL database, authentication, file storage
- **@supabase/ssr** - Server-side Supabase integration

### Tools & Search
- **exa-js** - Web search API
- **GitHub API** - Code search and repository access

### Code Rendering
- **Shiki** - Syntax highlighting
- **React Markdown** - Markdown rendering
- **remark-gfm** - GitHub Flavored Markdown
- **remark-breaks** - Line break support

### Development Tools
- **ESLint 9** - Linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Bundle Analyzer** - Build analysis

### Deployment
- **Docker** - Containerization
- **Vercel** - Primary deployment platform
- **Docker Compose** - Multi-container orchestration

---

## 📁 Project Structure

```
zola/
├── .agent-memory/           # AI agent persistent memory system
│   ├── config.json          # Memory configuration
│   ├── sessions.json        # Chat session history
│   ├── file-modifications.json  # File change tracking
│   └── README.md            # Memory system docs
│
├── .github/
│   └── workflows/           # CI/CD pipelines
│       └── *.yml            # GitHub Actions workflows
│
├── app/                     # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── chat/            # Main chat endpoint
│   │   │   ├── route.ts     # POST /api/chat - streaming chat
│   │   │   ├── api.ts       # Chat business logic
│   │   │   ├── db.ts        # Database operations
│   │   │   └── utils.ts     # Utility functions
│   │   ├── create-chat/     # Create new chat session
│   │   ├── create-guest/    # Guest user creation
│   │   ├── csrf/            # CSRF token generation
│   │   ├── health/          # Health check endpoint
│   │   ├── models/          # Get available models
│   │   ├── projects/        # Project management
│   │   ├── providers/       # AI provider info
│   │   ├── rate-limits/     # Rate limiting
│   │   ├── toggle-chat-pin/ # Pin/unpin chats
│   │   ├── update-chat-model/  # Update chat model
│   │   ├── user-keys/       # BYOK key management
│   │   ├── user-key-status/ # Check user key status
│   │   └── user-preferences/ # User settings
│   │
│   ├── auth/                # Authentication pages
│   │   ├── page.tsx         # Login page
│   │   ├── login-page.tsx   # Login component
│   │   ├── callback/        # OAuth callback
│   │   ├── error/           # Auth error page
│   │   └── login/           # Login actions
│   │
│   ├── c/[chatId]/          # Individual chat page
│   │   └── page.tsx         # Dynamic chat route
│   │
│   ├── p/[projectId]/       # Project page
│   │   └── page.tsx         # Dynamic project route
│   │
│   ├── components/          # App-specific components
│   │   ├── chat/            # Chat UI components
│   │   │   ├── chat.tsx                 # Main chat component
│   │   │   ├── chat-container.tsx       # Chat wrapper
│   │   │   ├── conversation.tsx         # Message list
│   │   │   ├── message.tsx              # Message wrapper
│   │   │   ├── message-user.tsx         # User message
│   │   │   ├── message-assistant.tsx    # AI message
│   │   │   ├── tool-invocation.tsx      # Tool call display
│   │   │   ├── reasoning.tsx            # Reasoning display
│   │   │   ├── sources-list.tsx         # Web sources
│   │   │   ├── search-images.tsx        # Image search results
│   │   │   ├── feedback-widget.tsx      # Message feedback
│   │   │   ├── use-chat-core.ts         # Chat logic hook
│   │   │   ├── use-chat-operations.ts   # Chat operations
│   │   │   ├── use-model.ts             # Model selection
│   │   │   └── use-file-upload.ts       # File upload logic
│   │   │
│   │   ├── chat-input/      # Chat input components
│   │   │   ├── chat-input.tsx           # Main input
│   │   │   ├── button-file-upload.tsx   # Upload button
│   │   │   ├── file-list.tsx            # File preview
│   │   │   ├── suggestions.tsx          # Prompt suggestions
│   │   │   └── button-search.tsx        # Search toggle
│   │   │
│   │   ├── history/         # Chat history sidebar
│   │   │   ├── drawer-history.tsx       # History drawer
│   │   │   ├── command-history.tsx      # History command palette
│   │   │   └── chat-preview-panel.tsx   # Chat preview
│   │   │
│   │   ├── layout/          # Layout components
│   │   │   ├── layout-app.tsx           # Main layout
│   │   │   ├── header.tsx               # Top header
│   │   │   ├── sidebar/                 # Sidebar components
│   │   │   │   ├── app-sidebar.tsx      # Main sidebar
│   │   │   │   ├── sidebar-list.tsx     # Chat list
│   │   │   │   ├── sidebar-item.tsx     # Chat item
│   │   │   │   └── sidebar-project.tsx  # Project section
│   │   │   └── settings/                # Settings components
│   │   │       ├── settings-content.tsx # Settings dialog
│   │   │       ├── general/             # General settings
│   │   │       ├── appearance/          # UI preferences
│   │   │       ├── apikeys/             # BYOK settings
│   │   │       ├── models/              # Model visibility
│   │   │       └── connections/         # Ollama & integrations
│   │   │
│   │   ├── multi-chat/      # Multi-model chat (experimental)
│   │   └── suggestions/     # Prompt suggestions
│   │
│   ├── hooks/               # App-level hooks
│   ├── types/               # App-level types
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   └── layout-client.tsx    # Client-side layout wrapper
│
├── components/              # Shared/reusable components
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── sidebar.tsx
│   │   └── ... (40+ components)
│   │
│   ├── prompt-kit/          # AI-specific components
│   │   ├── chat-container.tsx
│   │   ├── code-block.tsx
│   │   ├── markdown.tsx
│   │   ├── message.tsx
│   │   └── prompt-input.tsx
│   │
│   ├── motion-primitives/   # Animation components
│   │   ├── morphing-dialog.tsx
│   │   ├── morphing-popover.tsx
│   │   └── text-morph.tsx
│   │
│   └── icons/               # Custom icon components
│       ├── anthropic.tsx
│       ├── gemini.tsx
│       ├── mistral.tsx
│       └── ... (provider icons)
│
├── lib/                     # Shared utilities & logic
│   ├── agent-memory.ts      # AI agent memory system
│   ├── agent-memory-examples.ts  # Memory usage examples
│   │
│   ├── chat-store/          # Chat state management
│   │   ├── chats/           # Chat list state
│   │   │   ├── provider.tsx # Zustand provider
│   │   │   └── api.ts       # Chat API functions
│   │   ├── messages/        # Message state
│   │   │   ├── provider.tsx # Message provider
│   │   │   └── api.ts       # Message operations
│   │   ├── session/         # Session state
│   │   ├── persist.ts       # IndexedDB persistence
│   │   └── types.ts         # Store types
│   │
│   ├── model-store/         # Model state management
│   │   ├── provider.tsx     # Model provider
│   │   └── utils.ts         # Model utilities
│   │
│   ├── user-store/          # User state management
│   │   ├── provider.tsx     # User provider
│   │   └── api.ts           # User API
│   │
│   ├── user-preference-store/  # User preferences
│   │   ├── provider.tsx     # Preferences provider
│   │   └── utils.ts         # Preference utilities
│   │
│   ├── models/              # AI model definitions
│   │   ├── index.ts         # Model registry
│   │   ├── types.ts         # Model types
│   │   └── data/            # Model configurations
│   │       ├── openai.ts    # OpenAI models
│   │       ├── claude.ts    # Anthropic models
│   │       ├── gemini.ts    # Google models
│   │       ├── mistral.ts   # Mistral models
│   │       ├── grok.ts      # X.AI models
│   │       ├── perplexity.ts # Perplexity models
│   │       ├── ollama.ts    # Ollama models
│   │       └── openrouter.ts # OpenRouter models
│   │
│   ├── openproviders/       # AI provider management
│   │   ├── index.ts         # Provider factory
│   │   ├── provider-map.ts  # Provider mappings
│   │   ├── types.ts         # Provider types
│   │   └── env.ts           # Environment checks
│   │
│   ├── supabase/            # Supabase utilities
│   │   ├── client.ts        # Client-side Supabase
│   │   ├── server.ts        # Server-side Supabase
│   │   ├── server-guest.ts  # Guest user handling
│   │   └── config.ts        # Supabase config
│   │
│   ├── mcp/                 # Model Context Protocol (WIP)
│   │   ├── load-mcp-from-local.ts
│   │   └── load-mcp-from-url.ts
│   │
│   ├── hooks/               # Shared hooks
│   ├── server/              # Server-side utilities
│   ├── tanstack-query/      # React Query setup
│   ├── providers/           # Provider utilities
│   ├── user/                # User utilities
│   ├── api.ts               # API client
│   ├── config.ts            # App configuration
│   ├── csrf.ts              # CSRF protection
│   ├── encryption.ts        # BYOK encryption
│   ├── fetch.ts             # Fetch wrapper
│   ├── file-handling.ts     # File operations
│   ├── routes.ts            # Route definitions
│   ├── sanitize.ts          # Input sanitization
│   ├── usage.ts             # Usage tracking
│   ├── user-keys.ts         # User key management
│   └── utils.ts             # General utilities
│
├── scripts/
│   └── memory-cli.js        # CLI for agent memory
│
├── public/                  # Static assets
│   ├── banner_*.jpg         # Banner images
│   ├── cover_zola.jpg       # Cover image
│   └── button/              # Button assets
│
├── utils/
│   └── supabase/
│       └── middleware.ts    # Supabase middleware
│
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── .prettierrc.json         # Prettier configuration
├── components.json          # shadcn/ui configuration
├── docker-compose.yml       # Docker Compose config
├── docker-compose.ollama.yml # Docker + Ollama config
├── Dockerfile               # Docker build instructions
├── eslint.config.mjs        # ESLint configuration
├── middleware.ts            # Next.js middleware
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies & scripts
├── postcss.config.mjs       # PostCSS configuration
├── tsconfig.json            # TypeScript configuration
├── AGENT_MEMORY.md          # Agent memory quick reference
├── CODE_OF_CONDUCT.md       # Community guidelines
├── INSTALL.md               # Installation instructions
├── LICENSE                  # Apache 2.0 license
└── README.md                # Project documentation
```

### File Statistics
- **Total TypeScript/TSX files**: 239
- **Total API routes**: 20+
- **UI Components**: 40+ shadcn/ui + custom components
- **State Providers**: 5 (Chats, Messages, Session, User, Preferences)

---

## 🏗 Key Architecture Patterns

### 1. **App Router Pattern** (Next.js 15)
- Server Components by default
- Client Components marked with `"use client"`
- Streaming responses via React Server Components
- Route handlers in `app/api/*/route.ts`

### 2. **State Management Pattern**
```typescript
// Provider hierarchy (from app/layout.tsx):
TanstackQueryProvider
  └─ UserProvider
      └─ ModelProvider
          └─ ChatsProvider
              └─ ChatSessionProvider
                  └─ UserPreferencesProvider
                      └─ ThemeProvider
                          └─ SidebarProvider
```

**State Layers:**
- **Server State**: TanStack Query (API data, caching)
- **Client State**: Zustand stores (UI state, temporary data)
- **Persistent State**: IndexedDB (chat history, offline support)
- **Session State**: React Context (current chat, messages)

### 3. **Data Flow Pattern**
```
User Input → Chat Component → API Route → AI Provider → Streaming Response → UI Update
     ↓                          ↓              ↓              ↓
  Validation            Rate Limiting     Tool Calling    Incremental UI
     ↓                          ↓              ↓              ↓
  Sanitization         CSRF Check        Web Search      Message Store
     ↓                          ↓              ↓              ↓
  File Upload          Auth Check       Code Execution   Database Save
```

### 4. **Component Pattern**
- **Container Components**: Handle logic, state (e.g., `chat-container.tsx`)
- **Presentation Components**: Pure UI (e.g., `message.tsx`)
- **Hook Components**: Custom hooks for logic reuse (e.g., `use-chat-core.ts`)

### 5. **API Route Pattern**
```typescript
// Structure: app/api/[endpoint]/
route.ts     // Next.js route handler (POST, GET, etc.)
api.ts       // Business logic functions
db.ts        // Database operations (Supabase)
utils.ts     // Helper functions
```

### 6. **Provider Pattern**
Each major feature has a provider:
- `ChatsProvider` - Chat list management
- `MessagesProvider` - Message state for current chat
- `ModelProvider` - Available models and selection
- `UserProvider` - User authentication state
- `UserPreferencesProvider` - User settings

---

## ⚡ Core Features

### 1. Multi-Model Support
**Implementation**: `lib/models/` + `lib/openproviders/`

Supported providers:
- OpenAI (GPT-4, GPT-4o, o1, etc.)
- Anthropic (Claude 3.5 Sonnet, Opus, etc.)
- Google (Gemini 1.5 Pro, Flash, etc.)
- Mistral (Mistral Large, Small, etc.)
- X.AI (Grok models)
- Perplexity (Sonar models)
- OpenRouter (aggregator for 200+ models)
- Ollama (local models)

**Model Selection**: Users can switch models mid-conversation.

### 2. Chat Management
**Location**: `app/components/chat/` + `lib/chat-store/`

Features:
- Create new chats
- List all chats in sidebar
- Pin/unpin favorite chats
- Delete chats
- Search chat history
- Organize chats by projects

### 3. Project Organization
**Location**: `app/api/projects/` + sidebar components

- Group related chats into projects
- Create/delete projects
- Move chats between projects

### 4. File Uploads
**Location**: `app/components/chat-input/button-file-upload.tsx`

Supported:
- Images (vision models)
- Documents (text extraction)
- Maximum file size limits
- Rate limiting (5 uploads/day for non-authenticated)

### 5. Web Search Integration
**Location**: `app/api/chat/` with Exa API

- Enable/disable per message
- Real-time search results
- Source citations
- Image search support

### 6. Tool Calling (Function Calling)
**Location**: `app/components/chat/tool-invocation.tsx`

Examples:
- Web search
- Code execution (future)
- GitHub integration
- Custom MCP tools

### 7. BYOK (Bring Your Own Key)
**Location**: `lib/encryption.ts` + `app/api/user-keys/`

- Secure key storage (AES-256-GCM encryption)
- Support for all providers
- Key validation
- Per-user key management

### 8. Guest Mode
**Location**: `app/api/create-guest/`

- Anonymous access (5 messages/day)
- No login required
- Limited model access
- Convert to full account option

### 9. Local AI (Ollama)
**Location**: `lib/models/data/ollama.ts` + Docker Compose

- Automatic model detection
- GPU support
- Model pulling
- Health checks

### 10. Customization
- Custom system prompts
- UI themes (light/dark)
- Layout preferences
- Model visibility settings
- Favorite models

---

## 🌐 API Routes

### Chat & Messaging
- `POST /api/chat` - Stream chat completions (main endpoint)
- `POST /api/create-chat` - Create new chat session
- `POST /api/update-chat-model` - Change chat model
- `POST /api/toggle-chat-pin` - Pin/unpin chat

### Authentication & Users
- `GET /api/csrf` - Get CSRF token
- `POST /api/create-guest` - Create guest user
- `GET /auth/callback` - OAuth callback

### Models & Providers
- `GET /api/models` - Get available models
- `GET /api/providers` - Get provider status

### User Preferences
- `GET/POST /api/user-preferences` - User settings
- `GET/POST /api/user-preferences/favorite-models` - Favorite models

### BYOK
- `GET/POST /api/user-keys` - Manage API keys
- `GET /api/user-key-status` - Check key status

### Projects
- `GET/POST /api/projects` - List/create projects
- `GET/PUT/DELETE /api/projects/[projectId]` - Manage project

### MCP (Model Context Protocol)
- `GET /api/mcp` - List all MCP servers with status
- `POST /api/mcp/register` - Register new MCP server
- `GET /api/mcp/[serverId]` - Get server details
- `PUT /api/mcp/[serverId]` - Update server configuration
- `DELETE /api/mcp/[serverId]` - Unregister server
- `POST /api/mcp/[serverId]/toggle` - Enable/disable server

### System
- `GET /api/health` - Health check
- `GET /api/rate-limits` - Check rate limits

---

## 🔌 MCP (Model Context Protocol) Integration

**NEW FEATURE** - Added in Phase 5

### Overview
Zola now supports Model Context Protocol (MCP), allowing AI models to access external tools and data sources. MCP servers can provide custom tools that become available during chat conversations.

### Architecture

```
lib/mcp/                      # Core MCP library (8 files, 1,310 lines)
├── types.ts                  # Complete type definitions
├── errors.ts                 # Error handling (6 error types)
├── config.ts                 # Configuration + validation
├── client.ts                 # Enhanced client with retry/timeout
├── registry.ts               # Server registry (singleton)
├── load-mcp-from-local.ts    # stdio loader
├── load-mcp-from-url.ts      # SSE loader
└── index.ts                  # Module exports

app/api/mcp/                  # API routes (4 routes)
├── route.ts                  # List servers
├── register/route.ts         # Register server
├── [serverId]/route.ts       # CRUD operations
└── [serverId]/toggle/route.ts # Enable/disable

app/components/mcp/           # UI components (5 components)
├── mcp-tool-badge.tsx        # MCP tool indicator
├── mcp-server-list.tsx       # Server list with status
├── mcp-register-dialog.tsx   # Registration form
├── mcp-manager.tsx           # Main management UI
└── index.ts                  # Component exports

__tests__/unit/mcp/           # Tests (3 files, 64 tests)
├── errors.test.ts            # Error handling tests (19)
├── config.test.ts            # Configuration tests (26)
└── registry.test.ts          # Registry tests (19)
```

### Key Features

1. **Multi-Server Support**: Up to 10 concurrent MCP servers (configurable)
2. **Transport Types**: stdio (local) and SSE (remote)
3. **Robust Error Handling**: Automatic retries, timeouts, graceful degradation
4. **Registry Pattern**: Centralized server lifecycle management
5. **UI Management**: Full CRUD interface with real-time status
6. **Chat Integration**: Tools automatically loaded and available
7. **Comprehensive Testing**: 64 tests covering all scenarios

### Configuration

Default MCP config (overridable via env vars):
```typescript
{
  maxClients: 10,        // Max concurrent servers
  timeout: 30000,        // 30 seconds
  autoReconnect: true,   // Auto-reconnect on failure
  retryAttempts: 3,      // Retry 3 times
  retryDelay: 1000       // 1 second between retries
}
```

Environment variables:
```bash
MCP_MAX_CLIENTS=10
MCP_TIMEOUT=30000
MCP_AUTO_RECONNECT=true
MCP_RETRY_ATTEMPTS=3
MCP_RETRY_DELAY=1000
```

### Usage Examples

**Programmatic:**
```typescript
import { getMCPRegistry, EXAMPLE_MCP_SERVERS } from '@/lib/mcp'

const registry = getMCPRegistry()
await registry.register(EXAMPLE_MCP_SERVERS[0])
const tools = registry.getAllTools()
const stats = registry.getStats()
```

**UI:**
- Settings → MCP Servers
- Click "Add MCP Server"
- Fill form and register
- Toggle enable/disable
- Tools automatically available in chat

**API:**
```bash
# List servers
GET /api/mcp

# Register server
POST /api/mcp/register
{
  "id": "filesystem",
  "name": "Filesystem MCP",
  "description": "Access local files",
  "transport": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "stdio"]
  },
  "enabled": true
}

# Enable/disable
POST /api/mcp/filesystem/toggle
{
  "enabled": true
}
```

### Example MCP Servers

1. **Filesystem**: `npx -y @modelcontextprotocol/server-filesystem stdio`
2. **GitHub**: `npx -y @modelcontextprotocol/server-github stdio`
3. **Fetch**: `npx -y @modelcontextprotocol/server-fetch stdio`
4. **Memory**: `npx -y @modelcontextprotocol/server-memory stdio`

### Chat Integration

MCP tools are automatically loaded in `app/api/chat/route.ts`:

```typescript
// Get MCP tools
const registry = getMCPRegistry()
const mcpTools = registry.getAllTools()

// Pass to AI model
const result = streamText({
  model: modelConfig.apiSdk(apiKey),
  messages,
  tools: mcpTools,  // MCP tools included
  maxSteps: 10,
})
```

Tools are prefixed with server ID to avoid conflicts: `filesystem:read_file`

### Error Types

- `MCPError`: Base error class
- `MCPConnectionError`: Connection failed
- `MCPTransportError`: Transport error
- `MCPToolExecutionError`: Tool execution failed
- `MCPConfigError`: Invalid configuration
- `MCPTimeoutError`: Operation timed out

### Testing

64 comprehensive tests:
- Error handling: 19 tests
- Configuration: 26 tests
- Registry operations: 19 tests

Run tests:
```bash
npm test -- __tests__/unit/mcp/
```

### Documentation

- **Full Guide**: `docs/MCP.md` (12KB)
- **In-line Docs**: JSDoc in all files
- **Examples**: `lib/mcp/config.ts` (EXAMPLE_MCP_SERVERS)

### Statistics

- **Total Code**: 2,959 lines (lib + API + UI + tests)
- **Core Library**: 1,310 lines
- **API Routes**: 911 lines
- **Tests**: 738 lines
- **Tests**: 64 (100% passing)
- **Files**: 21 new files

---

## 🗄 Database Schema

**Platform**: Supabase (PostgreSQL)

### Tables

#### `users`
```sql
id UUID PRIMARY KEY (FK to auth.users)
email TEXT NOT NULL
anonymous BOOLEAN
display_name TEXT
profile_image TEXT
system_prompt TEXT
daily_message_count INTEGER
daily_reset TIMESTAMPTZ
daily_pro_message_count INTEGER
daily_pro_reset TIMESTAMPTZ
message_count INTEGER
premium BOOLEAN
favorite_models TEXT[]
created_at TIMESTAMPTZ
last_active_at TIMESTAMPTZ
```

#### `projects`
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
user_id UUID (FK to users)
created_at TIMESTAMPTZ
```

#### `chats`
```sql
id UUID PRIMARY KEY
user_id UUID (FK to users)
project_id UUID (FK to projects, nullable)
title TEXT
model TEXT
pinned BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

#### `messages`
```sql
id UUID PRIMARY KEY
chat_id UUID (FK to chats)
user_id UUID (FK to users)
role TEXT (user/assistant/system/tool)
content TEXT
attachments JSONB[]
sources JSONB[]
tool_invocations JSONB[]
created_at TIMESTAMPTZ
```

#### `user_keys` (Encrypted)
```sql
id UUID PRIMARY KEY
user_id UUID (FK to users)
provider TEXT (openai, anthropic, etc.)
encrypted_key TEXT
iv TEXT (initialization vector)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Storage Buckets
- `chat_attachments` - User-uploaded files

---

## 🧠 State Management

### Zustand Stores

#### 1. **Chats Store** (`lib/chat-store/chats/`)
```typescript
interface ChatsStore {
  chats: Chat[]
  isLoading: boolean
  error: string | null
  
  // Actions
  addChat: (chat: Chat) => void
  updateChat: (id: string, updates: Partial<Chat>) => void
  deleteChat: (id: string) => void
  fetchChats: () => Promise<void>
  togglePin: (id: string) => void
}
```

#### 2. **Messages Store** (`lib/chat-store/messages/`)
```typescript
interface MessagesStore {
  messages: Message[]
  isLoading: boolean
  
  // Actions
  addMessage: (message: Message) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  deleteMessage: (id: string) => void
  clearMessages: () => void
  setMessages: (messages: Message[]) => void
}
```

#### 3. **Model Store** (`lib/model-store/`)
```typescript
interface ModelStore {
  models: ModelConfig[]
  selectedModel: string
  
  // Actions
  setModels: (models: ModelConfig[]) => void
  selectModel: (modelId: string) => void
  getModel: (id: string) => ModelConfig | undefined
}
```

#### 4. **User Store** (`lib/user-store/`)
```typescript
interface UserStore {
  user: User | null
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
}
```

#### 5. **User Preferences Store** (`lib/user-preference-store/`)
```typescript
interface UserPreferencesStore {
  preferences: UserPreferences
  
  // Actions
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  setSystemPrompt: (prompt: string) => void
  setFavoriteModels: (models: string[]) => void
}
```

### Persistence

**IndexedDB** via `idb-keyval`:
- Chat history (offline access)
- Message cache
- Draft messages
- User preferences backup

**Implementation**: `lib/chat-store/persist.ts`

---

## 🤖 AI/ML Integration

### Vercel AI SDK Architecture

**Core Pattern**:
```typescript
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

// In API route:
const result = streamText({
  model: openai('gpt-4o'),
  messages: [...],
  tools: {
    web_search: tool({...}),
    // other tools
  }
})

return result.toDataStreamResponse()
```

### Provider Implementation

**File**: `lib/openproviders/index.ts`

```typescript
export function getProviderModel(
  modelId: string,
  apiKey?: string
): LanguageModelV1 {
  const provider = getProviderForModel(modelId)
  
  switch(provider) {
    case 'openai':
      return openai(modelId, { apiKey })
    case 'anthropic':
      return anthropic(modelId, { apiKey })
    // ... other providers
  }
}
```

### Model Configuration

**File**: `lib/models/index.ts`

Each model has:
```typescript
{
  id: "gpt-4o",
  name: "GPT-4o",
  provider: "OpenAI",
  providerId: "openai",
  baseProviderId: "openai",
  contextWindow: 128000,
  inputCost: 2.50,
  outputCost: 10.00,
  vision: true,
  tools: true,
  speed: "Fast",
  intelligence: "High",
  apiSdk: (apiKey) => openai("gpt-4o", { apiKey })
}
```

### Streaming Response

**Pattern**:
1. Client sends POST to `/api/chat`
2. Server validates request (auth, rate limits, CSRF)
3. Server streams response via `streamText()`
4. Client receives incremental updates via `useChat()` hook
5. UI updates in real-time

### Tool Calling

**Example**: Web search tool
```typescript
tools: {
  web_search: tool({
    description: 'Search the web for current information',
    parameters: z.object({
      query: z.string(),
    }),
    execute: async ({ query }) => {
      const results = await exa.search(query)
      return results
    }
  })
}
```

---

## 🔐 Authentication & Security

### Authentication
**Provider**: Supabase Auth

**Methods**:
- Google OAuth
- Guest/Anonymous sign-in
- Email/Password (configurable)

**Flow**:
1. User clicks "Sign in with Google"
2. Redirects to `/auth` → Supabase OAuth
3. Callback to `/auth/callback`
4. Session created, user profile loaded
5. Redirect to app

### Security Features

#### 1. **CSRF Protection**
**File**: `lib/csrf.ts` + `middleware.ts`

- Token generation: `GET /api/csrf`
- Validation on all state-changing requests (POST, PUT, DELETE)
- Token stored in cookie + sent in header

#### 2. **Content Security Policy**
**File**: `middleware.ts`

- Strict CSP headers
- Allowed domains for scripts, styles, images
- WebSocket support for streaming
- Different policies for dev/prod

#### 3. **Rate Limiting**
**File**: `app/api/rate-limits/`

Limits:
- Non-authenticated: 5 messages/day
- Authenticated: 1000 messages/day
- Pro models: 500 messages/day
- File uploads: 5/day

#### 4. **Input Sanitization**
**File**: `lib/sanitize.ts`

- DOMPurify for HTML
- Message length limits (10,000 chars)
- File type validation
- SQL injection prevention (via Supabase parameterized queries)

#### 5. **BYOK Encryption**
**File**: `lib/encryption.ts`

- Algorithm: AES-256-GCM
- Key derivation: PBKDF2
- Unique IV per key
- Server-side encryption only
- Environment variable: `ENCRYPTION_KEY`

---

## 💻 Development Workflow

### Setup
```bash
# Clone repository
git clone https://github.com/ibelick/zola.git
cd zola

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

### Scripts
```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "memory:summary": "node scripts/memory-cli.js summary",
  "memory:chats": "node scripts/memory-cli.js chats",
  "memory:mods": "node scripts/memory-cli.js mods",
  "memory:sessions": "node scripts/memory-cli.js sessions"
}
```

### Development Server
- **URL**: http://localhost:3000
- **Turbopack**: Enabled by default (faster than Webpack)
- **Hot Reload**: Automatic

### Building
```bash
# Development build
npm run build

# Production build (with optimizations)
NODE_ENV=production npm run build

# Analyze bundle size
ANALYZE=true npm run build
```

### Linting & Type Checking
```bash
# Run ESLint
npm run lint

# Type check
npm run type-check

# Format with Prettier
npx prettier --write .
```

### Docker Development
```bash
# Build image
docker build -t zola .

# Run with Ollama
docker-compose -f docker-compose.ollama.yml up
```

---

## ⚙️ Configuration Files

### `next.config.ts`
- Bundle analyzer
- Image optimization
- External packages (shiki)
- Experimental features

### `tsconfig.json`
- Path aliases: `@/*`
- Strict mode enabled
- Target: ES2017

### `tailwind.config.ts` (implicit via Tailwind 4)
- Custom colors (via CSS variables)
- Typography plugin
- Animation utilities

### `components.json` (shadcn/ui)
- Component aliases
- Style configuration
- Tailwind CSS setup

### `.env.example`
All required environment variables with descriptions

---

## 🔌 Third-Party Integrations

### 1. **Supabase**
- Auth, Database, Storage
- Row-level security (RLS)
- Real-time subscriptions (optional)

### 2. **Exa (Web Search)**
- API key: `EXA_API_KEY`
- Used for web_search tool
- Returns relevant web results + images

### 3. **GitHub API**
- Token: `GITHUB_TOKEN`
- Code search functionality
- Repository access

### 4. **Ollama**
- Base URL: `OLLAMA_BASE_URL`
- Local model inference
- Automatic model detection

### 5. **Analytics** (Optional)
- Umami Analytics (if configured)
- OneDollarStats (if official deployment)

---

## 📚 Key Files Reference

### Must-Read Files (Start Here)
1. `README.md` - Project overview
2. `INSTALL.md` - Setup instructions
3. `app/layout.tsx` - App structure
4. `app/page.tsx` - Home page
5. `lib/config.ts` - Configuration constants
6. `lib/models/index.ts` - Model registry

### Core Logic Files
1. `app/api/chat/route.ts` - Main chat endpoint (135 lines)
2. `app/components/chat/chat.tsx` - Chat UI (269 lines)
3. `app/components/chat/use-chat-core.ts` - Chat logic hook
4. `lib/openproviders/index.ts` - Provider factory
5. `lib/chat-store/messages/provider.tsx` - Message state

### Important Utilities
1. `lib/csrf.ts` - CSRF protection
2. `lib/encryption.ts` - BYOK encryption
3. `lib/sanitize.ts` - Input sanitization
4. `lib/file-handling.ts` - File operations
5. `lib/user-keys.ts` - User key management

### Configuration
1. `.env.example` - All environment variables
2. `next.config.ts` - Next.js config
3. `middleware.ts` - Security middleware
4. `package.json` - Dependencies

---

## 🧠 Agent Memory System

### Overview
Custom AI agent memory system for tracking interactions and file changes across sessions.

### Location
- Storage: `.agent-memory/`
- Library: `lib/agent-memory.ts`
- CLI: `scripts/memory-cli.js`
- Docs: `AGENT_MEMORY.md`

### Files
```
.agent-memory/
├── config.json              # Memory settings
├── sessions.json            # Chat history
├── file-modifications.json  # File changes
└── README.md               # Documentation
```

### Usage (TypeScript)
```typescript
import {
  logChat,
  logFileModification,
  getMemorySummary,
  getRecentChats,
  getRecentModifications,
} from '@/lib/agent-memory'

// Log interaction
logChat('User question', 'Agent response', ['action1', 'action2'])

// Log file change
logFileModification(
  'path/to/file.ts',
  'modify',
  '10-20',
  'Updated function logic'
)

// Get summary
const summary = getMemorySummary()
```

### CLI Commands
```bash
# View memory summary
npm run memory:summary

# View recent chats
npm run memory:chats

# View file modifications
npm run memory:mods

# List sessions
npm run memory:sessions
```

### Features
- Persistent JSON storage
- Session tracking
- File modification history
- Chat interaction logs
- Configurable history limits
- CLI tool for inspection

---

## 📊 Statistics

### Codebase Size
- **TypeScript/TSX files**: 239
- **React components**: 100+
- **API routes**: 20+
- **Lines of code**: ~25,000+ (estimated)

### Dependencies
- **Production**: 40+ packages
- **Dev dependencies**: 15+ packages
- **Core frameworks**: Next.js 15, React 19, TypeScript 5

### Performance
- **Bundle size**: Optimized with code splitting
- **First load**: < 100KB (gzipped)
- **Streaming**: Real-time response chunks
- **Caching**: TanStack Query + IndexedDB

---

## 🎯 Key Design Principles

1. **Multi-model First**: Support any AI provider easily
2. **User Control**: BYOK, custom prompts, model selection
3. **Privacy-Focused**: Local storage option, encrypted keys
4. **Developer-Friendly**: Clear structure, TypeScript, documented
5. **Performance**: Streaming, code splitting, caching
6. **Extensible**: Plugin architecture, MCP support (WIP)
7. **Self-Hostable**: Docker, Vercel, or custom deployment

---

## 🚀 Common Tasks

### Add a New AI Model
1. Add model config to `lib/models/data/[provider].ts`
2. Export from `lib/models/index.ts`
3. Ensure provider SDK is in `lib/openproviders/`
4. Test model selection in UI

### Add a New API Route
1. Create `app/api/[endpoint]/route.ts`
2. Implement handler (GET, POST, etc.)
3. Add types to `app/api/[endpoint]/api.ts`
4. Add CSRF protection if needed
5. Update `lib/routes.ts` if exposing to client

### Add a New UI Component
1. Create component in appropriate folder
2. Use shadcn/ui primitives when possible
3. Add to Storybook (if applicable)
4. Document props with TypeScript
5. Add to exports if shared component

### Modify Database Schema
1. Update Supabase schema via SQL editor
2. Update TypeScript types
3. Update API routes that query table
4. Test with migrations

---

## 📝 Notes for AI Agents

### When Making Changes
1. **Always check existing patterns** before adding new ones
2. **Use existing utilities** (lib/utils.ts, lib/fetch.ts, etc.)
3. **Follow TypeScript strictly** - no `any` types
4. **Update agent memory** - use `logFileModification()`
5. **Test incrementally** - small changes, verify each step
6. **Preserve working code** - don't break existing features
7. **Use the memory system** - check past changes before modifying

### File Creation Guidelines
1. Use absolute paths with `@/` alias
2. Follow existing naming conventions (kebab-case for files)
3. Place files in appropriate folders (see structure above)
4. Add TypeScript types for all functions
5. Document complex logic with comments

### Testing Approach
1. Run `npm run type-check` after changes
2. Run `npm run lint` to check style
3. Test in browser (npm run dev)
4. Check console for errors
5. Verify database operations in Supabase dashboard

---

## 🔍 Debugging Tips

### Common Issues

**1. Build Errors**
```bash
# Clear cache
rm -rf .next
npm run build
```

**2. Type Errors**
```bash
# Check types
npm run type-check

# Look for any types
grep -r "any" --include="*.ts" --include="*.tsx"
```

**3. API Issues**
- Check Network tab in DevTools
- Verify environment variables
- Check Supabase logs
- Verify CSRF token

**4. State Issues**
- Check Zustand DevTools
- Inspect React DevTools
- Check IndexedDB (Application tab)

---

## 📖 Additional Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Vercel AI SDK: https://sdk.vercel.ai/docs
- Supabase: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs

### External Links
- GitHub: https://github.com/ibelick/zola
- Website: https://zola.chat
- License: Apache 2.0

---

**Last Updated**: 2025-10-14  
**Document Version**: 1.0  
**Maintained By**: AI Agent + Human Developers

---

*This document is maintained by the AI agent memory system and updated automatically when significant changes are made to the codebase.*
