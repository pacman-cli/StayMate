-- Add property_id to bookings table
ALTER TABLE bookings
ADD COLUMN property_id BIGINT;

ALTER TABLE bookings
ADD CONSTRAINT fk_booking_property
FOREIGN KEY (property_id) REFERENCES properties(id);

-- Add property_id to applications table
ALTER TABLE applications
ADD COLUMN property_id BIGINT;

ALTER TABLE applications
ADD CONSTRAINT fk_application_property
FOREIGN KEY (property_id) REFERENCES properties(id);
