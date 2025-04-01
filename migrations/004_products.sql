-- Create extension for UUID generation if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  craftsman_id UUID NOT NULL REFERENCES public.users(id),
  storefront_id UUID REFERENCES public.storefronts(id),
  price DOUBLE PRECISION NOT NULL,
  discount_price DOUBLE PRECISION,
  currency TEXT DEFAULT 'USD' NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  is_customizable BOOLEAN DEFAULT false NOT NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
  dimensions TEXT,
  weight DOUBLE PRECISION,
  weight_unit TEXT DEFAULT 'kg',
  material TEXT,
  color TEXT,
  lead_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for products
CREATE INDEX IF NOT EXISTS product_craftsman_id_idx ON public.products(craftsman_id);
CREATE INDEX IF NOT EXISTS product_storefront_id_idx ON public.products(storefront_id);
CREATE INDEX IF NOT EXISTS product_category_id_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS product_is_published_idx ON public.products(is_published);

-- Create RLS policies for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy for reading published products (public)
CREATE POLICY "Published products are viewable by everyone" 
ON public.products
FOR SELECT 
USING (is_published = true OR (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = products.craftsman_id 
  AND auth.uid() = auth_id
)));

-- Policy for inserting/updating products (craftsman only)
CREATE POLICY "Craftsmen can manage their own products" 
ON public.products
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = products.craftsman_id 
  AND auth.uid() = auth_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = products.craftsman_id 
  AND auth.uid() = auth_id
));

-- Create product_images table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_main BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for product_images
CREATE INDEX IF NOT EXISTS product_image_product_id_idx ON public.product_images(product_id);

-- Create RLS policies for product images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Policy for reading product images (public)
CREATE POLICY "Product images are viewable by everyone" 
ON public.product_images
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE products.id = product_images.product_id
    AND (products.is_published = true OR (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = products.craftsman_id
        AND users.auth_id = auth.uid()
      )
    ))
  )
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 0 NOT NULL,
  reserved_quantity INTEGER DEFAULT 0 NOT NULL,
  sku TEXT UNIQUE,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for inventory
CREATE INDEX IF NOT EXISTS inventory_product_id_idx ON public.inventory(product_id);

-- Create RLS policies for inventory
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Policy for reading inventory (product owner only)
CREATE POLICY "Product owners can view their product inventory" 
ON public.inventory
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products
    JOIN public.users ON products.craftsman_id = users.id
    WHERE inventory.product_id = products.id
    AND users.auth_id = auth.uid()
  )
);

-- Policy for managing inventory (product owner only)
CREATE POLICY "Product owners can manage their product inventory" 
ON public.inventory
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products
    JOIN public.users ON products.craftsman_id = users.id
    WHERE inventory.product_id = products.id
    AND users.auth_id = auth.uid()
  )
);

