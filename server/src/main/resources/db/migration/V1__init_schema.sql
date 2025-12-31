-- Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone_number VARCHAR(255),
    profile_picture_url VARCHAR(255),
    bio VARCHAR(500),
    address VARCHAR(255),
    city VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    role_selected BOOLEAN DEFAULT FALSE,
    auth_provider ENUM('LOCAL','GOOGLE','GITHUB') NOT NULL,
    provider_id VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    last_login_at DATETIME,
    enabled BOOLEAN DEFAULT TRUE NOT NULL
);

-- User Roles Table (ElementCollection)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role ENUM('ROLE_USER','ROLE_ADMIN','ROLE_HOUSE_OWNER') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Bookings Table
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    landlord_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('PENDING','CONFIRMED','CANCELLED','COMPLETED') NOT NULL,
    notes TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (tenant_id) REFERENCES users(id),
    FOREIGN KEY (landlord_id) REFERENCES users(id)
);

-- Conversations Table
CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    participant_one_id BIGINT NOT NULL,
    participant_two_id BIGINT NOT NULL,
    subject VARCHAR(255),
    property_id BIGINT,
    property_title VARCHAR(255),
    last_message_at DATETIME,
    last_message_preview VARCHAR(255),
    participant_one_unread_count INT DEFAULT 0,
    participant_two_unread_count INT DEFAULT 0,
    participant_one_deleted BOOLEAN DEFAULT FALSE,
    participant_two_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (participant_one_id) REFERENCES users(id),
    FOREIGN KEY (participant_two_id) REFERENCES users(id)
);

-- Messages Table
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    recipient_id BIGINT NOT NULL,
    content VARCHAR(5000) NOT NULL,
    message_type ENUM('TEXT','IMAGE','SYSTEM') NOT NULL DEFAULT 'TEXT',
    attachment_url VARCHAR(255),
    attachment_name VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);

-- Applications Table
CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    status ENUM('PENDING','ACCEPTED','REJECTED','CANCELLED') NOT NULL,
    message TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Notifications Table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('NEW_MESSAGE','BOOKING_REQUEST','BOOKING_CONFIRMED','BOOKING_CANCELLED','BOOKING_REMINDER',
              'PROPERTY_INQUIRY','PROPERTY_APPROVED','PROPERTY_REJECTED','PROPERTY_VIEWED','LISTING_SAVED','PRICE_DROP',
              'REVIEW_RECEIVED','REVIEW_REPLY',
              'PROFILE_VIEWED','VERIFICATION_APPROVED','VERIFICATION_REQUIRED',
              'ROOMMATE_MATCH','ROOMMATE_REQUEST',
              'SYSTEM_ANNOUNCEMENT','WELCOME','ACCOUNT_UPDATE','SECURITY_ALERT',
              'PAYMENT_RECEIVED','PAYMENT_FAILED','PAYOUT_SENT',
              'APPLICATION_RECEIVED','APPLICATION_ACCEPTED','APPLICATION_REJECTED','MATCH_FOUND') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    action_url VARCHAR(255),
    icon VARCHAR(255),
    icon_color VARCHAR(255),
    sender_id BIGINT,
    sender_name VARCHAR(255),
    sender_avatar VARCHAR(255),
    property_id BIGINT,
    property_title VARCHAR(255),
    conversation_id BIGINT,
    booking_id BIGINT,
    review_id BIGINT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notification_user_id ON notifications(user_id);
CREATE INDEX idx_notification_read ON notifications(is_read);
CREATE INDEX idx_notification_created_at ON notifications(created_at);

-- Matches Table
CREATE TABLE matches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user1_id BIGINT NOT NULL,
    user2_id BIGINT NOT NULL,
    match_percentage DOUBLE,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id)
);
