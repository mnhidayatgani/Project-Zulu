/**
 * Agent Memory System
 * Persistent storage for tracking file modifications and chat sessions
 */

import fs from 'fs';
import path from 'path';

const MEMORY_DIR = path.join(process.cwd(), '.agent-memory');
const CONFIG_FILE = path.join(MEMORY_DIR, 'config.json');
const SESSIONS_FILE = path.join(MEMORY_DIR, 'sessions.json');
const MODIFICATIONS_FILE = path.join(MEMORY_DIR, 'file-modifications.json');

export interface ChatEntry {
  timestamp: string;
  userInput: string;
  agentResponse: string;
  actionsTaken: string[];
}

export interface Session {
  sessionId: string;
  startTime: string;
  endTime: string | null;
  chats: ChatEntry[];
}

export interface FileModification {
  timestamp: string;
  file: string;
  action: 'create' | 'modify' | 'delete';
  lines: string;
  description: string;
  sessionId: string;
}

export interface MemoryConfig {
  version: string;
  created: string;
  description: string;
  settings: {
    maxChatHistory: number;
    maxFileHistory: number;
    autoLog: boolean;
    logLevel: string;
  };
}

/**
 * Initialize memory system if not exists
 */
export function initMemory(): void {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
}

/**
 * Read JSON file safely
 */
function readJSON<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
}

/**
 * Write JSON file safely
 */
function writeJSON<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

/**
 * Get current session or create new one
 */
export function getCurrentSession(): Session {
  const sessionsData = readJSON<{ sessions: Session[]; lastUpdated: string }>(
    SESSIONS_FILE,
    { sessions: [], lastUpdated: new Date().toISOString() }
  );

  const currentSession = sessionsData.sessions.find((s) => s.endTime === null);
  
  if (currentSession) {
    return currentSession;
  }

  // Create new session
  const newSession: Session = {
    sessionId: `session_${Date.now()}`,
    startTime: new Date().toISOString(),
    endTime: null,
    chats: [],
  };

  sessionsData.sessions.push(newSession);
  sessionsData.lastUpdated = new Date().toISOString();
  writeJSON(SESSIONS_FILE, sessionsData);

  return newSession;
}

/**
 * Log chat interaction
 */
export function logChat(
  userInput: string,
  agentResponse: string,
  actionsTaken: string[] = []
): void {
  initMemory();
  
  const sessionsData = readJSON<{ sessions: Session[]; lastUpdated: string }>(
    SESSIONS_FILE,
    { sessions: [], lastUpdated: new Date().toISOString() }
  );

  const currentSession = getCurrentSession();
  const sessionIndex = sessionsData.sessions.findIndex(
    (s) => s.sessionId === currentSession.sessionId
  );

  if (sessionIndex !== -1) {
    const chatEntry: ChatEntry = {
      timestamp: new Date().toISOString(),
      userInput,
      agentResponse,
      actionsTaken,
    };

    sessionsData.sessions[sessionIndex].chats.push(chatEntry);
    
    // Trim to max history
    const config = readJSON<MemoryConfig>(CONFIG_FILE, {
      version: '1.0.0',
      created: new Date().toISOString(),
      description: 'Agent memory configuration',
      settings: { maxChatHistory: 100, maxFileHistory: 500, autoLog: true, logLevel: 'info' },
    });

    const maxChats = config.settings.maxChatHistory;
    if (sessionsData.sessions[sessionIndex].chats.length > maxChats) {
      sessionsData.sessions[sessionIndex].chats = sessionsData.sessions[sessionIndex].chats.slice(-maxChats);
    }

    sessionsData.lastUpdated = new Date().toISOString();
    writeJSON(SESSIONS_FILE, sessionsData);
  }
}

/**
 * Log file modification
 */
