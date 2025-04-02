/**
 * Database table data check script.
 * 
 * Directly checks data in specific tables to verify the database is properly configured.
 * You can run it with:
 * npx ts-node -P tsconfig.json src/lib/db/table-check.ts [tableName]
 * 
 * Example:
 * npx ts-node -P tsconfig.json src/lib/db/table-check.ts categories
 */

const pg = require('pg');
const Pool = pg.Pool;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Command-line arguments
const [,, tableName = ''] = process.argv;

// Available tables to check
const availableTables = [
  'users',
  'categories',
  'products',
  'storefronts',
  'reviews',
  'product_images',
  'storefront_customization',
  'messages',
  'conversations',
  'orders'
];

// SQL queries for different tables
const tableQueries = {
  users: {
    query: `
      SELECT id, email, full_name, user_role, created_at, avatar_url
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `,
    description: 'User accounts (limited to 10 most recent)'
  },
  categories: {
    query: `
      SELECT * 
      FROM categories
      ORDER BY name
    `,
    description: 'Product categories'
  },
  products: {
    query: `
      SELECT p.id, p.name, p.price, p.description, p.slug, s.name as storefront_name
      FROM products p
      JOIN storefronts s ON p.storefront_id = s.id
      ORDER BY p.created_at DESC
      LIMIT 15
    `,
    description: 'Products with their storefronts (limited to 15 most recent)'
  },
  storefronts: {
    query: `
      SELECT s.id, s.name, s.description, s.slug, u.full_name as owner_name
      FROM storefronts s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `,
    description: 'Storefronts with their owners'
  },
  reviews: {
    query: `
      SELECT r.id, r.rating, r.review_title, r.review_content, r.created_at,
             p.name as product_name, 
             reviewer.full_name as reviewer_name,
             recipient.full_name as craftsman_name
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users reviewer ON r.reviewer_id = reviewer.id
      JOIN users recipient ON r.recipient_id = recipient.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `,
    description: 'Product reviews with reviewer and craftsman info (limited to 10 most recent)'
  },
  product_images: {
    query: `
      SELECT pi.id, pi.image_url, pi.is_main, p.name as product_name
      FROM product_images pi
      JOIN products p ON pi.product_id = p.id
      LIMIT 20
    `,
    description: 'Product images with product names (limited to 20)'
  },
  storefront_customization: {
    query: `
      SELECT sc.*, s.name as storefront_name
      FROM storefront_customization sc
      JOIN storefronts s ON sc.storefront_id = s.id
    `,
    description: 'Storefront customization settings'
  },
  orders: {
    query: `
      SELECT o.id, o.order_number, o.status, o.total_amount, o.placed_at, 
             b.full_name as buyer_name, s.full_name as seller_name
      FROM orders o
      JOIN users b ON o.buyer_id = b.id
      JOIN users s ON o.seller_id = s.id
      ORDER BY o.placed_at DESC
      LIMIT 10
    `,
    description: 'Customer orders (limited to 10 most recent)'
  }
};

async function checkTable(tableName) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    // Verify table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      ) as exists
    `, [tableName]);
    
    if (!tableCheck.rows[0].exists) {
      console.error(`Table "${tableName}" does not exist in the database.`);
      return;
    }
    
    // Get table row count
    const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
    const rowCount = countResult.rows[0].count;
    
    console.log(`\n=== ${tableName} (${rowCount} records) ===`);
    
    if (tableQueries[tableName]) {
      console.log(`${tableQueries[tableName].description}\n`);
      
      // Run the specific query for this table
      const result = await pool.query(tableQueries[tableName].query);
      
      if (result.rows.length === 0) {
        console.log('No records found.');
      } else {
        // Print column headers
        const columns = Object.keys(result.rows[0]);
        const headerRow = columns.join(' | ');
        const separator = '-'.repeat(headerRow.length);
        
        console.log(headerRow);
        console.log(separator);
        
        // Print data rows (truncate long values)
        result.rows.forEach(row => {
          const rowValues = columns.map(col => {
            const value = String(row[col] || '');
            return value.length > 30 ? value.substring(0, 27) + '...' : value;
          });
          console.log(rowValues.join(' | '));
        });
        
        console.log(`\nTotal: ${result.rows.length} record(s)`);
      }
    } else {
      // Basic query if no specific query is defined
      const result = await pool.query(`SELECT * FROM ${tableName} LIMIT 10`);
      console.log(result.rows);
    }
  } catch (error) {
    console.error(`Error querying table "${tableName}":`, error);
  } finally {
    await pool.end();
  }
}

async function listAvailableTables() {
  console.log('Usage: npx ts-node src/lib/db/table-check.ts [tableName]\n');
  console.log('Available tables to check:');
  availableTables.forEach(table => {
    console.log(`- ${table}${tableQueries[table] ? ` (${tableQueries[table].description})` : ''}`);
  });
}

// Run the script
if (require.main === module) {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set.');
    process.exit(1);
  }
  
  if (!tableName) {
    listAvailableTables();
  } else if (availableTables.includes(tableName)) {
    checkTable(tableName)
      .then(() => process.exit(0))
      .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
      });
  } else {
    console.error(`Error: Unknown table "${tableName}".`);
    listAvailableTables();
    process.exit(1);
  }
}

module.exports = {
  checkTable,
  listAvailableTables
}; 