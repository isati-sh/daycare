-- Update bathroom visits to include detailed tracking
-- Migration: 004_enhance_bathroom_tracking.sql

-- First, we need to update the existing bathroom_visits column
-- Since we're changing the data type, we'll need to handle existing data carefully

-- Add a temporary column for the new structure
ALTER TABLE daily_logs ADD COLUMN bathroom_visits_new JSONB DEFAULT '[]'::jsonb;

-- Migrate existing data (convert number to empty array structure)
UPDATE daily_logs 
SET bathroom_visits_new = '[]'::jsonb 
WHERE bathroom_visits_new IS NULL;

-- Drop the old column and rename the new one
ALTER TABLE daily_logs DROP COLUMN bathroom_visits;
ALTER TABLE daily_logs RENAME COLUMN bathroom_visits_new TO bathroom_visits;

-- Add comment for documentation
COMMENT ON COLUMN daily_logs.bathroom_visits IS 'Array of bathroom visit details with time, type (pee/poop), colors, and notes';

-- Update children table to ensure age_group is properly set (if not already done)
-- No changes needed as age_group already exists in the schema

-- Update profiles table to allow null site_role (for unassigned users)
-- This should already be handled by the TypeScript interface updates

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_logs_bathroom_visits ON daily_logs USING GIN (bathroom_visits);
CREATE INDEX IF NOT EXISTS idx_profiles_site_role ON profiles(site_role);
CREATE INDEX IF NOT EXISTS idx_profiles_active_status ON profiles(active_status);
CREATE INDEX IF NOT EXISTS idx_children_age_group ON children(age_group);
