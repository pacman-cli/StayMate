-- V127__backfill_earnings.sql
-- Backfill earnings for existing bookings to ensure financial dashboard works

-- 1. Ensure bookings have financial data (Backfill from Property Price assuming 1 unit of time if not set)
-- This is a best-effort backfill for seed/legacy data
UPDATE bookings b
INNER JOIN properties p ON b.property_id = p.id
SET
    b.total_price = p.price_amount,
    b.commission = p.price_amount * 0.10,
    b.net_amount = p.price_amount * 0.90
WHERE b.total_price IS NULL
AND p.price_amount IS NOT NULL;

-- 2. Backfill Earnings for Confirmed/Completed Bookings
-- Create an earning record for every valid booking that doesn't have one
INSERT INTO earnings (user_id, booking_id, amount, commission, net_amount, status, created_at, updated_at)
SELECT
    b.landlord_id,
    b.id,
    b.total_price,
    b.commission,
    b.net_amount,
    'AVAILABLE',
    b.created_at,
    NOW()
FROM bookings b
WHERE b.status IN ('CONFIRMED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT')
AND b.total_price IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM earnings e WHERE e.booking_id = b.id);