-- Insert sample products linked to users and storefronts
INSERT INTO public.products (
  name,
  slug,
  description,
  craftsman_id,
  storefront_id,
  price,
  discount_price,
  currency,
  category_id,
  is_customizable,
  is_published,
  dimensions,
  weight,
  weight_unit,
  material,
  color,
  lead_time
) VALUES
-- Furniture Products
(
  'Farmhouse Dining Table',
  'farmhouse-dining-table',
  'A rustic dining table crafted from reclaimed wood.',
  (SELECT id FROM public.users WHERE email = 'john.woodworker@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'oak-and-pine'),
  1200.00,
  999.99,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'tables'),
  true,
  true,
  '72"L x 36"W x 30"H',
  50,
  'kg',
  'Reclaimed Wood',
  'Natural',
  14
),
(
  'Mid-Century Modern Chair',
  'mid-century-modern-chair',
  'Elegant chair with clean lines and smooth curves.',
  (SELECT id FROM public.users WHERE email = 'john.woodworker@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'oak-and-pine'),
  350.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'chairs'),
  false,
  true,
  '18"W x 18"D x 32"H',
  15,
  'kg',
  'Walnut',
  'Brown',
  10
),
(
  'Hand-Carved Cabinet',
  'hand-carved-cabinet',
  'Intricately carved cabinet with ample storage space.',
  (SELECT id FROM public.users WHERE email = 'john.woodworker@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'oak-and-pine'),
  800.00,
  750.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'cabinets'),
  true,
  true,
  '40"W x 20"D x 70"H',
  75,
  'kg',
  'Oak',
  'Dark Brown',
  21
),
-- Metalwork Products
(
  'Wrought Iron Wall Sconce',
  'wrought-iron-wall-sconce',
  'Hand-forged iron sconce with rustic finish.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  175.00,
  150.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'light-fixtures'),
  false,
  true,
  '12"W x 8"D x 18"H',
  5,
  'kg',
  'Iron',
  'Black',
  7
),
(
  'Decorative Iron Gate',
  'decorative-iron-gate',
  'Custom-made iron gate with ornate detailing.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  2500.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'metalwork'),
  true,
  true,
  '60"W x 84"H',
  120,
  'kg',
  'Iron',
  'Black',
  30
),
-- Ceramics Products
(
  'Stoneware Dinner Set',
  'stoneware-dinner-set',
  'Durable and stylish stoneware dinner set for four.',
  (SELECT id FROM public.users WHERE email = 'olivia.pottery@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'clay-and-kiln'),
  320.00,
  275.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'tableware'),
  false,
  true,
  'Varies',
  5,
  'kg',
  'Stoneware',
  'Seafoam Green',
  10
),
(
  'Decorative Ceramic Vase',
  'decorative-ceramic-vase',
  'Hand-painted ceramic vase perfect for home decor.',
  (SELECT id FROM public.users WHERE email = 'olivia.pottery@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'clay-and-kiln'),
  120.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'vases'),
  false,
  true,
  '10"W x 20"H',
  4,
  'kg',
  'Porcelain',
  'White & Blue',
  5
),
-- Textiles Products
(
  'Hand-Woven Wool Blanket',
  'hand-woven-wool-blanket',
  'Luxurious wool blanket made with traditional techniques.',
  (SELECT id FROM public.users WHERE email = 'david.textiles@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'textile-traditions'),
  225.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'blankets'),
  false,
  true,
  '50"W x 70"L',
  2,
  'kg',
  'Wool',
  'Blue/Gray',
  5
),
(
  'Hand-Woven Area Rug',
  'hand-woven-area-rug',
  'Beautifully crafted rug with intricate patterns.',
  (SELECT id FROM public.users WHERE email = 'david.textiles@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'textile-traditions'),
  900.00,
  850.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'rugs'),
  true,
  true,
  '120"W x 180"L',
  12,
  'kg',
  'Cotton',
  'Multi-colored',
  15
),
-- Additional Furniture Products
(
  'Rustic Coffee Table',
  'rustic-coffee-table',
  'Beautiful coffee table with a rustic finish and natural wood grain.',
  (SELECT id FROM public.users WHERE email = 'john.woodworker@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'oak-and-pine'),
  450.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'tables'),
  true,
  true,
  '48"L x 24"W x 18"H',
  20,
  'kg',
  'Pine',
  'Dark Walnut',
  12
),
(
  'Oak Bookshelf',
  'oak-bookshelf',
  'Handcrafted bookshelf made from solid oak with a natural finish.',
  (SELECT id FROM public.users WHERE email = 'john.woodworker@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'oak-and-pine'),
  850.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'cabinets'),
  false,
  true,
  '60"W x 12"D x 72"H',
  70,
  'kg',
  'Oak',
  'Natural',
  15
),

-- Metalwork Products
(
  'Forged Iron Candle Holder',
  'forged-iron-candle-holder',
  'Unique candle holder crafted from hand-forged iron.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  60.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'home-decor'),
  false,
  true,
  '10"H',
  2,
  'kg',
  'Iron',
  'Black',
  7
),
(
  'Custom Metal Railings',
  'custom-metal-railings',
  'Bespoke metal railings with intricate detailing.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  1500.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'metalwork'),
  true,
  true,
  'Varies',
  90,
  'kg',
  'Steel',
  'Matte Black',
  30
),

