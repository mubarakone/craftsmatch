// Set environment variables for testing
process.env.NODE_ENV = 'test';

// Mock global fetch if not already mocked
if (!global.fetch) {
  global.fetch = jest.fn(() => 
    Promise.resolve({
      json: () => Promise.resolve({}),
      ok: true
    })
  );
}

// For database testing, don't set CI to ensure real database tests run
process.env.CI = '';

// Allow logging for integration tests
process.env.DEBUG = process.env.DEBUG || 'db:*';

// Add a test user ID if needed (replace with a real ID from your database)
process.env.TEST_USER_ID = process.env.TEST_USER_ID || '';

// Timeout can be increased for database operations
jest.setTimeout(10000);

// Set test database URL if needed
// process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test'; 