-- ==========================================
-- COMPREHENSIVE SEED DATA V9 - COMMENTED OUT
-- Uncomment if you need sample data for testing
-- ==========================================

/*
-- Clear existing data if needed (optional, but safer for "fresh" testing)
-- DELETE FROM reports;
-- DELETE FROM reviews;
-- DELETE FROM bookings;
-- DELETE FROM properties;
-- DELETE FROM users WHERE id > 10; -- Keep initial admins/users if desired

-- =============================================
-- 1. USERS (Admins, Landlords, Tenants)
-- =============================================

-- Admins (re-confirming existence or adding new)
INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, enabled, account_status, profile_picture_url, auth_provider, created_at, email_verified, phone_verified) VALUES
(100, 'admin@staymate.com', '$2a$10$xn3LI/AjqicFYZFruO4.UOj8vXji9Y8r.m/g.j.7.j.9.8.7.6.5', 'System', 'Admin', true, 'ACTIVE', 'https://ui-avatars.com/api/?name=System+Admin&background=0D8ABC&color=fff', 'LOCAL', NOW(), true, true);

-- Landlords
INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, enabled, account_status, profile_picture_url, city, phone_number, email_verified, phone_verified, auth_provider, created_at) VALUES
(101, 'landlord1@test.com', '$2a$10$xn3LI/AjqicFYZFruO4.UOj8vXji9Y8r.m/g.j.7.j.9.8.7.6.5', 'Rahim', 'Uddin', true, 'ACTIVE', 'https://randomuser.me/api/portraits/men/32.jpg', 'Dhaka', '+8801700000001', true, true, 'LOCAL', NOW());

-- Tenants
INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, enabled, account_status, profile_picture_url, city, phone_number, email_verified, phone_verified, auth_provider, created_at) VALUES
(201, 'student1@test.com', '$2a$10$xn3LI/AjqicFYZFruO4.UOj8vXji9Y8r.m/g.j.7.j.9.8.7.6.5', 'Tanvir', 'Hassan', true, 'ACTIVE', 'https://randomuser.me/api/portraits/men/11.jpg', 'Dhaka', '+8801800000001', true, true, 'LOCAL', NOW());

-- USER ROLES
INSERT IGNORE INTO user_roles (user_id, role) VALUES (100, 'ROLE_ADMIN'), (101, 'ROLE_HOUSE_OWNER'), (201, 'ROLE_USER');

-- PROPERTIES
-- (omitted for brevity)

-- BOOKINGS
-- (omitted for brevity)

-- REVIEWS
-- (omitted for brevity)

-- REPORTS
-- (omitted for brevity)
*/
