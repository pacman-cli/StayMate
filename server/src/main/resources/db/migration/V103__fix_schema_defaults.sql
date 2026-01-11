-- Fix properties verified column default
-- Ensure all existing rows have a value
UPDATE properties SET verified = false WHERE verified IS NULL;

-- Apply default value constraint
ALTER TABLE properties MODIFY verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure users verified flags have defaults too if missing
ALTER TABLE users MODIFY email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users MODIFY phone_verified BOOLEAN DEFAULT FALSE;
