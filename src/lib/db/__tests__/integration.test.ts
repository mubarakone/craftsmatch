import { db } from '../index';
import { getUserWrittenReviews, getUserReceivedReviews } from '@/lib/reviews/queries';
import { getAllCategories, getTopCategories } from '@/lib/marketplace/queries';
import { getFeaturedStorefronts } from '@/lib/storefront/queries';

// Helper to check if we have a real database connection
// For testing purposes, consider a real connection if db.query exists
const hasRealDbConnection = (): boolean => {
  try {
    // @ts-ignore - we're checking if this exists at runtime
    return !!db && typeof db.query === 'object';
  } catch (e) {
    return false;
  }
};

// Skip tests if no real database connection
const shouldRunTests = hasRealDbConnection();

// Helper to conditionally run tests
const conditionalTest = shouldRunTests ? test : test.skip;

describe('Database Integration Tests', () => {
  beforeAll(() => {
    if (!shouldRunTests) {
      console.warn('Real database connection not available, tests will be skipped');
    } else {
      console.log('Running tests with real database connection');
    }
  });

  // Test database connection
  conditionalTest('should connect to the database', async () => {
    expect(db).toBeDefined();
    // @ts-ignore - if we're here, we have a real connection
    expect(db.query).toBeDefined();
  });

  // Test category queries
  conditionalTest('should retrieve all categories', async () => {
    const categories = await getAllCategories();
    expect(Array.isArray(categories)).toBe(true);
    console.log(`Retrieved ${categories.length} categories`);
    
    if (categories.length > 0) {
      expect(categories[0]).toHaveProperty('id');
      expect(categories[0]).toHaveProperty('name');
    }
  });

  conditionalTest('should retrieve top categories', async () => {
    const topCategories = await getTopCategories();
    expect(Array.isArray(topCategories)).toBe(true);
    console.log(`Retrieved ${topCategories.length} top categories`);
    
    if (topCategories.length > 0) {
      expect(topCategories[0]).toHaveProperty('id');
      expect(topCategories[0]).toHaveProperty('name');
      expect(topCategories[0]).toHaveProperty('imageUrl');
    }
  });

  // Test storefront queries
  conditionalTest('should retrieve featured storefronts', async () => {
    const storefronts = await getFeaturedStorefronts(3);
    expect(Array.isArray(storefronts)).toBe(true);
    console.log(`Retrieved ${storefronts.length} featured storefronts`);
    
    // Check limit is respected
    expect(storefronts.length).toBeLessThanOrEqual(3);
    
    if (storefronts.length > 0) {
      expect(storefronts[0]).toHaveProperty('id');
      expect(storefronts[0]).toHaveProperty('name');
      expect(storefronts[0]).toHaveProperty('description');
    }
  });

  // Test review queries
  conditionalTest('should retrieve user written reviews', async () => {
    // Get a real user ID from the database if possible, or use a fake one
    const testUserId = process.env.TEST_USER_ID || 'test-user-id';
    const reviews = await getUserWrittenReviews(testUserId);
    expect(Array.isArray(reviews)).toBe(true);
    console.log(`Retrieved ${reviews.length} written reviews for user ${testUserId}`);
  });

  conditionalTest('should retrieve user received reviews', async () => {
    // Get a real user ID from the database if possible, or use a fake one
    const testUserId = process.env.TEST_USER_ID || 'test-user-id';
    const reviews = await getUserReceivedReviews(testUserId);
    expect(Array.isArray(reviews)).toBe(true);
    console.log(`Retrieved ${reviews.length} received reviews for user ${testUserId}`);
  });
}); 