-- Create extension for UUID generation if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on parent_id for faster lookups
CREATE INDEX IF NOT EXISTS category_parent_id_idx ON public.categories(parent_id);

-- Create RLS policies for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policy for reading categories (public)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories
FOR SELECT USING (true);

-- Create attributes table
CREATE TABLE IF NOT EXISTS public.attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  options JSONB,
  unit TEXT,
  is_required BOOLEAN DEFAULT false NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on category_id for faster lookups
CREATE INDEX IF NOT EXISTS attribute_category_id_idx ON public.attributes(category_id);

-- Create RLS policies for attributes
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;

-- Policy for reading attributes (public)
CREATE POLICY "Attributes are viewable by everyone" 
ON public.attributes
FOR SELECT USING (true);

-- Insert parent categories
INSERT INTO public.categories (name, slug, description)
VALUES 
  ('Furniture', 'furniture', 'Handcrafted furniture items for indoor and outdoor spaces'),
  ('Ceramics', 'ceramics', 'Pottery and ceramic items for functional and decorative use'),
  ('Textiles', 'textiles', 'Handwoven textiles and fabric goods for home and apparel'),
  ('Metalwork', 'metalwork', 'Hand-forged metal products for functional and decorative purposes'),
  ('Woodwork', 'woodwork', 'Custom wooden crafts and objects for various applications'),
  ('Jewelry', 'jewelry', 'Handmade jewelry items crafted from various materials'),
  ('Home Decor', 'home-decor', 'Decorative items for the home crafted by artisans'),
  ('Lighting', 'lighting', 'Custom lighting fixtures for home and office spaces'),
  ('Sculpture', 'sculpture', 'Artistic sculptures made from various materials'),
  ('Glasswork', 'glasswork', 'Glass art and functional glass items such as vases, bowls, etc.')
ON CONFLICT DO NOTHING;

-- Insert sample subcategories using dynamic linking
INSERT INTO public.categories (name, slug, description, parent_id)
VALUES
  ('Tables', 'tables', 'Dining tables, coffee tables, side tables, and more', (SELECT id FROM public.categories WHERE slug = 'furniture')),
  ('Chairs', 'chairs', 'Dining chairs, armchairs, stools, and other seating', (SELECT id FROM public.categories WHERE slug = 'furniture')),
  ('Cabinets', 'cabinets', 'Storage cabinets, display cases, sideboards, and dressers', (SELECT id FROM public.categories WHERE slug = 'furniture')),
  ('Lamps', 'lamps', 'Handcrafted lamps and light fixtures', (SELECT id FROM public.categories WHERE slug = 'lighting')),
  ('Sconces', 'sconces', 'Wall-mounted light fixtures', (SELECT id FROM public.categories WHERE slug = 'lighting')),
  ('Glass Sculptures', 'glass-sculptures', 'Artistic glass sculptures', (SELECT id FROM public.categories WHERE slug = 'sculpture')),
  ('Metal Sculptures', 'metal-sculptures', 'Artistic sculptures made of metal', (SELECT id FROM public.categories WHERE slug = 'sculpture')),
  ('Wood Sculptures', 'wood-sculptures', 'Artistic sculptures made of wood', (SELECT id FROM public.categories WHERE slug = 'sculpture')),
  ('Decorative Glass', 'decorative-glass', 'Decorative glass items such as vases, plates, etc.', (SELECT id FROM public.categories WHERE slug = 'glasswork'))
ON CONFLICT DO NOTHING;

-- Insert attributes linked to categories dynamically
INSERT INTO public.attributes (name, slug, description, type, options, unit, is_required, category_id)
VALUES 
-- Furniture attributes
  ('Material', 'material', 'Type of material used', 'select', '["Wood", "Metal", "Glass", "Marble", "Plastic", "Other"]', NULL, true, (SELECT id FROM public.categories WHERE slug = 'furniture')),
  ('Dimensions', 'dimensions', 'Dimensions of the furniture piece', 'text', NULL, NULL, true, (SELECT id FROM public.categories WHERE slug = 'furniture')),

-- Lighting attributes
  ('Light Source', 'light-source', 'Type of light source used', 'select', '["LED", "Incandescent", "Halogen", "Fluorescent", "Solar", "Other"]', NULL, true, (SELECT id FROM public.categories WHERE slug = 'lighting')),
  ('Power Source', 'power-source', 'How the light is powered', 'select', '["Battery", "Hardwired", "Plug-in", "Solar"]', NULL, true, (SELECT id FROM public.categories WHERE slug = 'lighting')),
  ('Wattage', 'wattage', 'Wattage of the light fixture', 'number', NULL, 'Watts', true, (SELECT id FROM public.categories WHERE slug = 'lighting')),

-- Jewelry attributes
  ('Metal Type', 'metal-type', 'Type of metal used in the creation', 'select', '["Gold", "Silver", "Platinum", "Bronze", "Stainless Steel", "Titanium", "Other"]', NULL, true, (SELECT id FROM public.categories WHERE slug = 'jewelry')),
  ('Gemstone', 'gemstone', 'Type of gemstone used', 'multiselect', '["Diamond", "Ruby", "Sapphire", "Emerald", "Amethyst", "Turquoise", "Opal", "Other"]', NULL, false, (SELECT id FROM public.categories WHERE slug = 'jewelry')),
  ('Size', 'size', 'Size of the jewelry item', 'text', NULL, NULL, true, (SELECT id FROM public.categories WHERE slug = 'jewelry')),

-- Sculpture attributes
  ('Material', 'sculpture-material', 'Material used for the sculpture', 'select', '["Wood", "Metal", "Glass", "Stone", "Clay", "Resin", "Other"]', NULL, true, (SELECT id FROM public.categories WHERE slug = 'sculpture')),
  ('Weight', 'weight', 'Weight of the sculpture', 'number', NULL, 'kg', false, (SELECT id FROM public.categories WHERE slug = 'sculpture'))
ON CONFLICT DO NOTHING;
