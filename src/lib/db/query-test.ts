/**
 * Database query testing script.
 * 
 * This script allows you to test specific database query functions.
 * You can run it with:
 * npx ts-node -P tsconfig.json src/lib/db/query-test.ts
 */

// Import dynamically to avoid ES module issues
async function loadDependencies() {
  // This dynamically loads the modules when needed
  // We need to use paths like this for CommonJS compatibility
  const marketplaceQueries = await import('../../marketplace/queries');
  const reviewsQueries = await import('../../reviews/queries');
  const storefrontQueries = await import('../../storefront/queries');

  return {
    getAllCategories: marketplaceQueries.getAllCategories,
    getTopCategories: marketplaceQueries.getTopCategories,
    getUserWrittenReviews: reviewsQueries.getUserWrittenReviews, 
    getUserReceivedReviews: reviewsQueries.getUserReceivedReviews,
    getFeaturedStorefronts: storefrontQueries.getFeaturedStorefronts,
    getUserStorefronts: storefrontQueries.getUserStorefronts
  };
}

// Process command-line arguments
const [,, queryName, ...args] = process.argv;

async function runQueryTest() {
  if (!queryName) {
    console.log('Available queries:');
    console.log('- getAllCategories');
    console.log('- getTopCategories');
    console.log('- getFeaturedStorefronts');
    console.log('- getUserStorefronts');
    console.log('- getUserWrittenReviews');
    console.log('- getUserReceivedReviews');
    
    console.log('\nUsage: npx ts-node -P tsconfig.json src/lib/db/query-test.ts <queryName> [args...]');
    console.log('Example: npx ts-node -P tsconfig.json src/lib/db/query-test.ts getFeaturedStorefronts 5');
    process.exit(0);
  }

  try {
    // Dynamically load the query functions
    const queryFunctions = await loadDependencies();
    
    const queryFunction = queryFunctions[queryName];
    if (!queryFunction) {
      console.error(`Error: Query function "${queryName}" not found.`);
      console.log('Available queries:');
      Object.keys(queryFunctions).forEach(name => {
        console.log(`- ${name}`);
      });
      process.exit(1);
    }

    console.log(`Running query: ${queryName}(${args.join(', ')})`);
    console.time('Query execution time');
    
    // Execute the query with provided arguments
    const result = await queryFunction(...args);
    
    console.timeEnd('Query execution time');
    
    // Print the result
    console.log('\nResult:');
    
    if (Array.isArray(result)) {
      console.log(`${result.length} records found`);
      
      if (result.length > 0) {
        // Show sample data
        console.log('\nSample record:');
        console.log(result[0]);
        
        // For larger result sets, summarize
        if (result.length > 5) {
          console.log(`\n... and ${result.length - 1} more records`);
        } else {
          // For smaller result sets, show all records
          console.log('\nAll records:');
          console.log(result);
        }
      }
    } else {
      console.log(result);
    }
    
    console.log('\nQuery executed successfully.');
  } catch (error) {
    console.error('Error executing query:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runQueryTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = runQueryTest; 