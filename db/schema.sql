-- CloudSentinel: Registration Metadata Table
-- Stores metadata only. No secrets.

CREATE TABLE IF NOT EXISTS app_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id TEXT UNIQUE NOT NULL, -- owner/repo-name
  spiffe_id TEXT NOT NULL,
  vault_key_name TEXT NOT NULL,
  github_owner TEXT NOT NULL,
  detected_stack TEXT,
  default_branch TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | SUSPENDED | DELETED
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE app_registrations ENABLE ROW LEVEL SECURITY;

-- Create Policies (Simplified for Flow 1)
-- In a real scenario, we'd check against auth.uid()
CREATE POLICY "Users can see their own registrations" 
  ON app_registrations 
  FOR SELECT 
  USING (true); -- Placeholder: until real auth is wired.

CREATE POLICY "System can insert registrations" 
  ON app_registrations 
  FOR INSERT 
  WITH CHECK (true);
