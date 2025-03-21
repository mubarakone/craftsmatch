import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../search-bar';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock the Next.js router and searchParams
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('SearchBar', () => {
  const mockPush = jest.fn();
  const mockGet = jest.fn();
  const mockHas = jest.fn();
  const mockToString = jest.fn().mockReturnValue('');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mocks
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
      has: mockHas,
      toString: mockToString,
    });
  });
  
  test('renders with default placeholder', () => {
    render(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText(
      'Search for products, materials, or artisans...'
    );
    expect(searchInput).toBeInTheDocument();
    
    const searchButton = screen.getByText('Search');
    expect(searchButton).toBeInTheDocument();
    // The button is disabled by default when no text is entered
    expect(searchButton).toBeDisabled();
  });
  
  test('updates search term on input change', () => {
    render(<SearchBar />);
    
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'wooden chair' } });
    
    expect(searchInput).toHaveValue('wooden chair');
    
    const searchButton = screen.getByText('Search');
    expect(searchButton).not.toBeDisabled();
  });
  
  test('submits search and navigates to marketplace', () => {
    mockGet.mockReturnValue('');
    
    render(<SearchBar />);
    
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'wooden chair' } });
    
    // Get the form directly using querySelector
    const form = document.querySelector('form');
    expect(form).not.toBeNull();
    
    // Submit the form
    fireEvent.submit(form as HTMLFormElement);
    
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/^\/marketplace\?/)
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('query=wooden+chair')
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('page=1')
    );
  });
  
  test('clears search term when clear button is clicked', () => {
    mockGet.mockReturnValue('wooden chair');
    mockHas.mockReturnValue(true); // Mock that the query param exists
    
    render(<SearchBar defaultValue="wooden chair" />);
    
    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveValue('wooden chair');
    
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);
    
    // Check that the search term is cleared
    expect(searchInput).toHaveValue('');
    
    // Verify router.push is called only when searchParams has "query"
    expect(mockPush).toHaveBeenCalledWith('/marketplace');
  });
  
  test('initializes with search term from URL', () => {
    mockGet.mockReturnValue('wooden chair');
    
    render(<SearchBar />);
    
    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveValue('wooden chair');
  });
}); 