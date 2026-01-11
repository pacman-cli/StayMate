-- 1. Safely handle invalid 'fraud_type' values in 'fraud_events'
-- Update any fraud_type that is NOT in the new allowed list to a safe default 'SUSPICIOUS_LOGIN'
UPDATE fraud_events
SET fraud_type = 'SUSPICIOUS_LOGIN'
WHERE fraud_type NOT IN (
    'DUPLICATE_LISTING',
    'SPAM_MESSAGES',
    'MULTI_ACCOUNT',
    'SUSPICIOUS_LOGIN',
    'FAKE_LOCATION'
);

-- 2. Safely handle invalid 'status' values in 'maintenance_requests'
-- Update any status that is NOT in the new allowed list to a safe default 'OPEN'
UPDATE maintenance_requests
SET status = 'OPEN'
WHERE status NOT IN (
    'OPEN',
    'IN_PROGRESS',
    'ON_HOLD',
    'RESOLVED',
    'CLOSED',
    'CANCELLED'
);

-- 3. Ensure the columns are VARCHAR to support the Enum mapping cleanly
-- (MySQL ENUM type can be strict, VARCHAR allows strict application-level validation via Hibernate)
ALTER TABLE fraud_events MODIFY COLUMN fraud_type VARCHAR(50) NOT NULL;
ALTER TABLE maintenance_requests MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'OPEN';
