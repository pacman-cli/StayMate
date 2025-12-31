-- Safely add column using Dynamic SQL (Compatible with all MySQL versions)
SET @dbname = DATABASE();
SET @tablename = "properties";
SET @columnname = "property_type";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE properties ADD COLUMN property_type VARCHAR(50)"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing records
UPDATE properties SET property_type = 'APARTMENT' WHERE property_type IS NULL;

-- Enforce NOT NULL constraint
ALTER TABLE properties MODIFY property_type VARCHAR(50) NOT NULL;


