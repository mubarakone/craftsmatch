-- Create extension for UUID generation if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_onboarded BOOLEAN DEFAULT false NOT NULL,
  user_role TEXT NOT NULL,
  avatar_url TEXT
);

-- Insert sample user data for testing (Craftsmen)
INSERT INTO public.users (auth_id, email, full_name, is_onboarded, user_role, avatar_url)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'john.woodworker@example.com', 'John Woodworker', true, 'craftsman', 'https://randomuser.me/api/portraits/men/1.jpg'),
  ('00000000-0000-0000-0000-000000000002', 'sarah.metals@example.com', 'Sarah Metals', true, 'craftsman', 'https://randomuser.me/api/portraits/women/2.jpg'),
  ('00000000-0000-0000-0000-000000000003', 'michael.stone@example.com', 'Michael Stone', true, 'craftsman', 'https://randomuser.me/api/portraits/men/3.jpg'),
  ('00000000-0000-0000-0000-000000000004', 'emma.glass@example.com', 'Emma Glass', true, 'craftsman', 'https://randomuser.me/api/portraits/women/4.jpg'),
  ('00000000-0000-0000-0000-000000000005', 'david.textiles@example.com', 'David Textiles', true, 'craftsman', 'https://randomuser.me/api/portraits/men/5.jpg'),
  ('00000000-0000-0000-0000-000000000006', 'olivia.pottery@example.com', 'Olivia Pottery', true, 'craftsman', 'https://randomuser.me/api/portraits/women/6.jpg');

-- Insert sample user data for testing (Builders)
INSERT INTO public.users (auth_id, email, full_name, is_onboarded, user_role, avatar_url)
VALUES 
  ('00000000-0000-0000-0000-000000000007', 'robert.builder@example.com', 'Robert Builder', true, 'builder', 'https://randomuser.me/api/portraits/men/7.jpg'),
  ('00000000-0000-0000-0000-000000000008', 'jennifer.homes@example.com', 'Jennifer Homes', true, 'builder', 'https://randomuser.me/api/portraits/women/8.jpg'),
  ('00000000-0000-0000-0000-000000000009', 'william.properties@example.com', 'William Properties', true, 'builder', 'https://randomuser.me/api/portraits/men/9.jpg'),
  ('00000000-0000-0000-0000-000000000010', 'sophia.interiors@example.com', 'Sophia Interiors', true, 'builder', 'https://randomuser.me/api/portraits/women/10.jpg'),
  ('00000000-0000-0000-0000-000000000011', 'bradley.construction@example.com', 'Bradley Construction', true, 'builder', 'https://randomuser.me/api/portraits/men/11.jpg'),
  ('00000000-0000-0000-0000-000000000012', 'claire.architecture@example.com', 'Claire Architecture', true, 'builder', 'https://randomuser.me/api/portraits/women/12.jpg');

-- Create craftsman_profiles table
CREATE TABLE IF NOT EXISTS public.craftsman_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  specialty TEXT,
  experience_years INTEGER,
  website TEXT,
  phone_number TEXT,
  social_links JSONB,
  certifications JSONB,
  portfolio_images JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert craftsman profiles
INSERT INTO public.craftsman_profiles (user_id, business_name, location, description, specialty, experience_years, website, phone_number)
VALUES 
  ((SELECT id FROM public.users WHERE email = 'john.woodworker@example.com'), 'Oak & Pine Woodworks', 'Portland, Oregon', 'Handcrafted furniture', 'Woodworking', 12, 'https://oakandpine.com', '(503) 555-1234'),
  ((SELECT id FROM public.users WHERE email = 'sarah.metals@example.com'), 'Ironforge Metalcraft', 'Detroit, Michigan', 'Bold metal designs', 'Metalworking', 8, 'https://ironforge.com', '(313) 555-6789'),
  ((SELECT id FROM public.users WHERE email = 'michael.stone@example.com'), 'Stonehill Masonry', 'Boulder, Colorado', 'Stone constructions', 'Masonry', 15, 'https://stonehill.com', '(720) 555-4321'),
  ((SELECT id FROM public.users WHERE email = 'emma.glass@example.com'), 'Glass Haven Studio', 'Seattle, Washington', 'Stained glass artistry', 'Glassworking', 10, 'https://glasshaven.com', '(206) 555-8765'),
  ((SELECT id FROM public.users WHERE email = 'david.textiles@example.com'), 'Textile Traditions', 'Santa Fe, New Mexico', 'Handwoven textiles', 'Textile Arts', 20, 'https://textiletraditions.com', '(505) 555-9876'),
  ((SELECT id FROM public.users WHERE email = 'olivia.pottery@example.com'), 'Clay & Kiln Pottery', 'Asheville, North Carolina', 'Pottery craftsmanship', 'Pottery', 14, 'https://clayandkiln.com', '(828) 555-2468');

