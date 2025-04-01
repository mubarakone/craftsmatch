#!/bin/bash

# Run migrations in order
echo "Running migrations..."

# 0. Create extension first
echo "Creating extensions..."
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# 1. Run users and profiles migration first
echo "Running 001_users_and_profiles.sql..."
psql "$DATABASE_URL" -f ./001_users_and_profiles.sql

# 2. Run storefronts migration
echo "Running 002_storefronts.sql..."
psql "$DATABASE_URL" -f ./002_storefronts.sql

# 3. Run categories and attributes migration
echo "Running 003_categories_attributes.sql..."
psql "$DATABASE_URL" -f ./003_categories_attributes.sql

# 4. Run products migration
echo "Running 004_products.sql..."
psql "$DATABASE_URL" -f ./004_products.sql

# 5. Run customization options migration
echo "Running 005_customization_options.sql..."
psql "$DATABASE_URL" -f ./005_customization_options.sql

# 6. Run orders and transactions migration
echo "Running 006_orders_transactions.sql..."
psql "$DATABASE_URL" -f ./006_orders_transactions.sql

# 7. Run messages and reviews migration
echo "Running 007_messages_reviews.sql..."
psql "$DATABASE_URL" -f ./007_messages_reviews.sql

echo "Migrations completed successfully!" 