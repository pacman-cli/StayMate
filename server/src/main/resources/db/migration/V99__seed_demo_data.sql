-- Seed Users
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, profile_picture_url, bio, address, city, email_verified, phone_verified, role_selected, enabled, account_status, auth_provider, created_at, updated_at)
VALUES
('tenant@demo.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1', 'John', 'Tenant', '01700000001', 'https://ui-avatars.com/api/?name=John+Tenant', 'Looking for a chill place.', '123 Street', 'Dhaka', true, true, true, true, 'ACTIVE', 'LOCAL', NOW(), NOW()),
('landlord@demo.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1', 'Jane', 'Landlord', '01700000002', 'https://ui-avatars.com/api/?name=Jane+Landlord', 'I own great properties.', '456 Avenue', 'Dhaka', true, true, true, true, 'ACTIVE', 'LOCAL', NOW(), NOW()),
('seeker@demo.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1', 'Alice', 'Seeker', '01700000003', 'https://ui-avatars.com/api/?name=Alice+Seeker', 'Student looking for roommates.', '789 Road', 'Dhanmondi', true, true, true, true, 'ACTIVE', 'LOCAL', NOW(), NOW());

-- Seed Roles
INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_USER' FROM users WHERE email = 'tenant@demo.com';

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_HOUSE_OWNER' FROM users WHERE email = 'landlord@demo.com';

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_USER' FROM users WHERE email = 'seeker@demo.com';

-- Seed Properties
INSERT INTO properties (owner_id, title, description, location, latitude, longitude, price, price_amount, beds, baths, sqft, property_type, image_url, status, emergency_available, verified, views, inquiries, created_at, updated_at)
SELECT id, 'Luxury Apartment in Gulshan', 'Spacious 3BR apartment with lake view, full security, and modern amenities.', 'Gulshan 2, Dhaka', 23.7925, 90.4078, '35,000/mo', 35000, 3, 3, 1800, 'APARTMENT', 'https://images.unsplash.com/photo-1545324418-cc1a3d27208e?auto=format&fit=crop&w=800', 'Active', true, true, 0, 0, NOW(), NOW()
FROM users WHERE email = 'landlord@demo.com';

INSERT INTO properties (owner_id, title, description, location, latitude, longitude, price, price_amount, beds, baths, sqft, property_type, image_url, status, emergency_available, verified, views, inquiries, created_at, updated_at)
SELECT id, 'Cozy Studio in Dhanmondi', 'Perfect for students or singles. Near restaurants and universities.', 'Dhanmondi 27, Dhaka', 23.7461, 90.3742, '15,000/mo', 15000, 1, 1, 500, 'STUDIO', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800', 'Active', false, true, 0, 0, NOW(), NOW()
FROM users WHERE email = 'landlord@demo.com';

INSERT INTO properties (owner_id, title, description, location, latitude, longitude, price, price_amount, beds, baths, sqft, property_type, image_url, status, emergency_available, verified, views, inquiries, created_at, updated_at)
SELECT id, 'Shared Room near DU', 'Affordable shared room for male students. Walking distance to curzon hall.', 'Shahbag, Dhaka', 23.7337, 90.3928, '5,000/mo', 5000, 1, 1, 200, 'ROOM', 'https://images.unsplash.com/photo-1555854743-e3c746dd09ef?auto=format&fit=crop&w=800', 'Active', false, false, 0, 0, NOW(), NOW()
FROM users WHERE email = 'landlord@demo.com';

INSERT INTO properties (owner_id, title, description, location, latitude, longitude, price, price_amount, beds, baths, sqft, property_type, image_url, status, emergency_available, verified, views, inquiries, created_at, updated_at)
SELECT id, 'Family House in Uttara', 'Independent house with garage and rooftop garden. Quiet neighborhood.', 'Uttara Sector 4, Dhaka', 23.8732, 90.3838, '45,000/mo', 45000, 4, 4, 2500, 'HOUSE', 'https://images.unsplash.com/photo-1600596542815-27b88e54e46f?auto=format&fit=crop&w=800', 'Active', true, true, 0, 0, NOW(), NOW()
FROM users WHERE email = 'landlord@demo.com';

INSERT INTO properties (owner_id, title, description, location, latitude, longitude, price, price_amount, beds, baths, sqft, property_type, image_url, status, emergency_available, verified, views, inquiries, created_at, updated_at)
SELECT id, 'Modern Flat in Banani', 'Recently renovated flat with open kitchen. Close to commercial area.', 'Banani, Dhaka', 23.7937, 90.4031, '28,000/mo', 28000, 2, 2, 1200, 'APARTMENT', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800', 'Active', true, true, 0, 0, NOW(), NOW()
FROM users WHERE email = 'landlord@demo.com';


-- Seed Roommate Posts
INSERT INTO roommate_posts (user_id, location, budget, move_in_date, bio, gender_preference, smoking, pets, occupation, status, latitude, longitude, created_at, updated_at)
SELECT id, 'Dhanmondi', 5000, '2024-02-01', 'Need a study friendly environment.', 'ANY', false, false, 'STUDENT', 'APPROVED', 23.7461, 90.3742, NOW(), NOW()
FROM users WHERE email = 'tenant@demo.com';

INSERT INTO roommate_posts (user_id, location, budget, move_in_date, bio, gender_preference, smoking, pets, occupation, status, latitude, longitude, created_at, updated_at)
SELECT id, 'Gulshan', 15000, '2024-02-15', 'Looking for a premium flat.', 'ANY', true, true, 'PROFESSIONAL', 'PENDING', 23.7925, 90.4078, NOW(), NOW()
FROM users WHERE email = 'seeker@demo.com';
