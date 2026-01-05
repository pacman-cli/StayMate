-- V27__seed_geo_data.sql

-- Update existing properties with sample coordinates (Dhaka focus)
-- Gulshan
UPDATE properties SET latitude = 23.7925, longitude = 90.4078 WHERE location LIKE '%Gulshan%' AND latitude IS NULL;
-- Banani
UPDATE properties SET latitude = 23.7940, longitude = 90.4043 WHERE location LIKE '%Banani%' AND latitude IS NULL;
-- Dhanmondi
UPDATE properties SET latitude = 23.7461, longitude = 90.3742 WHERE location LIKE '%Dhanmondi%' AND latitude IS NULL;
-- Bashundhara
UPDATE properties SET latitude = 23.8191, longitude = 90.4526 WHERE location LIKE '%Bashundhara%' AND latitude IS NULL;
-- Uttara
UPDATE properties SET latitude = 23.8728, longitude = 90.3984 WHERE location LIKE '%Uttara%' AND latitude IS NULL;
-- Mirpur
UPDATE properties SET latitude = 23.8223, longitude = 90.3654 WHERE location LIKE '%Mirpur%' AND latitude IS NULL;

-- Fallback for others (Dhaka Center approx)
UPDATE properties SET latitude = 23.8103, longitude = 90.4125 WHERE latitude IS NULL;

-- Update Roommate Posts too if matching location
UPDATE roommate_posts SET latitude = 23.7925, longitude = 90.4078 WHERE location LIKE '%Gulshan%' AND latitude IS NULL;
UPDATE roommate_posts SET latitude = 23.7940, longitude = 90.4043 WHERE location LIKE '%Banani%' AND latitude IS NULL;
UPDATE roommate_posts SET latitude = 23.7461, longitude = 90.3742 WHERE location LIKE '%Dhanmondi%' AND latitude IS NULL;
UPDATE roommate_posts SET latitude = 23.8103, longitude = 90.4125 WHERE latitude IS NULL;