-- Ceramics Products
(
  'Hand-Painted Plate Set',
  'hand-painted-plate-set',
  'A set of four hand-painted plates featuring floral designs.',
  (SELECT id FROM public.users WHERE email = 'olivia.pottery@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'clay-and-kiln'),
  150.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'tableware'),
  false,
  true,
  '10" diameter',
  2,
  'kg',
  'Stoneware',
  'Blue & White',
  8
),
(
  'Porcelain Tea Set',
  'porcelain-tea-set',
  'Elegant porcelain tea set featuring a teapot, cups, and saucers.',
  (SELECT id FROM public.users WHERE email = 'olivia.pottery@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'clay-and-kiln'),
  300.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'tableware'),
  true,
  true,
  'Various',
  5,
  'kg',
  'Porcelain',
  'White',
  12
),

-- Textiles Products
(
  'Handwoven Tapestry',
  'handwoven-tapestry',
  'Intricate tapestry created using traditional weaving techniques.',
  (SELECT id FROM public.users WHERE email = 'david.textiles@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'textile-traditions'),
  700.00,
  650.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'home-decor'),
  true,
  true,
  '48"W x 72"L',
  4,
  'kg',
  'Wool',
  'Multicolor',
  20
),
(
  'Silk Scarf',
  'silk-scarf',
  'Luxurious silk scarf with hand-painted patterns.',
  (SELECT id FROM public.users WHERE email = 'david.textiles@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'textile-traditions'),
  120.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'textiles'),
  false,
  true,
  '18"W x 72"L',
  0.3,
  'kg',
  'Silk',
  'Red & Gold',
  5
),

-- Jewelry Products
(
  'Silver Pendant Necklace',
  'silver-pendant-necklace',
  'Beautiful pendant necklace made from sterling silver.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  200.00,
  180.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'jewelry'),
  true,
  true,
  '18"L',
  0.1,
  'kg',
  'Sterling Silver',
  'Silver',
  7
),
(
  'Gemstone Ring',
  'gemstone-ring',
  'Custom ring featuring a beautiful emerald gemstone.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  350.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'jewelry'),
  true,
  true,
  'Size 7',
  0.05,
  'kg',
  'Gold',
  'Emerald',
  14
),
-- Lighting Products
(
  'Artisan Table Lamp',
  'artisan-table-lamp',
  'Handcrafted table lamp with a ceramic base and linen shade.',
  (SELECT id FROM public.users WHERE email = 'olivia.pottery@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'clay-and-kiln'),
  150.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'lamps'),
  false,
  true,
  '12"W x 12"D x 24"H',
  3,
  'kg',
  'Ceramic, Linen',
  'Ivory',
  10
),
(
  'Modern Pendant Light',
  'modern-pendant-light',
  'Minimalist pendant light designed from brushed brass.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  275.00,
  250.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'light-fixtures'),
  false,
  true,
  '10"W x 10"D x 12"H',
  1.5,
  'kg',
  'Brass',
  'Gold',
  14
),
(
  'Rustic Wall Sconce',
  'rustic-wall-sconce',
  'Wall-mounted iron sconce perfect for indoor or outdoor use.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  180.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'sconces'),
  false,
  true,
  '8"W x 12"H x 6"D',
  2.5,
  'kg',
  'Wrought Iron',
  'Black',
  7
),

