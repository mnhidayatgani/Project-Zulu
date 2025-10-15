# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2025-10-15

### Added - Phase 5C & 5D: MCP Advanced Features

#### 🔌 WebSocket Real-time Implementation
- Full JSON-RPC 2.0 over WebSocket protocol support
- 5-state connection management (disconnected/connecting/connected/reconnecting/error)
- Auto-reconnection with exponential backoff (1s → 30s)
- Heartbeat/ping-pong mechanism (30s interval)
- Connection manager for multiple servers
- Real-time status indicators component
- Connection health monitoring

#### 🔍 Server Discovery & Marketplace
- Public server registry with 8 curated MCP servers
- Discovery engine with multi-criteria filtering
- Search by name, description, and tags
- Category filtering (Development, Productivity, Data, Search, Communication)
- Sort options (popularity, rating, recent, name)
- Smart recommendations algorithm
- Marketplace UI with tabs (Browse, Installed, Recommended)
- One-click server installation

#### ⭐ Tool Favorites & Bookmarks
- Add/remove favorites with star icon
- Quick access bar (up to 8 tools)
- Organize into collections (up to 20)
- Sort by name, recent, popular, added date
- Search across favorites
- View usage statistics
- Export/import collections
- Share collections with share codes
- LocalStorage persistence with auto-sync

#### 🔎 Advanced Search & Filtering
- Full-text fuzzy search with scoring (Levenshtein distance)
- Multi-criteria filtering (providers, categories, tags)
- Advanced filter panel with 10+ options
- Search history (last 50 searches)
- Saved searches (up to 20)
- Recent & popular search suggestions
- Search result highlighting
- Sort by relevance, name, rating, popularity, recent

#### 📜 Tool Execution History
- Track all tool executions with full details
- Execution status tracking (success/error/pending/cancelled)
- Input/output recording with error stack traces
- Duration measurement (milliseconds)
- Re-run previous executions
- Execution filtering and search
- Export to JSON/CSV and import logs
- Statistics dashboard with analytics
- Success rate, average duration, most used tools
- Up to 500 execution records with auto-trim

#### 🎨 UI/UX Improvements
- 6 comprehensive tabs in MCP Manager (Servers, Tools, Marketplace, History, Analytics, About)
- Favorites bar integrated in Tools tab
- Advanced search toggle (simple ↔ advanced)
- Enhanced tool cards with favorite buttons
- Connection indicators on server list
- Responsive layouts with smooth animations
- Dark mode support for all new components

### Technical Details
- 18 new files created (~177KB production code)
- 100+ utility functions
- 20+ React components
- 3 new API routes
- Zero build errors, TypeScript strict mode
- Client-side processing with LocalStorage persistence
- Event-driven architecture for real-time updates

### Components Added
- `MCPConnectionIndicator` - Real-time connection status
- `MCPServerStatus` - Server health monitoring
- `MCPMarketplace` - Server discovery UI
- `MCPMarketplaceCard` - Server listing card
- `MCPFavoritesBar` - Quick access favorites
- `MCPFavoritesDialog` - Favorites management
- `MCPAdvancedSearch` - Advanced filter panel
- `MCPExecutionHistory` - History tracking UI
- `MCPExecutionLogItem` - Execution log display

### Libraries Added
- `lib/mcp/websocket-client.ts` - WebSocket JSON-RPC client
- `lib/mcp/connection-manager.ts` - Multi-server connection management
- `lib/mcp/discovery.ts` - Server discovery engine
- `lib/mcp/favorites.ts` - Favorites management
- `lib/mcp/search.ts` - Advanced search algorithms
- `lib/mcp/execution-history.ts` - History tracking

### API Routes Added
- `POST /api/mcp/discover` - Server discovery
- `GET/POST /api/mcp/favorites` - Favorites management
- `GET/POST /api/mcp/history` - Execution history

### Authentication & Core Features
- Enhanced authentication system with email/password and Google OAuth
- Password reset functionality
- Comprehensive authentication documentation
- CREDITS.md for proper attribution
- CHANGELOG.md for tracking changes
- REFACTORING_PLAN.md for development roadmap

### Fixed
- Server-side authentication errors
- Image component configuration
- Error handling improvements
- WebSocket connection stability

### Changed
- Improved login page with tabbed interface
- Enhanced error messages
- Better loading states
- Optimized MCP Manager with 6 tabs (was 4)

### Security
- Fixed CSRF protection
- Improved session management
- Added proper input validation
- Secure WebSocket connections

---

## [0.1.0] - 2025-10-15

### Initial Fork
- Forked from [ibelick/zola](https://github.com/ibelick/zola)
- Established as independent project
- Set foundation for enhancements

