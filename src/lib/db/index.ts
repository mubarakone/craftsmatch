// Check if we're running on the client side or in a build environment
const isBrowser = typeof window !== 'undefined';
const isProduction = process.env.NODE_ENV === 'production';

// Create a mock DB that implements common query methods
function createMockDb() {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => ({
            then: () => Promise.resolve(null)
          }),
          orderBy: () => Promise.resolve([])
        }),
        orderBy: () => Promise.resolve([])
      })
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([{}])
      })
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([{}])
        })
      })
    }),
    delete: () => ({
      where: () => Promise.resolve()
    }),
    transaction: async (fn) => {
      // Just call the function with the mock db
      return await fn({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => ({
                then: () => Promise.resolve(null)
              }),
              orderBy: () => Promise.resolve([])
            }),
            orderBy: () => Promise.resolve([])
          })
        }),
        insert: () => ({
          values: () => ({
            returning: () => Promise.resolve([{}])
          })
        }),
        update: () => ({
          set: () => ({
            where: () => ({
              returning: () => Promise.resolve([{}])
            })
          })
        }),
        delete: () => ({
          where: () => Promise.resolve()
        })
      });
    },
    query: {
      categories: {
        findFirst: () => Promise.resolve(null),
        findMany: () => Promise.resolve([])
      },
      products: {
        findFirst: () => Promise.resolve(null),
        findMany: () => Promise.resolve([])
      },
      inventory: {
        findFirst: () => Promise.resolve(null)
      }
    }
  };
}

// Default to mock DB
let db = createMockDb();

// Conditionally initialize real DB in a function to avoid top-level await
function initializeDb() {
  if (!isBrowser && !isProduction) {
    try {
      // Using dynamic imports instead of await
      Promise.all([
        import('postgres'),
        import('drizzle-orm/postgres-js')
      ]).then(([postgresModule, drizzleModule]) => {
        const postgres = postgresModule.default;
        const { drizzle } = drizzleModule;
        
        // Create a PostgreSQL connection
        const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/craftsmatch';
        const client = postgres(connectionString, { max: 1 });
        
        // Create a Drizzle instance
        db = drizzle(client);
      }).catch(error => {
        console.error('Failed to initialize database:', error);
      });
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}

// Call initialization
initializeDb();

export { db };