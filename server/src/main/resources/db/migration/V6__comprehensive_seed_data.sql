USE authdb;

-- ==========================================
-- 1. SEED USERS (Password: 'password' -> $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG)
-- ==========================================

-- Landlords
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role_selected, email_verified, enabled, created_at, updated_at, auth_provider) VALUES
('landlord.sarah@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Sarah', 'Jenkins', '+15550000001', true, true, true, DATE_SUB(NOW(), INTERVAL 60 DAY), NOW(), 'LOCAL'),
('landlord.david@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'David', 'Chen', '+15550000002', true, true, true, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW(), 'LOCAL'),
('landlord.elena@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Elena', 'Rodriguez', '+15550000003', true, true, true, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW(), 'LOCAL'),
('landlord.james@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'James', 'Wilson', '+15550000004', true, true, true, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW(), 'LOCAL'),
('landlord.maria@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Maria', 'Santos', '+15550000005', true, false, true, NOW(), NOW(), 'LOCAL'); -- Pending Verification

-- Tenants
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role_selected, email_verified, enabled, created_at, updated_at, auth_provider) VALUES
('tenant.alex@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Alex', 'Thompson', '+15551000001', true, true, true, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW(), 'LOCAL'),
('tenant.priya@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Priya', 'Patel', '+15551000002', true, true, true, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW(), 'LOCAL'),
('tenant.sam@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Sam', 'Kim', '+15551000003', true, true, true, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW(), 'LOCAL'),
('tenant.lisa@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Lisa', 'Brown', '+15551000004', true, true, true, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), 'LOCAL'),
('tenant.badactor@staymate.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Bad', 'Actor', '+15559999999', true, true, true, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), 'LOCAL'); -- For Reports

-- Assign Roles
INSERT INTO user_roles (user_id, role) SELECT id, 'ROLE_HOUSE_OWNER' FROM users WHERE email LIKE 'landlord.%';
INSERT INTO user_roles (user_id, role) SELECT id, 'ROLE_USER' FROM users WHERE email LIKE 'tenant.%';

-- ==========================================
-- 2. SEED PROPERTIES (Across Cities)
-- ==========================================

-- Sarah's Properties (New York)
INSERT INTO properties (owner_id, title, description, location, price, price_amount, beds, baths, sqft, status, verified, views, inquiries, created_at, updated_at)
SELECT id, 'Luxury Loft in Soho', 'Beautiful loft with high ceilings.', 'New York, NY', '$4,500/mo', 4500, 1, 1, 900, 'Active', true, 120, 15, DATE_SUB(NOW(), INTERVAL 50 DAY), NOW() FROM users WHERE email='landlord.sarah@staymate.com';

INSERT INTO properties (owner_id, title, description, location, price, price_amount, beds, baths, sqft, status, verified, views, inquiries, created_at, updated_at)
SELECT id, 'Cozy Studio in Brooklyn', 'Near subway, great light.', 'Brooklyn, NY', '$2,200/mo', 2200, 0, 1, 450, 'Rented', true, 85, 8, DATE_SUB(NOW(), INTERVAL 40 DAY), NOW() FROM users WHERE email='landlord.sarah@staymate.com';

-- David's Properties (San Francisco)
INSERT INTO properties (owner_id, title, description, location, price, price_amount, beds, baths, sqft, status, verified, views, inquiries, created_at, updated_at)
SELECT id, 'Modern Condo in Mission', 'New appliances, gym in building.', 'San Francisco, CA', '$3,800/mo', 3800, 2, 2, 1100, 'Active', true, 200, 25, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW() FROM users WHERE email='landlord.david@staymate.com';

INSERT INTO properties (owner_id, title, description, location, price, price_amount, beds, baths, sqft, status, verified, views, inquiries, created_at, updated_at)
SELECT id, 'Victorian Room', 'Shared house in Haight.', 'San Francisco, CA', '$1,500/mo', 1500, 1, 1, 200, 'Pending', false, 15, 2, NOW(), NOW() FROM users WHERE email='landlord.david@staymate.com';

-- Elena's Properties (London)
INSERT INTO properties (owner_id, title, description, location, price, price_amount, beds, baths, sqft, status, verified, views, inquiries, created_at, updated_at)
SELECT id, 'Flat in Kensington', 'Elegant 1 bedroom flat.', 'London, UK', '£2,500/mo', 3100, 1, 1, 600, 'Active', true, 150, 12, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW() FROM users WHERE email='landlord.elena@staymate.com';

