/**
 * Database Migration Script
 * 
 * This script runs the SQL migration files in the migrations directory
 * against a PostgreSQL database. It's designed to be run from the command line
 * using Node.js.
 * 
 * Usage: node scripts/migrate.js
 * 
 * Environment variables:
 * - DATABASE_URL: The PostgreSQL connection string
 * - MIGRATION_DIR: (Optional) The directory containing migration files (default: ./migrations)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATION_DIR = process.env.MIGRATION_DIR || './migrations';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

async function main() {
  // Create Supabase client with service role key (for admin privileges)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  console.log(`Looking for migration files in ${MIGRATION_DIR}`);
  
  // Read migration files
  const migrationFiles = fs
    .readdirSync(MIGRATION_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => {
      // Extract number prefix from filename for sorting (e.g., 001_, 002_)
      const numA = parseInt(a.split('_')[0]);
      const numB = parseInt(b.split('_')[0]);
      return numA - numB;
    });
  
  if (migrationFiles.length === 0) {
    console.log('No migration files found');
    return;
  }
  
  console.log(`Found ${migrationFiles.length} migration files`);
  
  // Run each migration
  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`);
    
    const filePath = path.join(MIGRATION_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    try {
      // Execute the SQL directly using Postgres API
      const { error } = await supabase.rpc('run_sql_migration', { sql });
      
      if (error) {
        console.error(`Error running migration ${file}:`, error);
        process.exit(1);
      }
      
      console.log(`Successfully applied migration: ${file}`);
    } catch (error) {
      console.error(`Error running migration ${file}:`, error);
      process.exit(1);
    }
  }
  
  console.log('All migrations completed successfully');
}

// Run the script
main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
}); 