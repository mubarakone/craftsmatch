/**
 * Basic database connection test.
 * 
 * This file can be run with:
 * npx jest src/lib/db/connection.test.ts
 * 
 * Ensure your database is running and DATABASE_URL is set correctly.
 */

import { describe, expect, test } from '@jest/globals';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Polyfill clearImmediate for test environment if not defined
if (typeof global.clearImmediate !== 'function') {
  global.clearImmediate = function (id: any) {
    clearTimeout(id);
  };
}

// Since there's an issue with directly using postgres in Jest,
// we'll use a different approach by directly querying the database
describe('Database Connection', () => {
  const databaseUrl = process.env.DATABASE_URL;

  beforeAll(() => {
    if (!databaseUrl) {
      console.warn('DATABASE_URL is not set. Tests will be skipped.');
    } else {
      console.log('DATABASE_URL is set. Testing connection...');
    }
  });

  // Skip if no DATABASE_URL is provided
  const testOrSkip = databaseUrl ? test : test.skip;

  // Test if we can create a database connection
  testOrSkip('can connect to the database', async () => {
    // Use pgPromise or node-postgres directly instead of importing our db
    const { Pool } = require('pg');
    
    const pool = new Pool({
      connectionString: databaseUrl
    });
    
    try {
      // Simple test query
      const result = await pool.query('SELECT 1 as test');
      expect(result).toBeDefined();
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].test).toBe(1);
      console.log('Successfully connected to database');
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      await pool.end();
    }
  });

  testOrSkip('can query database tables', async () => {
    // Use pgPromise or node-postgres directly instead of importing our db
    const { Pool } = require('pg');
    
    const pool = new Pool({
      connectionString: databaseUrl
    });
    
    try {
      // Get table names
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      expect(Array.isArray(result.rows)).toBe(true);
      
      // Log the tables
      console.log('Tables in database:', 
        result.rows.map((row: any) => row.table_name).join(', ')
      );
      
      // Check for some tables we expect
      const tableNames = result.rows.map((row: any) => row.table_name);
      const expectedTables = ['users', 'categories', 'products', 'storefronts'];
      
      for (const tableName of expectedTables) {
        console.log(
          tableNames.includes(tableName) 
            ? `✓ Found table: ${tableName}` 
            : `✗ Missing table: ${tableName}`
        );
      }
      
      // At least one expected table should exist
      const hasExpectedTable = expectedTables.some(table => 
        tableNames.includes(table)
      );
      
      expect(hasExpectedTable).toBe(true);
    } catch (error) {
      console.error('Error querying tables:', error);
      throw error;
    } finally {
      await pool.end();
    }
  });
}); 