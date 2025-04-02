-- Migration: Add featured storefronts functionality
-- 
-- This migration adds:
-- 1. Featured flag to storefronts table
-- 2. Featured order column for controlling display order
-- 3. A view for easy querying of featured storefronts
--

-- Add 'is_featured' flag and 'featured_order' columns to storefronts
ALTER TABLE storefronts
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN featured_order INTEGER;

-- Add an index for faster queries of featured stores
CREATE INDEX idx_storefronts_featured ON storefronts (is_featured) WHERE is_featured = TRUE;

-- Create a view for easier querying of featured storefronts
CREATE VIEW featured_storefronts AS
SELECT s.*, u.name as owner_name
FROM storefronts s
JOIN users u ON s.user_id = u.id
WHERE s.is_featured = TRUE
ORDER BY s.featured_order NULLS LAST, s.updated_at DESC;

-- Set a few initial featured storefronts
UPDATE storefronts 
SET is_featured = TRUE, featured_order = 1
WHERE name = 'Oak & Pine Woodworks';

UPDATE storefronts 
SET is_featured = TRUE, featured_order = 2
WHERE name = 'Glass Haven Art Studio';

UPDATE storefronts 
SET is_featured = TRUE, featured_order = 3
WHERE name = 'Ironforge Metalcraft';

-- Insert initial featured metadata (description, etc.)
CREATE TABLE featured_storefront_metadata (
  id SERIAL PRIMARY KEY,
  storefront_id UUID NOT NULL REFERENCES storefronts(id) ON DELETE CASCADE,
  feature_title VARCHAR(100),
  feature_description TEXT,
  feature_start_date TIMESTAMP WITH TIME ZONE,
  feature_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_featured_storefront UNIQUE(storefront_id)
);

-- Add trigger to update 'updated_at' timestamp
CREATE TRIGGER update_featured_storefront_metadata_timestamp
BEFORE UPDATE ON featured_storefront_metadata
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();

-- Function to get featured storefronts with a configurable limit
CREATE OR REPLACE FUNCTION get_featured_storefronts(limit_count INTEGER DEFAULT 4)
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  slug VARCHAR(100),
  description TEXT,
  logo_url TEXT,
  hero_image_url TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  feature_title VARCHAR(100),
  feature_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, s.name, s.slug, s.description, s.logo_url, s.hero_image_url, 
    s.user_id, s.created_at, s.updated_at, 
    m.feature_title, m.feature_description
  FROM storefronts s
  LEFT JOIN featured_storefront_metadata m ON s.id = m.storefront_id
  WHERE s.is_featured = TRUE
  ORDER BY s.featured_order NULLS LAST, s.updated_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql; 