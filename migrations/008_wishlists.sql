-- Create wishlists table
CREATE TABLE IF NOT EXISTS "wishlists" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) NOT NULL,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS "wishlists_user_id_idx" ON "wishlists" ("user_id");

-- Enable RLS on wishlists
ALTER TABLE "wishlists" ENABLE ROW LEVEL SECURITY;

-- Create policy for wishlists - only owner can see their wishlists
CREATE POLICY "Users can view their own wishlists" 
  ON "wishlists" 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for wishlists - only owner can insert their wishlists
CREATE POLICY "Users can create their own wishlists" 
  ON "wishlists" 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for wishlists - only owner can update their wishlists
CREATE POLICY "Users can update their own wishlists" 
  ON "wishlists" 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for wishlists - only owner can delete their wishlists
CREATE POLICY "Users can delete their own wishlists" 
  ON "wishlists" 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create wishlist items table
CREATE TABLE IF NOT EXISTS "wishlist_items" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "wishlist_id" UUID NOT NULL REFERENCES "wishlists"("id") ON DELETE CASCADE,
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE("wishlist_id", "product_id")
);

-- Create indices for faster lookups
CREATE INDEX IF NOT EXISTS "wishlist_items_wishlist_id_idx" ON "wishlist_items" ("wishlist_id");
CREATE INDEX IF NOT EXISTS "wishlist_items_product_id_idx" ON "wishlist_items" ("product_id");

-- Enable RLS on wishlist_items
ALTER TABLE "wishlist_items" ENABLE ROW LEVEL SECURITY;

-- Create policy for wishlist_items - only owner can see their wishlist items
-- This policy uses a join to verify user ownership
CREATE POLICY "Users can view their own wishlist items" 
  ON "wishlist_items" 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

-- Create policy for wishlist_items - only owner can insert items to their wishlists
CREATE POLICY "Users can add items to their own wishlists" 
  ON "wishlist_items" 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

-- Create policy for wishlist_items - only owner can update their wishlist items
CREATE POLICY "Users can update their own wishlist items" 
  ON "wishlist_items" 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

-- Create policy for wishlist_items - only owner can delete their wishlist items
CREATE POLICY "Users can delete their own wishlist items" 
  ON "wishlist_items" 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  ); 