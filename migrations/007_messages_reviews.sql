-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  participants JSONB NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_archived BOOLEAN DEFAULT false NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title TEXT,
  review_content TEXT,
  reply TEXT,
  reply_date TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS conversations_order_id_idx ON public.conversations(order_id);
CREATE INDEX IF NOT EXISTS conversations_product_id_idx ON public.conversations(product_id);
CREATE INDEX IF NOT EXISTS conversations_participants_idx ON public.conversations USING GIN (participants);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

CREATE INDEX IF NOT EXISTS attachments_message_id_idx ON public.attachments(message_id);

CREATE INDEX IF NOT EXISTS reviews_order_id_idx ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS reviews_reviewer_id_idx ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS reviews_recipient_id_idx ON public.reviews(recipient_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON public.reviews(rating);

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Conversations RLS Policies
CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations
FOR SELECT USING (
  auth.uid() IN (
    SELECT auth_id FROM public.users 
    WHERE id::text IN (
      SELECT jsonb_array_elements_text(participants) FROM public.conversations 
      WHERE conversations.id = public.conversations.id
    )
  )
);

CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT auth_id FROM public.users 
    WHERE id::text IN (
      SELECT jsonb_array_elements_text(participants) FROM (SELECT participants FROM public.conversations WHERE id = public.conversations.id) as parts
    )
  )
);

-- Messages RLS Policies
CREATE POLICY "Conversation participants can view messages" 
ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND auth.uid() IN (
      SELECT auth_id FROM public.users 
      WHERE id::text IN (
        SELECT jsonb_array_elements_text(participants) FROM public.conversations 
        WHERE conversations.id = messages.conversation_id
      )
    )
  )
);

CREATE POLICY "Conversation participants can create messages" 
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND auth.uid() IN (
      SELECT auth_id FROM public.users 
      WHERE id::text IN (
        SELECT jsonb_array_elements_text(participants) FROM public.conversations 
        WHERE conversations.id = messages.conversation_id
      )
    )
  )
  AND
  auth.uid() = (SELECT auth_id FROM public.users WHERE id = messages.sender_id)
);

CREATE POLICY "Senders can update their messages" 
ON public.messages
FOR UPDATE
TO authenticated
USING (
  auth.uid() = (SELECT auth_id FROM public.users WHERE id = messages.sender_id)
);

-- Attachments RLS Policies
CREATE POLICY "Conversation participants can view attachments" 
ON public.attachments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.messages
    JOIN public.conversations ON messages.conversation_id = conversations.id
    WHERE messages.id = attachments.message_id
    AND auth.uid() IN (
      SELECT auth_id FROM public.users 
      WHERE id::text IN (
        SELECT jsonb_array_elements_text(participants) FROM public.conversations 
        WHERE conversations.id = messages.conversation_id
      )
    )
  )
);

-- Reviews RLS Policies
CREATE POLICY "Published reviews are viewable by everyone" 
ON public.reviews
FOR SELECT USING (
  is_published = true
);

CREATE POLICY "Reviewers and recipients can view their own reviews" 
ON public.reviews
FOR SELECT USING (
  auth.uid() IN (
    SELECT auth_id FROM public.users WHERE id = reviews.reviewer_id
    UNION
    SELECT auth_id FROM public.users WHERE id = reviews.recipient_id
  )
);

CREATE POLICY "Reviewers can update their own reviews" 
ON public.reviews
FOR UPDATE
TO authenticated
USING (
  auth.uid() = (SELECT auth_id FROM public.users WHERE id = reviews.reviewer_id)
);

CREATE POLICY "Recipients can reply to reviews" 
ON public.reviews
FOR UPDATE
TO authenticated
USING (
  auth.uid() = (SELECT auth_id FROM public.users WHERE id = reviews.recipient_id)
);

