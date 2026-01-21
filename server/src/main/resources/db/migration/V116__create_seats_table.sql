CREATE TABLE seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    label VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    last_vacated_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_seats_property FOREIGN KEY (property_id) REFERENCES properties(id)
);
