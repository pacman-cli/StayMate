-- V125__fix_admin_login.sql
-- Purpose: Force reset admin credentials to known good state
-- User: admin@gmail.com
-- Password: admin123
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMye.eOQoXfYJv.pmKQp.0xY2hO2mLiP/Ve

-- 1. Force update the user record
UPDATE users
SET password_hash = '$2a$12$UP0uW0Jz51lKXw1LE7mEC.8REHr6hp5jBrcLs.thb/Zx1vXCBSa0C',
    enabled = 1,
    account_status = 'ACTIVE',
    auth_provider = 'LOCAL',
    email_verified = 1
WHERE email = 'admin@gmail.com';

-- 2. Ensure roles exist (idempotent check)
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
