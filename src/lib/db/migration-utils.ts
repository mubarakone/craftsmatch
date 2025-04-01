/**
 * Migration Utilities
 * 
 * Helper functions for running and managing database migrations.
 * These utilities help integrate our Supabase migration files
 * with our application in a structured manner.
 */

import { createClient } from '../supabase/server';
import fs from 'fs';
import path from 'path';

/**
 * Run a SQL migration file against the Supabase database.
 * This is useful for running migrations from server actions or scripts.
 */
export async function runMigration(fileName: string): Promise<{ success: boolean; message: string }> {
  try {
    // Initialize Supabase client
    const supabase = createClient();
    
    // Build path to migration file - look in both places it might be
    let migrationPath = path.join(process.cwd(), 'migrations', fileName);
    
    // Check if the path exists
    if (!fs.existsSync(migrationPath)) {
      // Try the alternative src/lib/db/migrations path
      migrationPath = path.join(process.cwd(), 'src', 'lib', 'db', 'migrations', fileName);
      
      // If still not found, return an error
      if (!fs.existsSync(migrationPath)) {
        return {
          success: false,
          message: `Migration file not found: ${fileName}`
        };
      }
    }
    
    // Read the SQL file
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL as Supabase postgres function
    const { error } = await supabase.rpc('run_sql_migration', { sql });
    
    if (error) {
      console.error('Migration error:', error);
      return {
        success: false,
        message: `Migration failed: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: `Successfully ran migration: ${fileName}`
    };
  } catch (error) {
    console.error('Failed to run migration:', error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Helper to run all migration files in sequence
 */
export async function runAllMigrations(): Promise<{ success: boolean; results: Array<{ file: string; success: boolean; message: string }> }> {
  try {
    // Get list of migration files from the migrations directory
    let migrationsDir = path.join(process.cwd(), 'migrations');
    
    // Check if the directory exists
    if (!fs.existsSync(migrationsDir)) {
      // Try the alternative src/lib/db/migrations path
      migrationsDir = path.join(process.cwd(), 'src', 'lib', 'db', 'migrations');
      
      // If still not found, return an error
      if (!fs.existsSync(migrationsDir)) {
        return {
          success: false,
          results: [{
            file: 'migrations_directory',
            success: false,
            message: 'Migrations directory not found'
          }]
        };
      }
    }
    
    // Get all SQL files and sort them numerically
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort((a, b) => {
        // Extract number prefix from filename for sorting (e.g., 001_, 002_)
        const numA = parseInt(a.split('_')[0]);
        const numB = parseInt(b.split('_')[0]);
        return numA - numB;
      });
    
    // Run each migration in sequence
    const results = [];
    let allSucceeded = true;
    
    for (const file of migrationFiles) {
      const result = await runMigration(file);
      results.push({
        file,
        success: result.success,
        message: result.message
      });
      
      if (!result.success) {
        allSucceeded = false;
        // Don't break on failure - collect all results
      }
    }
    
    return {
      success: allSucceeded,
      results
    };
  } catch (error) {
    console.error('Failed to run all migrations:', error);
    return {
      success: false,
      results: [{
        file: 'migration_runner',
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
} 