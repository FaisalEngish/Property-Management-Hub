-- Commission Log table for detailed tracking
CREATE TABLE IF NOT EXISTS commission_log (
  id SERIAL PRIMARY KEY,
  organization_id VARCHAR NOT NULL,
  agent_id VARCHAR NOT NULL,
  agent_type VARCHAR NOT NULL CHECK (agent_type IN ('retail-agent', 'referral-agent')),
  property_id INTEGER,
  booking_id INTEGER,
  reference_number VARCHAR,
  base_amount VARCHAR NOT NULL,
  commission_rate VARCHAR NOT NULL,
  commission_amount VARCHAR NOT NULL,
  currency VARCHAR NOT NULL DEFAULT 'THB',
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  is_adjustment BOOLEAN DEFAULT FALSE,
  original_commission_id INTEGER,
  adjustment_reason TEXT,
  processed_by VARCHAR,
  processed_at TIMESTAMP,
  admin_notes TEXT,
  commission_month INTEGER,
  commission_year INTEGER,
  payout_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Commission Invoices table
CREATE TABLE IF NOT EXISTS commission_invoices (
  id SERIAL PRIMARY KEY,
  organization_id VARCHAR NOT NULL,
  agent_id VARCHAR NOT NULL,
  agent_type VARCHAR NOT NULL CHECK (agent_type IN ('retail-agent', 'referral-agent')),
  invoice_number VARCHAR UNIQUE NOT NULL,
  invoice_date VARCHAR NOT NULL,
  period_start VARCHAR NOT NULL,
  period_end VARCHAR NOT NULL,
  total_commissions VARCHAR NOT NULL,
  currency VARCHAR NOT NULL DEFAULT 'THB',
  description TEXT,
  agent_notes TEXT,
  status VARCHAR NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'paid')),
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by VARCHAR,
  rejected_reason TEXT,
  admin_notes TEXT,
  generated_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Commission Invoice Items table
CREATE TABLE IF NOT EXISTS commission_invoice_items (
  id SERIAL PRIMARY KEY,
  organization_id VARCHAR NOT NULL,
  invoice_id INTEGER NOT NULL REFERENCES commission_invoices(id) ON DELETE CASCADE,
  commission_log_id INTEGER,
  description TEXT NOT NULL,
  property_name VARCHAR,
  reference_number VARCHAR,
  commission_date VARCHAR NOT NULL,
  commission_amount VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_commission_log_agent ON commission_log(agent_id, agent_type);
CREATE INDEX IF NOT EXISTS idx_commission_log_org ON commission_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_commission_log_status ON commission_log(status);
CREATE INDEX IF NOT EXISTS idx_commission_log_created ON commission_log(created_at);

CREATE INDEX IF NOT EXISTS idx_commission_invoices_agent ON commission_invoices(agent_id, agent_type);
CREATE INDEX IF NOT EXISTS idx_commission_invoices_org ON commission_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_commission_invoices_status ON commission_invoices(status);

CREATE INDEX IF NOT EXISTS idx_commission_invoice_items_invoice ON commission_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_commission_invoice_items_org ON commission_invoice_items(organization_id);