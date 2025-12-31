-- 1. Restore Admin Role (Prioritized)
UPDATE user_roles
SET role = 'ROLE_ADMIN'
WHERE user_id = (SELECT id FROM users WHERE email = 'puspopuspo520@gmail.com');

-- 2. Restore House Owner Role
-- Only for users who own properties AND are not the admin
UPDATE user_roles
SET role = 'ROLE_HOUSE_OWNER'
WHERE user_id IN (SELECT DISTINCT owner_id FROM properties)
  AND user_id != (SELECT id FROM users WHERE email = 'puspopuspo520@gmail.com');

-- 3. Cleanup Duplicates (Optional but recommended if users had multiple roles originally)
-- If a user has multiple rows that are now all 'ROLE_USER' or mixed, we might want to consolidate.
-- However, without a unique ID column in user_roles, standard deduplication is hard.
-- We assume the updates above effectively 'fix' the primary role.
