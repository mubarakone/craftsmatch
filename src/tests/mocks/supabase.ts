// src/tests/mocks/supabase.ts

// Declare jest global to fix TypeScript errors
declare global {
  // eslint-disable-next-line no-var
  var jest: any;
}

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
  app_metadata: {
    role: 'craftsman',
  },
  created_at: new Date().toISOString(),
};

export const mockUserSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser,
};

// Create mock functions that properly return { data, error } objects
export const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockImplementation(() => Promise.resolve({
      data: { session: mockUserSession },
      error: null,
    })),
    signInWithPassword: jest.fn().mockImplementation(() => Promise.resolve({
      data: { session: mockUserSession },
      error: null,
    })),
    signUp: jest.fn().mockImplementation(() => Promise.resolve({
      data: { user: mockUser, session: mockUserSession },
      error: null,
    })),
    signOut: jest.fn().mockImplementation(() => Promise.resolve({
      error: null,
    })),
    getUser: jest.fn().mockImplementation(() => Promise.resolve({
      data: { user: mockUser },
      error: null,
    })),
    resetPasswordForEmail: jest.fn().mockImplementation(() => Promise.resolve({
      data: {},
      error: null,
    })),
    updateUser: jest.fn().mockImplementation(() => Promise.resolve({
      data: { user: mockUser },
      error: null,
    })),
  },
  from: jest.fn().mockImplementation(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null }))),
  })),
  storage: {
    from: jest.fn().mockImplementation(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: 'mock-file-path' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://mock-storage.com/mock-file-path' } }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      list: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    listBuckets: jest.fn().mockResolvedValue({ data: [], error: null }),
  },
  rpc: jest.fn().mockImplementation(() => ({
    select: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: null, error: null }))),
  })),
};

// Helper function to reset all mocks
export const resetSupabaseMocks = () => {
  Object.values(mockSupabaseClient.auth).forEach(method => {
    if (typeof method === 'function' && typeof method.mockReset === 'function') {
      method.mockReset();
    }
  });
};

// Mock module exports
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerClient: jest.fn(() => mockSupabaseClient),
  createServerComponentClient: jest.fn(() => mockSupabaseClient),
})); 