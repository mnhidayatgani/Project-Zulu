# Project Zulu

> An enhanced, production-ready AI chat interface with advanced features

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

**Project Zulu** is a standalone AI chat interface built on top of [Zola](https://github.com/ibelick/zola) by Julien Thibeaut. This fork includes extensive enhancements, new features, and production-ready optimizations developed with the assistance of AI tooling (Claude).

![Cover](./public/cover_zola.jpg)

---

## 🎯 About This Project

Project Zulu started as a fork of the excellent Zola project and has evolved into a comprehensive AI chat platform with:

- **Enhanced stability** and production-ready code
- **Advanced authentication** with multiple providers
- **MCP (Model Context Protocol)** integration
- **Comprehensive analytics** and tool management
- **Extensive testing** infrastructure
- **Better documentation** and developer experience

---

## ✨ Key Enhancements Over Original

### 🔐 Authentication & Security
- ✅ Email/Password authentication
- ✅ Google OAuth integration  
- ✅ Guest mode with limitations
- ✅ Password reset functionality
- ✅ Secure session management
- ✅ CSRF protection
- ✅ Rate limiting

### 🔧 MCP (Model Context Protocol)
- ✅ Full MCP server support
- ✅ Tool categorization (11 categories)
- ✅ Usage analytics dashboard
- ✅ WebSocket transport (foundation)
- ✅ Local & remote MCP servers
- ✅ Tool discovery and management

### 📊 Analytics & Insights
- ✅ Tool usage tracking
- ✅ Success rate monitoring
- ✅ Server health metrics
- ✅ Category distribution charts
- ✅ Data export (JSON/CSV)
- ✅ Time-based filtering

### 🐛 Bug Fixes & Stability
- ✅ Fixed critical TypeScript errors
- ✅ Improved error handling
- ✅ Better loading states
- ✅ Enhanced form validation
- ✅ Memory leak fixes
- ✅ Performance optimizations

### 📚 Documentation
- ✅ Comprehensive setup guides
- ✅ API documentation
- ✅ Troubleshooting guides
- ✅ Authentication tutorials
- ✅ MCP integration guide
- ✅ Developer workflow docs

### 🧪 Testing
- ✅ Jest configuration
- ✅ React Testing Library setup
- ✅ Unit test infrastructure
- ✅ Component testing
- ✅ Integration testing
- ✅ CI/CD ready

---

## 🚀 Features

### Core Features (from Original Zola)
- **Multi-model support**: OpenAI, Anthropic, Google, Mistral, Perplexity, X.AI
- **BYOK support**: Bring your own API keys
- **Local AI**: Ollama integration
- **File uploads**: Images and documents
- **Web search**: Integrated search with Exa
- **Projects**: Organize chats into projects
- **Responsive UI**: Light/dark themes, mobile-friendly

### New Features in Zulu
- **MCP Integration**: Add custom tools via Model Context Protocol
- **Tool Categories**: Organized tool management with 11 categories
- **Analytics Dashboard**: Track usage, success rates, and performance
- **Enhanced Auth**: Multiple authentication methods
- **Guest Mode**: Try without signup (with limits)
- **Better Error Handling**: Comprehensive error messages and recovery
- **Performance**: Optimized loading and rendering

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm/pnpm/yarn
- Supabase account (for database)
- API keys for AI providers

### Quick Start

```bash
# Clone the repository
git clone https://github.com/mnhidayatgani/zulu.git
cd zulu

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your keys
# - Supabase credentials
# - AI provider API keys
# - Other configuration

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Detailed Setup

See [INSTALL.md](./INSTALL.md) for comprehensive installation instructions.

---

## 🔑 Environment Variables

Key environment variables needed:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# AI Providers (at least one required)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key

# Optional
EXA_API_KEY=your_exa_key  # For web search
GITHUB_TOKEN=your_github_token  # For code search
ENCRYPTION_KEY=your_encryption_key  # For BYOK
```

See `.env.example` for complete list.

---

## 🎯 Usage

### Basic Chat
1. Open the app and sign in (or use guest mode)
2. Select an AI model from the sidebar
3. Start chatting!

### MCP Tools
1. Go to Settings → Developer Tools → MCP
2. Add an MCP server (e.g., filesystem, GitHub, fetch)
3. Enable the server
4. Tools will be available in chat automatically

### Analytics
1. Go to Settings → Developer Tools → MCP
2. Click the "Analytics" tab
3. View tool usage, success rates, and performance metrics
4. Export data as needed

---

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI**: Vercel AI SDK
- **State**: Zustand, TanStack Query
- **Testing**: Jest, React Testing Library

### Key Directories
```
zulu/
├── app/              # Next.js app router
│   ├── api/          # API routes
│   ├── components/   # App-specific components
│   └── auth/         # Authentication pages
├── components/       # Shared UI components
├── lib/              # Utilities and logic
│   ├── mcp/          # MCP integration
│   ├── models/       # AI model definitions
│   └── supabase/     # Database client
└── __tests__/        # Test files
```

---

## 🤝 Credits

### Original Project
This project is built upon [Zola](https://github.com/ibelick/zola) created by:
- **Julien Thibeaut** ([@ibelick](https://github.com/ibelick))

Zola provided the excellent foundation for this project, including the core chat interface, multi-model support, and clean architecture.

### Project Zulu Development
Enhanced and extended by:
- **Your Name** - Project lead and development
- **Claude (Anthropic)** - AI assistant for development, bug fixes, and feature implementation

Major contributions include:
- MCP integration and tool management
- Analytics dashboard and tracking
- Enhanced authentication system
- Comprehensive testing infrastructure
- Bug fixes and stability improvements
- Documentation and guides

### Open Source Libraries
This project uses many excellent open source libraries. See [package.json](./package.json) for the complete list.

Key dependencies:
- Next.js, React, TypeScript
- Vercel AI SDK
- Supabase
- shadcn/ui, Radix UI
- And many more...

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

**Original work**: Copyright © Julien Thibeaut  
**Modifications and enhancements**: Copyright © 2025 Muhammad Nurhidayat Gani

---

## 🙏 Acknowledgments

- **Julien Thibeaut** for creating Zola and providing a solid foundation
- **Anthropic** for Claude, which assisted in development and bug fixes
- **Vercel** for the AI SDK and deployment platform
- **Supabase** for the excellent backend platform
- All the open source contributors whose libraries made this possible

---

## 📞 Support

- **Documentation**: See the [docs](./docs) folder
- **Issues**: [GitHub Issues](https://github.com/mnhidayatgani/zulu/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mnhidayatgani/zulu/discussions)

---

## 🚦 Status

- ✅ **Production Ready**: Core features stable
- ✅ **Active Development**: New features being added
- ✅ **Maintained**: Regular updates and bug fixes

---

## 🗺️ Roadmap

### Completed
- ✅ MCP integration
- ✅ Tool categorization
- ✅ Analytics dashboard
- ✅ Enhanced authentication
- ✅ Testing infrastructure

### In Progress
- 🚧 WebSocket MCP support
- 🚧 Advanced analytics
- 🚧 Performance optimizations

### Planned
- 📋 Voice input support
- 📋 Chat export functionality
- 📋 Real-time collaboration
- 📋 Plugin system
- 📋 Mobile apps

---

## 💖 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ using Zola as foundation**
