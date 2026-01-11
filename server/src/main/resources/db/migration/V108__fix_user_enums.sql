-- 1. Fix invalid account_status values
-- Defaulting to 'ACTIVE' if the status is not one of the recognized values
UPDATE users
SET account_status = 'ACTIVE'
WHERE account_status NOT IN ('ACTIVE', 'BANNED', 'SUSPENDED', 'WARNING', 'PENDING_DELETION');

-- 2. Fix invalid auth_provider values
-- Defaulting to 'LOCAL' if invalid
UPDATE users
SET auth_provider = 'LOCAL'
WHERE auth_provider NOT IN ('LOCAL', 'GOOGLE', 'FACEBOOK');

-- 3. Fix invalid roles in user_roles table
-- Defaulting to 'ROLE_USER' if invalid
UPDATE user_roles
SET role = 'ROLE_USER'
WHERE role NOT IN ('ROLE_USER', 'ROLE_HOUSE_OWNER', 'ROLE_ADMIN');

-- 4. Ensure columns are VARCHAR(50) to strict enum truncation issues in the future
ALTER TABLE users MODIFY COLUMN account_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE users MODIFY COLUMN auth_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL';

-- 5. user_roles.role is part of an ElementCollection, ensure it's simple varchar
ALTER TABLE user_roles MODIFY COLUMN role VARCHAR(50) NOT NULL;