-- Insert sample conversation data
INSERT INTO public.conversations (
  id,
  title,
  participants,
  order_id,
  product_id,
  created_at,
  updated_at,
  last_message_at,
  is_archived
) VALUES
(
  '00000000-0000-0000-0000-000000000801',
  'Farmhouse Dining Table Inquiry',
  '["e8e25e2c-4197-4a5d-95c3-1cb8cfcdce36", "27bb271e-1b6b-4f82-99c0-9a0b57c22310"]',
  '00000000-0000-0000-0000-000000000601',
  'd44b3f3c-2db7-47a5-a9fc-d848e1fd55d1',
  '2025-01-01 10:00:00+00',
  '2025-01-02 12:00:00+00',
  '2025-01-02 12:00:00+00',
  false
),
(
  '00000000-0000-0000-0000-000000000802',
  'Stained Glass Panel Inquiry',
  '["329e01ce-ad87-44aa-9702-c70bd63ff5d7", "4ee301e7-862b-4a77-974b-ee470afe50ba"]',
  '00000000-0000-0000-0000-000000000604',
  'ef6ae4fc-d135-4ef9-9018-0186a9f709bb',
  '2025-01-03 11:00:00+00',
  '2025-01-04 14:00:00+00',
  '2025-01-04 14:00:00+00',
  false
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample messages data
INSERT INTO public.messages (
  conversation_id,
  sender_id,
  content,
  is_read,
  read_at,
  created_at
) VALUES
(
  '00000000-0000-0000-0000-000000000801',
  'e8e25e2c-4197-4a5d-95c3-1cb8cfcdce36',
  'Hi! I''m interested in your farmhouse dining table. Can you provide more details on customization options?',
  true,
  '2025-01-01 10:15:00+00',
  '2025-01-01 10:00:00+00'
),
(
  '00000000-0000-0000-0000-000000000801',
  '27bb271e-1b6b-4f82-99c0-9a0b57c22310',
  'Hello! Yes, I can customize the table size, wood type, and finish. Would you like me to provide you with a quote?',
  true,
  '2025-01-01 10:30:00+00',
  '2025-01-01 10:15:00+00'
),
(
  '00000000-0000-0000-0000-000000000802',
  '329e01ce-ad87-44aa-9702-c70bd63ff5d7',
  'I love the stained glass panel designs. Can you make one with a custom pattern?',
  true,
  '2025-01-03 11:15:00+00',
  '2025-01-03 11:00:00+00'
),
(
  '00000000-0000-0000-0000-000000000802',
  '4ee301e7-862b-4a77-974b-ee470afe50ba',
  'Yes, I can create custom designs. Just share your ideas, and I''ll work on a design draft.',
  true,
  '2025-01-04 14:00:00+00',
  '2025-01-04 13:45:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample attachment data
INSERT INTO public.attachments (
  message_id,
  file_url,
  file_name,
  file_type,
  file_size
) VALUES
(
  (SELECT id FROM public.messages WHERE conversation_id = '00000000-0000-0000-0000-000000000801' LIMIT 1),
  'https://example.com/uploads/table_design1.jpg',
  'table_design1.jpg',
  'image/jpeg',
  2048000
),
(
  (SELECT id FROM public.messages WHERE conversation_id = '00000000-0000-0000-0000-000000000802' LIMIT 1),
  'https://example.com/uploads/glass_design1.jpg',
  'glass_design1.jpg',
  'image/jpeg',
  1024000
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample review data
INSERT INTO public.reviews (
  id,
  order_id,
  product_id,
  reviewer_id,
  recipient_id,
  rating,
  review_title,
  review_content,
  reply,
  reply_date,
  is_published,
  created_at
) VALUES
(
  '00000000-0000-0000-0000-000000000901',
  '00000000-0000-0000-0000-000000000601',
  'd44b3f3c-2db7-47a5-a9fc-d848e1fd55d1',
  'e8e25e2c-4197-4a5d-95c3-1cb8cfcdce36',
  '27bb271e-1b6b-4f82-99c0-9a0b57c22310',
  5,
  'Beautiful Craftsmanship',
  'The table exceeded my expectations. The finish is perfect and the customization was exactly what I wanted. Highly recommend!',
  'Thank you so much for your kind words! It was a pleasure working with you.',
  '2025-01-05 10:30:00+00',
  true,
  '2025-01-05 09:00:00+00'
),
(
  '00000000-0000-0000-0000-000000000902',
  '00000000-0000-0000-0000-000000000604',
  'ef6ae4fc-d135-4ef9-9018-0186a9f709bb',
  '329e01ce-ad87-44aa-9702-c70bd63ff5d7',
  '4ee301e7-862b-4a77-974b-ee470afe50ba',
  4,
  'Great Stained Glass Panel',
  'The panel is gorgeous, but I wish there were more color options. Otherwise, I love it!',
  'Thank you for your feedback! I will definitely consider expanding the color palette.',
  '2025-01-06 11:00:00+00',
  true,
  '2025-01-06 10:30:00+00'
)
ON CONFLICT (id) DO NOTHING;