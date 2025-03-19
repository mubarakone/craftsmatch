-- Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "parent_id" UUID REFERENCES "categories"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index on parent_id for faster lookups
CREATE INDEX IF NOT EXISTS "category_parent_id_idx" ON "categories"("parent_id");

-- Create attributes table
CREATE TABLE IF NOT EXISTS "attributes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL,
  "options" JSONB,
  "unit" TEXT,
  "is_required" BOOLEAN NOT NULL DEFAULT false,
  "category_id" UUID REFERENCES "categories"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index on category_id for faster lookups
CREATE INDEX IF NOT EXISTS "attribute_category_id_idx" ON "attributes"("category_id");

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "craftsman_id" UUID NOT NULL REFERENCES "users"("id"),
  "price" DOUBLE PRECISION NOT NULL,
  "discount_price" DOUBLE PRECISION,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "category_id" UUID REFERENCES "categories"("id"),
  "is_customizable" BOOLEAN NOT NULL DEFAULT false,
  "is_published" BOOLEAN NOT NULL DEFAULT false,
  "dimensions" TEXT,
  "weight" DOUBLE PRECISION,
  "weight_unit" TEXT DEFAULT 'kg',
  "material" TEXT,
  "color" TEXT,
  "lead_time" INTEGER,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "product_craftsman_id_idx" ON "products"("craftsman_id");
CREATE INDEX IF NOT EXISTS "product_category_id_idx" ON "products"("category_id");
CREATE INDEX IF NOT EXISTS "product_is_published_idx" ON "products"("is_published");

-- Create product_images table
CREATE TABLE IF NOT EXISTS "product_images" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "image_url" TEXT NOT NULL,
  "alt_text" TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "is_main" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS "product_image_product_id_idx" ON "product_images"("product_id");

-- Create product_attributes table
CREATE TABLE IF NOT EXISTS "product_attributes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "attribute_id" UUID NOT NULL REFERENCES "attributes"("id") ON DELETE CASCADE,
  "value" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "product_attribute_product_id_idx" ON "product_attributes"("product_id");
CREATE INDEX IF NOT EXISTS "product_attribute_attribute_id_idx" ON "product_attributes"("attribute_id");

-- Create inventory table
CREATE TABLE IF NOT EXISTS "inventory" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
  "sku" TEXT UNIQUE,
  "low_stock_threshold" INTEGER DEFAULT 5,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS "inventory_product_id_idx" ON "inventory"("product_id"); 