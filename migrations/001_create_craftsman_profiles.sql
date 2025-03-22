-- Create extension for UUID generation if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create craftsman_profiles table
CREATE TABLE IF NOT EXISTS public.craftsman_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  location TEXT,
  specialization TEXT,
  years_of_experience INTEGER,
  description TEXT,
  profile_image TEXT,
  website TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for security
ALTER TABLE public.craftsman_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for reading craftsman profiles (public)
CREATE POLICY "Craftsman profiles are viewable by everyone" 
ON public.craftsman_profiles
FOR SELECT USING (true);

-- Policy for inserting craftsman profiles (authenticated users only)
CREATE POLICY "Users can create their own craftsman profile" 
ON public.craftsman_profiles
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = auth_id);

-- Policy for updating craftsman profiles (owner only)
CREATE POLICY "Users can update their own craftsman profile" 
ON public.craftsman_profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = auth_id);

-- Policy for deleting craftsman profiles (owner only)
CREATE POLICY "Users can delete their own craftsman profile" 
ON public.craftsman_profiles
FOR DELETE 
TO authenticated
USING (auth.uid() = auth_id);

-- Insert sample data for testing
INSERT INTO public.craftsman_profiles (
  id, 
  business_name, 
  location, 
  specialization, 
  years_of_experience, 
  description, 
  website, 
  phone_number
) VALUES 
(
  '1', 
  'Oak & Pine Woodworks', 
  'Portland, Oregon', 
  'Custom furniture, cabinetry, wooden decor', 
  12, 
  'With over a decade of experience in fine woodworking, Oak & Pine specializes in handcrafted furniture that combines traditional joinery with modern design. Every piece is made to order with careful attention to detail and client preferences.', 
  'https://www.oakandpinewoodworks.com', 
  '(503) 555-1234'
),
(
  '2', 
  'Ironforge Metalcraft', 
  'Detroit, Michigan', 
  'Ornamental ironwork, metal furniture, architectural elements', 
  8, 
  'Founded in Detroit''s industrial district, Ironforge Metalcraft creates bold, functional pieces that celebrate the city''s manufacturing heritage. From custom railings to statement furniture, each creation is built to last generations.', 
  'https://www.ironforgemetalcraft.com', 
  '(313) 555-6789'
),
(
  '3', 
  'Stonehill Masonry', 
  'Boulder, Colorado', 
  'Stone walls, fireplaces, outdoor kitchens', 
  15, 
  'Specializing in natural stone construction, Stonehill Masonry has been transforming Colorado homes and landscapes for 15 years. We work with local and imported stone to create structures that complement their natural surroundings.', 
  'https://www.stonehillmasonry.com', 
  '(720) 555-4321'
),
(
  '4', 
  'Glass Haven Studio', 
  'Seattle, Washington', 
  'Stained glass, glass sculpture, custom windows', 
  10, 
  'Glass Haven Studio creates custom stained glass pieces that transform ordinary spaces with light and color. From traditional to contemporary designs, our work can be found in homes, businesses, and public spaces throughout the Pacific Northwest.', 
  'https://www.glasshavenstudio.com', 
  '(206) 555-8765'
),
(
  '5', 
  'Textile Traditions', 
  'Santa Fe, New Mexico', 
  'Handwoven textiles, upholstery, custom drapery', 
  20, 
  'Textile Traditions blends Southwest patterns with global influences to create unique fabric designs. Our workshop uses both traditional looms and modern techniques to produce textiles for interior designers and discerning homeowners.', 
  'https://www.textiletraditions.com', 
  '(505) 555-9876'
),
(
  '6', 
  'Clay & Kiln Pottery', 
  'Asheville, North Carolina', 
  'Functional pottery, ceramic art, custom tile work', 
  14, 
  'Inspired by the rich pottery tradition of North Carolina, Clay & Kiln creates both functional vessels and decorative ceramic art. Each piece is wheel-thrown or hand-built in our Asheville studio using locally-sourced clay and glazes.', 
  'https://www.clayandkiln.com', 
  '(828) 555-2468'
); 