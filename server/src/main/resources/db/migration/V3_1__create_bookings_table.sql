-- Flyway manages the database context, do not use USE statements

CREATE TABLE IF NOT EXISTS bookings (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id   BIGINT NOT NULL REFERENCES users (id),
    landlord_id BIGINT NOT NULL REFERENCES users (id),
    start_date  DATE,
    end_date    DATE,
    status      ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- ADMIN SEED DATA
-- Creates the primary admin user
-- Note: Only uses columns that exist at this migration point
-- ==========================================

-- Admin User (Password: password)
INSERT INTO users (email, password_hash, first_name, last_name, bio, auth_provider, email_verified, phone_verified, role_selected, enabled, created_at, updated_at)
SELECT 'mpuspo2310304@bscse.uiu.ac.bd',
       '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
       'Super',
       'Admin',
       'System Administrator',
       'LOCAL',
       true,
       true,
       true,
       true,
       NOW(),
       NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mpuspo2310304@bscse.uiu.ac.bd');

-- Assign Admin Roles
SET @admin_id = (SELECT id FROM users WHERE email = 'mpuspo2310304@bscse.uiu.ac.bd');

INSERT INTO user_roles (user_id, role)
SELECT @admin_id, 'ROLE_ADMIN'
FROM DUAL
WHERE @admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = @admin_id AND role = 'ROLE_ADMIN'
);

INSERT INTO user_roles (user_id, role)
SELECT @admin_id, 'ROLE_USER'
FROM DUAL
WHERE @admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = @admin_id AND role = 'ROLE_USER'
);

INSERT INTO user_roles (user_id, role)
SELECT @admin_id, 'ROLE_HOUSE_OWNER'
FROM DUAL
WHERE @admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = @admin_id AND role = 'ROLE_HOUSE_OWNER'
);
