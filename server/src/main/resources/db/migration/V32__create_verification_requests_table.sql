-- Create Verification Requests Table
CREATE TABLE IF NOT EXISTS verification_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    document_url VARCHAR(255) NOT NULL,
    document_type ENUM('GOVERNMENT_ID', 'PASSPORT', 'DRIVER_LICENSE', 'STUDENT_ID', 'PROPERTY_DEED', 'OTHER') NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster admin queue lookups
CREATE INDEX idx_verification_status ON verification_requests(status);
