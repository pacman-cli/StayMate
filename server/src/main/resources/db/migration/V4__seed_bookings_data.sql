USE authdb;
-- ==========================================
-- SEED DATA COMMENTED OUT
-- Uncomment if you need sample bookings for testing
-- ==========================================

/*
-- variables
SET @landlord_id = (SELECT id FROM users WHERE email = 'landlord@staymate.com');
SET @tenant_id = (SELECT id FROM users WHERE email = 'tenant@staymate.com');

-- 1. Active Booking (Confirmed, Future End Date)
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
VALUES (@tenant_id, @landlord_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'CONFIRMED', 'Excited for the stay!', NOW(), NOW());

-- 2. Pending Booking
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
VALUES (@tenant_id, @landlord_id, DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'PENDING', 'Checking availability.', NOW(), NOW());

-- 3. Completed Booking
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
VALUES (@tenant_id, @landlord_id, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'COMPLETED', 'Great host!', NOW(), NOW());

-- 4. Another Active Booking
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
VALUES (@tenant_id, @landlord_id, DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'CONFIRMED', 'Long term stay.', NOW(), NOW());

-- 5. Canceled Booking
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
VALUES (@tenant_id, @landlord_id, DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'CANCELLED', 'Changed plans.', NOW(), NOW());
*/
