ALTER TABLE roommate_posts
ADD COLUMN cleanliness VARCHAR(50),
ADD COLUMN sleep_schedule VARCHAR(50),
ADD COLUMN personality_tags JSON,
ADD COLUMN interests JSON;