-- Sculpture Products
(
  'Bronze Abstract Sculpture',
  'bronze-abstract-sculpture',
  'Contemporary sculpture cast from bronze.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  1200.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'metal-sculptures'),
  false,
  true,
  '14"W x 10"D x 20"H',
  12,
  'kg',
  'Bronze',
  'Antique Bronze',
  21
),
(
  'Wooden Animal Carving',
  'wooden-animal-carving',
  'Hand-carved wooden sculpture depicting wildlife.',
  (SELECT id FROM public.users WHERE email = 'john.woodworker@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'oak-and-pine'),
  450.00,
  400.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'wood-sculptures'),
  false,
  true,
  '15"W x 8"D x 12"H',
  5,
  'kg',
  'Walnut',
  'Natural',
  10
),
(
  'Glass Wave Sculpture',
  'glass-wave-sculpture',
  'Elegant glass sculpture inspired by ocean waves.',
  (SELECT id FROM public.users WHERE email = 'emma.glass@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'glass-haven'),
  900.00,
  850.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'glass-sculptures'),
  true,
  true,
  '20"W x 10"D x 14"H',
  6,
  'kg',
  'Glass',
  'Blue & White',
  14
),

-- Glasswork Products
(
  'Stained Glass Panel',
  'stained-glass-panel',
  'Colorful stained glass panel with intricate patterns.',
  (SELECT id FROM public.users WHERE email = 'emma.glass@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'glass-haven'),
  400.00,
  375.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'decorative-glass'),
  false,
  true,
  '18"W x 24"H',
  3,
  'kg',
  'Glass, Lead',
  'Multi-colored',
  10
),
(
  'Blown Glass Vase',
  'blown-glass-vase',
  'Hand-blown glass vase with a modern, organic shape.',
  (SELECT id FROM public.users WHERE email = 'emma.glass@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'glass-haven'),
  120.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'vases'),
  false,
  true,
  '10"H x 6"W',
  2,
  'kg',
  'Glass',
  'Clear',
  7
),
(
  'Etched Glass Bowl',
  'etched-glass-bowl',
  'Decorative bowl with intricate etched designs.',
  (SELECT id FROM public.users WHERE email = 'emma.glass@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'glass-haven'),
  150.00,
  130.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'decorative-glass'),
  false,
  true,
  '12"D x 6"H',
  2.5,
  'kg',
  'Glass',
  'Frosted',
  9
),
-- Jewelry Products
(
  'Gold Bangle Bracelet',
  'gold-bangle-bracelet',
  'Elegant bangle bracelet crafted from 18K gold.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  300.00,
  280.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'jewelry'),
  false,
  true,
  'Diameter: 7"',
  0.05,
  'kg',
  'Gold',
  'Yellow Gold',
  7
),
(
  'Turquoise Pendant Necklace',
  'turquoise-pendant-necklace',
  'Beautiful necklace featuring a natural turquoise stone.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  180.00,
  160.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'jewelry'),
  false,
  true,
  'Length: 18"',
  0.02,
  'kg',
  'Silver, Turquoise',
  'Silver & Blue',
  10
),
(
  'Diamond Stud Earrings',
  'diamond-stud-earrings',
  'Classic diamond stud earrings set in white gold.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  450.00,
  420.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'jewelry'),
  false,
  true,
  'Diameter: 0.25"',
  0.01,
  'kg',
  'White Gold, Diamond',
  'Silver & Clear',
  14
),

-- Home Decor Products
(
  'Macrame Wall Hanging',
  'macrame-wall-hanging',
  'Handwoven macrame wall hanging for boho decor.',
  (SELECT id FROM public.users WHERE email = 'david.textiles@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'textile-traditions'),
  120.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'home-decor'),
  false,
  true,
  'Width: 24" Height: 40"',
  1,
  'kg',
  'Cotton',
  'White',
  10
),
(
  'Embroidered Throw Pillow',
  'embroidered-throw-pillow',
  'Luxurious pillow with hand-stitched embroidery.',
  (SELECT id FROM public.users WHERE email = 'david.textiles@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'textile-traditions'),
  80.00,
  75.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'home-decor'),
  false,
  true,
  'Size: 18" x 18"',
  0.5,
  'kg',
  'Cotton, Wool',
  'Beige & Blue',
  7
),
(
  'Wool Area Rug',
  'wool-area-rug',
  'Handwoven wool rug with geometric patterns.',
  (SELECT id FROM public.users WHERE email = 'david.textiles@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'textile-traditions'),
  600.00,
  550.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'rugs'),
  false,
  true,
  'Size: 5'' x 8''',
  8,
  'kg',
  'Wool',
  'Gray & White',
  15
),

