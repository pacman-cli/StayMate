-- Flyway manages the database context, do not use USE statements

-- Create Reviews Table
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    author_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    property_id BIGINT,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Create Reports Table
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    reported_user_id BIGINT NOT NULL,
    reason ENUM('SPAM','FRAUD','HARASSMENT','INAPPROPRIATE_CONTENT','FAKE_LISTING','OTHER') NOT NULL,
    description TEXT,
    severity ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
    status ENUM('PENDING','INVESTIGATING','RESOLVED','DISMISSED') NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id),
    FOREIGN KEY (reported_user_id) REFERENCES users(id)
);

-- Seed some initial data for visual verification (COMMENTED OUT)
-- Reviews
-- INSERT INTO reviews (author_id, receiver_id, rating, comment, created_at, updated_at)
-- SELECT
--     (SELECT id FROM users WHERE email='tenant@staymate.com' LIMIT 1),
--     (SELECT id FROM users WHERE email='landlord@staymate.com' LIMIT 1),
--     5,
--     'Great landlord, very responsive!',
--     NOW(),
--     NOW();

-- Reports
-- INSERT INTO reports (reporter_id, reported_user_id, reason, description, severity, status, created_at, updated_at)
-- SELECT
--     (SELECT id FROM users WHERE email='landlord@staymate.com' LIMIT 1),
--     (SELECT id FROM users WHERE email='tenant@staymate.com' LIMIT 1),
--     'SPAM',
--     'Sending duplicate messages.',
--     'LOW',
--     'RESOLVED',
--     NOW(),
--     NOW();

