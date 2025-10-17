-- Create table for smart tag interest submissions
CREATE TABLE IF NOT EXISTS smart_tag_interest (
  id           bigserial PRIMARY KEY,
  email        text NOT NULL,
  name         text NULL,
  likelihood   int  NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  features     text[] NULL,
  comments     text NULL,
  created_at   timestamptz DEFAULT now()
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_smart_tag_interest_email ON smart_tag_interest(email);
CREATE INDEX IF NOT EXISTS idx_smart_tag_interest_created_at ON smart_tag_interest(created_at DESC);