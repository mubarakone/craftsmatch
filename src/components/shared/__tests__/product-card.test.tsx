import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../product-card';

// Mock product data
const mockProduct = {
  id: 'prod-123',
  name: 'Handcrafted Wooden Table',
  price: 499.99,
  discountPrice: 399.99,
  craftmanId: 'craft-456',
  isPublished: true,
  slug: 'handcrafted-wooden-table',
  description: 'A beautiful handcrafted wooden table made from reclaimed oak.',
  images: [
    {
      id: 'img-1',
      imageUrl: '/images/wooden-table.jpg',
      altText: 'Wooden table top view',
      isMain: true,
    },
  ],
  craftsman: {
    name: 'John Woodworker',
  },
  category: {
    name: 'Furniture',
    slug: 'furniture',
  },
};

// Mock product without image and discount
const mockProductNoImage = {
  id: 'prod-124',
  name: 'Basic Chair',
  price: 199.99,
  craftmanId: 'craft-456',
  isPublished: false,
  slug: 'basic-chair',
  description: 'A simple wooden chair.',
  images: [],
  craftsman: {
    name: 'John Woodworker',
  },
  category: {
    name: 'Furniture',
    slug: 'furniture',
  },
};

// Mock Next.js router and Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt || ''} src={props.src} data-testid="next-image" {...props} />;
  },
}));

describe('ProductCard', () => {
  test('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    // Test product name and details are displayed
    expect(screen.getByText('Handcrafted Wooden Table')).toBeInTheDocument();
    expect(screen.getByText('by John Woodworker')).toBeInTheDocument();
    expect(screen.getByText('Furniture')).toBeInTheDocument();
    
    // Test price display including discount
    expect(screen.getByText('$399.99')).toBeInTheDocument();
    expect(screen.getByText('$499.99')).toBeInTheDocument();
    
    // Test availability status
    expect(screen.getByText('Available')).toBeInTheDocument();
    
    // Test view details text
    expect(screen.getByText('View Details')).toBeInTheDocument();
    
    // Test image is rendered
    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('src', '/images/wooden-table.jpg');
    expect(image).toHaveAttribute('alt', 'Wooden table top view');
  });
  
  test('renders product without image correctly', () => {
    render(<ProductCard product={mockProductNoImage} />);
    
    // Test no image display
    expect(screen.getByText('No image')).toBeInTheDocument();
    
    // Test regular price display (no discount)
    expect(screen.getByText('$199.99')).toBeInTheDocument();
    
    // Test availability status for unpublished product
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });
  
  test('toggles favorite state when heart button is clicked', () => {
    render(<ProductCard product={mockProduct} />);
    
    // Find heart button
    const heartButton = screen.getByLabelText('Add to favorites');
    
    // Initially the heart icon should not be filled
    const heartIcon = heartButton.querySelector('svg');
    expect(heartIcon).not.toHaveClass('fill-red-500');
    
    // Click the heart button
    fireEvent.click(heartButton);
    
    // After clicking, the heart icon should be filled
    expect(heartButton).toHaveAttribute('aria-label', 'Remove from favorites');
    expect(heartButton.querySelector('svg')).toHaveClass('fill-red-500');
    
    // Click again to toggle back
    fireEvent.click(heartButton);
    
    // Heart should be unfilled again
    expect(heartButton).toHaveAttribute('aria-label', 'Add to favorites');
    expect(heartButton.querySelector('svg')).not.toHaveClass('fill-red-500');
  });
}); 