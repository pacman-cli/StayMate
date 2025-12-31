-- Properties Table
CREATE TABLE properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    price VARCHAR(255) NOT NULL,
    price_amount DECIMAL(19, 2),
    beds INT NOT NULL DEFAULT 0,
    baths INT NOT NULL DEFAULT 0,
    sqft INT NOT NULL DEFAULT 0,
    rating DOUBLE NOT NULL DEFAULT 0.0,
    verified BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    inquiries INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE INDEX idx_property_owner_id ON properties(owner_id);
CREATE INDEX idx_property_status ON properties(status);
CREATE INDEX idx_property_location ON properties(location);
CREATE INDEX idx_property_price_amount ON properties(price_amount);
