-- V122__add_seat_booking_relationship.sql
-- Add seat_id foreign key to bookings table and version column for optimistic locking
-- This migration enables atomic seat assignment during booking approval

-- Add version column for optimistic locking (prevents concurrent updates)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- Add seat_id foreign key to link booking to assigned seat
-- NULL when booking is PENDING or REJECTED
-- Set when booking is CONFIRMED
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seat_id BIGINT NULL;

-- Add foreign key constraint
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_seat
    FOREIGN KEY (seat_id) REFERENCES seats(id)
    ON DELETE SET NULL;

-- Create index for faster seat lookups on bookings
CREATE INDEX IF NOT EXISTS idx_bookings_seat_id ON bookings(seat_id);

-- Ensure seats table has proper index for property + status queries (used in approval)
CREATE INDEX IF NOT EXISTS idx_seats_property_status ON seats(property_id, status);
