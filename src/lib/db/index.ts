import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

// Import various utilities
import { isBrowser, isBuild } from '@/lib/utils';

// Extract components from DATABASE_URL to fix incorrect hostname format
const DATABASE_URL = process.env.DATABASE_URL;
// Supabase direct connection should NOT have "db." prefix
const FIXED_DATABASE_URL = DATABASE_URL?.replace(
  /postgres:\/\/([^:]+):([^@]+)@db\.([^:]+):(\d+)\/(.+)/,
  (_, user, pass, host, port, db) => {
    // Fix hostname by removing "db." prefix - Supabase direct connection format
    return `postgres://${user}:${pass}@${host}:${port}/${db}?sslmode=require`;
  }
);

// Global database instance
let db: any = null;

// Initialize database connection
if (!isBuild && !isBrowser && FIXED_DATABASE_URL) {
  try {
    // Setup PostgreSQL client using postgres.js with correct hostname
    const client = postgres(FIXED_DATABASE_URL, { 
      max: 1,
      ssl: { rejectUnauthorized: false }
    });
    
    db = drizzle(client, { schema });
    
    console.log('Database connection initialized');
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    
    // Create a mock database for fallback
    db = {
      select: () => ({
        from: () => ({
          where: () => Promise.resolve([]),
          limit: () => Promise.resolve([]),
          orderBy: () => Promise.resolve([]),
          get: () => Promise.resolve(null),
          all: () => Promise.resolve([]),
        }),
      }),
      insert: () => ({
        values: () => Promise.resolve({ rows: [], rowCount: 0 }),
      }),
      update: () => ({
        set: () => ({
          where: () => Promise.resolve({ rows: [], rowCount: 0 }),
        }),
      }),
      delete: () => ({
        where: () => Promise.resolve({ rows: [], rowCount: 0 }),
      }),
      query: {
        users: {
          findMany: () => Promise.resolve([]),
          findFirst: () => Promise.resolve(null),
        },
      },
    };
  }
}

// Export database instance
export { db };

/**
 * Execute raw SQL query as a fallback when ORM access fails
 */
export async function executeRawQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
  if (!FIXED_DATABASE_URL) {
    console.warn('No DATABASE_URL provided for raw query execution');
    return [];
  }
  
  try {
    // For raw queries, use postgres.js with corrected hostname
    const client = postgres(FIXED_DATABASE_URL, { 
      max: 1,
      ssl: { rejectUnauthorized: false }
    });
    
    const result = await client.unsafe(sql, params);
    return result as unknown as T[];
  } catch (error) {
    console.error('Error executing raw query:', error);
    return [];
  }
}