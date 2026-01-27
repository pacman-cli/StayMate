-- V122__add_seat_booking_relationship.sql
-- Fixed for MySQL Compatibility (Atomic & Idempotent)
-- Addresses: "ADD COLUMN IF NOT EXISTS" syntax error on older MySQL versions

DELIMITER //

DROP PROCEDURE IF EXISTS upgrade_bookings_v122 //

CREATE PROCEDURE upgrade_bookings_v122()
BEGIN
    -- 1. Add 'version' column for optimistic locking (Safe Add)
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'bookings'
        AND COLUMN_NAME = 'version'
    ) THEN
        ALTER TABLE bookings ADD COLUMN version BIGINT DEFAULT 0;
    END IF;

    -- 2. Add 'seat_id' column for relationship (Safe Add)
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'bookings'
        AND COLUMN_NAME = 'seat_id'
    ) THEN
        ALTER TABLE bookings ADD COLUMN seat_id BIGINT NULL;
    END IF;

    -- 3. Add Foreign Key 'fk_bookings_seat' (Safe Add)
    IF NOT EXISTS (
        SELECT * FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'bookings'
        AND CONSTRAINT_NAME = 'fk_bookings_seat'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT fk_bookings_seat
        FOREIGN KEY (seat_id) REFERENCES seats(id)
        ON DELETE SET NULL;
    END IF;

    -- 4. Add Index 'idx_bookings_seat_id' (Safe Add)
    IF NOT EXISTS (
        SELECT * FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'bookings'
        AND INDEX_NAME = 'idx_bookings_seat_id'
    ) THEN
        CREATE INDEX idx_bookings_seat_id ON bookings(seat_id);
    END IF;

    -- 5. Add Index 'idx_seats_property_status' (Safe Add)
    IF NOT EXISTS (
        SELECT * FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'seats'
        AND INDEX_NAME = 'idx_seats_property_status'
    ) THEN
        CREATE INDEX idx_seats_property_status ON seats(property_id, status);
    END IF;

END //

DELIMITER ;

-- Execute the procedure
CALL upgrade_bookings_v122();

-- Clean up
DROP PROCEDURE upgrade_bookings_v122;
