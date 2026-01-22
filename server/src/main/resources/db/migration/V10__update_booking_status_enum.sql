-- Flyway manages the database context, do not use USE statements

-- Update Booking Status Enum to include REJECTED (matching Java BookingStatus enum)
ALTER TABLE bookings MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED') NOT NULL;