-- Lighting Products
(
  'Brass Chandelier',
  'brass-chandelier',
  'Luxurious chandelier crafted from polished brass.',
  (SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'ironforge-metalcraft'),
  1200.00,
  1100.00,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'light-fixtures'),
  false,
  true,
  'Diameter: 24" Height: 30"',
  10,
  'kg',
  'Brass',
  'Gold',
  21
),
(
  'Hand-Carved Wooden Lamp',
  'hand-carved-wooden-lamp',
  'Elegant lamp with a hand-carved wooden base and linen shade.',
  (SELECT id FROM public.users WHERE email = 'john.woodworker@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'oak-and-pine'),
  250.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'lamps'),
  false,
  true,
  'Height: 20"',
  2,
  'kg',
  'Oak, Linen',
  'Natural & White',
  14
),
(
  'Reclaimed Wood Pendant Light',
  'reclaimed-wood-pendant-light',
  'Pendant light made from reclaimed wood and industrial hardware.',
  (SELECT id FROM public.users WHERE email = 'john.woodworker@example.com'),
  (SELECT id FROM public.storefronts WHERE slug = 'oak-and-pine'),
  180.00,
  NULL,
  'USD',
  (SELECT id FROM public.categories WHERE slug = 'light-fixtures'),
  false,
  true,
  'Diameter: 10" Height: 8"',
  1.5,
  'kg',
  'Reclaimed Wood, Metal',
  'Brown & Black',
  10
)
ON CONFLICT DO NOTHING;

-- Insert product images for all products
INSERT INTO public.product_images (
  product_id,
  image_url,
  alt_text,
  display_order,
  is_main
) VALUES
-- Furniture Products
(
  (SELECT id FROM public.products WHERE slug = 'farmhouse-dining-table'),
  'https://example.com/images/farmhouse-dining-table1.jpg',
  'Rustic farmhouse dining table made from reclaimed wood',
  0,
  true
),
(
  (SELECT id FROM public.products WHERE slug = 'mid-century-modern-chair'),
  'https://example.com/images/mid-century-modern-chair1.jpg',
  'Elegant mid-century modern chair',
  0,
  true
),
(
  (SELECT id FROM public.products WHERE slug = 'hand-carved-cabinet'),
  'https://example.com/images/hand-carved-cabinet1.jpg',
  'Intricately carved wooden cabinet with dark finish',
  0,
  true
),

-- Metalwork Products
(
  (SELECT id FROM public.products WHERE slug = 'forged-iron-candle-holder'),
  'https://example.com/images/forged-iron-candle-holder1.jpg',
  'Unique forged iron candle holder',
  0,
  true
),
(
  (SELECT id FROM public.products WHERE slug = 'custom-metal-railings'),
  'https://example.com/images/custom-metal-railings1.jpg',
  'Custom metal railings with intricate designs',
  0,
  true
),

-- Ceramics Products
(
  (SELECT id FROM public.products WHERE slug = 'hand-painted-plate-set'),
  'https://example.com/images/hand-painted-plate-set1.jpg',
  'Hand-painted plates with floral designs',
  0,
  true
),
(
  (SELECT id FROM public.products WHERE slug = 'porcelain-tea-set'),
  'https://example.com/images/porcelain-tea-set1.jpg',
  'Elegant porcelain tea set with floral design',
  0,
  true
),

-- Textiles Products
(
  (SELECT id FROM public.products WHERE slug = 'handwoven-tapestry'),
  'https://example.com/images/handwoven-tapestry1.jpg',
  'Beautiful handwoven tapestry with intricate patterns',
  0,
  true
),
(
  (SELECT id FROM public.products WHERE slug = 'silk-scarf'),
  'https://example.com/images/silk-scarf1.jpg',
  'Luxurious silk scarf with hand-painted designs',
  0,
  true
),