-- Create builder_profiles table
CREATE TABLE IF NOT EXISTS public.builder_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description TEXT,
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  website TEXT,
  phone_number TEXT,
  is_commercial BOOLEAN DEFAULT false NOT NULL,
  project_types JSONB,
  preferred_materials JSONB,
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert builder profiles
INSERT INTO public.builder_profiles (
  user_id,
  company_name,
  description,
  industry,
  location,
  website,
  phone_number,
  is_commercial,
  project_types,
  preferred_materials,
  social_links
) VALUES
  ((SELECT id FROM public.users WHERE email = 'robert.builder@example.com'),
   'BuildRight Construction',
   'Sustainable home construction and energy-efficient renovations.',
   'Construction',
   'Denver, Colorado',
   'https://www.buildright.com',
   '(303) 555-1234',
   true,
   '["Custom Homes", "Green Building"]',
   '["Reclaimed Wood", "Energy Efficient Systems"]',
   '{"instagram": "buildright"}'
  ),
  ((SELECT id FROM public.users WHERE email = 'jennifer.homes@example.com'),
   'Inspired Interiors',
   'Creating personalized living spaces reflecting clients'' unique lifestyles.',
   'Interior Design',
   'Chicago, Illinois',
   'https://www.inspiredinteriors.com',
   '(312) 555-5678',
   false,
   '["Residential Design", "Furniture Selection"]',
   '["Custom Furniture", "Handcrafted Decor"]',
   '{"instagram": "inspiredinteriors"}'
  ),
  ((SELECT id FROM public.users WHERE email = 'william.properties@example.com'),
   'Heritage Builders',
   'Commercial development with a focus on preserving architectural heritage.',
   'Commercial Development',
   'Boston, Massachusetts',
   'https://www.heritagebuilders.com',
   '(617) 555-2345',
   true,
   '["Commercial Renovation", "Historic Preservation"]',
   '["Reclaimed Materials", "Artisan Tile"]',
   '{"instagram": "heritagebuilders"}'
  ),
  ((SELECT id FROM public.users WHERE email = 'sophia.interiors@example.com'),
   'Modern Living Spaces',
   'Contemporary residential design studio emphasizing open spaces and natural light.',
   'Residential Design',
   'Austin, Texas',
   'https://www.modernlivingspaces.com',
   '(512) 555-8901',
   false,
   '["Modern Homes", "Indoor-Outdoor Living"]',
   '["Custom Glass Features", "Natural Stone"]',
   '{"instagram": "modern_living_spaces"}'
  ),
  ((SELECT id FROM public.users WHERE email = 'bradley.construction@example.com'),
   'Bradley Construction',
   'High-end luxury construction specializing in commercial and residential projects.',
   'Luxury Construction',
   'Los Angeles, California',
   'https://www.bradleyconstruction.com',
   '(213) 555-9876',
   true,
   '["Luxury Homes", "Commercial High-Rises"]',
   '["Glass Structures", "Sustainable Materials"]',
   '{"instagram": "bradleyconstruction"}'
  ),
  ((SELECT id FROM public.users WHERE email = 'claire.architecture@example.com'),
   'Claire Architecture',
   'Boutique architecture firm specializing in sustainable design.',
   'Architecture',
   'New York, New York',
   'https://www.clairearchitecture.com',
   '(212) 555-4321',
   true,
   '["Residential Buildings", "Public Spaces"]',
   '["Reclaimed Wood", "Smart Home Systems"]',
   '{"instagram": "clairearchitecture"}'
  );