-- James's Properties (Tokyo)
INSERT INTO properties (owner_id, title, description, location, price, price_amount, beds, baths, sqft, status, verified, views, inquiries, created_at, updated_at)
SELECT id, 'Compact Apt in Shibuya', 'Right in the action.', 'Tokyo, JP', '¥150,000/mo', 1000, 1, 1, 25, 'Active', true, 300, 40, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW() FROM users WHERE email='landlord.james@staymate.com';


-- ==========================================
-- 3. SEED BOOKINGS (History & Trends)
-- ==========================================

-- Completed Bookings (Past Revenue)
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email='tenant.alex@staymate.com'),
    (SELECT id FROM users WHERE email='landlord.sarah@staymate.com'),
    DATE_SUB(CURDATE(), INTERVAL 2 MONTH), DATE_SUB(CURDATE(), INTERVAL 1 MONTH),
    'COMPLETED', 'Great stay!', DATE_SUB(NOW(), INTERVAL 65 DAY), DATE_SUB(NOW(), INTERVAL 65 DAY);

INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email='tenant.priya@staymate.com'),
    (SELECT id FROM users WHERE email='landlord.david@staymate.com'),
    DATE_SUB(CURDATE(), INTERVAL 45 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY),
    'COMPLETED', 'Lovely place.', DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY);

-- Active/Confirmed Bookings (Current Revenue)
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email='tenant.sam@staymate.com'),
    (SELECT id FROM users WHERE email='landlord.elena@staymate.com'),
    DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 25 DAY),
    'CONFIRMED', 'Moving in now.', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY);

-- Pending Bookings (Upcoming Actions)
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email='tenant.lisa@staymate.com'),
    (SELECT id FROM users WHERE email='landlord.james@staymate.com'),
    DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 40 DAY),
    'PENDING', 'Is internet included?', NOW(), NOW();

-- Cancelled (Churn)
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email='tenant.alex@staymate.com'),
    (SELECT id FROM users WHERE email='landlord.james@staymate.com'),
    DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY),
    'CANCELLED', 'Changed destination.', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY);


-- ==========================================
-- 4. SEED REVIEWS (Reputation)
-- ==========================================

-- Positive Reviews
INSERT INTO reviews (author_id, receiver_id, rating, comment, created_at, updated_at)
SELECT (SELECT id FROM users WHERE email='tenant.alex@staymate.com'), (SELECT id FROM users WHERE email='landlord.sarah@staymate.com'), 5, 'Best host ever!', NOW(), NOW();

INSERT INTO reviews (author_id, receiver_id, rating, comment, created_at, updated_at)
SELECT (SELECT id FROM users WHERE email='tenant.priya@staymate.com'), (SELECT id FROM users WHERE email='landlord.david@staymate.com'), 4, 'Very good, bit noisy.', NOW(), NOW();

-- Negative Review (For Safety/Quality check)
INSERT INTO reviews (author_id, receiver_id, rating, comment, created_at, updated_at)
SELECT (SELECT id FROM users WHERE email='tenant.sam@staymate.com'), (SELECT id FROM users WHERE email='landlord.james@staymate.com'), 2, 'Room smaller than photos.', NOW(), NOW();


-- ==========================================
-- 5. SEED REPORTS (Safety Command Panel)
-- ==========================================

-- Critical Report
INSERT INTO reports (reporter_id, reported_user_id, reason, description, severity, status, admin_notes, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email='landlord.sarah@staymate.com'),
    (SELECT id FROM users WHERE email='tenant.badactor@staymate.com'),
    'FRAUD', 'Tried to pay outside platform with weird link.', 'CRITICAL', 'PENDING', NULL, NOW(), NOW();

-- High Severity Report
INSERT INTO reports (reporter_id, reported_user_id, reason, description, severity, status, admin_notes, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email='tenant.lisa@staymate.com'),
    (SELECT id FROM users WHERE email='landlord.david@staymate.com'),
    'HARASSMENT', 'Host sent rude messages after I asked about heating.', 'HIGH', 'INVESTIGATING', 'Contacted host for statement.', DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW();

-- Resolved Report
INSERT INTO reports (reporter_id, reported_user_id, reason, description, severity, status, admin_notes, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email='landlord.elena@staymate.com'),
    (SELECT id FROM users WHERE email='tenant.alex@staymate.com'),
    'OTHER', 'Minor noise complaint.', 'LOW', 'RESOLVED', 'Warned tenant.', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY);
