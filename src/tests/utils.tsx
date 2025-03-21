import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { mockSupabaseClient } from './mocks/supabase';

// Import providers if they exist in your app
type ProviderProps = {
  children: React.ReactNode;
};

// Mock Providers
const MockToastProvider = ({ children }: ProviderProps) => {
  return <>{children}</>;
};

// Add any additional providers your app uses
const AllTheProviders = ({ children }: ProviderProps) => {
  return (
    <MockToastProvider>
      {children}
    </MockToastProvider>
  );
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Export testing utilities
export * from '@testing-library/react';
export { customRender as render, mockSupabaseClient };

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...rest }: any) => {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  };
});

// Helper to wait for promises to resolve
export const waitForPromises = () => new Promise(resolve => setTimeout(resolve, 0));

// Create a mock server action
export function mockServerAction(returnValue: any) {
  const action = jest.fn().mockResolvedValue(returnValue);
  return action;
}

// Helper for testing forms
export function fillFormField(element: HTMLElement, value: string) {
  const input = element as HTMLInputElement;
  input.value = value;
  const event = new Event('input', { bubbles: true });
  input.dispatchEvent(event);
}

// Helper for testing file uploads
export function createMockFile(name = 'test.png', type = 'image/png', size = 1024) {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', {
    get() {
      return size;
    },
  });
  return file;
} 