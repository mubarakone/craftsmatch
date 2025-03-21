import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { reviews, users, products, orders } from '@/lib/db/schema';
import { desc, eq, and, or, inArray, sql } from 'drizzle-orm';

// Mock data type definitions
export interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  orderId: string;
  productId: string;
  reviewerId: string;
  revieweeId: string;
  isPublic: boolean;
  status: 'pending' | 'published' | 'rejected';
  createdAt: string;
  updatedAt: string;
  response?: {
    content: string;
    createdAt: string;
  };
}

export interface ReviewWithDetails extends Review {
  reviewer?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  reviewee?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  product?: {
    id: string;
    name: string;
    images?: string[];
  };
  order?: {
    id: string;
    status: string;
    createdAt: string;
  };
}

// Mock data
const mockReviews: ReviewWithDetails[] = [
  {
    id: '1',
    title: 'Great craftsmanship',
    content: 'The product exceeded my expectations in every way. The attention to detail was incredible.',
    rating: 5,
    orderId: 'order1',
    productId: 'product1',
    reviewerId: 'user1',
    revieweeId: 'seller1',
    isPublic: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewer: {
      id: 'user1',
      fullName: 'John Doe',
      avatarUrl: '/avatars/user1.jpg'
    },
    reviewee: {
      id: 'seller1',
      fullName: 'Artisan Workshop',
      avatarUrl: '/avatars/seller1.jpg'
    },
    product: {
      id: 'product1',
      name: 'Handcrafted Wooden Table',
      images: ['/products/table1.jpg']
    },
    order: {
      id: 'order1',
      status: 'completed',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: '2',
    title: 'Beautiful piece',
    content: 'This item is exactly what I was looking for. The craftsmanship is outstanding.',
    rating: 4,
    orderId: 'order2',
    productId: 'product2',
    reviewerId: 'user2',
    revieweeId: 'seller1',
    isPublic: true,
    status: 'published',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reviewer: {
      id: 'user2',
      fullName: 'Jane Smith',
      avatarUrl: '/avatars/user2.jpg'
    },
    reviewee: {
      id: 'seller1',
      fullName: 'Artisan Workshop',
      avatarUrl: '/avatars/seller1.jpg'
    },
    product: {
      id: 'product2',
      name: 'Handmade Ceramic Vase',
      images: ['/products/vase1.jpg']
    },
    order: {
      id: 'order2',
      status: 'completed',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    response: {
      content: "Thank you for your kind words! I'm so glad you love the vase.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
];

/**
 * Get all reviews for a specific product
 */
export async function getProductReviews(productId: string, limit = 10, offset = 0) {
  try {
    // Mock implementation
    return mockReviews
      .filter(review => review.productId === productId && review.isPublic && review.status === 'published')
      .slice(offset, offset + limit);
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }
}

/**
 * Get review statistics for a product
 */
export async function getProductReviewStats(productId: string) {
  try {
    // Mock implementation
    const productReviews = mockReviews.filter(
      review => review.productId === productId && review.isPublic && review.status === 'published'
    );
    
    const totalReviews = productReviews.length;
    const averageRating = totalReviews > 0 
      ? productReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;
    
    // Count ratings by star level
    const distribution = {
      5: productReviews.filter(r => r.rating === 5).length,
      4: productReviews.filter(r => r.rating === 4).length,
      3: productReviews.filter(r => r.rating === 3).length,
      2: productReviews.filter(r => r.rating === 2).length,
      1: productReviews.filter(r => r.rating === 1).length,
    };
    
    return {
      averageRating,
      totalReviews,
      distribution
    };
  } catch (error) {
    console.error('Error fetching product review stats:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
}

/**
 * Get all reviews for a specific order
 */
export async function getOrderReviews(orderId: string) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return [];
    }
    
    // Mock implementation
    return mockReviews.filter(review => review.orderId === orderId);
  } catch (error) {
    console.error('Error fetching order reviews:', error);
    return [];
  }
}

/**
 * Get all reviews written by a user
 */
export async function getUserWrittenReviews(limit = 20, offset = 0) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return [];
    }
    
    const userId = session.user.id;
    
    // For mock purposes, just return sample reviews
    return mockReviews
      .filter(review => review.reviewerId === 'user1')  // Use mock ID for now
      .slice(offset, offset + limit);
  } catch (error) {
    console.error('Error fetching user written reviews:', error);
    return [];
  }
}

/**
 * Get all reviews received by a user
 */
export async function getUserReceivedReviews(limit = 20, offset = 0) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return [];
    }
    
    const userId = session.user.id;
    
    // For mock purposes, just return sample reviews
    return mockReviews
      .filter(review => review.revieweeId === 'seller1')  // Use mock ID for now
      .slice(offset, offset + limit);
  } catch (error) {
    console.error('Error fetching user received reviews:', error);
    return [];
  }
} 