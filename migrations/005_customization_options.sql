-- Create customization_options table
CREATE TABLE IF NOT EXISTS public.customization_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  required BOOLEAN DEFAULT false NOT NULL,
  additional_cost DOUBLE PRECISION DEFAULT 0 NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on product_id for faster lookups
CREATE INDEX IF NOT EXISTS customization_options_product_id_idx ON public.customization_options(product_id);

-- Create RLS policies for customization options
ALTER TABLE public.customization_options ENABLE ROW LEVEL SECURITY;

-- Policy for reading customization options (public)
CREATE POLICY "Customization options are viewable by everyone" 
ON public.customization_options
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = customization_options.product_id
    AND (products.is_published = true OR (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = products.craftsman_id
        AND users.auth_id = auth.uid()
      )
    ))
  )
);

-- Policy for managing customization options (product owner only)
CREATE POLICY "Product owners can manage customization options" 
ON public.customization_options
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products
    JOIN public.users ON products.craftsman_id = users.id
    WHERE customization_options.product_id = products.id
    AND users.auth_id = auth.uid()
  )
);

-- Create customization_option_choices table
CREATE TABLE IF NOT EXISTS public.customization_option_choices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id UUID NOT NULL REFERENCES public.customization_options(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  additional_cost DOUBLE PRECISION DEFAULT 0 NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  available BOOLEAN DEFAULT true NOT NULL,
  metadata TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on option_id for faster lookups
CREATE INDEX IF NOT EXISTS customization_option_choices_option_id_idx ON public.customization_option_choices(option_id);

-- Create RLS policies for customization option choices
ALTER TABLE public.customization_option_choices ENABLE ROW LEVEL SECURITY;

-- Policy for reading customization option choices (public)
CREATE POLICY "Customization option choices are viewable by everyone" 
ON public.customization_option_choices
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.customization_options
    JOIN public.products ON customization_options.product_id = products.id
    WHERE customization_option_choices.option_id = customization_options.id
    AND (products.is_published = true OR (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = products.craftsman_id
        AND users.auth_id = auth.uid()
      )
    ))
  )
);

-- Policy for managing customization option choices (product owner only)
CREATE POLICY "Product owners can manage customization option choices" 
ON public.customization_option_choices
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customization_options
    JOIN public.products ON customization_options.product_id = products.id
    JOIN public.users ON products.craftsman_id = users.id
    WHERE customization_option_choices.option_id = customization_options.id
    AND users.auth_id = auth.uid()
  )
);

-- Insert sample customization options
INSERT INTO public.customization_options (
  product_id,
  name,
  description,
  type,
  required,
  additional_cost,
  display_order
) VALUES
-- Farmhouse table customization options
(
  (SELECT id FROM public.products WHERE slug = 'farmhouse-dining-table'),
  'Size',
  'Select the dimensions of your table',
  'select',
  true,
  0,
  0
),
(
  (SELECT id FROM public.products WHERE slug = 'farmhouse-dining-table'),
  'Finish',
  'Choose the finish for your table',
  'select',
  true,
  0,
  1
),
(
  (SELECT id FROM public.products WHERE slug = 'farmhouse-dining-table'),
  'Pedestal Style',
  'Select the style of table base',
  'select',
  true,
  0,
  2
),
(
  (SELECT id FROM public.products WHERE slug = 'farmhouse-dining-table'),
  'Edge Profile',
  'Choose the edge style for your tabletop',
  'select',
  false,
  0,
  3
),
(
  (SELECT id FROM public.products WHERE slug = 'farmhouse-dining-table'),
  'Add Breadboard Ends',
  'Adds decorative breadboard ends to the tabletop',
  'boolean',
  false,
  150,
  4
)
ON CONFLICT DO NOTHING;

-- Insert sample customization option choices
INSERT INTO public.customization_option_choices (
  option_id,
  value,
  label,
  description,
  additional_cost,
  display_order,
  is_default,
  available
) VALUES
-- Farmhouse table size options
(
  (SELECT id FROM public.customization_options WHERE name = 'Size' AND product_id = (SELECT id FROM public.products WHERE slug = 'farmhouse-dining-table')),
  'small',
  'Small (60" x 36")',
  'Seats 4-6 people comfortably',
  -200,
  0,
  false,
  true
),
(
  (SELECT id FROM public.customization_options WHERE name = 'Size' AND product_id = (SELECT id FROM public.products WHERE slug = 'farmhouse-dining-table')),
  'medium',
  'Medium (72" x 36")',
  'Seats 6-8 people comfortably',
  0,
  1,
  true,
  true
),
(
  (SELECT id FROM public.customization_options WHERE name = 'Size' AND product_id = (SELECT id FROM public.products WHERE slug = 'farmhouse-dining-table')),
  'large',
  'Large (84" x 40")',
  'Seats 8-10 people comfortably',
  300,
  2,
  false,
  true
)
ON CONFLICT DO NOTHING;