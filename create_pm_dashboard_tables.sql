-- Create Portfolio Manager Dashboard Tables
-- Run this SQL to create the necessary tables for the PM Dashboard functionality

-- PM Commission Balance Table
CREATE TABLE IF NOT EXISTS pm_commission_balance (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR NOT NULL,
    manager_id VARCHAR NOT NULL,
    total_earned DECIMAL(10,2) DEFAULT 0,
    total_paid DECIMAL(10,2) DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    last_payout_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, manager_id)
);

-- PM Payout Requests Table
CREATE TABLE IF NOT EXISTS pm_payout_requests (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR NOT NULL,
    manager_id VARCHAR NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AUD',
    request_notes TEXT,
    admin_notes TEXT,
    status VARCHAR DEFAULT 'pending', -- pending, approved, paid, rejected
    receipt_url VARCHAR,
    requested_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    approved_by VARCHAR,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PM Task Logs Table
CREATE TABLE IF NOT EXISTS pm_task_logs (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR NOT NULL,
    manager_id VARCHAR NOT NULL,
    property_id INTEGER,
    task_title VARCHAR NOT NULL,
    department VARCHAR,
    staff_assigned VARCHAR,
    status VARCHAR NOT NULL,
    result TEXT,
    notes TEXT,
    evidence_photos TEXT[], -- Array of photo URLs
    receipts TEXT[], -- Array of receipt URLs
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PM Property Performance Table
CREATE TABLE IF NOT EXISTS pm_property_performance (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR NOT NULL,
    manager_id VARCHAR NOT NULL,
    property_id INTEGER NOT NULL,
    period VARCHAR NOT NULL, -- Format: YYYY-MM
    revenue DECIMAL(10,2) DEFAULT 0,
    expenses DECIMAL(10,2) DEFAULT 0,
    net_income DECIMAL(10,2) DEFAULT 0,
    commission_earned DECIMAL(10,2) DEFAULT 0,
    occupancy_rate DECIMAL(5,2) DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, manager_id, property_id, period)
);

-- PM Notifications Table
CREATE TABLE IF NOT EXISTS pm_notifications (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR NOT NULL,
    manager_id VARCHAR NOT NULL,
    type VARCHAR NOT NULL, -- task_assigned, booking_update, payout_approved, maintenance_alert, etc.
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR DEFAULT 'info', -- info, warning, urgent
    action_required BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    related_type VARCHAR, -- task, booking, payout, property
    related_id VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Portfolio Assignments Table (linking PMs to properties)
CREATE TABLE IF NOT EXISTS portfolio_assignments (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR NOT NULL,
    manager_id VARCHAR NOT NULL,
    property_id INTEGER NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 50.00, -- Percentage
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    unassigned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pm_commission_balance_org_manager ON pm_commission_balance(organization_id, manager_id);
CREATE INDEX IF NOT EXISTS idx_pm_payout_requests_org_manager ON pm_payout_requests(organization_id, manager_id);
CREATE INDEX IF NOT EXISTS idx_pm_task_logs_org_manager ON pm_task_logs(organization_id, manager_id);
CREATE INDEX IF NOT EXISTS idx_pm_property_performance_org_manager ON pm_property_performance(organization_id, manager_id);
CREATE INDEX IF NOT EXISTS idx_pm_notifications_org_manager ON pm_notifications(organization_id, manager_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_assignments_org_manager ON portfolio_assignments(organization_id, manager_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_assignments_property ON portfolio_assignments(property_id, is_active);

-- Insert sample data for PM user (pm/pm123)
INSERT INTO portfolio_assignments (organization_id, manager_id, property_id, commission_rate)
SELECT 'default-org', 'pm', id, 10.0
FROM properties
WHERE organization_id = 'default-org'
ON CONFLICT DO NOTHING;

-- Initialize PM commission balance
INSERT INTO pm_commission_balance (organization_id, manager_id, total_earned, total_paid, current_balance)
VALUES ('default-org', 'pm', 2500.00, 1500.00, 1000.00)
ON CONFLICT (organization_id, manager_id) DO UPDATE SET
    total_earned = EXCLUDED.total_earned,
    total_paid = EXCLUDED.total_paid,
    current_balance = EXCLUDED.current_balance;

-- Insert sample task logs
INSERT INTO pm_task_logs (organization_id, manager_id, property_id, task_title, department, staff_assigned, status, result, completed_at)
SELECT 
    'default-org',
    'pm',
    p.id,
    'Property inspection completed',
    'inspection',
    'staff',
    'completed',
    'Property in excellent condition, minor issues addressed',
    NOW() - INTERVAL '2 days'
FROM properties p
WHERE p.organization_id = 'default-org'
LIMIT 3;

-- Insert sample notifications
INSERT INTO pm_notifications (organization_id, manager_id, type, title, message, severity, action_required)
VALUES 
    ('default-org', 'pm', 'task_completed', 'Maintenance Task Completed', 'Pool cleaning has been completed at Ocean View Villa', 'info', false),
    ('default-org', 'pm', 'booking_update', 'New Booking Received', 'New 5-night booking for Mountain Lodge starting Dec 20th', 'info', false),
    ('default-org', 'pm', 'maintenance_alert', 'Urgent Maintenance Required', 'HVAC system failure reported at Downtown Apartment', 'urgent', true),
    ('default-org', 'pm', 'payout_approved', 'Commission Payout Approved', 'Your commission payout of $500 has been approved', 'info', false);

-- Insert sample payout requests
INSERT INTO pm_payout_requests (organization_id, manager_id, amount, currency, request_notes, status, requested_at)
VALUES 
    ('default-org', 'pm', 500.00, 'AUD', 'Monthly commission withdrawal', 'approved', NOW() - INTERVAL '3 days'),
    ('default-org', 'pm', 750.00, 'AUD', 'Quarterly performance bonus', 'pending', NOW() - INTERVAL '1 day');