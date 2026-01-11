-- Ensure all properties have valid coordinates for the map
-- Default to Dhaka center if missing
UPDATE properties
SET latitude = 23.8103, longitude = 90.4125
WHERE latitude IS NULL OR longitude IS NULL;

-- Make lat/long not null to prevent future issues (optional, but good practice)
-- ALTER TABLE properties MODIFY latitude DOUBLE NOT NULL DEFAULT 23.8103;
-- ALTER TABLE properties MODIFY longitude DOUBLE NOT NULL DEFAULT 90.4125;
