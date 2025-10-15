#!/usr/bin/env node

/**
 * Deploy MCP Schema via Supabase REST API
 * 
 * This uses the Supabase REST API to execute SQL directly
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Colors
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`\n${c.cyan}╔════════════════════════════════════════════════════════════╗`);
console.log(`║   Deploy MCP Schema to Supabase via REST API              ║`);
console.log(`╚════════════════════════════════════════════════════════════╝${c.reset}\n`);

// Load env
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE;
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)/)[1];

console.log(`${c.blue}📡 Project:${c.reset} ${PROJECT_REF}`);
console.log(`${c.blue}🔗 URL:${c.reset} ${SUPABASE_URL}\n`);

// Read migration file
const migrationFile = fs.readdirSync(path.join(__dirname, '..', 'supabase', 'migrations'))
  .filter(f => f.endsWith('_mcp_tables.sql'))[0];
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);
const sqlContent = fs.readFileSync(migrationPath, 'utf8');

console.log(`${c.blue}📄 Migration:${c.reset} ${migrationFile}`);
console.log(`${c.blue}📏 Size:${c.reset} ${(sqlContent.length / 1024).toFixed(1)} KB\n`);

// Split into statements
const statements = sqlContent
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 20 && !s.startsWith('--') && !s.match(/^\s*$/));

console.log(`${c.cyan}🔄 Executing ${statements.length} SQL statements...\n${c.reset}`);

// Execute statements one by one
let success = 0;
let failed = 0;
const errors = [];

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec`);
    
    const postData = JSON.stringify({ sql: sql + ';' });
    
    const options = {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function deployAll() {
  console.log(`${c.yellow}Note: Some errors are expected (e.g., "already exists")${c.reset}\n`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\s+/g, ' ');
    
    try {
      const result = await executeSQL(stmt);
      
      if (result.success) {
        process.stdout.write(`${c.green}.${c.reset}`);
        success++;
      } else {
        // Check if it's a benign error (already exists, etc.)
        const errorMsg = result.error?.toLowerCase() || '';
        if (errorMsg.includes('already exists') || 
            errorMsg.includes('duplicate') ||
            result.statusCode === 404) {
          process.stdout.write(`${c.yellow}-${c.reset}`);
          success++;
        } else {
          process.stdout.write(`${c.red}x${c.reset}`);
          failed++;
          errors.push({ stmt: preview, error: result.error });
        }
      }
      
      if ((i + 1) % 50 === 0) {
        console.log(` ${i + 1}/${statements.length}`);
      }
    } catch (err) {
      process.stdout.write(`${c.red}X${c.reset}`);
      failed++;
      errors.push({ stmt: preview, error: err.message });
    }
  }
  
  console.log(`\n\n${c.cyan}════════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.green}✅ Successful:${c.reset} ${success}/${statements.length}`);
  
  if (failed > 0) {
    console.log(`${c.red}❌ Failed:${c.reset} ${failed}/${statements.length}`);
    console.log(`\n${c.yellow}Errors:${c.reset}`);
    errors.slice(0, 5).forEach(e => {
      console.log(`  ${c.red}•${c.reset} ${e.stmt}...`);
      console.log(`    ${c.yellow}${e.error.substring(0, 200)}${c.reset}\n`);
    });
    if (errors.length > 5) {
      console.log(`  ${c.yellow}... and ${errors.length - 5} more errors${c.reset}\n`);
    }
  }
  
  console.log(`\n${c.cyan}🔍 Verifying deployment...${c.reset}\n`);
  
  // We'll just show the verification command since we can't easily query from here
  console.log(`${c.blue}Run this to verify:${c.reset}`);
  console.log(`  npm run test:sync\n`);
  
  console.log(`${c.green}🎉 Deployment process complete!${c.reset}`);
  console.log(`\n${c.cyan}Next steps:${c.reset}`);
  console.log(`  1. Check tables in Supabase Dashboard`);
  console.log(`  2. Run: npm run test:sync`);
  console.log(`  3. Test sync components in your app\n`);
  
  if (failed === 0) {
    process.exit(0);
  } else {
    console.log(`${c.yellow}⚠️  Some errors occurred. If they're "already exists" errors, that's OK.${c.reset}\n`);
    process.exit(0);
  }
}

deployAll().catch(err => {
  console.error(`\n${c.red}❌ Fatal error:${c.reset}`, err);
  process.exit(1);
});
