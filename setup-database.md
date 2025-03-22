# Setting Up the Database

This document guides you through setting up the database tables for CraftsMatch in Supabase.

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