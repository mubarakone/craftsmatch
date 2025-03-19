-- Create conversations table
CREATE TABLE IF NOT EXISTS "conversations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "title" TEXT,
  "participant_ids" JSONB NOT NULL,
  "last_message_id" UUID,
  "last_message_at" TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS "messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversation_id" UUID NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "sender_id" UUID NOT NULL REFERENCES "users"("id"),
  "content" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index for faster message queries
CREATE INDEX IF NOT EXISTS "message_conversation_id_idx" ON "messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "message_sender_id_idx" ON "messages"("sender_id");
CREATE INDEX IF NOT EXISTS "message_created_at_idx" ON "messages"("created_at");
CREATE INDEX IF NOT EXISTS "message_is_read_idx" ON "messages"("is_read");

-- Self reference for last_message_id in conversations
ALTER TABLE "conversations" 
  ADD CONSTRAINT "conversations_last_message_id_fkey" 
  FOREIGN KEY ("last_message_id") REFERENCES "messages"("id") ON DELETE SET NULL;

-- Create attachments table
CREATE TABLE IF NOT EXISTS "attachments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "message_id" UUID NOT NULL REFERENCES "messages"("id") ON DELETE CASCADE,
  "file_name" TEXT NOT NULL,
  "file_url" TEXT NOT NULL,
  "file_size" TEXT NOT NULL,
  "file_type" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index for faster attachment queries
CREATE INDEX IF NOT EXISTS "attachment_message_id_idx" ON "attachments"("message_id");

-- Create reviews table
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "reviewer_id" UUID NOT NULL REFERENCES "users"("id"),
  "reviewee_id" UUID NOT NULL REFERENCES "users"("id"),
  "product_id" UUID REFERENCES "products"("id"),
  "order_id" UUID REFERENCES "orders"("id"),
  "rating" INTEGER NOT NULL,
  "title" TEXT,
  "content" TEXT,
  "response" TEXT,
  "response_date" TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "is_public" BOOLEAN NOT NULL DEFAULT true,
  "images" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for faster review queries
CREATE INDEX IF NOT EXISTS "review_reviewer_id_idx" ON "reviews"("reviewer_id");
CREATE INDEX IF NOT EXISTS "review_reviewee_id_idx" ON "reviews"("reviewee_id");
CREATE INDEX IF NOT EXISTS "review_product_id_idx" ON "reviews"("product_id");
CREATE INDEX IF NOT EXISTS "review_order_id_idx" ON "reviews"("order_id");
CREATE INDEX IF NOT EXISTS "review_rating_idx" ON "reviews"("rating");
CREATE INDEX IF NOT EXISTS "review_status_idx" ON "reviews"("status"); 