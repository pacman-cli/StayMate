CREATE TABLE system_settings (
    setting_key VARCHAR(255) PRIMARY KEY,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at DATETIME
);
