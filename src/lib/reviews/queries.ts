'use server';

import { db, executeRawQuery } from '@/lib/db';
import { reviews, users, products, orders } from '@/lib/db/schema';
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
    // Check if we have a proper database connection
    if (typeof db.query?.reviews?.findMany !== 'function') {
      console.warn('Using direct SQL query for getProductReviews');
      // Use direct SQL instead
      const results = await executeRawQuery(`
        SELECT r.*, reviewer.full_name as reviewer_name, 
               reviewer.avatar_url as reviewer_avatar
        FROM reviews r
        JOIN users reviewer ON r.reviewer_id = reviewer.id
        WHERE r.product_id = $1 AND r.is_published = true
        ORDER BY r.created_at DESC
      `, [productId]);
      
      return results || [];
    }
    
    // Use Drizzle ORM
    return await db.query.reviews.findMany({
      where: and(
        eq(reviews.productId, productId),
        eq(reviews.isPublished, true)
      ),
      with: {
        reviewer: {
          columns: {
            fullName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: [desc(reviews.createdAt)]
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return [];
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
    // Check if we have a proper database connection
    if (typeof db.query?.reviews?.findFirst !== 'function') {
      console.warn('Using direct SQL query for getReviewById');
      // Use direct SQL instead
      const results = await executeRawQuery(`
        SELECT r.*, p.name as product_name, p.slug as product_slug,
               recipient.full_name as craftsman_name,
               reviewer.full_name as reviewer_name
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        JOIN users recipient ON r.recipient_id = recipient.id
        JOIN users reviewer ON r.reviewer_id = reviewer.id
        WHERE r.id = $1
        LIMIT 1
      `, [reviewId]);
      
      return results.length > 0 ? results[0] : null;
    }
    
    // Use Drizzle ORM
    return await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
      with: {
        product: true,
        reviewer: {
          columns: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        },
        recipient: {
          columns: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching review by ID:', error);
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
    if (db) {
      // Use ORM if database is available
      return await db.query.reviews.findMany({
        where: eq(reviews.reviewerId, userId),
        orderBy: [desc(reviews.createdAt)],
        with: {
          product: true,
        },
      });
    } else {
      // Fallback to direct SQL with IPv4 forcing
      console.warn("Using direct SQL for getUserWrittenReviews (db connection unavailable)");
      
      const sql = `
        SELECT r.*, p.name as product_name, p.image_url as product_image
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        WHERE r.reviewer_id = $1
        ORDER BY r.created_at DESC
      `;
      
      return await executeRawQuery(sql, [userId]);
    }
  } catch (error) {
    console.error("Error fetching user written reviews:", error);
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
    // Check if we have a proper database connection
    if (typeof db.query?.reviews?.findMany !== 'function') {
      console.warn('Using direct SQL query for getUserReceivedReviews');
      // Use direct SQL instead
      const results = await executeRawQuery(`
        SELECT r.*, p.name as product_name, p.slug as product_slug,
               reviewer.full_name as reviewer_name,
               p.image_url as product_image
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        JOIN users reviewer ON r.reviewer_id = reviewer.id
        WHERE r.recipient_id = $1
        ORDER BY r.created_at DESC
      `, [userId]);
      
      return results || [];
    }
    
    // Use Drizzle ORM
    return await db.query.reviews.findMany({
      where: eq(reviews.recipientId, userId),
      with: {
        product: true,
        reviewer: {
          columns: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: [desc(reviews.createdAt)]
    });
  } catch (error) {
    console.error('Error fetching user received reviews:', error);
    return [];
  }
} 