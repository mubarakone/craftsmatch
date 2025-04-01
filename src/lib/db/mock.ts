/**
 * This file contains a mock database that is used during the build process.
 * It avoids using drizzle-orm and postgres which use node: imports that cause issues in the browser.
 */

// Create a mock DB for client side that implements common query methods
export function createMockDb() {
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
      return await fn(createMockDb());
    },
    query: {}
  };
}

// Default to mock DB
export const db = createMockDb();
export type DbClient = typeof db; 