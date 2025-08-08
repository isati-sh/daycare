-- Add urgency and duration fields to announcements table
ALTER TABLE announcements 
ADD COLUMN urgency VARCHAR(10) CHECK (urgency IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
ADD COLUMN duration_days INTEGER DEFAULT 7,
ADD COLUMN expires_at TIMESTAMP,
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Update existing records to have proper expiration dates
UPDATE announcements 
SET expires_at = created_at + INTERVAL '7 days'
WHERE expires_at IS NULL;
