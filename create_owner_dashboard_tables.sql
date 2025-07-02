-- Owner Dashboard Database Tables
-- Execute this manually in the PostgreSQL database to create the required tables

-- Owner Financial Summary Table (for aggregated financial data)
CREATE TABLE IF NOT EXISTS owner_financial_summary (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR NOT NULL,
    owner_id VARCHAR NOT NULL,
    property_id INTEGER REFERENCES properties(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    rental_income DECIMAL(12, 2) DEFAULT 0,
    addon_revenue DECIMAL(12, 2) DEFAULT 0,
    management_fees DECIMAL(12, 2) DEFAULT 0,
    utility_deductions DECIMAL(12, 2) DEFAULT 0,
    service_deductions DECIMAL(12, 2) DEFAULT 0,
    net_balance DECIMAL(12, 2) DEFAULT 0,
    breakdown JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Owner Timeline Activity Table (for activity tracking)
CREATE TABLE IF NOT EXISTS owner_timeline_activity (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR NOT NULL,
    owner_id VARCHAR NOT NULL,
    property_id INTEGER REFERENCES properties(id),
    activity_type VARCHAR(50) NOT NULL, -- check_in, check_out, task_completed, guest_feedback, addon_booking, bill_uploaded
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_name VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Owner Payout Requests Table (for payout management)
CREATE TABLE IF NOT EXISTS owner_payout_requests (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR NOT NULL,
    owner_id VARCHAR NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AUD',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, completed, rejected
    request_notes TEXT,
    admin_notes TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    completed_at TIMESTAMP,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    processed_by VARCHAR
);

-- Owner Settings/Preferences Table (for notification preferences)
CREATE TABLE IF NOT EXISTS owner_settings (
    id SERIAL PRIMARY KEY,
    organization_id VARCHAR NOT NULL,
    owner_id VARCHAR NOT NULL UNIQUE,
    task_approval_required BOOLEAN DEFAULT FALSE,
    maintenance_alerts BOOLEAN DEFAULT TRUE,
    guest_addon_notifications BOOLEAN DEFAULT TRUE,
    financial_notifications BOOLEAN DEFAULT TRUE,
    weekly_reports BOOLEAN DEFAULT TRUE,
    preferred_currency VARCHAR(3) DEFAULT 'AUD',
    notification_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_owner_financial_summary_owner_period 
ON owner_financial_summary(organization_id, owner_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_owner_timeline_activity_owner_date 
ON owner_timeline_activity(organization_id, owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_owner_payout_requests_owner_status 
ON owner_payout_requests(organization_id, owner_id, status);

CREATE INDEX IF NOT EXISTS idx_owner_settings_owner 
ON owner_settings(organization_id, owner_id);

-- Insert some sample data for testing
INSERT INTO owner_timeline_activity (organization_id, owner_id, property_id, activity_type, title, description, property_name) VALUES
('demo-org', 'owner1', 1, 'check_in', 'Guest Check-in', 'John Smith checked in for 3 nights', 'Beachfront Villa'),
('demo-org', 'owner1', 1, 'task_completed', 'Cleaning Completed', 'Property cleaned and inspected', 'Beachfront Villa'),
('demo-org', 'owner1', 2, 'guest_feedback', 'Positive Review', 'Guest left 5-star review mentioning excellent cleanliness', 'City Apartment'),
('demo-org', 'owner1', 1, 'addon_booking', 'Massage Service Booked', 'Guest booked in-room massage for $150', 'Beachfront Villa'),
('demo-org', 'owner1', 2, 'bill_uploaded', 'Utility Bill Uploaded', 'Electricity bill for March uploaded ($89.50)', 'City Apartment');

INSERT INTO owner_payout_requests (organization_id, owner_id, amount, period_start, period_end, status, request_notes) VALUES
('demo-org', 'owner1', 2500.00, '2024-12-01', '2024-12-31', 'completed', 'December earnings payout'),
('demo-org', 'owner1', 3200.00, '2025-01-01', '2025-01-31', 'pending', 'January earnings - includes addon revenue'),
('demo-org', 'owner1', 1800.00, '2024-11-01', '2024-11-30', 'approved', 'November earnings payout');

INSERT INTO owner_settings (organization_id, owner_id, task_approval_required, preferred_currency, notification_email) VALUES
('demo-org', 'owner1', TRUE, 'AUD', 'owner@example.com')
ON CONFLICT (owner_id) DO UPDATE SET
    task_approval_required = EXCLUDED.task_approval_required,
    preferred_currency = EXCLUDED.preferred_currency,
    notification_email = EXCLUDED.notification_email,
    updated_at = CURRENT_TIMESTAMP;