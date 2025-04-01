// Check if we're in a build environment
const isBuild = process.env.NEXT_BUILD === 'true';
const isBrowser = typeof window !== 'undefined';

// Only import schema if not in build mode
import * as schema from './schema';

// Simple mock database interface for build time
const mockDb = {
  select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
  insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
  update: () => ({ set: () => ({ where: () => Promise.resolve([]) }) }),
  delete: () => ({ where: () => Promise.resolve([]) }),
  transaction: async (fn) => fn(mockDb),
  query: { schema }
};

// Use dynamic imports to avoid node: prefixed imports during build
let db = mockDb;

// Only attempt to initialize the real database when not in build mode and not in browser
if (!isBuild && !isBrowser) {
  try {
    // Dynamic import of database libraries
    // This code will be excluded during build time
    const { drizzle } = require('drizzle-orm/postgres-js');
    const postgres = require('postgres');
    
    // Get database URL from environment
    const url = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
    
    if (url) {
      // Create Postgres client
      const client = postgres(url);
      
      // Initialize Drizzle with schema
      db = drizzle(client, { schema });
      
      // Log successful connection
      console.log('Database connection initialized successfully');
    } else {
      console.warn('DATABASE_URL is not defined, using mock database');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Export the database (either real or mock)
export { db };
export type DbClient = typeof db;