-- ==========================================
-- FRIMA Database Schema
-- ==========================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'investor', 'startup');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending');
CREATE TYPE kyc_status_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE opportunity_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE document_visibility AS ENUM ('public', 'granted_only', 'admin_only');
CREATE TYPE handoff_status AS ENUM ('initiated', 'completed', 'failed');

-- 2. TABLES

-- Profiles (1:1 with auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY, -- References auth.users.id
  role user_role NOT NULL,
  full_name TEXT,
  phone TEXT,
  status user_status DEFAULT 'pending',
  mfa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subsidiaries
CREATE TABLE subsidiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies (Startup profiles)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subsidiary_id UUID REFERENCES subsidiaries(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  website TEXT,
  stage TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investors
CREATE TABLE investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  investment_min NUMERIC,
  investment_max NUMERIC,
  preferred_industries TEXT[],
  kyc_status kyc_status_enum DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunities
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  subsidiary_id UUID REFERENCES subsidiaries(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  expected_revenue NUMERIC,
  currency TEXT DEFAULT 'USD',
  stage TEXT,
  status opportunity_status DEFAULT 'draft',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal Room Documents
CREATE TABLE deal_room_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  visibility document_visibility DEFAULT 'admin_only',
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal Room Permissions
CREATE TABLE deal_room_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (CRM)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsidiary_id UUID REFERENCES subsidiaries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_number TEXT,
  whatsapp_number TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Sales
CREATE TABLE customer_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  sold_at TIMESTAMPTZ DEFAULT NOW()
);

-- External Handoffs
CREATE TABLE external_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  redirect_url TEXT,
  status handoff_status DEFAULT 'initiated',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables as a safety net. 
-- Since the backend uses the service_role key, it will bypass RLS.
-- This just ensures that anon/authenticated keys cannot query tables directly via the frontend.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
