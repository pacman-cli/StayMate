-- V25__add_geolocation_columns.sql

ALTER TABLE properties
ADD COLUMN latitude DOUBLE NULL,
ADD COLUMN longitude DOUBLE NULL;

ALTER TABLE roommate_posts
ADD COLUMN latitude DOUBLE NULL,
ADD COLUMN longitude DOUBLE NULL;
