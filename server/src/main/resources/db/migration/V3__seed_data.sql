USE authdb;
-- Seed Users (Password is 'password' for all: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG)
-- Admin User
INSERT INTO users (email, password_hash, first_name, last_name, bio, auth_provider, email_verified, role_selected,
                   enabled, created_at, updated_at)
SELECT 'puspopuspo520@gmail.com',
       '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
       'Super',
       'Admin',
       'System Administrator',
       'LOCAL',
       true,
       true,
       true,
       NOW(),
       NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'puspopuspo520@gmail.com');

-- Landlord User
INSERT INTO users (email, password_hash, first_name, last_name, bio, auth_provider, email_verified, role_selected,
                   enabled, created_at, updated_at)
SELECT 'landlord@staymate.com',
       '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
       'John',
       'Landlord',
       'Experienced property manager.',
       'LOCAL',
       true,
       true,
       true,
       NOW(),
       NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'landlord@staymate.com');

-- Tenant User
INSERT INTO users (email, password_hash, first_name, last_name, bio, auth_provider, email_verified, role_selected,
                   enabled, created_at, updated_at)
SELECT 'tenant@staymate.com',
       '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
       'Jane',
       'Tenant',
       'Looking for a nice place to stay.',
       'LOCAL',
       true,
       true,
       true,
       NOW(),
       NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tenant@staymate.com');

-- Seed Roles
-- Get IDs
SET @admin_id = (SELECT id
                 FROM users
                 WHERE email = 'puspopuspo520@gmail.com');
SET @landlord_id = (SELECT id
                    FROM users
                    WHERE email = 'landlord@staymate.com');
SET @tenant_id = (SELECT id
                  FROM users
                  WHERE email = 'tenant@staymate.com');

-- Assign Roles (Delete existing first to avoid dupes if re-running partially, though usually migration runs once)
DELETE
FROM user_roles
WHERE user_id IN (@admin_id, @landlord_id, @tenant_id);

INSERT INTO user_roles (user_id, role)
VALUES (@admin_id, 'ROLE_ADMIN');
INSERT INTO user_roles (user_id, role)
VALUES (@admin_id, 'ROLE_USER');
INSERT INTO user_roles (user_id, role)
VALUES (@admin_id, 'ROLE_HOUSE_OWNER');

INSERT INTO user_roles (user_id, role)
VALUES (@landlord_id, 'ROLE_HOUSE_OWNER');

INSERT INTO user_roles (user_id, role)
VALUES (@tenant_id, 'ROLE_USER');

-- Seed Properties (Owned by Landlord)
INSERT INTO properties (owner_id, title, description, location, price, price_amount, beds, baths, sqft, rating,
                        verified, views, inquiries, status, created_at, updated_at)
SELECT @landlord_id,
       'Modern Downtown Loft',
       'Stunning loft in the heart of the city with high ceilings and large windows.',
       'Downtown, Cityville',
       '$2,500/mo',
       2500.00,
       1,
       1,
       850,
       4.8,
       true,
       120,
       5,
       'Active',
       NOW(),
       NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = 'Modern Downtown Loft');

INSERT INTO properties (owner_id, title, description, location, price, price_amount, beds, baths, sqft, rating,
                        verified, views, inquiries, status, created_at, updated_at)
SELECT @landlord_id,
       'Cozy Suburban Home',
       'Perfect family home with a large garden and quiet neighborhood.',
       'Maplewood, Suburbia',
       '$3,200/mo',
       3200.00,
       3,
       2,
       1800,
       4.5,
       true,
       85,
       3,
       'Active',
       NOW(),
       NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = 'Cozy Suburban Home');

INSERT INTO properties (owner_id, title, description, location, price, price_amount, beds, baths, sqft, rating,
                        verified, views, inquiries, status, created_at, updated_at)
SELECT @landlord_id,
       'Luxury Beachfront Villa',
       'Exclusive villa with private beach access and pool.',
       'Seaside, Coastline',
       '$8,500/mo',
       8500.00,
       5,
       4,
       4500,
       5.0,
       true,
       200,
       15,
       'Active',
       NOW(),
       NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = 'Luxury Beachfront Villa');

INSERT INTO properties (owner_id, title, description, location, price, price_amount, beds, baths, sqft, rating,
                        verified, views, inquiries, status, created_at, updated_at)
SELECT @landlord_id,
       'Affordable Studio',
       'Compact and efficient studio apartment near university.',
       'University District',
       '$900/mo',
       900.00,
       1,
       1,
       400,
       4.2,
       false,
       50,
       10,
       'Active',
       NOW(),
       NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = 'Affordable Studio');

INSERT INTO properties (owner_id, title, description, location, price, price_amount, beds, baths, sqft, rating,
                        verified, views, inquiries, status, created_at, updated_at)
SELECT @landlord_id,
       'Renovated Historic Condo',
       'Beautifully restored condo in a historic building.',
       'Old Town',
       '$1,800/mo',
       1800.00,
       2,
       1,
       1000,
       4.7,
       true,
       95,
       8,
       'Rented',
       NOW(),
       NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE title = 'Renovated Historic Condo');
