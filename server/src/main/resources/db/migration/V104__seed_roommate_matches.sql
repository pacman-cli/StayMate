-- Seed Users for Matchmaking
INSERT INTO users (email, password_hash, first_name, last_name, gender, email_verified, phone_verified, role_selected, enabled, account_status, auth_provider, created_at)
VALUES
('match.male@test.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1', 'Match', 'Male', 'MALE', true, true, true, true, 'ACTIVE', 'LOCAL', NOW()),
('match.female@test.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1', 'Match', 'Female', 'FEMALE', true, true, true, true, 'ACTIVE', 'LOCAL', NOW()),
('match.student@test.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1', 'Match', 'Student', 'MALE', true, true, true, true, 'ACTIVE', 'LOCAL', NOW()),
('match.pro@test.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1', 'Match', 'Pro', 'FEMALE', true, true, true, true, 'ACTIVE', 'LOCAL', NOW());

-- Seed Roles
INSERT INTO user_roles (user_id, role) SELECT id, 'ROLE_USER' FROM users WHERE email IN ('match.male@test.com', 'match.female@test.com', 'match.student@test.com', 'match.pro@test.com');

-- Seed Roommate Posts
-- 1. Male, Dhaka, 5000, Non-Smoker, Student (The Seeker)
INSERT INTO roommate_posts (user_id, location, budget, bio, gender_preference, smoking, pets, occupation, status, created_at, updated_at)
SELECT id, 'Dhaka', 5000, 'Looking for roommate', 'ANY', false, false, 'STUDENT', 'APPROVED', NOW(), NOW()
FROM users WHERE email = 'match.male@test.com';

-- 2. Female, Dhaka, 15000, Smoker (Low Match for Male due to budget/smoking)
INSERT INTO roommate_posts (user_id, location, budget, bio, gender_preference, smoking, pets, occupation, status, created_at, updated_at)
SELECT id, 'Dhaka', 15000, 'Looking for luxury', 'FEMALE', true, true, 'PROFESSIONAL', 'APPROVED', NOW(), NOW()
FROM users WHERE email = 'match.female@test.com';

-- 3. Male, Dhanmondi (Subset of Dhaka), 5200, Non-Smoker (High Match for Male)
INSERT INTO roommate_posts (user_id, location, budget, bio, gender_preference, smoking, pets, occupation, status, created_at, updated_at)
SELECT id, 'Dhanmondi, Dhaka', 5200, 'Student friendly', 'MALE', false, false, 'STUDENT', 'APPROVED', NOW(), NOW()
FROM users WHERE email = 'match.student@test.com';

-- 4. Female, Uttara, 4500, Non-Smoker (Medium match - fits budget/smoking, but location differentish)
INSERT INTO roommate_posts (user_id, location, budget, bio, gender_preference, smoking, pets, occupation, status, created_at, updated_at)
SELECT id, 'Uttara', 4500, 'Quiet place', 'ANY', false, false, 'PROFESSIONAL', 'APPROVED', NOW(), NOW()
FROM users WHERE email = 'match.pro@test.com';
