-- =====================================================
-- V102: Seed Analytics Data
-- =====================================================
-- CRITICAL: This migration creates users FIRST, then dependent data
-- This ensures all FK references are valid (no NULL violations)
-- Schema-validated: All columns verified against actual migrations
-- =====================================================

-- =====================================================
-- 1. SEED PREREQUISITE USERS (For dependent tables)
-- =====================================================

-- Tenant user for maintenance requests
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, auth_provider, created_at, account_status, email_verified, phone_verified)
SELECT 'tenant@example.com', '$2a$10$abcdefg...', 'Demo', 'Tenant', 'ROLE_USER', 'LOCAL', DATE_SUB(CURRENT_DATE, INTERVAL 45 DAY), 'ACTIVE', true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tenant@example.com');

-- Second tenant for maintenance requests
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, auth_provider, created_at, account_status, email_verified, phone_verified)
SELECT 'tenant2@example.com', '$2a$10$abcdefg...', 'Demo', 'Tenant2', 'ROLE_USER', 'LOCAL', DATE_SUB(CURRENT_DATE, INTERVAL 40 DAY), 'ACTIVE', true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tenant2@example.com');

-- Landlord for bookings
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, auth_provider, created_at, account_status, email_verified, phone_verified)
SELECT 'landlord@example.com', '$2a$10$abcdefg...', 'Demo', 'Landlord', 'ROLE_HOUSE_OWNER', 'LOCAL', DATE_SUB(CURRENT_DATE, INTERVAL 50 DAY), 'ACTIVE', true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'landlord@example.com');

-- =====================================================
-- 2. SEED USERS FOR GROWTH CHART
-- =====================================================
-- Create users with different creation dates to simulate growth
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, auth_provider, created_at, account_status, email_verified, phone_verified)
SELECT 'early.user1@example.com', '$2a$10$abcdefg...', 'Early', 'User1', 'ROLE_USER', 'LOCAL', DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY), 'ACTIVE', true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'early.user1@example.com');

INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, auth_provider, created_at, account_status, email_verified, phone_verified)
SELECT 'early.user2@example.com', '$2a$10$abcdefg...', 'Early', 'User2', 'ROLE_USER', 'LOCAL', DATE_SUB(CURRENT_DATE, INTERVAL 29 DAY), 'ACTIVE', true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'early.user2@example.com');

INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, auth_provider, created_at, account_status, email_verified, phone_verified)
SELECT 'mid.user1@example.com', '$2a$10$abcdefg...', 'Mid', 'User1', 'ROLE_USER', 'LOCAL', DATE_SUB(CURRENT_DATE, INTERVAL 15 DAY), 'ACTIVE', true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mid.user1@example.com');

INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, auth_provider, created_at, account_status, email_verified, phone_verified)
SELECT 'mid.user2@example.com', '$2a$10$abcdefg...', 'Mid', 'User2', 'ROLE_USER', 'LOCAL', DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY), 'ACTIVE', true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mid.user2@example.com');

INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, auth_provider, created_at, account_status, email_verified, phone_verified)
SELECT 'recent.user1@example.com', '$2a$10$abcdefg...', 'Recent', 'User1', 'ROLE_USER', 'LOCAL', DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY), 'ACTIVE', true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'recent.user1@example.com');

INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, auth_provider, created_at, account_status, email_verified, phone_verified)
SELECT 'recent.user2@example.com', '$2a$10$abcdefg...', 'Recent', 'User2', 'ROLE_USER', 'LOCAL', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'ACTIVE', true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'recent.user2@example.com');

-- =====================================================
-- 3. SEED MAINTENANCE REQUESTS (Now safe - users exist)
-- =====================================================
INSERT INTO maintenance_requests (property_id, requester_id, title, description, status, priority, created_at, updated_at)
SELECT
  (SELECT id FROM properties LIMIT 1),
  (SELECT id FROM users WHERE email = 'tenant@example.com'),
  'Leaky Faucet',
  'The faucet in the bathroom is dripping constantly.',
  'PENDING',
  'LOW',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM properties)
  AND EXISTS (SELECT 1 FROM users WHERE email = 'tenant@example.com');

INSERT INTO maintenance_requests (property_id, requester_id, title, description, status, priority, created_at, updated_at)
SELECT
  (SELECT id FROM properties LIMIT 1),
  (SELECT id FROM users WHERE email = 'tenant2@example.com'),
  'Broken Window',
  'Window cracked during storm.',
  'IN_PROGRESS',
  'HIGH',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM properties)
  AND EXISTS (SELECT 1 FROM users WHERE email = 'tenant2@example.com');

-- =====================================================
-- 4. SEED BOOKINGS (Schema-validated: V1, V15, V19)
-- =====================================================
-- Columns: id, tenant_id, landlord_id, property_id, start_date, end_date,
--          check_in_time, check_out_time, status, notes, created_at, updated_at
-- NO 'items' column exists!

INSERT INTO bookings (property_id, tenant_id, landlord_id, start_date, end_date, status, created_at, updated_at)
SELECT
  (SELECT id FROM properties LIMIT 1),
  (SELECT id FROM users WHERE email = 'recent.user1@example.com'),
  (SELECT id FROM users WHERE email = 'landlord@example.com'),
  DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY),
  DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY),
  'CONFIRMED',
  DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY),
  DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY)
WHERE EXISTS (SELECT 1 FROM properties)
  AND EXISTS (SELECT 1 FROM users WHERE email = 'recent.user1@example.com')
  AND EXISTS (SELECT 1 FROM users WHERE email = 'landlord@example.com');

INSERT INTO bookings (property_id, tenant_id, landlord_id, start_date, end_date, status, created_at, updated_at)
SELECT
  (SELECT id FROM properties LIMIT 1),
  (SELECT id FROM users WHERE email = 'recent.user2@example.com'),
  (SELECT id FROM users WHERE email = 'landlord@example.com'),
  DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY),
  DATE_ADD(CURRENT_DATE, INTERVAL 40 DAY),
  'CANCELLED',
  DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY),
  DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY)
WHERE EXISTS (SELECT 1 FROM properties)
  AND EXISTS (SELECT 1 FROM users WHERE email = 'recent.user2@example.com')
  AND EXISTS (SELECT 1 FROM users WHERE email = 'landlord@example.com');

-- =====================================================
-- 5. SEED FRAUD EVENTS
-- =====================================================
INSERT INTO fraud_events (user_id, fraud_type, severity, metadata, created_at)
SELECT
  (SELECT id FROM users WHERE email = 'early.user1@example.com'),
  'LOGIN_ATTEMPT',
  'MEDIUM',
  '{"ip": "192.168.1.1", "reason": "Multiple failed login attempts"}',
  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 HOUR)
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'early.user1@example.com');

INSERT INTO fraud_events (user_id, fraud_type, severity, metadata, created_at)
SELECT
  (SELECT id FROM users WHERE email = 'early.user2@example.com'),
  'PAYMENT_FAILURE',
  'HIGH',
  '{"card": "****1234", "reason": "Suspicious card activity"}',
  DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 HOUR)
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'early.user2@example.com');
