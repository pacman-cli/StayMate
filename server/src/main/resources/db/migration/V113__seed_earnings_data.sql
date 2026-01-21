-- ===================================================================
-- V113 - SEED EARNINGS DATA & FIX BOOKING SCHEMA (STRICT MYSQL)
-- 1. Adds missing financial columns to bookings table using PREPARE
-- 2. Seeds earnings records for all confirmed/completed bookings
-- ===================================================================

-- ---------------------------------------------------------
-- Step 1: Safely Add Missing Columns to bookings (Idempotent)
-- ---------------------------------------------------------

-- Add total_price if missing
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'total_price');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE bookings ADD COLUMN total_price DECIMAL(19,2)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add commission if missing
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'commission');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE bookings ADD COLUMN commission DECIMAL(19,2)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add net_amount if missing
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'net_amount');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE bookings ADD COLUMN net_amount DECIMAL(19,2)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------
-- Step 2: Update Data
-- ---------------------------------------------------------
UPDATE bookings b
JOIN properties p ON b.property_id = p.id
SET b.total_price = COALESCE(p.price_amount, 1000.00)
WHERE b.total_price IS NULL;

-- Update commission (5% flat, matching BookingService)
UPDATE bookings
SET commission = total_price * 0.05
WHERE commission IS NULL;

-- Update net_amount
UPDATE bookings
SET net_amount = total_price - commission
WHERE net_amount IS NULL;

-- ---------------------------------------------------------
-- Step 3: Create Tables (IF NOT EXISTS is valid for TABLES)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS earnings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    commission DECIMAL(19,2) NOT NULL,
    net_amount DECIMAL(19,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payout_request_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    booking_id BIGINT NULL,
    amount DECIMAL(19,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    payment_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payout_methods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    routing_number VARCHAR(50),
    currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
    is_default BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    verification_document_url VARCHAR(500),
    verified_at TIMESTAMP NULL,
    verified_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payout_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    payout_method_id BIGINT NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    admin_note TEXT,
    idempotency_key VARCHAR(255),
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payout_method_id) REFERENCES payout_methods(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- Step 4: Seed Data
-- ---------------------------------------------------------
INSERT INTO earnings (user_id, booking_id, amount, commission, net_amount, status, created_at)
SELECT
    b.landlord_id,
    b.id,
    b.total_price,
    b.commission,
    b.net_amount,
    CASE
        WHEN b.status IN ('CHECKED_OUT', 'COMPLETED') THEN 'AVAILABLE'
        WHEN b.status IN ('CONFIRMED', 'CHECKED_IN') THEN 'PENDING'
        ELSE 'PENDING'
    END,
    COALESCE(b.created_at, NOW())
FROM bookings b
WHERE b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED')
  AND b.landlord_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM earnings e WHERE e.booking_id = b.id);

-- ---------------------------------------------------------
-- Step 5: Create Index Safely (Idempotent)
-- ---------------------------------------------------------
SET @idx_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'earnings' AND INDEX_NAME = 'idx_earnings_user_status');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_earnings_user_status ON earnings(user_id, status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT CONCAT('Seeded ', COUNT(*), ' earnings records') as result FROM earnings;
