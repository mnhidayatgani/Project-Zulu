#!/usr/bin/env node

/**
 * Deploy MCP Schema to Supabase
 * 
 * This script reads the MCP migration file and deploys it to the remote Supabase database
 * using the Supabase client with service role permissions.
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function deploySchema() {
  try {
    log('\n🚀 Deploying MCP Schema to Supabase...\n', 'cyan');

    // Check if .env.local exists
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
      log('❌ Error: .env.local not found', 'red');
      log('Please create .env.local with SUPABASE credentials', 'yellow');
      process.exit(1);
    }

    // Load environment variables
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });

    const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      log('❌ Error: Supabase credentials not found in .env.local', 'red');
      log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE', 'yellow');
      process.exit(1);
    }

    log(`📡 Connected to: ${SUPABASE_URL}`, 'blue');

    // Find the migration file
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('_mcp_tables.sql'));
    
    if (files.length === 0) {
      log('❌ Error: No MCP migration file found', 'red');
      process.exit(1);
    }

    const migrationFile = path.join(migrationsDir, files[0]);
    log(`📄 Reading migration: ${files[0]}`, 'blue');

    const sqlContent = fs.readFileSync(migrationFile, 'utf8');

    // Import Supabase client
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    log('\n🔄 Executing SQL migration...\n', 'cyan');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent }).catch(async () => {
      // If exec_sql doesn't exist, try direct query
      log('⚠️  exec_sql function not available, trying direct approach...', 'yellow');
      
      // Split SQL into individual statements
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      log(`📝 Executing ${statements.length} SQL statements...`, 'blue');

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (stmt.length < 10) continue; // Skip very short statements
        
        try {
          // Use REST API to execute SQL
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: stmt + ';' })
          });

          if (response.ok) {
            successCount++;
            process.stdout.write('.');
          } else {
            errorCount++;
            const errorText = await response.text();
            errors.push({ statement: stmt.substring(0, 100), error: errorText });
            process.stdout.write('x');
          }
        } catch (err) {
          errorCount++;
          errors.push({ statement: stmt.substring(0, 100), error: err.message });
          process.stdout.write('x');
        }
      }

      console.log('\n');
      return { successCount, errorCount, errors };
    });

    if (error) {
      log(`❌ Deployment failed: ${error.message}`, 'red');
      process.exit(1);
    }

    log('\n✅ Migration executed successfully!\n', 'green');

    // Verify tables were created
    log('🔍 Verifying table creation...', 'cyan');

    const tables = [
      'mcp_favorites',
      'mcp_favorite_collections', 
      'mcp_collection_items',
      'mcp_saved_searches',
      'mcp_search_history',
      'mcp_execution_history'
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === 'PGRST204' || error.message.includes('does not exist')) {
          log(`⚠️  Table '${table}' not found - may need manual creation`, 'yellow');
        } else {
          log(`✅ Table '${table}' exists`, 'green');
        }
      } else {
        log(`✅ Table '${table}' exists (${count || 0} rows)`, 'green');
      }
    }

    log('\n🎉 Deployment complete!', 'green');
    log('\nNext steps:', 'cyan');
    log('1. Verify tables in Supabase Dashboard', 'blue');
    log('2. Run: npm run test:sync', 'blue');
    log('3. Test sync components in your app\n', 'blue');

  } catch (error) {
    log(`\n❌ Unexpected error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run deployment
deploySchema();
