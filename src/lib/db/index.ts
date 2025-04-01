// Check if we're in a build environment
const isBuild = process.env.NEXT_BUILD === 'true';
// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Define a simple interface for our mock database
interface MockDatabase {
  select: (...args: any[]) => any;
  insert: (...args: any[]) => any;
  update: (...args: any[]) => any;
  delete: (...args: any[]) => any;
  transaction: (...args: any[]) => any;
}

// Define a mock database for build time
const mockDb: MockDatabase = {
  select: () => {
    const queryBuilder = {
      from: (table: string) => ({
        where: () => ({
          limit: () => Promise.resolve([]),
          orderBy: () => Promise.resolve([]),
          eq: () => Promise.resolve([]),
        }),
        limit: () => Promise.resolve([]),
        orderBy: () => Promise.resolve([]),
      }),
      where: function() { return queryBuilder; },
      limit: function() { return Promise.resolve([]); },
      orderBy: function() { return Promise.resolve([]); },
      eq: function() { return Promise.resolve([]); },
    };
    return queryBuilder;
  },
  insert: () => ({
    values: () => ({
      returning: () => Promise.resolve([])
    }),
    into: () => ({
      values: () => ({
        returning: () => Promise.resolve([])
      })
    })
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: () => Promise.resolve([])
      })
    })
  }),
  delete: () => ({
    where: () => ({
      returning: () => Promise.resolve([])
    })
  }),
  transaction: (fn: () => Promise<any>) => Promise.resolve(fn())
};

// Export either the real database or the mock database
let db = mockDb;

// If we're not in a build environment and not in the browser, initialize the real database
if (!isBuild && !isBrowser) {
  try {
    // We need to use dynamic imports to avoid Node.js prefixed imports during build
    const { drizzle } = require('drizzle-orm/postgres-js');
    const postgres = require('postgres');
    
    // Import the schema only if not in build mode
    const { schema } = require('./schema');
    
    // Initialize the database connection
    const connectionString = process.env.DATABASE_URL || '';
    const client = postgres(connectionString);
    db = drizzle(client, { schema });
    
    console.log('Real database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Fall back to mock database
  }
}

/**
 * Fetch data from the database with a loading fallback
 * @param fetchFn - The function that performs the actual database query
 * @param fallbackData - The data to return if in build mode or if the fetch fails
 */
export async function fetchWithFallback<T>(
  fetchFn: () => Promise<T>, 
  fallbackData: T
): Promise<T> {
  // During build time, return fallback data immediately
  if (isBuild) {
    return fallbackData;
  }
  
  try {
    // At runtime, actually fetch the real data
    return await fetchFn();
  } catch (error) {
    console.error('Error fetching data:', error);
    // If the fetch fails, return the fallback data
    return fallbackData;
  }
}

export { db };