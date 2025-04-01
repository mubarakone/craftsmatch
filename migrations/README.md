# CraftsMatch Migration Scripts

This directory contains SQL migration scripts for the CraftsMatch platform database. These scripts are designed to be run sequentially to set up the database schema and permissions.

## Migration Files

1. `001_users_and_profiles.sql` - Creates tables for users and user profiles (builder and craftsman)
2. `002_storefronts.sql` - Creates tables for storefronts and storefront customization
3. `003_categories_attributes.sql` - Creates tables for product categories and attributes
4. `004_products.sql` - Creates tables for products, product images, product attributes, and inventory
5. `005_customization_options.sql` - Creates tables for product customization options
6. `006_orders_transactions.sql` - Creates tables for orders, order items, and transactions
7. `007_messages_reviews.sql` - Creates tables for user messages, conversations, and reviews
8. `008_wishlists.sql` - Creates tables for user wishlists and wishlist items

## Running Migrations

You can run these migrations using the migration script:

```bash
npm run db:migrate
```

This will execute all migration files in order.

## Row Level Security (RLS)

All tables are protected by Supabase Row Level Security (RLS) policies, ensuring that:

- Users can only read their own private data
- Users can only modify their own data
- Some data (like public product listings) is readable by anyone
- Appropriate access controls are in place for all operations

## Database Relationships

The database is designed with proper relationships between tables, using foreign keys to maintain referential integrity. The key relationships are:

- User profiles (builder/craftsman) belong to users
- Storefronts belong to users (craftsmen)
- Products belong to storefronts and categories
- Orders are associated with buyers and sellers
- Messages belong to conversations between users
- Wishlists belong to users
- Reviews are associated with products, reviewers, and recipients

## Indexes

Performance-optimized indexes are created for all foreign keys and frequently queried fields to ensure fast database operations.

## Schema Structure

The database schema includes:

- **Users and Profiles**: Core user data and role-specific profiles
- **Storefronts**: Craftsman's store information and customization
- **Products**: Product listings with categories and attributes
- **Customization Options**: Options for product customization
- **Orders and Transactions**: Order management and payment tracking
- **Messages**: Conversation system for buyer-seller communication
- **Reviews**: Product and seller review system

## Notes

- The `uuid-ossp` extension is automatically enabled by the migration script
- The migrations must be run in the specified order to maintain table dependencies
- Sample mock data is included in each migration file for testing purposes 