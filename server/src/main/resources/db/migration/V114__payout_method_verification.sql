-- ===================================================================
-- V114 - PAYOUT METHOD VERIFICATION (STRICT MYSQL)
-- Adds verification status and document upload fields safely
-- ===================================================================

-- 1. Add verification_status
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payout_methods' AND COLUMN_NAME = 'verification_status');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE payout_methods ADD COLUMN verification_status VARCHAR(20) DEFAULT ''PENDING''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Add verification_document_url
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payout_methods' AND COLUMN_NAME = 'verification_document_url');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE payout_methods ADD COLUMN verification_document_url VARCHAR(500)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Add verified_at
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payout_methods' AND COLUMN_NAME = 'verified_at');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE payout_methods ADD COLUMN verified_at TIMESTAMP NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Add verified_by
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payout_methods' AND COLUMN_NAME = 'verified_by');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE payout_methods ADD COLUMN verified_by BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. Add rejection_reason
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payout_methods' AND COLUMN_NAME = 'rejection_reason');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE payout_methods ADD COLUMN rejection_reason VARCHAR(500)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6. Add Index for verification_status (Idempotent)
SET @idx_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payout_methods' AND INDEX_NAME = 'idx_payout_methods_verification');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_payout_methods_verification ON payout_methods(verification_status)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 7. Add idempotency_key to payout_requests
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payout_requests' AND COLUMN_NAME = 'idempotency_key');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE payout_requests ADD COLUMN idempotency_key VARCHAR(100) UNIQUE', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 8. Add version to payout_requests
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payout_requests' AND COLUMN_NAME = 'version');
SET @sql := IF(@col_exists = 0, 'ALTER TABLE payout_requests ADD COLUMN version BIGINT DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 9. Add Index for idempotency_key
SET @idx_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payout_requests' AND INDEX_NAME = 'idx_payout_requests_idempotency');
SET @sql := IF(@idx_exists = 0, 'CREATE INDEX idx_payout_requests_idempotency ON payout_requests(idempotency_key)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
