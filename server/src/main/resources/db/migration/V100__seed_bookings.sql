-- Seed Bookings
-- 1. Pending Request (Tenant -> Landlord)
INSERT INTO bookings (tenant_id, landlord_id, property_id, start_date, end_date, status, notes, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'tenant@demo.com'),
    (SELECT id FROM users WHERE email = 'landlord@demo.com'),
    (SELECT id FROM properties WHERE title = 'Luxury Apartment in Gulshan' LIMIT 1),
    DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY),
    DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY),
    'PENDING',
    'Hello, I would like to book this for a business trip.',
    NOW(),
    NOW();

-- 2. Confirmed Future Booking (Tenant -> Landlord)
INSERT INTO bookings (tenant_id, landlord_id, property_id, start_date, end_date, status, notes, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'tenant@demo.com'),
    (SELECT id FROM users WHERE email = 'landlord@demo.com'),
    (SELECT id FROM properties WHERE title = 'Cozy Studio in Dhanmondi' LIMIT 1),
    DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY),
    DATE_ADD(CURRENT_DATE, INTERVAL 25 DAY),
    'CONFIRMED',
    'Paid deposit.',
    NOW(),
    NOW();

-- 3. Past Completed Booking (Tenant -> Landlord)
INSERT INTO bookings (tenant_id, landlord_id, property_id, start_date, end_date, status, notes, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'tenant@demo.com'),
    (SELECT id FROM users WHERE email = 'landlord@demo.com'),
    (SELECT id FROM properties WHERE title = 'Modern Flat in Banani' LIMIT 1),
    DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY),
    DATE_SUB(CURRENT_DATE, INTERVAL 25 DAY),
    'CHECKED_OUT',
    'Great stay!',
    DATE_SUB(NOW(), INTERVAL 35 DAY),
    DATE_SUB(NOW(), INTERVAL 25 DAY);

-- 4. Reject Request (Seeker -> Landlord)
INSERT INTO bookings (tenant_id, landlord_id, property_id, start_date, end_date, status, notes, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'seeker@demo.com'),
    (SELECT id FROM users WHERE email = 'landlord@demo.com'),
    (SELECT id FROM properties WHERE title = 'Family House in Uttara' LIMIT 1),
    DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY),
    DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY),
    'REJECTED',
    'Dates not available.',
    NOW(),
    NOW();
