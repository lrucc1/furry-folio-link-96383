-- Profiles: add plan-related columns if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'free' CHECK (plan_tier IN ('free','premium'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_source text DEFAULT 'stripe' CHECK (plan_source IN ('manual','stripe','system'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS manual_override boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_updated_at timestamptz DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_notes text;

-- Lightweight audit log for plan changes
CREATE TABLE IF NOT EXISTS plan_audit (
  id bigserial PRIMARY KEY,
  actor_id uuid NOT NULL,
  target_id uuid NOT NULL,
  action text NOT NULL,
  new_tier text NOT NULL CHECK (new_tier IN ('free','premium')),
  note text,
  created_at timestamptz DEFAULT now()
);

-- Index for faster queries by target user
CREATE INDEX IF NOT EXISTS plan_audit_target_idx ON plan_audit(target_id);

-- Enable RLS on plan_audit
ALTER TABLE plan_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all audit entries" ON plan_audit;
DROP POLICY IF EXISTS "System can insert audit entries" ON plan_audit;

-- Policy: Admins can view all audit entries
CREATE POLICY "Admins can view all audit entries"
ON plan_audit FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only system can insert audit entries (edge functions use service role)
CREATE POLICY "System can insert audit entries"
ON plan_audit FOR INSERT
WITH CHECK (true);