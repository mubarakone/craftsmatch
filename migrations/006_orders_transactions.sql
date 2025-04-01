-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  shipping_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  metadata JSONB,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS orders_buyer_id_idx ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS orders_seller_id_idx ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders can be viewed by the buyer and seller
CREATE POLICY "Users can view their own orders" 
ON public.orders
FOR SELECT USING (
  auth.uid() IN (
    SELECT auth_id FROM public.users WHERE id = orders.buyer_id
    UNION
    SELECT auth_id FROM public.users WHERE id = orders.seller_id
  )
);

-- Orders can be created by authenticated users
CREATE POLICY "Authenticated users can create orders" 
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = (SELECT auth_id FROM public.users WHERE id = orders.buyer_id)
);

-- Orders can be updated by buyer or seller depending on status
CREATE POLICY "Buyers and sellers can update orders depending on status" 
ON public.orders
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = (SELECT auth_id FROM public.users WHERE id = orders.buyer_id) AND 
   orders.status IN ('pending', 'cancelled'))
  OR
  (auth.uid() = (SELECT auth_id FROM public.users WHERE id = orders.seller_id) AND 
   orders.status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled'))
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  customizations JSONB,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order items can be viewed by the buyer and seller of the parent order
CREATE POLICY "Users can view their own order items" 
ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (
      auth.uid() IN (
        SELECT auth_id FROM public.users WHERE id = orders.buyer_id
        UNION
        SELECT auth_id FROM public.users WHERE id = orders.seller_id
      )
    )
  )
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  transaction_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  amount DECIMAL(10, 2) NOT NULL,
  fee_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  gateway_transaction_id TEXT,
  gateway TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS transactions_order_id_idx ON public.transactions(order_id);
CREATE INDEX IF NOT EXISTS transactions_buyer_id_idx ON public.transactions(buyer_id);
CREATE INDEX IF NOT EXISTS transactions_seller_id_idx ON public.transactions(seller_id);
CREATE INDEX IF NOT EXISTS transactions_payment_status_idx ON public.transactions(payment_status);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions can be viewed by the buyer and seller
CREATE POLICY "Users can view their own transactions" 
ON public.transactions
FOR SELECT USING (
  auth.uid() IN (
    SELECT auth_id FROM public.users WHERE id = transactions.buyer_id
    UNION
    SELECT auth_id FROM public.users WHERE id = transactions.seller_id
  )
);

