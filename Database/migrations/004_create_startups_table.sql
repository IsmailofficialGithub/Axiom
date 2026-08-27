-- 004_create_startups_table.sql

CREATE TABLE startups (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  industry TEXT,
  stage TEXT,
  current_arr NUMERIC,
  last_year_revenue NUMERIC,
  revenue_model TEXT,
  funding_sought NUMERIC,
  primary_use_of_funds TEXT,
  previous_funding NUMERIC,
  custom_qa JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on startups as a safety net
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
