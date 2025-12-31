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
(101, 'landlord1@test.com', '$2a$10$xn3LI/AjqicFYZFruO4.UOj8vXji9Y8r.m/g.j.7.j.9.8.7.6.5', 'Rahim', 'Uddin', true, 'ACTIVE', 'https://randomuser.me/api/portraits/men/32.jpg', 'Dhaka', '+8801700000001', true, true, 'LOCAL', NOW()),
(102, 'landlord2@test.com', '$2a$10$xn3LI/AjqicFYZFruO4.UOj8vXji9Y8r.m/g.j.7.j.9.8.7.6.5', 'Selina', 'Begum', true, 'ACTIVE', 'https://randomuser.me/api/portraits/women/44.jpg', 'Chittagong', '+8801700000002', true, true, 'LOCAL', NOW()),
(103, 'scam_landlord@test.com', '$2a$10$xn3LI/AjqicFYZFruO4.UOj8vXji9Y8r.m/g.j.7.j.9.8.7.6.5', 'Fake', 'Landlord', true, 'PENDING_DELETION', 'https://randomuser.me/api/portraits/men/88.jpg', 'Dhaka', '+8801700000003', false, false, 'LOCAL', NOW());

-- Tenants
INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, enabled, account_status, profile_picture_url, city, phone_number, email_verified, phone_verified, auth_provider, created_at) VALUES
(201, 'student1@test.com', '$2a$10$xn3LI/AjqicFYZFruO4.UOj8vXji9Y8r.m/g.j.7.j.9.8.7.6.5', 'Tanvir', 'Hassan', true, 'ACTIVE', 'https://randomuser.me/api/portraits/men/11.jpg', 'Dhaka', '+8801800000001', true, true, 'LOCAL', NOW()),
(202, 'jobseeker@test.com', '$2a$10$xn3LI/AjqicFYZFruO4.UOj8vXji9Y8r.m/g.j.7.j.9.8.7.6.5', 'Nusrat', 'Jahan', true, 'ACTIVE', 'https://randomuser.me/api/portraits/women/65.jpg', 'Dhaka', '+8801800000002', true, true, 'LOCAL', NOW()),
(203, 'newcomer@test.com', '$2a$10$xn3LI/AjqicFYZFruO4.UOj8vXji9Y8r.m/g.j.7.j.9.8.7.6.5', 'Kamal', 'Ahmed', true, 'ACTIVE', 'https://randomuser.me/api/portraits/men/22.jpg', 'Sylhet', '+8801800000003', false, false, 'LOCAL', NOW());

-- =============================================
-- 1a. USER ROLES
-- =============================================

INSERT IGNORE INTO user_roles (user_id, role) VALUES
(100, 'ROLE_ADMIN'),
(101, 'ROLE_HOUSE_OWNER'),
(102, 'ROLE_HOUSE_OWNER'),
(103, 'ROLE_HOUSE_OWNER'),
(201, 'ROLE_USER'),
(202, 'ROLE_USER'),
(203, 'ROLE_USER');


-- =============================================
-- 2. PROPERTIES (Various locations and statuses)
-- =============================================

INSERT IGNORE INTO properties (id, title, description, location, price, price_amount, status, beds, baths, sqft, owner_id, created_at) VALUES
-- Active Properties (Dhaka)
(301, 'Modern Apartment near NSU', 'Spacious student-friendly apartment walking distance to North South University. Generator, Lift, and Guard available. Type: APARTMENT', 'Plot 5, Block B, Bashundhara R/A, Dhaka', '25,000', 25000, 'AVAILABLE', 3, 3, 1500, 101, NOW() - INTERVAL 10 DAY),
(302, 'Cozy Studio in Gulshan', 'Fully furnished studio apartment perfect for bachelor or single professional. Type: STUDIO', 'Road 45, Gulshan 2, Dhaka', '35,000', 35000, 'AVAILABLE', 1, 1, 600, 101, NOW() - INTERVAL 5 DAY),

-- Active Properties (Chittagong)
(303, 'Sea View Flat', 'Beautiful view of the bay. Quiet neighborhood. Type: APARTMENT', 'Nasirabad Housing Society, Chittagong', '18,000', 18000, 'AVAILABLE', 2, 2, 1200, 102, NOW() - INTERVAL 20 DAY),

-- Pending Properties
(304, 'Shared Room for Female Student', 'Female roommate needed. Near EWU. Type: SHARED_ROOM', 'Aftabnagar, Dhaka', '6,000', 6000, 'PENDING', 1, 1, 150, 102, NOW() - INTERVAL 1 DAY),

-- Rented Properties
(305, 'Family Apartment in Uttara', '3 Bedroom apartment, south facing. Type: APARTMENT', 'Sector 7, Uttara, Dhaka', '22,000', 22000, 'RENTED', 3, 3, 1400, 101, NOW() - INTERVAL 60 DAY);

-- =============================================
-- 3. BOOKINGS (Past, Active, Upcoming)
-- =============================================
-- Note: Bookings table uses tenant_id AND landlord_id (direct booking), and has NO property_id or total_price column.
-- Linked manually per property owner:
-- Property 305 owner=101, 301 owner=101, 302 owner=101, 303 owner=102

INSERT IGNORE INTO bookings (id, tenant_id, landlord_id, start_date, end_date, status, created_at) VALUES
-- Past (COMPLETED) - was Property 305 (Owner 101)
(401, 201, 101, NOW() - INTERVAL 6 MONTH, NOW() - INTERVAL 1 DAY, 'COMPLETED', NOW() - INTERVAL 6 MONTH),

-- Active (CONFIRMED) - was Property 301 (Owner 101)
(402, 202, 101, NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 20 DAY, 'CONFIRMED', NOW() - INTERVAL 15 DAY),

-- Upcoming (CONFIRMED) - was Property 302 (Owner 101)
(403, 203, 101, NOW() + INTERVAL 5 DAY, NOW() + INTERVAL 35 DAY, 'CONFIRMED', NOW() - INTERVAL 2 DAY),

-- Cancelled (CANCELLED) - was Property 303 (Owner 102)
(404, 201, 102, NOW() + INTERVAL 10 DAY, NOW() + INTERVAL 40 DAY, 'CANCELLED', NOW() - INTERVAL 3 DAY);

-- =============================================
-- 4. REVIEWS
-- =============================================
-- Note: Reviews table doesn't have booking_id. Has property_id and rating/comment.

INSERT IGNORE INTO reviews (id, author_id, property_id, rating, comment, created_at) VALUES
-- Review for Property 305 by User 201
(501, 201, 305, 5, 'Excellent apartment and very cooperative landlord. Highly recommended!', NOW() - INTERVAL 1 DAY),
-- Review for Landlord 101 directly (property_id null)
(502, 201, null, 4, 'Mr. Rahim is a gentleman. Prompt with repairs.', NOW() - INTERVAL 1 DAY);

-- =============================================
-- 5. REPORTS
-- =============================================
-- Note: Reports table has reported_user_id, NO reported_property_id. Added severity column.

INSERT IGNORE INTO reports (id, reporter_id, reported_user_id, reason, description, severity, status, created_at) VALUES
-- Report against Scam Landlord
(601, 201, 103, 'FRAUD', 'This user asked for advance payment without showing the property.', 'CRITICAL', 'PENDING', NOW() - INTERVAL 2 HOUR),
-- Report against Landlord 101 (Property issue, but reported against user)
(602, 202, 101, 'OTHER', 'Lift was not working for 3 days at property.', 'MEDIUM', 'RESOLVED', NOW() - INTERVAL 5 DAY);
