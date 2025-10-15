#!/usr/bin/env python3
"""
Deploy MCP Schema to Supabase
Uses Supabase REST API to execute SQL
"""

import os
import sys
import json
import requests
from pathlib import Path

# Load environment
env_file = Path(__file__).parent.parent / '.env.local'
env_vars = {}

if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key] = value

SUPABASE_URL = env_vars.get('NEXT_PUBLIC_SUPABASE_URL', '')
SERVICE_ROLE = env_vars.get('SUPABASE_SERVICE_ROLE', '')

if not SUPABASE_URL or not SERVICE_ROLE:
    print('❌ Missing Supabase credentials in .env.local')
    sys.exit(1)

# Read schema
schema_file = Path(__file__).parent.parent / 'supabase' / 'mcp_schema.sql'
if not schema_file.exists():
    print(f'❌ Schema file not found: {schema_file}')
    sys.exit(1)

sql_content = schema_file.read_text()

print('🚀 Deploying MCP Schema to Supabase')
print('=' * 60)
print(f'📄 Schema: {schema_file}')
print(f'🌐 URL: {SUPABASE_URL}')
print(f'📏 Size: {len(sql_content)} bytes')
print()

# Extract project ref
project_ref = SUPABASE_URL.split('//')[1].split('.')[0]

# Try to execute via Supabase Management API
# Note: This requires Management API access which may not be available
print('📡 Attempting direct SQL execution...')
print()

# Split into statements
statements = [s.strip() for s in sql_content.split(';') if s.strip() and not s.strip().startswith('--')]

print(f'📊 Found {len(statements)} SQL statements')
print()

# For now, we'll provide instructions instead
print('⚠️  Direct SQL execution requires Database password or Management API access')
print()
print('📋 Please use one of these methods:')
print()
print('Method 1: Supabase Dashboard (Recommended)')
print(f'  Visit: https://supabase.com/dashboard/project/{project_ref}/sql/new')
print(f'  Copy SQL from: {schema_file}')
print('  Paste and click "Run"')
print()
print('Method 2: Using psql (if you have DB password)')
print(f'  psql "postgresql://postgres:[PASSWORD]@db.{project_ref}.supabase.co:5432/postgres" -f {schema_file}')
print()
print('After deployment, verify with:')
print('  npm run test:sync')
print()
