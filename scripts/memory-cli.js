#!/usr/bin/env node

/**
 * Agent Memory CLI Tool
 * Usage: node scripts/memory-cli.js [command]
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(process.cwd(), '.agent-memory');
const SESSIONS_FILE = path.join(MEMORY_DIR, 'sessions.json');
const MODIFICATIONS_FILE = path.join(MEMORY_DIR, 'file-modifications.json');

function readJSON(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
  return defaultValue;
}

function showHelp() {
  console.log(`
Agent Memory CLI Tool
---------------------
Usage: node scripts/memory-cli.js [command]

Commands:
  summary              Show memory summary
  chats [limit]        Show recent chats (default: 10)
  mods [limit]         Show recent modifications (default: 20)
  sessions             List all sessions
  clear                Clear all memory (use with caution!)
  help                 Show this help message

Examples:
  node scripts/memory-cli.js summary
  node scripts/memory-cli.js chats 5
  node scripts/memory-cli.js mods 10
  `);
}

function showSummary() {
  const sessionsData = readJSON(SESSIONS_FILE, { sessions: [], lastUpdated: '' });
  const modificationsData = readJSON(MODIFICATIONS_FILE, { modifications: [], lastUpdated: '' });
  
  const totalChats = sessionsData.sessions.reduce((sum, s) => sum + s.chats.length, 0);
  const currentSession = sessionsData.sessions.find(s => s.endTime === null);
  
  console.log('\n=== Agent Memory Summary ===\n');
  console.log(`Total Sessions: ${sessionsData.sessions.length}`);
  console.log(`Total Chats: ${totalChats}`);
  console.log(`Total File Modifications: ${modificationsData.modifications.length}`);
  console.log(`Current Session: ${currentSession ? currentSession.sessionId : 'None'}`);
  console.log(`Last Updated: ${sessionsData.lastUpdated || 'Never'}\n`);
}

function showChats(limit = 10) {
  const sessionsData = readJSON(SESSIONS_FILE, { sessions: [], lastUpdated: '' });
  
  const allChats = [];
  for (let i = sessionsData.sessions.length - 1; i >= 0 && allChats.length < limit; i--) {
    const session = sessionsData.sessions[i];
    for (let j = session.chats.length - 1; j >= 0 && allChats.length < limit; j--) {
      allChats.unshift({ ...session.chats[j], sessionId: session.sessionId });
    }
  }
  
  console.log(`\n=== Recent Chats (${Math.min(limit, allChats.length)}) ===\n`);
  allChats.slice(-limit).forEach((chat, i) => {
    console.log(`[${i + 1}] ${chat.timestamp}`);
    console.log(`Session: ${chat.sessionId}`);
    console.log(`User: ${chat.userInput.substring(0, 100)}${chat.userInput.length > 100 ? '...' : ''}`);
    console.log(`Agent: ${chat.agentResponse.substring(0, 100)}${chat.agentResponse.length > 100 ? '...' : ''}`);
    console.log(`Actions: ${chat.actionsTaken.join(', ')}`);
    console.log('---');
  });
  console.log();
}

function showModifications(limit = 20) {
  const modificationsData = readJSON(MODIFICATIONS_FILE, { modifications: [], lastUpdated: '' });
  
  console.log(`\n=== Recent File Modifications (${Math.min(limit, modificationsData.modifications.length)}) ===\n`);
  modificationsData.modifications.slice(-limit).forEach((mod, i) => {
    console.log(`[${i + 1}] ${mod.timestamp}`);
    console.log(`File: ${mod.file}`);
    console.log(`Action: ${mod.action}`);
    console.log(`Lines: ${mod.lines}`);
    console.log(`Description: ${mod.description}`);
    console.log(`Session: ${mod.sessionId}`);
    console.log('---');
  });
  console.log();
}

function showSessions() {
  const sessionsData = readJSON(SESSIONS_FILE, { sessions: [], lastUpdated: '' });
  
  console.log(`\n=== All Sessions (${sessionsData.sessions.length}) ===\n`);
  sessionsData.sessions.forEach((session, i) => {
    console.log(`[${i + 1}] ${session.sessionId}`);
    console.log(`Start: ${session.startTime}`);
    console.log(`End: ${session.endTime || 'Active'}`);
    console.log(`Chats: ${session.chats.length}`);
    console.log('---');
  });
  console.log();
}

function clearMemory() {
  console.log('\n⚠️  WARNING: This will delete all memory data!');
  console.log('Are you sure? This action cannot be undone.');
  console.log('To confirm, run: rm -rf .agent-memory\n');
}

// Main
const command = process.argv[2] || 'help';
const arg = parseInt(process.argv[3]) || undefined;

switch (command) {
  case 'summary':
    showSummary();
    break;
  case 'chats':
    showChats(arg || 10);
    break;
  case 'mods':
  case 'modifications':
    showModifications(arg || 20);
    break;
  case 'sessions':
    showSessions();
    break;
  case 'clear':
    clearMemory();
    break;
  case 'help':
  default:
    showHelp();
    break;
}
