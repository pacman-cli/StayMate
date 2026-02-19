-- Update status values
UPDATE roommate_posts SET status = 'OPEN' WHERE status = 'APPROVED';

-- Add accepted_request_id column
ALTER TABLE roommate_posts
ADD COLUMN accepted_request_id BIGINT;

ALTER TABLE roommate_posts
ADD CONSTRAINT fk_accepted_request
FOREIGN KEY (accepted_request_id)
REFERENCES roommate_requests(id);

-- Ensure index for performance (optional but good practice)
CREATE INDEX idx_roommate_posts_status ON roommate_posts(status);
