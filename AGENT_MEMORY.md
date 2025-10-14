# Agent Memory System - Quick Reference

## 📁 Files Created

```
.agent-memory/
├── config.json                    # Memory system configuration
├── sessions.json                  # Chat history across sessions
├── file-modifications.json        # File change tracking
└── README.md                     # Full documentation

lib/
├── agent-memory.ts               # Core TypeScript API
└── agent-memory-examples.ts      # Integration examples

scripts/
└── memory-cli.js                 # Command-line tool
```

## 🚀 Quick Start

### View Memory Summary
```bash
node scripts/memory-cli.js summary
```

### View Recent Chats
```bash
node scripts/memory-cli.js chats 10
```

### View Recent File Changes
```bash
node scripts/memory-cli.js mods 20
```

## 💻 TypeScript Usage

```typescript
import { logChat, logFileModification, getMemorySummary } from '@/lib/agent-memory';

// Log a chat
logChat('User question', 'Agent response', ['action1', 'action2']);

// Log file change
logFileModification('path/to/file.ts', 'modify', '10-20', 'Updated function');

// Get summary
const summary = getMemorySummary();
```

## 📊 What's Tracked

### Chat Sessions
- ✅ User inputs and agent responses
- ✅ Timestamps for each interaction
- ✅ Actions taken during conversation
- ✅ Session start/end times

### File Modifications
- ✅ File paths and modification type (create/modify/delete)
- ✅ Line numbers affected
- ✅ Change descriptions
- ✅ Timestamps and session IDs

## 🔧 Configuration

Edit `.agent-memory/config.json`:
```json
{
  "settings": {
    "maxChatHistory": 100,      // Max chats per session
    "maxFileHistory": 500,      // Max file modifications
    "autoLog": true,            // Enable auto-logging
    "logLevel": "info"          // Logging verbosity
  }
}
```

## 📝 Current Session

**Session ID**: `session_20251014_201804`
**Files Modified**: 8
**Chats Logged**: 2

## 🎯 Features

- **Persistent Storage**: JSON-based, survives restarts
- **Automatic Logging**: Integrated into workflows
- **Easy Access**: CLI tool + TypeScript API
- **Configurable**: Limits and settings adjustable
- **Privacy-Friendly**: Local storage only

## 🛠️ NPM Scripts (Add to package.json)

```json
{
  "scripts": {
    "memory:summary": "node scripts/memory-cli.js summary",
    "memory:chats": "node scripts/memory-cli.js chats",
    "memory:mods": "node scripts/memory-cli.js mods"
  }
}
```

## 📚 Documentation

Full documentation: `.agent-memory/README.md`
Examples: `lib/agent-memory-examples.ts`
