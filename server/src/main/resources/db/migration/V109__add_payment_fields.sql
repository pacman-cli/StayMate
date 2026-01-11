-- Add payment fields to bookings table
ALTER TABLE bookings
ADD COLUMN payment_method VARCHAR(50) DEFAULT 'CREDIT_CARD',
ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT 0.00;

-- Backfill existing confirmed/completed bookings with random payment methods
UPDATE bookings
SET payment_method = CASE
    WHEN RAND() < 0.33 THEN 'bKash'
    WHEN RAND() < 0.66 THEN 'Nagad'
    ELSE 'CREDIT_CARD'
END
WHERE status IN ('CONFIRMED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT');

-- Backfill some refunds for CANCELLED or REJECTED bookings to simulate data
UPDATE bookings
SET refund_amount = (SELECT p.price_amount * 0.5 FROM properties p WHERE p.id = bookings.property_id)
WHERE status IN ('CANCELLED', 'REJECTED')
AND RAND() < 0.3; -- 30% of cancelled bookings have partial refunds
