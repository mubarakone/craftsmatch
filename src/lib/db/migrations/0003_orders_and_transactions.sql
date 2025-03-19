-- Create orders table
CREATE TABLE IF NOT EXISTS "orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_number" TEXT UNIQUE NOT NULL,
  "buyer_id" UUID NOT NULL REFERENCES "users"("id"),
  "seller_id" UUID NOT NULL REFERENCES "users"("id"),
  "status" TEXT NOT NULL DEFAULT 'pending',
  "total_price" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "shipping" DOUBLE PRECISION,
  "tax" DOUBLE PRECISION,
  "notes" TEXT,
  "is_custom_order" BOOLEAN NOT NULL DEFAULT false,
  "custom_requirements" TEXT,
  "estimated_delivery_date" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS "order_buyer_id_idx" ON "orders"("buyer_id");
CREATE INDEX IF NOT EXISTS "order_seller_id_idx" ON "orders"("seller_id");
CREATE INDEX IF NOT EXISTS "order_status_idx" ON "orders"("status");

-- Create order_items table
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "product_id" UUID NOT NULL REFERENCES "products"("id"),
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unit_price" DOUBLE PRECISION NOT NULL,
  "customizations" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index for order_items
CREATE INDEX IF NOT EXISTS "order_item_order_id_idx" ON "order_items"("order_id");
CREATE INDEX IF NOT EXISTS "order_item_product_id_idx" ON "order_items"("product_id");

-- Create shipping table
CREATE TABLE IF NOT EXISTS "shipping" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE UNIQUE,
  "recipient_name" TEXT NOT NULL,
  "address_line1" TEXT NOT NULL,
  "address_line2" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "zip_code" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "phone_number" TEXT,
  "tracking_number" TEXT,
  "shipping_carrier" TEXT,
  "shipping_method" TEXT,
  "shipping_status" TEXT NOT NULL DEFAULT 'pending',
  "estimated_delivery_date" TIMESTAMP,
  "actual_delivery_date" TIMESTAMP,
  "special_instructions" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index for shipping
CREATE INDEX IF NOT EXISTS "shipping_order_id_idx" ON "shipping"("order_id");
CREATE INDEX IF NOT EXISTS "shipping_status_idx" ON "shipping"("shipping_status");

-- Create samples table
CREATE TABLE IF NOT EXISTS "samples" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "request_number" TEXT UNIQUE NOT NULL,
  "product_id" UUID NOT NULL REFERENCES "products"("id"),
  "buyer_id" UUID NOT NULL REFERENCES "users"("id"),
  "seller_id" UUID NOT NULL REFERENCES "users"("id"),
  "status" TEXT NOT NULL DEFAULT 'requested',
  "request_reason" TEXT NOT NULL,
  "seller_notes" TEXT,
  "shipping_id" UUID REFERENCES "shipping"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for samples
CREATE INDEX IF NOT EXISTS "sample_buyer_id_idx" ON "samples"("buyer_id");
CREATE INDEX IF NOT EXISTS "sample_seller_id_idx" ON "samples"("seller_id");
CREATE INDEX IF NOT EXISTS "sample_product_id_idx" ON "samples"("product_id");
CREATE INDEX IF NOT EXISTS "sample_status_idx" ON "samples"("status");

-- Create revisions table
CREATE TABLE IF NOT EXISTS "revisions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "requested_by" UUID NOT NULL REFERENCES "users"("id"),
  "status" TEXT NOT NULL DEFAULT 'requested',
  "description" TEXT NOT NULL,
  "attachments" JSONB,
  "response_notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for revisions
CREATE INDEX IF NOT EXISTS "revision_order_id_idx" ON "revisions"("order_id");
CREATE INDEX IF NOT EXISTS "revision_requested_by_idx" ON "revisions"("requested_by");
CREATE INDEX IF NOT EXISTS "revision_status_idx" ON "revisions"("status");

-- Create transactions table
CREATE TABLE IF NOT EXISTS "transactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "transaction_id" TEXT UNIQUE NOT NULL,
  "order_id" UUID REFERENCES "orders"("id"),
  "buyer_id" UUID NOT NULL REFERENCES "users"("id"),
  "seller_id" UUID NOT NULL REFERENCES "users"("id"),
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "payment_method" TEXT NOT NULL,
  "payment_details" JSONB,
  "blockchain_tx_hash" TEXT,
  "blockchain_network" TEXT,
  "wallet_address" TEXT,
  "platform_fee" DOUBLE PRECISION,
  "seller_payout" DOUBLE PRECISION,
  "description" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS "transaction_order_id_idx" ON "transactions"("order_id");
CREATE INDEX IF NOT EXISTS "transaction_buyer_id_idx" ON "transactions"("buyer_id");
CREATE INDEX IF NOT EXISTS "transaction_seller_id_idx" ON "transactions"("seller_id");
CREATE INDEX IF NOT EXISTS "transaction_status_idx" ON "transactions"("status"); 