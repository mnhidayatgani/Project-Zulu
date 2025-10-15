# Agent Memory System

This directory contains persistent storage for the AI agent's memory, tracking file modifications and chat sessions across interactions.

## Structure

```
.agent-memory/
├── config.json              # Configuration settings
├── sessions.json            # Chat session history
├── file-modifications.json  # File change tracking
└── README.md               # This file
```

## Files

### config.json
Configuration for memory system behavior:
- `maxChatHistory`: Maximum number of chats to keep per session (default: 100)
- `maxFileHistory`: Maximum number of file modifications to track (default: 500)
- `autoLog`: Enable automatic logging (default: true)
- `logLevel`: Logging verbosity level

### sessions.json
Records all chat interactions:
- Session ID and timestamps
- User inputs and agent responses
- Actions taken during each interaction
- Session start/end times

### file-modifications.json
Tracks all file changes made by the agent:
- File path and modification type (create/modify/delete)
- Line numbers affected
- Description of changes
- Timestamp and session ID

## Usage

### TypeScript API
```typescript
import {
  logChat,
  logFileModification,
  getRecentChats,
  getRecentModifications,
  getMemorySummary,
  endSession
} from '@/lib/agent-memory';

// Log a chat interaction
logChat(
  'User question',
  'Agent response',
  ['action1', 'action2']
);

// Log a file modification
logFileModification(
  'path/to/file.ts',
  'modify',
  '10-25',
  'Updated function logic'
);

// Get recent history
const chats = getRecentChats(10);
const mods = getRecentModifications(20);
const summary = getMemorySummary();
```

### CLI Tool
```bash
# Show memory summary
node scripts/memory-cli.js summary

# View recent chats
node scripts/memory-cli.js chats 10

# View recent modifications
node scripts/memory-cli.js mods 20

# List all sessions
node scripts/memory-cli.js sessions

# Show help
node scripts/memory-cli.js help
```

## Features

- **Persistent Storage**: All interactions and changes are saved to disk
- **Session Management**: Automatic session creation and tracking
- **History Limits**: Configurable limits to prevent unbounded growth
- **Easy Access**: TypeScript API and CLI tool for querying history
- **Automatic Logging**: Integrates seamlessly with agent workflows

## Privacy & Security

- Memory files are stored locally in the project directory
- Can be excluded from version control via `.gitignore`
- Contains interaction history and file change logs
- To clear all memory: `rm -rf .agent-memory`

## Integration

The memory system is designed to be called automatically during agent operations:
1. Chat interactions are logged after each response
2. File modifications are logged after each file operation
3. Sessions are managed automatically (start/end)
4. History is trimmed automatically based on config limits

## Maintenance

- Memory files grow over time - monitor size periodically
- Old sessions can be archived or cleared manually
- Configuration can be adjusted in `config.json`
- Use CLI tool to inspect and manage memory data
