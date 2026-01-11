-- V106 Complete Dashboard Seed Data

-- 1. Saved Items
-- Tenant saves a property
INSERT INTO saved_properties (user_id, property_id, saved_at)
SELECT
    (SELECT id FROM users WHERE email = 'tenant@demo.com'),
    (SELECT id FROM properties ORDER BY id DESC LIMIT 1),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM saved_properties
    WHERE user_id = (SELECT id FROM users WHERE email = 'tenant@demo.com')
    AND property_id = (SELECT id FROM properties ORDER BY id DESC LIMIT 1)
);

-- Seeker saves a roommate post
INSERT INTO saved_roommates (user_id, roommate_post_id, saved_at)
SELECT
    (SELECT id FROM users WHERE email = 'seeker@demo.com'),
    (SELECT id FROM roommate_posts ORDER BY id LIMIT 1),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM saved_roommates
    WHERE user_id = (SELECT id FROM users WHERE email = 'seeker@demo.com')
    AND roommate_post_id = (SELECT id FROM roommate_posts ORDER BY id LIMIT 1)
);


-- 2. Notifications
-- Unread notification for Tenant
INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'tenant@demo.com'),
    'PRICE_DROP',
    'Price Drop Alert',
    'A property in your saved list has dropped its price!',
    false,
    NOW(),
    NOW();

-- Unread notification for Landlord
INSERT INTO notifications (user_id, type, title, message, is_read, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'landlord@demo.com'),
    'BOOKING_REQUEST',
    'New Booking Request',
    'You received a new booking request for Luxury Apartment.',
    false,
    NOW(),
    NOW();

-- 3. Reviews (for Landlord Dashboard Ratings)
INSERT INTO reviews (author_id, receiver_id, property_id, rating, comment, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'tenant@demo.com'),
    (SELECT id FROM users WHERE email = 'landlord@demo.com'),
    (SELECT id FROM properties WHERE owner_id = (SELECT id FROM users WHERE email = 'landlord@demo.com') LIMIT 1),
    5,
    'Excellent host and amazing apartment! Highly recommended.',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY);

INSERT INTO reviews (author_id, receiver_id, property_id, rating, comment, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'seeker@demo.com'),
    (SELECT id FROM users WHERE email = 'landlord@demo.com'),
    (SELECT id FROM properties WHERE owner_id = (SELECT id FROM users WHERE email = 'landlord@demo.com') LIMIT 1),
    4,
    'Good place, but a bit noisy in the evening.',
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    DATE_SUB(NOW(), INTERVAL 10 DAY);


-- 4. Expenses (for User Dashboard Finance Charts)
INSERT INTO expenses (title, amount, payer_id, expense_date, created_at)
SELECT 'Rent Payment', 35000.00, (SELECT id FROM users WHERE email = 'tenant@demo.com'), DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY), NOW();

INSERT INTO expenses (title, amount, payer_id, expense_date, created_at)
SELECT 'Utility Bill', 2500.00, (SELECT id FROM users WHERE email = 'tenant@demo.com'), DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), NOW();

INSERT INTO expenses (title, amount, payer_id, expense_date, created_at)
SELECT 'Internet', 1200.00, (SELECT id FROM users WHERE email = 'tenant@demo.com'), DATE_SUB(CURRENT_DATE, INTERVAL 10 DAY), NOW();

-- 5. Verification Requests (for Admin Dashboard Queue)
INSERT INTO verification_requests (user_id, document_url, document_type, status, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'recent.user1@example.com'),
    'https://example.com/docs/passport.jpg',
    'PASSPORT',
    'PENDING',
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'recent.user1@example.com');


-- 6. Reports / Complaints (for Admin Dashboard alerts)
INSERT INTO reports (reporter_id, reported_user_id, reason, description, severity, status, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'landlord@demo.com'),
    (SELECT id FROM users WHERE email = 'recent.user2@example.com'),
    'HARASSMENT',
    'User is sending abusive messages.',
    'HIGH',
    'PENDING',
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'recent.user2@example.com');


-- 7. Fraud Events (Fixing V102 mismatch)
INSERT INTO fraud_events (user_id, fraud_type, severity, metadata, created_at)
SELECT
    (SELECT id FROM users WHERE email = 'early.user1@example.com'),
    'LOGIN_ATTEMPT',
    'MEDIUM',
    '{"ip": "192.168.1.1", "reason": "Multiple failed attempts"}',
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'early.user1@example.com');

INSERT INTO fraud_events (user_id, fraud_type, severity, metadata, created_at)
SELECT
    (SELECT id FROM users WHERE email = 'early.user2@example.com'),
    'PAYMENT_FAILURE',
    'HIGH',
    '{"card": "****1234", "reason": "Suspicious card activity"}',
    DATE_SUB(NOW(), INTERVAL 5 HOUR)
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'early.user2@example.com');

