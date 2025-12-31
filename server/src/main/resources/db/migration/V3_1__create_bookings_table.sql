CREATE TABLE IF NOT EXISTS bookings
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id   BIGINT NOT NULL,
    landlord_id BIGINT NOT NULL,
    start_date  DATE   NOT NULL,
    end_date    DATE   NOT NULL,
    status      enum ('pending','confirmed','rejected','cancelled','completed'),
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
