-- V101_2__add_role_column_to_users.sql
-- Adds 'role' column to users table to support V102 analytics seeding and denormalization

-- 1. Add the column
ALTER TABLE users
ADD COLUMN role VARCHAR(50) DEFAULT 'ROLE_USER' AFTER last_name;

-- 2. Backfill existing data
-- Map from user_roles table usually, but for now default is 'ROLE_USER'
UPDATE users u
SET role = (
    SELECT role FROM user_roles ur WHERE ur.user_id = u.id LIMIT 1
)
WHERE EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id);

-- If no role found, default to ROLE_USER
UPDATE users SET role = 'ROLE_USER' WHERE role IS NULL;
