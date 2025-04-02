import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Import schema
import * as schema from './schema';

// Environment detection
const isBuild = process.env.NEXT_BUILD === 'true';
const isBrowser = typeof window !== 'undefined';

// Database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

// Initialize database client with error handling
let db: ReturnType<typeof drizzle> | null = null;

// Only initialize the database if not in build mode and not running in browser
if (!isBuild && !isBrowser && DATABASE_URL) {
  try {
    // Setup PostgreSQL client
    const client = postgres(DATABASE_URL, { max: 1 });
    db = drizzle(client, { schema });
    
    console.log('Database connection initialized');
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    
    // Create a mock database for fallback
    db = createMockDatabase();
  }
} else {
  console.log(`Using mock database (${isBuild ? 'build mode' : 'browser environment'})`);
  db = createMockDatabase();
}

// Mock database interface for build time or when real connection fails
function createMockDatabase() {
  // Return a minimal implementation that won't break code during build
  return {
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
      values: () => ({
        returning: () => Promise.resolve([]),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
    }),
    delete: () => ({
      where: () => ({
        returning: () => Promise.resolve([]),
      }),
    }),
    transaction: async (fn: Function) => await fn({}),
    execute: async () => [],
    query: {
      categories: {
        findMany: async () => []
      },
      products: {
        findMany: async () => []
      },
      storefronts: {
        findMany: async () => []
      },
      users: {
        findMany: async () => []
      }
    }
  };
}

/**
 * Helper function to execute a raw SQL query directly
 * Useful for complex queries not easily expressed with Drizzle
 */
export async function executeRawQuery<T = any>(
  sql: string, 
  params: any[] = []
): Promise<T[]> {
  if (!DATABASE_URL || isBuild || isBrowser) {
    console.warn('Raw query execution skipped in build/browser environment');
    return [];
  }
  
  try {
    const client = postgres(DATABASE_URL, { max: 1 });
    const result = await client.unsafe(sql, params);
    return result as T[];
  } catch (error) {
    console.error('Error executing raw query:', error);
    throw error;
  }
}

export { db };