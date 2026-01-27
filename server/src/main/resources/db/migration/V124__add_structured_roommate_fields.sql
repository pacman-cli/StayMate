ALTER TABLE roommate_posts
ADD COLUMN budget_min DECIMAL(10,2) DEFAULT 0,
ADD COLUMN budget_max DECIMAL(10,2) DEFAULT 0,
ADD COLUMN alcohol BOOLEAN DEFAULT FALSE,
ADD COLUMN stay_duration VARCHAR(50),
ADD COLUMN guests_allowed VARCHAR(50),
ADD COLUMN cooking_habits VARCHAR(50);

-- Initialize min/max budget from existing budget for backward compatibility
UPDATE roommate_posts SET budget_min = budget, budget_max = budget WHERE budget IS NOT NULL;
