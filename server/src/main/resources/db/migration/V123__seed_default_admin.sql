-- V123__seed_default_admin.sql
-- Purpose: Ensure default admin user exists with correct credentials and roles
-- Target User: admin@gmail.com
-- Password: admin123
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMye.eOQoXfYJv.pmKQp.0xY2hO2mLiP/Ve (BCrypt Cost 10)

SET @admin_email = 'admin@gmail.com';
SET @admin_hash = '$2a$12$zcXBZrDB8xW4qfhCMKWYcuHM485fd4ctBdq.vcKcRZBSEANpGI8dm';

-- 1. Insert Admin User if not exists
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    phone_number,
    profile_picture_url,
    bio,
    address,
    city,
    email_verified,
    phone_verified,
    role_selected,
    auth_provider,
    created_at,
    updated_at,
    last_login_at,
    enabled,
    account_status
)
SELECT * FROM (SELECT
    @admin_email AS email,
    @admin_hash AS password_hash,
    'System' AS first_name,
    'Admin' AS last_name,
    '+8801700000000' AS phone_number,
    'https://ui-avatars.com/api/?name=System+Admin' AS profile_picture_url,
    'Default System Administrator' AS bio,
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
    SELECT email FROM users WHERE email = @admin_email
) LIMIT 1;

-- 2. Update existing user to ensure password match (if they already existed)
UPDATE users
SET password_hash = @admin_hash,
    enabled = 1,
    account_status = 'ACTIVE',
    updated_at = NOW()
WHERE email = @admin_email;

-- 3. Get Admin User ID
SET @admin_id = (SELECT id FROM users WHERE email = @admin_email);

-- 4. Assign ROLE_ADMIN (Idempotent)
INSERT INTO user_roles (user_id, role)
SELECT * FROM (SELECT @admin_id, 'ROLE_ADMIN') AS tmp
WHERE @admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = @admin_id AND role = 'ROLE_ADMIN'
) LIMIT 1;

-- 5. Assign ROLE_USER (Idempotent - Admin often needs basic User permissions too)
INSERT INTO user_roles (user_id, role)
SELECT * FROM (SELECT @admin_id, 'ROLE_USER') AS tmp
WHERE @admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = @admin_id AND role = 'ROLE_USER'
) LIMIT 1;

-- 6. Assign ROLE_HOUSE_OWNER (Optional but often useful for full system access)
INSERT INTO user_roles (user_id, role)
SELECT * FROM (SELECT @admin_id, 'ROLE_HOUSE_OWNER') AS tmp
WHERE @admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = @admin_id AND role = 'ROLE_HOUSE_OWNER'
) LIMIT 1;
