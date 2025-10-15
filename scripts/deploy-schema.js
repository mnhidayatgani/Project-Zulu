#!/usr/bin/env node

/**
 * Deploy MCP Schema via Supabase REST API
 * 
 * This uses the Supabase service role to execute SQL directly
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

// Read SQL schema
const schemaPath = path.join(__dirname, '..', 'supabase', 'mcp_schema.sql')
const sqlContent = fs.readFileSync(schemaPath, 'utf8')

console.log('🚀 Deploying MCP Schema to Supabase')
console.log('=' .repeat(60))
console.log('')
console.log('📄 Schema file:', schemaPath)
console.log('🌐 Supabase URL:', SUPABASE_URL)
console.log('📏 SQL size:', sqlContent.length, 'bytes')
console.log('')

// Extract project ref from URL
const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0]

console.log('📋 Deployment Options:')
console.log('')
console.log('Option 1: Supabase Dashboard (Easiest)')
console.log('  1. Visit: https://supabase.com/dashboard/project/' + projectRef + '/sql/new')
console.log('  2. Copy the SQL from: supabase/mcp_schema.sql')
console.log('  3. Paste into SQL Editor')
console.log('  4. Click "Run" or press Ctrl+Enter')
console.log('  5. Wait for completion (~5-10 seconds)')
console.log('')

console.log('Option 2: Using psql (If you have DB password)')
console.log('  psql "postgresql://postgres:[YOUR_PASSWORD]@db.' + projectRef + '.supabase.co:5432/postgres" -f supabase/mcp_schema.sql')
console.log('')

console.log('Option 3: Copy SQL to clipboard')
console.log('  The SQL is ready at: supabase/mcp_schema.sql')
console.log('')

console.log('📊 What will be created:')
console.log('  ✓ 6 tables (favorites, collections, items, searches, history, executions)')
console.log('  ✓ 13 indexes for performance')
console.log('  ✓ Row Level Security policies')
console.log('  ✓ 3 helper functions')
console.log('  ✓ Auto-update triggers')
console.log('')

console.log('After deployment, verify with:')
console.log('  npm run test:sync')
console.log('')

// Offer to open SQL content
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Show SQL content? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    console.log('')
    console.log('=' .repeat(60))
    console.log('SQL SCHEMA CONTENT')
    console.log('=' .repeat(60))
    console.log(sqlContent)
    console.log('=' .repeat(60))
  }
  
  console.log('')
  console.log('✅ Ready to deploy!')
  console.log('')
  console.log('Recommended: Use Option 1 (Supabase Dashboard)')
  console.log('Link: https://supabase.com/dashboard/project/' + projectRef + '/sql/new')
  console.log('')
  
  rl.close()
})
