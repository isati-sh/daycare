-- Add email_verified column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Update existing users to have email_verified = true (since they're already in the system)
UPDATE profiles SET email_verified = true WHERE email_verified IS NULL;

-- Set email_verified to NOT NULL with default false for new records
ALTER TABLE profiles ALTER COLUMN email_verified SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN email_verified SET DEFAULT false;

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_active_status ON profiles(active_status);

-- Add comment to the column
COMMENT ON COLUMN profiles.email_verified IS 'Whether the user has verified their email address';
