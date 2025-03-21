# Testing Setup for CraftsMatch

This document outlines the testing infrastructure and practices for the CraftsMatch project.

## Tech Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: For testing React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized in `__tests__` directories alongside the code they test:

```
src/
  components/
    shared/
      __tests__/
        product-card.test.tsx
        search-bar.test.tsx
  lib/
    auth/
      __tests__/
        actions.test.ts
    products/
      __tests__/
        actions.test.ts
```

## Writing Tests

### Component Tests

Component tests use React Testing Library to render components and assert on their behavior:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { YourComponent } from '../your-component';

describe('YourComponent', () => {
  test('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Your Text')).toBeInTheDocument();
  });
});
```

### Server Action Tests

Server action tests mock dependencies and test the action's functionality:

```tsx
import { yourAction } from '../your-actions';
import { mockSupabaseClient } from '@/tests/mocks/supabase';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('Your Action', () => {
  test('returns expected result', async () => {
    const result = await yourAction();
    expect(result).toEqual({ success: true });
  });
});
```

## Mocks

Common mocks are provided in the `src/tests/mocks` directory:

- `supabase.ts`: Mocks for Supabase client and authentication
- Additional mocks can be created as needed

## Test Utils

Testing utilities are available in `src/tests/utils.tsx`:

- Custom render function with common providers
- Helper functions for testing forms, file uploads, etc.

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how it's built.
2. **Use meaningful assertions**: Write assertions that verify the expected behavior.
3. **Mock external dependencies**: Use Jest mocks for external services and APIs.
4. **Keep tests isolated**: Tests should not depend on each other.
5. **Test error cases**: Verify that components and functions handle errors gracefully.
6. **Avoid testing library internals**: Don't test React, Next.js, or library code.

## Adding New Tests

1. Create a `__tests__` directory if it doesn't exist
2. Create a test file with the `.test.tsx` or `.test.ts` extension
3. Import the component or function to test
4. Write tests using Jest and React Testing Library
5. Run tests to verify they pass

## Coverage Reports

Coverage reports will be generated in the `coverage` directory when running:

```bash
npm run test:coverage
```

The goal is to maintain high test coverage for critical business logic and UI components. 