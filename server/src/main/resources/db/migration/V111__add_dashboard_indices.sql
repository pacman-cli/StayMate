-- Add indices for Dashboard Performance
CREATE INDEX idx_bookings_landlord_status ON bookings(landlord_id, status);
CREATE INDEX idx_properties_owner_status ON properties(owner_id, status);
