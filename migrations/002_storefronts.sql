-- Create extension for UUID generation if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop foreign key constraint temporarily (if it exists)
ALTER TABLE IF EXISTS public.storefronts DROP CONSTRAINT IF EXISTS storefronts_user_id_fkey;

-- Create storefronts table
CREATE TABLE IF NOT EXISTS public.storefronts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  banner_url TEXT,
  location TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS storefront_user_id_idx ON public.storefronts(user_id);

-- Create RLS policies for storefronts
ALTER TABLE public.storefronts ENABLE ROW LEVEL SECURITY;

-- Policy for reading storefronts (public)
CREATE POLICY "Storefronts are viewable by everyone" 
ON public.storefronts
FOR SELECT USING (true);

-- Create storefront_customization table
CREATE TABLE IF NOT EXISTS public.storefront_customization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storefront_id UUID NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE UNIQUE,
  primary_color TEXT DEFAULT '#4f46e5',
  secondary_color TEXT DEFAULT '#f43f5e',
  accent_color TEXT DEFAULT '#10b981',
  font_family TEXT DEFAULT 'Inter',
  header_layout TEXT DEFAULT 'standard',
  product_card_style TEXT DEFAULT 'standard',
  custom_css TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on storefront_id for faster lookups
CREATE INDEX IF NOT EXISTS storefront_customization_storefront_id_idx ON public.storefront_customization(storefront_id);

-- Create RLS policies for storefront customization
ALTER TABLE public.storefront_customization ENABLE ROW LEVEL SECURITY;

-- Policy for reading storefront customization (public)
CREATE POLICY "Storefront customization is viewable by everyone" 
ON public.storefront_customization
FOR SELECT USING (true);

-- Insert sample storefront data linking to previously created users (6 craftsmen and 6 builders)
INSERT INTO public.storefronts (
  id,
  user_id,
  name,
  description,
  slug,
  logo_url,
  banner_url,
  location,
  contact_email,
  contact_phone
) VALUES
  ('00000000-0000-0000-0000-000000000101', (SELECT id FROM public.users WHERE email = 'john.woodworker@example.com'), 'Oak & Pine Woodworks', 'Handcrafted wooden furniture and decor.', 'oak-and-pine', 'https://example.com/logos/oak-and-pine.png', 'https://example.com/banners/oak-and-pine-banner.jpg', 'Portland, Oregon', 'info@oakandpinewoodworks.com', '(503) 555-1234'),
  ('00000000-0000-0000-0000-000000000102', (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'), 'Ironforge Metalcraft', 'Bold metal pieces from Detroit.', 'ironforge-metalcraft', 'https://example.com/logos/ironforge.png', 'https://example.com/banners/ironforge-banner.jpg', 'Detroit, Michigan', 'create@ironforgemetalcraft.com', '(313) 555-6789'),
  ('00000000-0000-0000-0000-000000000103', (SELECT id FROM public.users WHERE email = 'michael.stone@example.com'), 'Stonehill Masonry', 'Natural stone constructions including fireplaces and outdoor kitchens.', 'stonehill-masonry', 'https://example.com/logos/stonehill.png', 'https://example.com/banners/stonehill-banner.jpg', 'Boulder, Colorado', 'contact@stonehillmasonry.com', '(720) 555-4321'),
  ('00000000-0000-0000-0000-000000000104', (SELECT id FROM public.users WHERE email = 'emma.glass@example.com'), 'Glass Haven Art Studio', 'Custom stained glass pieces and sculptures.', 'glass-haven', 'https://example.com/logos/glass-haven.png', 'https://example.com/banners/glass-haven-banner.jpg', 'Seattle, Washington', 'info@glasshavenstudio.com', '(206) 555-8765'),
  ('00000000-0000-0000-0000-000000000105', (SELECT id FROM public.users WHERE email = 'david.textiles@example.com'), 'Textile Traditions', 'Unique fabric designs blending Southwest patterns.', 'textile-traditions', 'https://example.com/logos/textile-traditions.png', 'https://example.com/banners/textile-traditions-banner.jpg', 'Santa Fe, New Mexico', 'create@textiletraditions.com', '(505) 555-9876'),
  ('00000000-0000-0000-0000-000000000106', (SELECT id FROM public.users WHERE email = 'olivia.pottery@example.com'), 'Clay & Kiln Pottery', 'Functional vessels and decorative ceramic art.', 'clay-and-kiln', 'https://example.com/logos/clay-and-kiln.png', 'https://example.com/banners/clay-and-kiln-banner.jpg', 'Asheville, North Carolina', 'hello@clayandkiln.com', '(828) 555-2468')
ON CONFLICT (id) DO NOTHING;

-- Insert sample storefront customization data
INSERT INTO public.storefront_customization (
  storefront_id,
  primary_color,
  secondary_color,
  accent_color,
  font_family,
  header_layout,
  product_card_style
) VALUES
  ('00000000-0000-0000-0000-000000000101', '#5f4b32', '#8b6f4e', '#3d9970', 'Roboto', 'centered', 'minimal'),
  ('00000000-0000-0000-0000-000000000102', '#2c3e50', '#e74c3c', '#f39c12', 'Montserrat', 'left-aligned', 'bold'),
  ('00000000-0000-0000-0000-000000000103', '#596563', '#8a9a94', '#dbba4f', 'Lato', 'standard', 'framed'),
  ('00000000-0000-0000-0000-000000000104', '#2a6496', '#7fb2d9', '#e67e22', 'Poppins', 'transparent', 'glass'),
  ('00000000-0000-0000-0000-000000000105', '#c45b74', '#f4e6bd', '#698157', 'Playfair Display', 'centered', 'textured'),
  ('00000000-0000-0000-0000-000000000106', '#765341', '#c2a792', '#db8a74', 'Merriweather', 'standard', 'organic')
ON CONFLICT DO NOTHING;