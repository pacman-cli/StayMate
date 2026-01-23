-- V121__update_admin_password.sql
-- 1. Remove old admin user: mpuspo2310304@bscse.uiu.ac.bd
-- 2. Ensure admin@gmail.com with password: admin123

-- ==========================================
-- REMOVE OLD ADMIN USER
-- ==========================================
SET @old_admin_id = (SELECT id FROM users WHERE email = 'mpuspo2310304@bscse.uiu.ac.bd');

-- Delete roles first (foreign key constraint)
DELETE FROM user_roles WHERE user_id = @old_admin_id;

-- Delete the old admin user
DELETE FROM users WHERE email = 'mpuspo2310304@bscse.uiu.ac.bd';

-- ==========================================
-- ENSURE NEW ADMIN USER: admin@gmail.com / admin123
-- BCrypt hash for "admin123": $2a$10$N9qo8uLOickgx2ZMRZoMye.eOQoXfYJv.pmKQp.0xY2hO2mLiP/Ve
-- ==========================================

-- Update existing admin password if user exists
UPDATE users
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye.eOQoXfYJv.pmKQp.0xY2hO2mLiP/Ve'
WHERE email = 'admin@gmail.com';

-- Insert admin if not exists
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, profile_picture_url, bio, address, city, email_verified, phone_verified, role_selected, auth_provider, created_at, updated_at, last_login_at, enabled, account_status)
SELECT * FROM (SELECT
    'admin@gmail.com' AS email,
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.eOQoXfYJv.pmKQp.0xY2hO2mLiP/Ve' AS password_hash,
    'Admin' AS first_name,
    'User' AS last_name,
    '+8801700000000' AS phone_number,
    'https://ui-avatars.com/api/?name=Admin+User' AS profile_picture_url,
    'Main Administrator' AS bio,
    'Admin HQ' AS address,
    'Dhaka' AS city,
    1 AS email_verified,
    1 AS phone_verified,
    1 AS role_selected,
    'LOCAL' AS auth_provider,
    NOW() AS created_at,
    NOW() AS updated_at,
    NOW() AS last_login_at,
    1 AS enabled,
    'ACTIVE' AS account_status
) AS tmp
WHERE NOT EXISTS (
    SELECT email FROM users WHERE email = 'admin@gmail.com'
) LIMIT 1;

-- Ensure roles exist for admin@gmail.com
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@gmail.com');

INSERT INTO user_roles (user_id, role)
SELECT * FROM (SELECT @admin_id, 'ROLE_ADMIN') AS tmp
WHERE @admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = @admin_id AND role = 'ROLE_ADMIN'
) LIMIT 1;

INSERT INTO user_roles (user_id, role)
SELECT * FROM (SELECT @admin_id, 'ROLE_USER') AS tmp
WHERE @admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = @admin_id AND role = 'ROLE_USER'
) LIMIT 1;

INSERT INTO user_roles (user_id, role)
SELECT * FROM (SELECT @admin_id, 'ROLE_HOUSE_OWNER') AS tmp
WHERE @admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = @admin_id AND role = 'ROLE_HOUSE_OWNER'
) LIMIT 1;
