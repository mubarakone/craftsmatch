-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "auth_id" TEXT UNIQUE NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "full_name" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "is_onboarded" BOOLEAN NOT NULL DEFAULT false,
  "user_role" TEXT NOT NULL,
  "avatar_url" TEXT
);

-- Create craftsman_profiles table
CREATE TABLE IF NOT EXISTS "craftsman_profiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "business_name" TEXT NOT NULL,
  "description" TEXT,
  "specialty" TEXT NOT NULL,
  "experience_years" INTEGER,
  "location" TEXT NOT NULL,
  "website" TEXT,
  "phone_number" TEXT,
  "social_links" JSONB,
  "certifications" JSONB,
  "portfolio_images" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS "craftsman_profile_user_id_idx" ON "craftsman_profiles"("user_id");

-- Create builder_profiles table
CREATE TABLE IF NOT EXISTS "builder_profiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "company_name" TEXT,
  "description" TEXT,
  "industry" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "website" TEXT,
  "phone_number" TEXT,
  "is_commercial" BOOLEAN NOT NULL DEFAULT false,
  "project_types" JSONB,
  "preferred_materials" JSONB,
  "social_links" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS "builder_profile_user_id_idx" ON "builder_profiles"("user_id"); 