export function logFileModification(
  file: string,
  action: 'create' | 'modify' | 'delete',
  lines: string,
  description: string
): void {
  initMemory();
  
  const modificationsData = readJSON<{ modifications: FileModification[]; lastUpdated: string }>(
    MODIFICATIONS_FILE,
    { modifications: [], lastUpdated: new Date().toISOString() }
  );

  const currentSession = getCurrentSession();
  
  const modification: FileModification = {
    timestamp: new Date().toISOString(),
    file,
    action,
    lines,
    description,
    sessionId: currentSession.sessionId,
  };

  modificationsData.modifications.push(modification);
  
  // Trim to max history
  const config = readJSON<MemoryConfig>(CONFIG_FILE, {
    version: '1.0.0',
    created: new Date().toISOString(),
    description: 'Agent memory configuration',
    settings: { maxChatHistory: 100, maxFileHistory: 500, autoLog: true, logLevel: 'info' },
  });

  const maxMods = config.settings.maxFileHistory;
  if (modificationsData.modifications.length > maxMods) {
    modificationsData.modifications = modificationsData.modifications.slice(-maxMods);
  }

  modificationsData.lastUpdated = new Date().toISOString();
  writeJSON(MODIFICATIONS_FILE, modificationsData);
}

/**
 * End current session
 */
export function endSession(): void {
  const sessionsData = readJSON<{ sessions: Session[]; lastUpdated: string }>(
    SESSIONS_FILE,
    { sessions: [], lastUpdated: new Date().toISOString() }
  );

  const currentSession = sessionsData.sessions.find((s) => s.endTime === null);
  
  if (currentSession) {
    const sessionIndex = sessionsData.sessions.findIndex(
      (s) => s.sessionId === currentSession.sessionId
    );
    
    if (sessionIndex !== -1) {
      sessionsData.sessions[sessionIndex].endTime = new Date().toISOString();
      sessionsData.lastUpdated = new Date().toISOString();
      writeJSON(SESSIONS_FILE, sessionsData);
    }
  }
}

/**
 * Get recent chat history
 */
export function getRecentChats(limit: number = 10): ChatEntry[] {
  const sessionsData = readJSON<{ sessions: Session[]; lastUpdated: string }>(
    SESSIONS_FILE,
    { sessions: [], lastUpdated: new Date().toISOString() }
  );

  const allChats: ChatEntry[] = [];
  
  // Get chats from most recent sessions first
  for (let i = sessionsData.sessions.length - 1; i >= 0 && allChats.length < limit; i--) {
    const session = sessionsData.sessions[i];
    allChats.push(...session.chats.slice(-limit));
  }

  return allChats.slice(-limit);
}

/**
 * Get recent file modifications
 */
export function getRecentModifications(limit: number = 20): FileModification[] {
  const modificationsData = readJSON<{ modifications: FileModification[]; lastUpdated: string }>(
    MODIFICATIONS_FILE,
    { modifications: [], lastUpdated: new Date().toISOString() }
  );

  return modificationsData.modifications.slice(-limit);
}

/**
 * Get memory summary
 */
export function getMemorySummary(): {
  totalSessions: number;
  currentSession: Session | null;
  totalChats: number;
  totalModifications: number;
  recentChats: ChatEntry[];
  recentModifications: FileModification[];
} {
  const sessionsData = readJSON<{ sessions: Session[]; lastUpdated: string }>(
    SESSIONS_FILE,
    { sessions: [], lastUpdated: new Date().toISOString() }
  );

  const modificationsData = readJSON<{ modifications: FileModification[]; lastUpdated: string }>(
    MODIFICATIONS_FILE,
    { modifications: [], lastUpdated: new Date().toISOString() }
  );

  const currentSession = sessionsData.sessions.find((s) => s.endTime === null) || null;
  const totalChats = sessionsData.sessions.reduce((sum, s) => sum + s.chats.length, 0);

  return {
    totalSessions: sessionsData.sessions.length,
    currentSession,
    totalChats,
    totalModifications: modificationsData.modifications.length,
    recentChats: getRecentChats(5),
    recentModifications: getRecentModifications(10),
  };
}
