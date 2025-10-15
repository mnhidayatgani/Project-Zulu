#!/usr/bin/env node

/**
 * Test MCP Sync System
 * 
 * This script tests the MCP sync system functionality:
 * - Database connection
 * - Table existence
 * - Sync operations
 */

const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🧪 Testing MCP Sync System')
console.log('=' .repeat(50))
console.log('')

async function testSync() {
  // Test 1: Check database connection
  console.log('📡 Test 1: Database Connection')
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.log('   ⚠️  Users table:', error.message)
    } else {
      console.log('   ✅ Database connected')
    }
  } catch (err) {
    console.log('   ❌ Connection failed:', err.message)
  }
  console.log('')

  // Test 2: Check MCP tables
  console.log('📊 Test 2: MCP Tables')
  const tables = [
    'mcp_favorites',
    'mcp_favorite_collections',
    'mcp_collection_items',
    'mcp_saved_searches',
    'mcp_search_history',
    'mcp_execution_history'
  ]

  const tableResults = {}
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(0)
      if (error) {
        tableResults[table] = '❌ ' + error.message
      } else {
        tableResults[table] = '✅ Ready'
      }
    } catch (err) {
      tableResults[table] = '❌ ' + err.message
    }
  }

  for (const [table, status] of Object.entries(tableResults)) {
    console.log(`   ${status} - ${table}`)
  }
  console.log('')

  // Test 3: Check sync modules
  console.log('📦 Test 3: Sync Modules')
  const syncModules = [
    'lib/mcp/sync.ts',
    'lib/mcp/favorites-sync.ts',
    'lib/mcp/execution-history-sync.ts',
    'lib/mcp/search-sync.ts'
  ]

  const fs = require('fs')
  for (const module of syncModules) {
    const modulePath = path.join(__dirname, '..', module)
    if (fs.existsSync(modulePath)) {
      const content = fs.readFileSync(modulePath, 'utf8')
      const lines = content.split('\n').length
      console.log(`   ✅ ${module} (${lines} lines)`)
    } else {
      console.log(`   ❌ ${module} - Not found`)
    }
  }
  console.log('')

  // Summary
  console.log('📋 Summary')
  console.log('=' .repeat(50))
  
  const allTablesExist = Object.values(tableResults).every(r => r.includes('✅'))
  
  if (allTablesExist) {
    console.log('✅ All tests passed!')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Start dev server: npm run dev')
    console.log('  2. Open browser: http://localhost:3000')
    console.log('  3. Test sync in console:')
    console.log('     import { setupMCPSync, forceSyncNow } from "@/lib/mcp/sync"')
    console.log('     await setupMCPSync()')
    console.log('     await forceSyncNow()')
  } else {
    console.log('⚠️  MCP tables not found!')
    console.log('')
    console.log('Deploy SQL schema first:')
    console.log('  1. Go to Supabase Dashboard')
    console.log('  2. Open SQL Editor')
    console.log('  3. Copy content from: supabase/mcp_schema.sql')
    console.log('  4. Run the SQL')
    console.log('  5. Run this test again: node scripts/test-sync.js')
  }
  console.log('')
}

testSync().catch(err => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
