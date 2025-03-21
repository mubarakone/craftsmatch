import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Declare jest global to fix TypeScript errors
declare global {
  // eslint-disable-next-line no-var
  var jest: any;
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWith: any;
      toBeInTheDocument: () => R;
    }
  }
}

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/mockpath',
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Suppress console errors/warnings during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (
    args[0]?.includes?.('React does not recognize the') ||
    args[0]?.includes?.('Warning: React has detected a change in the order of Hooks') ||
    args[0]?.includes?.('Warning: useLayoutEffect does nothing on the server')
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Warning: React.createFactory() is deprecated')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
}); 