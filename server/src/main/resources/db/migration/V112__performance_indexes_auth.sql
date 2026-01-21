-- V112: Performance indexes for authentication and high-traffic queries
-- Target: Reduce login latency from 304ms to <100ms
-- Note: Using simple CREATE INDEX - if index already exists, migration will need repair

-- 1. User email index (CRITICAL for login performance)
-- Login queries: SELECT * FROM users WHERE email = ?
CREATE INDEX idx_v112_users_email ON users (email);

-- 2. User account status index (for active user filtering)
CREATE INDEX idx_v112_users_account_status ON users (account_status);

-- 3. Notification indexes (high-traffic query)
CREATE INDEX idx_v112_notifications_user_read ON notifications (user_id, is_read);

-- 4. Roommate posts indexes (Browse Roommates endpoint)
CREATE INDEX idx_v112_roommate_status ON roommate_posts (status);

-- 5. Maintenance requests indexes
CREATE INDEX idx_v112_maintenance_property ON maintenance_requests (property_id, status);
