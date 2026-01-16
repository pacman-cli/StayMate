-- V110__fix_roommate_status.sql
-- Fix roommate posts that were seeded without status (defaulted to PENDING)
-- Make them APPROVED so they are visible in public search and matching

UPDATE roommate_posts
SET status = 'APPROVED'
WHERE status IS NULL OR status = 'PENDING';
