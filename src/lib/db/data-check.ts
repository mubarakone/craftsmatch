/**
 * Database data integrity check.
 * 
 * This script checks key tables in the database for data integrity.
 * You can run it with:
 * npx ts-node -P tsconfig.json src/lib/db/data-check.ts
 */

// Use require instead of import
const { db } = require('../index');
const drizzle = require('drizzle-orm');
const count = drizzle.count;

// We'll load schema at runtime to avoid import issues
async function loadSchema() {
  try {
    // Dynamic import for schemas
    const schema = await import('../schema');
    return {
      storefronts: schema.storefronts,
      categories: schema.categories,
      products: schema.products, 
      reviews: schema.reviews,
      users: schema.users
    };
  } catch (error) {
    console.error('Error loading schema:', error);
    throw error;
  }
}

const EXPECTED_MIN_RECORDS = {
  users: 1,
  categories: 5,
  storefronts: 2,
  products: 5,
  reviews: 0, // Reviews might not exist initially
};

async function checkTableCounts() {
  try {
    // Load schemas
    const schema = await loadSchema();
    const { users, categories, storefronts, products, reviews } = schema;
    
    console.log('Checking database tables...\n');
    
    // Check users
    const userCount = await db.select({ count: count() }).from(users);
    console.log(`Users: ${userCount[0].count} records`);
    if (userCount[0].count < EXPECTED_MIN_RECORDS.users) {
      console.log('⚠️ WARNING: Users table has fewer records than expected');
    }
    
    // Check categories
    const categoryCount = await db.select({ count: count() }).from(categories);
    console.log(`Categories: ${categoryCount[0].count} records`);
    if (categoryCount[0].count < EXPECTED_MIN_RECORDS.categories) {
      console.log('⚠️ WARNING: Categories table has fewer records than expected');
    }
    
    // Check storefronts
    const storefrontCount = await db.select({ count: count() }).from(storefronts);
    console.log(`Storefronts: ${storefrontCount[0].count} records`);
    if (storefrontCount[0].count < EXPECTED_MIN_RECORDS.storefronts) {
      console.log('⚠️ WARNING: Storefronts table has fewer records than expected');
    }
    
    // Check products
    const productCount = await db.select({ count: count() }).from(products);
    console.log(`Products: ${productCount[0].count} records`);
    if (productCount[0].count < EXPECTED_MIN_RECORDS.products) {
      console.log('⚠️ WARNING: Products table has fewer records than expected');
    }
    
    // Check reviews
    const reviewCount = await db.select({ count: count() }).from(reviews);
    console.log(`Reviews: ${reviewCount[0].count} records`);
    if (reviewCount[0].count < EXPECTED_MIN_RECORDS.reviews) {
      console.log('⚠️ WARNING: Reviews table has fewer records than expected');
    }
    
    // Check for sample data from each table
    console.log('\nSample Records:');
    
    // Sample users (limited fields for privacy)
    const sampleUsers = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
    }).from(users).limit(2);
    
    console.log('\nUsers:');
    console.log(sampleUsers);
    
    // Sample categories
    const sampleCategories = await db.select().from(categories).limit(3);
    console.log('\nCategories:');
    console.log(sampleCategories);
    
    // Sample storefronts
    const sampleStorefronts = await db.select({
      id: storefronts.id,
      name: storefronts.name,
      userId: storefronts.userId,
      description: storefronts.description,
      slug: storefronts.slug,
    }).from(storefronts).limit(2);
    
    console.log('\nStorefronts:');
    console.log(sampleStorefronts);
    
    // Sample products
    const sampleProducts = await db.select({
      id: products.id,
      name: products.name,
      price: products.price,
      storefrontId: products.storefrontId,
      slug: products.slug,
    }).from(products).limit(3);
    
    console.log('\nProducts:');
    console.log(sampleProducts);
    
    console.log('\nDatabase check completed successfully.');
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

// Run the check when script is executed directly
if (require.main === module) {
  checkTableCounts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = checkTableCounts; 