-- Insert sample order data
INSERT INTO public.orders (
  id,
  order_number,
  buyer_id,
  seller_id,
  status,
  total_amount,
  discount_amount,
  shipping_amount,
  tax_amount,
  currency,
  notes,
  shipping_address,
  billing_address,
  placed_at,
  updated_at,
  completed_at
) VALUES
(
  '00000000-0000-0000-0000-000000000601',
  'ORD-20230301-001',
  'e8e25e2c-4197-4a5d-95c3-1cb8cfcdce36', -- Robert Builder (buyer)
  '27bb271e-1b6b-4f82-99c0-9a0b57c22310', -- John Woodworker (seller)
  'completed',
  1345.00,
  0.00,
  75.00,
  70.00,
  'USD',
  'Please deliver to side entrance.',
  '{"name": "Robert Builder", "street": "123 Main St", "city": "Denver", "state": "CO", "zip": "80202", "country": "USA"}',
  '{"name": "Robert Builder", "street": "123 Main St", "city": "Denver", "state": "CO", "zip": "80202", "country": "USA"}',
  '2023-03-01 10:15:00+00',
  '2023-03-15 14:30:00+00',
  '2023-03-15 14:30:00+00'
),
(
  '00000000-0000-0000-0000-000000000602',
  'ORD-20230315-002',
  'd758998e-efeb-4f94-b440-3e14c924382e', -- Jennifer Homes (buyer)
  '47d20ea9-0825-4a82-a6b9-084bde5e7d54', -- Sarah Metals (seller)
  'shipped',
  192.50,
  17.50,
  35.00,
  0.00,
  'USD',
  NULL,
  '{"name": "Jennifer Homes", "street": "456 Oak Ave", "city": "Chicago", "state": "IL", "zip": "60611", "country": "USA"}',
  '{"name": "Jennifer Homes", "street": "456 Oak Ave", "city": "Chicago", "state": "IL", "zip": "60611", "country": "USA"}',
  '2023-03-15 15:45:00+00',
  '2023-03-18 09:20:00+00',
  NULL
),
(
  '00000000-0000-0000-0000-000000000603',
  'ORD-20230405-003',
  'd9e00342-990b-4573-b2c6-2ef121f95593', -- William Properties (buyer)
  'de451322-7ef4-4cea-877d-9fe0e330abbc', -- Michael Stone (seller)
  'processing',
  1025.00,
  100.00,
  125.00,
  0.00,
  'USD',
  'This is for a commercial project, please include assembly instructions.',
  '{"name": "William Properties", "street": "789 Business Park", "city": "Boston", "state": "MA", "zip": "02110", "country": "USA"}',
  '{"name": "William Properties", "street": "789 Business Park", "city": "Boston", "state": "MA", "zip": "02110", "country": "USA"}',
  '2023-04-05 11:30:00+00',
  '2023-04-06 16:45:00+00',
  NULL
),
(
  '00000000-0000-0000-0000-000000000604',
  'ORD-20230420-004',
  '329e01ce-ad87-44aa-9702-c70bd63ff5d7', -- Sophia Interiors (buyer)
  '4ee301e7-862b-4a77-974b-ee470afe50ba', -- Emma Glass (seller)
  'completed',
  385.00,
  0.00,
  35.00,
  0.00,
  'USD',
  'Gift wrapping requested.',
  '{"name": "Sophia Interiors", "street": "101 Design District", "city": "Austin", "state": "TX", "zip": "78701", "country": "USA"}',
  '{"name": "Sophia Interiors", "street": "101 Design District", "city": "Austin", "state": "TX", "zip": "78701", "country": "USA"}',
  '2023-04-20 14:15:00+00',
  '2023-04-27 11:30:00+00',
  '2023-04-27 11:30:00+00'
),
(
  '00000000-0000-0000-0000-000000000605',
  'ORD-20230505-005',
  'e8e25e2c-4197-4a5d-95c3-1cb8cfcdce36', -- Robert Builder (buyer)
  '5089c79b-9748-431c-abd2-976090fe2ad8', -- David Textiles (seller)
  'pending',
  225.00,
  0.00,
  0.00,
  0.00,
  'USD',
  NULL,
  '{"name": "Robert Builder", "street": "123 Main St", "city": "Denver", "state": "CO", "zip": "80202", "country": "USA"}',
  '{"name": "Robert Builder", "street": "123 Main St", "city": "Denver", "state": "CO", "zip": "80202", "country": "USA"}',
  '2023-05-05 09:45:00+00',
  '2023-05-05 09:45:00+00',
  NULL
)
ON CONFLICT (id) DO NOTHING;


-- Insert sample order item data
INSERT INTO public.order_items (
  order_id,
  product_id,
  quantity,
  unit_price,
  total_price,
  customizations,
  notes,
  status
) VALUES
(
  '00000000-0000-0000-0000-000000000601', -- Order by Robert Builder (Buyer)
  'd44b3f3c-2db7-47a5-a9fc-d848e1fd55d1', -- Farmhouse Dining Table
  1,
  1200.00,
  1200.00,
  '{"size": "medium", "finish": "natural", "pedestal": "trestle", "breadboard_ends": true}',
  'Please ensure the wood grain is consistent throughout.',
  'completed'
),
(
  '00000000-0000-0000-0000-000000000602', -- Order by Jennifer Homes (Buyer)
  'b12101cd-7972-4da0-ba1d-1fe18a3ccfb0', -- Wrought Iron Wall Sconce
  1,
  175.00,
  175.00,
  NULL,
  NULL,
  'shipped'
),
(
  '00000000-0000-0000-0000-000000000603', -- Order by William Properties (Buyer)
  '13f7e977-c032-414f-af61-6cda96fb88ef', -- Stone Garden Fountain
  1,
  1000.00,
  1000.00,
  '{"finish": "polished"}',
  'This will be installed in an office lobby.',
  'processing'
),
(
  '00000000-0000-0000-0000-000000000604', -- Order by Sophia Interiors (Buyer)
  'ef6ae4fc-d135-4ef9-9018-0186a9f709bb', -- Stained Glass Window Panel
  1,
  350.00,
  350.00,
  '{"color_scheme": "blue-amber", "design_theme": "art-nouveau", "hanging_hardware": true}',
  'This is a gift, please package accordingly.',
  'completed'
),
(
  '00000000-0000-0000-0000-000000000605', -- Order by Robert Builder (Buyer)
  'e55c0cbc-a63a-4028-9f52-98b8e54f3720', -- Hand-Woven Wool Throw
  1,
  225.00,
  225.00,
  NULL,
  NULL,
  'pending'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample transaction data
-- Skip transactions for now