-- Jewelry Products
(
  (SELECT id FROM public.products WHERE slug = 'gold-bangle-bracelet'),
  'https://example.com/images/gold-bangle-bracelet1.jpg',
  'Elegant 18K gold bangle bracelet',
  0,
  true
),
(
  (SELECT id FROM public.products WHERE slug = 'turquoise-pendant-necklace'),
  'https://example.com/images/turquoise-pendant-necklace1.jpg',
  'Pendant necklace featuring a natural turquoise stone',
  0,
  true
),
(
  (SELECT id FROM public.products WHERE slug = 'diamond-stud-earrings'),
  'https://example.com/images/diamond-stud-earrings1.jpg',
  'Classic diamond stud earrings set in white gold',
  0,
  true
),

-- Lighting Products
(
  (SELECT id FROM public.products WHERE slug = 'artisan-table-lamp'),
  'https://example.com/images/artisan-table-lamp1.jpg',
  'Handcrafted table lamp with ceramic base and linen shade',
  0,
  true
),
(
  (SELECT id FROM public.products WHERE slug = 'modern-pendant-light'),
  'https://example.com/images/modern-pendant-light1.jpg',
  'Minimalist pendant light with brass finish',
  0,
  true
),
(
  (SELECT id FROM public.products WHERE slug = 'rustic-wall-sconce'),
  'https://example.com/images/rustic-wall-sconce1.jpg',
  'Rustic wrought iron wall sconce',
  0,
  true
)
ON CONFLICT DO NOTHING;

-- Insert inventory entries for all products
INSERT INTO public.inventory (
  product_id,
  quantity,
  reserved_quantity,
  sku,
  low_stock_threshold
) VALUES
-- Furniture Products
(
  (SELECT id FROM public.products WHERE slug = 'farmhouse-dining-table'),
  5,
  2,
  'FDT-OAK-72',
  2
),
(
  (SELECT id FROM public.products WHERE slug = 'mid-century-modern-chair'),
  10,
  1,
  'MCMC-WAL-001',
  3
),
(
  (SELECT id FROM public.products WHERE slug = 'hand-carved-cabinet'),
  3,
  0,
  'HCC-OAK-001',
  1
),

-- Metalwork Products
(
  (SELECT id FROM public.products WHERE slug = 'forged-iron-candle-holder'),
  20,
  4,
  'FICH-001',
  5
),
(
  (SELECT id FROM public.products WHERE slug = 'custom-metal-railings'),
  2,
  0,
  'CMR-001',
  1
),

-- Ceramics Products
(
  (SELECT id FROM public.products WHERE slug = 'hand-painted-plate-set'),
  12,
  2,
  'HPPS-001',
  4
),
(
  (SELECT id FROM public.products WHERE slug = 'porcelain-tea-set'),
  6,
  1,
  'PTS-001',
  2
),

-- Textiles Products
(
  (SELECT id FROM public.products WHERE slug = 'handwoven-tapestry'),
  4,
  1,
  'HWT-001',
  1
),
(
  (SELECT id FROM public.products WHERE slug = 'silk-scarf'),
  15,
  3,
  'SS-001',
  5
),

-- Jewelry Products
(
  (SELECT id FROM public.products WHERE slug = 'gold-bangle-bracelet'),
  8,
  0,
  'GBB-001',
  2
),
(
  (SELECT id FROM public.products WHERE slug = 'turquoise-pendant-necklace'),
  10,
  1,
  'TPN-001',
  3
),
(
  (SELECT id FROM public.products WHERE slug = 'diamond-stud-earrings'),
  6,
  1,
  'DSE-001',
  2
),

-- Lighting Products
(
  (SELECT id FROM public.products WHERE slug = 'artisan-table-lamp'),
  5,
  0,
  'ATL-001',
  2
),
(
  (SELECT id FROM public.products WHERE slug = 'modern-pendant-light'),
  4,
  0,
  'MPL-001',
  1
),
(
  (SELECT id FROM public.products WHERE slug = 'rustic-wall-sconce'),
  12,
  3,
  'RWS-001',
  4
)
ON CONFLICT DO NOTHING;