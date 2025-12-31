USE authdb;

-- variables
SET @landlord_id = (SELECT id
                    FROM users
                    WHERE email = 'landlord@staymate.com');
SET @tenant_id = (SELECT id
                  FROM users
                  WHERE email = 'tenant@staymate.com');

-- 1. Active Booking (Confirmed, Future End Date)
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
VALUES (@tenant_id, @landlord_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'CONFIRMED', 'Excited for the stay!',
        NOW(), NOW());

-- 2. Pending Booking (Pending, Future Start Date)
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
VALUES (@tenant_id, @landlord_id, DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'PENDING',
        'Checking availability.', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- 3. Completed Booking (Completed, Past Date)
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
VALUES (@tenant_id, @landlord_id, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY),
        'COMPLETED', 'Great host!', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 4. Another Active Booking (Confirmed)
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
VALUES (@tenant_id, @landlord_id, DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY),
        'CONFIRMED', 'Long term stay.', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

-- 5. Canceled Booking
INSERT INTO bookings (tenant_id, landlord_id, start_date, end_date, status, notes, created_at, updated_at)
VALUES (@tenant_id, @landlord_id, DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 25 DAY),
        'CANCELLED', 'Changed plans.', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));
