/**
 * Example: How to integrate Agent Memory into your application
 */

import {
  logChat,
  logFileModification,
  getMemorySummary,
  getRecentChats,
  endSession
} from '@/lib/agent-memory';

// Example 1: Log a chat interaction
export function exampleLogChat() {
  logChat(
    'How do I create a new component?',
    'You can create a new component using the CLI tool...',
    ['searched_docs', 'created_file', 'ran_tests']
  );
}

// Example 2: Log file modifications
export function exampleLogFileModification() {
  // When creating a new file
  logFileModification(
    'components/NewComponent.tsx',
    'create',
    '1-50',
    'Created new React component with TypeScript'
  );

  // When modifying an existing file
  logFileModification(
    'app/page.tsx',
    'modify',
    '25-30',
    'Updated import statements to include new component'
  );

  // When deleting a file
  logFileModification(
    'components/OldComponent.tsx',
    'delete',
    'all',
    'Removed deprecated component'
  );
}

// Example 3: Get memory summary
export function exampleGetSummary() {
  const summary = getMemorySummary();
  
  console.log('Memory Summary:', {
    totalSessions: summary.totalSessions,
    currentSessionActive: summary.currentSession !== null,
    totalChats: summary.totalChats,
    totalModifications: summary.totalModifications
  });

  console.log('\nRecent Chats:');
  summary.recentChats.forEach((chat, i) => {
    console.log(`  ${i + 1}. ${chat.userInput.substring(0, 50)}...`);
  });

  console.log('\nRecent Modifications:');
  summary.recentModifications.forEach((mod, i) => {
    console.log(`  ${i + 1}. ${mod.action} ${mod.file}`);
  });
}

// Example 4: Middleware integration (Next.js API route)
export async function memoryMiddleware(
  userInput: string,
  agentResponse: string,
  actions: string[]
) {
  // Automatically log every interaction
  logChat(userInput, agentResponse, actions);
  
  return { success: true };
}

// Example 5: Graceful session end (e.g., on app shutdown)
export function exampleEndSession() {
  endSession();
  console.log('Session ended gracefully');
}

// Example 6: Integration with file operations
export async function createFileWithLogging(
  filePath: string,
  content: string
) {
  // Your file creation logic here
  // fs.writeFileSync(filePath, content);
  
  // Log the modification
  const lineCount = content.split('\n').length;
  logFileModification(
    filePath,
    'create',
    `1-${lineCount}`,
    `Created new file with ${lineCount} lines`
  );
}

// Example 7: Batch logging for multiple operations
export function exampleBatchOperations() {
  const operations = [
    { file: 'file1.ts', action: 'create' as const, desc: 'Created file 1' },
    { file: 'file2.ts', action: 'create' as const, desc: 'Created file 2' },
    { file: 'file3.ts', action: 'modify' as const, desc: 'Updated file 3' },
  ];

  operations.forEach(op => {
    logFileModification(op.file, op.action, '1-10', op.desc);
  });

  logChat(
    'Create multiple files',
    'Created 3 files successfully',
    ['batch_file_creation']
  );
}
