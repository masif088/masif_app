-- Company Database Setup for Supabase
-- Run this script in your Supabase SQL editor

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo VARCHAR(500),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    industry VARCHAR(100),
    founded_date DATE,
    leader_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add company_id to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL;

-- Add company_id to activities table if not exists
ALTER TABLE activities ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_leader_id ON companies(leader_id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON activities(company_id);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies table
CREATE POLICY "Users can view companies they belong to or lead" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        ) OR leader_id = auth.uid()
    );

CREATE POLICY "Company leaders can insert companies" ON companies
    FOR INSERT WITH CHECK (leader_id = auth.uid());

CREATE POLICY "Company leaders can update their companies" ON companies
    FOR UPDATE USING (leader_id = auth.uid());

CREATE POLICY "Company leaders can delete their companies" ON companies
    FOR DELETE USING (leader_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW EXECUTE FUNCTION update_companies_updated_at();

-- Function to automatically set company creator as leader
CREATE OR REPLACE FUNCTION set_company_creator_as_leader()
RETURNS TRIGGER AS $$
BEGIN
    NEW.leader_id = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to set company creator as leader
CREATE TRIGGER set_company_creator_as_leader 
    BEFORE INSERT ON companies 
    FOR EACH ROW EXECUTE FUNCTION set_company_creator_as_leader();

-- Create a view to see companies with leader info
CREATE OR REPLACE VIEW companies_with_leaders AS
SELECT 
    c.*,
    u.first_name as leader_first_name,
    u.last_name as leader_last_name,
    u.email as leader_email,
    u.avatar as leader_avatar
FROM companies c
LEFT JOIN users u ON c.leader_id = u.id;

-- Insert sample companies (optional)
INSERT INTO companies (name, description, website, industry, is_active) 
VALUES 
    ('Tech Solutions Inc', 'Leading technology solutions provider', 'https://techsolutions.com', 'Technology', true),
    ('Creative Agency', 'Digital marketing and creative services', 'https://creativeagency.com', 'Marketing', true),
    ('Consulting Group', 'Business consulting and strategy', 'https://consultinggroup.com', 'Consulting', true)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON companies TO authenticated;
GRANT USAGE ON SEQUENCE companies_id_seq TO authenticated;
GRANT SELECT ON companies_with_leaders TO authenticated; 