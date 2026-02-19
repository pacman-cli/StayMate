-- V126__fix_review_property_ids.sql
-- Fix orphan reviews that are missing property_id by inferring from bookings
-- This addresses the issue where reviews exist but aren't linked to properties in the dashboard

-- 1. Link orphan reviews to properties via Bookings
UPDATE reviews r
SET property_id = (
    SELECT b.property_id
    FROM bookings b
    WHERE b.tenant_id = r.author_id
    AND b.landlord_id = r.receiver_id
    ORDER BY b.created_at DESC
    LIMIT 1
)
WHERE r.property_id IS NULL;

-- 1.5 Checking & Adding missing columns
-- Using a safe way via stored procedure block for MySQL
DROP PROCEDURE IF EXISTS AddReviewsCountColumn;
DELIMITER $$
CREATE PROCEDURE AddReviewsCountColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'properties'
        AND COLUMN_NAME = 'reviews_count'
    ) THEN
        ALTER TABLE properties ADD COLUMN reviews_count INT DEFAULT 0;
    END IF;
END$$
DELIMITER ;
CALL AddReviewsCountColumn();
DROP PROCEDURE AddReviewsCountColumn;


-- 2. Recalculate Property Ratings and Review Counts
UPDATE properties p
SET
    reviews_count = (SELECT COUNT(*) FROM reviews r WHERE r.property_id = p.id),
    rating = COALESCE((SELECT AVG(r.rating) FROM reviews r WHERE r.property_id = p.id), 0.0);
