-- Flyway manages the database context, do not use USE statements
-- ==========================================
-- COMPREHENSIVE SEED DATA - COMMENTED OUT
-- Uncomment if you need sample data for testing
-- ==========================================

/*
-- ==========================================
-- 1. SEED USERS (Password: 'password' -> $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG)
-- ==========================================

-- Landlords
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role_selected, email_verified, enabled, created_at, updated_at, auth_provider) VALUES
('landlord.sarah@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Sarah', 'Jenkins', '+15550000001', true, true, true, DATE_SUB(NOW(), INTERVAL 60 DAY), NOW(), 'LOCAL'),
('landlord.david@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'David', 'Chen', '+15550000002', true, true, true, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW(), 'LOCAL');

-- Tenants
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role_selected, email_verified, enabled, created_at, updated_at, auth_provider) VALUES
('tenant.alex@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Alex', 'Thompson', '+15551000001', true, true, true, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW(), 'LOCAL');

-- Assign Roles
INSERT INTO user_roles (user_id, role) SELECT id, 'ROLE_HOUSE_OWNER' FROM users WHERE email LIKE 'landlord.%';
INSERT INTO user_roles (user_id, role) SELECT id, 'ROLE_USER' FROM users WHERE email LIKE 'tenant.%';

-- ==========================================
-- 2. SEED PROPERTIES
-- ==========================================
INSERT INTO properties (owner_id, title, description, location, price, price_amount, beds, baths, sqft, status, verified, views, inquiries, created_at, updated_at)
SELECT id, 'Luxury Loft in Soho', 'Beautiful loft with high ceilings.', 'New York, NY', '$4,500/mo', 4500, 1, 1, 900, 'Active', true, 120, 15, DATE_SUB(NOW(), INTERVAL 50 DAY), NOW() FROM users WHERE email='landlord.sarah@staymate.com';

-- ==========================================
-- 3. SEED BOOKINGS
-- ==========================================
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
SELECT (SELECT id FROM users WHERE email='tenant.alex@staymate.com'), (SELECT id FROM users WHERE email='landlord.sarah@staymate.com'),
CAST(DATE_SUB(NOW(), INTERVAL 2 MONTH) AS DATE), CAST(DATE_SUB(NOW(), INTERVAL 1 MONTH) AS DATE), 'COMPLETED', 'Great stay!', NOW(), NOW();

-- ==========================================
-- 4. SEED REVIEWS
-- ==========================================
INSERT INTO reviews (author_id, receiver_id, rating, comment, created_at, updated_at)
SELECT (SELECT id FROM users WHERE email='tenant.alex@staymate.com'), (SELECT id FROM users WHERE email='landlord.sarah@staymate.com'), 5, 'Best host ever!', NOW(), NOW();

-- ==========================================
-- 5. SEED REPORTS
-- ==========================================
INSERT INTO reports (reporter_id, reported_user_id, reason, description, severity, status, admin_notes, created_at, updated_at)
SELECT (SELECT id FROM users WHERE email='landlord.sarah@staymate.com'), (SELECT id FROM users WHERE email='tenant.alex@staymate.com'), 'OTHER', 'Minor noise complaint.', 'LOW', 'RESOLVED', 'Warned tenant.', NOW(), NOW();
*/
