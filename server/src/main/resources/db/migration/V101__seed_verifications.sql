-- Seed Verification Requests

-- 1. Pending Request (Tenant)
INSERT INTO verification_requests (user_id, document_url, document_type, status, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'tenant@demo.com'),
    'https://example.com/documents/tenant_id.pdf',
    'GOVERNMENT_ID',
    'PENDING',
    NOW(),
    NOW();

-- 2. Approved Request (Landlord)
INSERT INTO verification_requests (user_id, document_url, document_type, status, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'landlord@demo.com'),
    'https://example.com/documents/deed.pdf',
    'PROPERTY_DEED',
    'APPROVED',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY);

-- 3. Rejected Request (Seeker)
INSERT INTO verification_requests (user_id, document_url, document_type, status, rejection_reason, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'seeker@demo.com'),
    'https://example.com/documents/blurry_id.jpg',
    'STUDENT_ID',
    'REJECTED',
    'Document is too blurry. Please upload a clear copy.',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    DATE_SUB(NOW(), INTERVAL 1 DAY);

-- 4. Another Pending Request (New User)
-- Creating a new user for this scenario if not exists or reuse seeker if allowed multiple (usually one per user, but for seed it's fine)
-- Let's just add another one for 'seeker@demo.com' as a re-submission
INSERT INTO verification_requests (user_id, document_url, document_type, status, created_at, updated_at)
SELECT
    (SELECT id FROM users WHERE email = 'seeker@demo.com'),
    'https://example.com/documents/clear_id.jpg',
    'STUDENT_ID',
    'PENDING',
    NOW(),
    NOW();
