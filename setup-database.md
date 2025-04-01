# CraftsMatch Database Setup

This file provides instructions for setting up the database schema and loading initial data for the CraftsMatch platform.

## Migration Files

Our database migrations are structured in numbered files to ensure they are executed in the correct order:

1. `001_users_and_profiles.sql` - Creates users table, craftsmen profiles, and builder profiles
2. `002_storefronts.sql` - Creates storefronts and customization tables
3. `003_categories_attributes.sql` - Creates categories and attributes tables
4. `004_products.sql` - Creates products, product images, product attributes, and inventory tables
5. `005_customization_options.sql` - Creates product customization options tables
6. `006_orders_transactions.sql` - Creates orders, order items, and transactions tables
7. `007_messages_reviews.sql` - Creates conversations, messages, attachments, and reviews tables

## Setting Up the Database

### Option 1: Using the migration script

1. **Set your database connection string**
   ```
   export DATABASE_URL="postgresql://postgres:your-password@localhost:5432/craftsmatch"
   ```

2. **Run the migration script**
   ```
   cd migrations
   ./run_migrations.sh
   ```

### Option 2: Using Supabase SQL Editor

1. **Open the Supabase dashboard** for your project
2. Navigate to the **SQL Editor** section
3. Create a new query
4. Copy and paste the contents of each migration file in order
5. Run each query in sequence

## Sample Data

Each migration file includes sample mock data for testing purposes. This data includes:

- Users (craftsmen and builders)
- Storefronts
- Categories and attributes
- Products and inventory
- Customization options
- Orders and transactions
- Conversations, messages, and reviews

## Verifying Setup

To confirm the tables were created successfully:

1. Navigate to the **Table Editor** in Supabase
2. Verify that all tables are present
3. Check that sample data is correctly loaded

## Development Notes

- All tables use UUID primary keys
- Row Level Security (RLS) is enabled on all tables
- The database uses triggers for automatically updating `updated_at` timestamps
- Foreign key constraints are set up to maintain data integrity

## Craftsman Profiles Table

We need to create the `craftsman_profiles` table to store information about craftsmen and their services.

### Steps to Create the Table:

1. **Open the Supabase dashboard** for your project
2. Navigate to the **SQL Editor** section
3. Create a new query
4. Copy and paste the contents of the migration file: `migrations/001_create_craftsman_profiles.sql`
5. Run the query

The migration will:

1. Create the `craftsman_profiles` table with all necessary columns
2. Set up Row Level Security (RLS) policies for secure access
3. Insert sample craftsman data for testing

## Verifying Setup

To confirm the table was created successfully:

1. Navigate to the **Table Editor** in Supabase
2. Look for the `craftsman_profiles` table
3. Check that it contains the sample data (6 profiles)

## Troubleshooting

If you encounter any errors:

- Check that the UUID extension is available in your Supabase project
- Verify that you have the correct permissions to create tables
- If there's an error with the auth.users reference, make sure your Supabase instance is properly set up with authentication

For any other issues, check the Supabase logs for more details.

## Next Steps

Once the database is set up, the application should be able to query craftsman profiles directly from the database. The code has been updated to use the database table while falling back to mock data if there are any issues with the query. 