USE authdb;

ALTER TABLE properties ADD COLUMN image_url VARCHAR(500);

-- ==========================================
-- SEED DATA UPDATES - COMMENTED OUT
-- Uncomment if you have sample properties to update
-- ==========================================

/*
-- Update existing properties with sample images
UPDATE properties SET image_url = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' WHERE title = 'Luxury Loft in Soho';
UPDATE properties SET image_url = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' WHERE title = 'Cozy Studio in Brooklyn';
UPDATE properties SET image_url = 'https://images.unsplash.com/photo-1502005229766-93976863d08dd?auto=format&fit=crop&w=800&q=80' WHERE title = 'Modern Condo in Mission';
UPDATE properties SET image_url = 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80' WHERE title = 'Victorian Room';
UPDATE properties SET image_url = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' WHERE title = 'Flat in Kensington';
UPDATE properties SET image_url = 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80' WHERE title = 'Compact Apt in Shibuya';

-- Default for others
UPDATE properties SET image_url = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80' WHERE image_url IS NULL;
*/
