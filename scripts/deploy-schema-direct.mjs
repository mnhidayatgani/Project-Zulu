#!/usr/bin/env node

/**
 * Deploy MCP Schema to Supabase via Direct SQL Execution
 * Uses @supabase/supabase-js with service role key
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE')
  process.exit(1)
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Read SQL schema
const schemaPath = path.join(__dirname, '..', 'supabase', 'mcp_schema.sql')
const sqlContent = fs.readFileSync(schemaPath, 'utf8')

console.log('🚀 Deploying MCP Schema to Supabase...')
console.log('📄 Schema file:', schemaPath)
console.log('🌐 Supabase URL:', SUPABASE_URL)
console.log('📏 SQL size:', sqlContent.length, 'bytes')
console.log('')

// Split SQL into individual statements (simple split by semicolon)
// Note: This is a simple approach and may not work for all SQL
const statements = sqlContent
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

console.log('📊 Found', statements.length, 'SQL statements')
console.log('')

// Execute statements
async function deploySchema() {
  console.log('⏳ Executing SQL statements...')
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    
    // Skip comments
    if (statement.startsWith('--') || statement.length < 10) {
      continue
    }
    
    try {
      // Use rpc to execute raw SQL
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      })
      
      if (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error.message)
        console.error('   SQL:', statement.substring(0, 100) + '...')
        errorCount++
      } else {
        successCount++
        process.stdout.write('.')
      }
    } catch (err) {
      console.error(`❌ Statement ${i + 1} error:`, err.message)
      errorCount++
    }
  }
  
  console.log('\n')
  console.log('✅ Deployment complete!')
  console.log('   Success:', successCount)
  console.log('   Errors:', errorCount)
  
  if (errorCount > 0) {
    console.log('')
    console.log('⚠️  Some statements failed. This is normal if:')
    console.log('   - Tables already exist')
    console.log('   - Policies already exist')
    console.log('   - Functions already exist')
  }
  
  console.log('')
  console.log('Next steps:')
  console.log('  1. Verify tables in Supabase Dashboard')
  console.log('  2. Run: npm run dev')
  console.log('  3. Test sync system')
}

deploySchema().catch(error => {
  console.error('❌ Deployment failed:', error)
  process.exit(1)
})
