-- Flyway manages the database context, do not use USE statements

-- Add account status enum column
ALTER TABLE users ADD COLUMN account_status ENUM('ACTIVE', 'PENDING_DELETION', 'DELETED') NOT NULL DEFAULT 'ACTIVE';

-- Add deletion tracking columns
ALTER TABLE users ADD COLUMN deletion_requested_at DATETIME;
ALTER TABLE users ADD COLUMN deletion_scheduled_at DATETIME;
ALTER TABLE users ADD COLUMN deleted_by BIGINT;
ALTER TABLE users ADD COLUMN deletion_reason VARCHAR(255);

-- Index for scheduler performance
CREATE INDEX idx_users_deletion_scheduled_at ON users(deletion_scheduled_at);
CREATE INDEX idx_users_account_status ON users(account_status);
