# Indexing Strategy

Performance indexes for query optimization.

---

## Key Indexes

```sql
-- Auth lookups
CREATE INDEX idx_users_email ON users(email);

-- Property searches
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);

-- Booking queries
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
```

---

## Migration References

| Index | Migration |
|-------|-----------|
| Auth indexes | V112 |
| Dashboard indexes | V111 |
| Performance indexes | V33 |
