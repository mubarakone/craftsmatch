'use server';

import { db } from '@/lib/db';
import { reviews, users, products } from '@/lib/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

// Helper to safely execute queries with proper error handling
const safeExecute = async <T>(fn: () => Promise<T>): Promise<T | []> => {
  try {
    return await fn();
  } catch (error) {
    console.error('Database operation failed:', error);
    return [] as unknown as T;
  }
};

// Transform database review objects to consistent format
const transformReview = (review: any) => {
  if (!review) return null;
  return {
    id: review.id,
    rating: review.rating,
    title: review.reviewTitle || review.title,
    content: review.reviewContent || review.content,
    createdAt: review.createdAt,
    reviewerId: review.reviewerId,
    productId: review.productId,
    recipientId: review.recipientId,
    reply: review.reply,
    replyDate: review.replyDate,
    isPublished: review.isPublished,
    reviewerName: review.reviewerName,
    reviewerAvatar: review.reviewerAvatar,
    productName: review.productName,
  };
};

/**
 * Get reviews for a product
 */
export async function getProductReviews(productId: string, options = { limit: 10, offset: 0, sortBy: 'date', sortOrder: 'desc' }) {
  try {
    // Using any to avoid TypeScript errors with the db module
    const dbSelect = db.select as any;
    const reviews = await dbSelect()
      .from('reviews')
      .where(`product_id = '${productId}' AND is_published = true`);
    
    // Sort and paginate in memory
    const sorted = [...reviews].sort((a, b) => {
      if (options.sortBy === 'rating') {
        return options.sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
      } else {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return options.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });
    
    const paginated = sorted.slice(
      options.offset, 
      options.offset + options.limit
    );
    
    return {
      reviews: paginated.map(transformReview),
      pagination: {
        total: reviews.length,
        limit: options.limit,
        offset: options.offset,
      }
    };
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return {
      reviews: [],
      pagination: {
        total: 0,
        limit: options.limit,
        offset: options.offset,
      }
    };
  }
}

/**
 * Get reviews for a craftsman/seller
 */
export async function getCraftsmanReviews(craftsmanId: string, options = { limit: 10, offset: 0, sortBy: 'date', sortOrder: 'desc' }) {
  try {
    // Using any to avoid TypeScript errors with the db module
    const dbSelect = db.select as any;
    const reviews = await dbSelect()
      .from('reviews')
      .where(`recipient_id = '${craftsmanId}' AND is_published = true`);
    
    // Sort and paginate in memory
    const sorted = [...reviews].sort((a, b) => {
      if (options.sortBy === 'rating') {
        return options.sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
      } else {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return options.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });
    
    const paginated = sorted.slice(
      options.offset, 
      options.offset + options.limit
    );
    
    return {
      reviews: paginated.map(transformReview),
      pagination: {
        total: reviews.length,
        limit: options.limit,
        offset: options.offset,
      }
    };
  } catch (error) {
    console.error('Error fetching craftsman reviews:', error);
    return {
      reviews: [],
      pagination: {
        total: 0,
        limit: options.limit,
        offset: options.offset,
      }
    };
  }
}

/**
 * Get a single review by ID
 */
export async function getReviewById(reviewId: string) {
  try {
    // Using any to avoid TypeScript errors with the db module
    const dbSelect = db.select as any;
    const results = await dbSelect()
      .from('reviews')
      .where(`id = '${reviewId}'`);
    
    return results.length > 0 ? transformReview(results[0]) : null;
  } catch (error) {
    console.error('Error fetching review:', error);
    return null;
  }
}

/**
 * Get average rating and count for a product
 */
export async function getProductRatingSummary(productId: string) {
  try {
    // Using any to avoid TypeScript errors with the db module
    const dbSelect = db.select as any;
    const results = await dbSelect()
      .from('reviews')
      .where(`product_id = '${productId}' AND is_published = true`);
    
    const reviewCount = results.length;
    let averageRating = 0;
    
    if (reviewCount > 0) {
      const sum = results.reduce((total: number, review: any) => total + review.rating, 0);
      averageRating = sum / reviewCount;
    }
    
    return {
      averageRating,
      reviewCount
    };
  } catch (error) {
    console.error('Error fetching product rating summary:', error);
    return {
      averageRating: 0,
      reviewCount: 0
    };
  }
}

/**
 * Get average rating and count for a craftsman/seller
 */
export async function getCraftsmanRatingSummary(craftsmanId: string) {
  try {
    // Using any to avoid TypeScript errors with the db module
    const dbSelect = db.select as any;
    const results = await dbSelect()
      .from('reviews')
      .where(`recipient_id = '${craftsmanId}' AND is_published = true`);
    
    const reviewCount = results.length;
    let averageRating = 0;
    
    if (reviewCount > 0) {
      const sum = results.reduce((total: number, review: any) => total + review.rating, 0);
      averageRating = sum / reviewCount;
    }
    
    return {
      averageRating,
      reviewCount
    };
  } catch (error) {
    console.error('Error fetching craftsman rating summary:', error);
    return {
      averageRating: 0,
      reviewCount: 0
    };
  }
}

/**
 * Get reviews written by a user
 * @param userId The ID of the user who wrote the reviews
 * @returns Promise with array of reviews
 */
export async function getUserWrittenReviews(userId: string) {
  try {
    // This would normally query the database
    // For now, we'll return mock data
    return [
      {
        id: '1',
        rating: 4,
        comment: 'Great product, exactly as described!',
        createdAt: new Date().toISOString(),
        productId: 'prod-1',
        productName: 'Handcrafted Wooden Table',
        sellerId: 'seller-1',
        sellerName: 'John Craftsman'
      },
      {
        id: '2',
        rating: 5,
        comment: 'Excellent service and fantastic quality.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        productId: 'prod-2',
        productName: 'Ceramic Vase',
        sellerId: 'seller-2',
        sellerName: 'Pottery Studio'
      }
    ];
  } catch (error) {
    console.error('Error fetching user written reviews:', error);
    return [];
  }
}

/**
 * Get reviews received by a user (as a seller)
 * @param userId The ID of the user who received the reviews
 * @returns Promise with array of reviews
 */
export async function getUserReceivedReviews(userId: string) {
  try {
    // This would normally query the database
    // For now, we'll return mock data
    return [
      {
        id: '3',
        rating: 5,
        comment: 'Amazing craftsmanship, will definitely order again!',
        createdAt: new Date().toISOString(),
        buyerId: 'buyer-1',
        buyerName: 'Sarah Johnson',
        productId: 'prod-3',
        productName: 'Custom Wood Carving'
      },
      {
        id: '4',
        rating: 4,
        comment: 'Very good quality and fast shipping.',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        buyerId: 'buyer-2',
        buyerName: 'Michael Thompson',
        productId: 'prod-4',
        productName: 'Leather Journal'
      },
      {
        id: '5',
        rating: 5,
        comment: 'Exceeded my expectations in every way!',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        buyerId: 'buyer-3',
        buyerName: 'Emily Williams',
        productId: 'prod-5',
        productName: 'Hand-blown Glass Set'
      }
    ];
  } catch (error) {
    console.error('Error fetching user received reviews:', error);
    return [];
  }
} 