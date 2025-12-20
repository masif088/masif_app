-- Customer Websites Database Setup for Supabase
-- Run this script in your Supabase SQL editor

-- Create customer_websites table
CREATE TABLE IF NOT EXISTS customer_websites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    url VARCHAR(500) NOT NULL,
    name VARCHAR(255),
    description TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_websites_customer_id ON customer_websites(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_websites_is_primary ON customer_websites(is_primary);
CREATE INDEX IF NOT EXISTS idx_customer_websites_created_at ON customer_websites(created_at DESC);

-- Add comment to table
COMMENT ON TABLE customer_websites IS 'Stores multiple websites for each customer';

-- Enable Row Level Security (RLS)
ALTER TABLE customer_websites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_websites table
CREATE POLICY "Users can view all customer websites" ON customer_websites
    FOR SELECT USING (true);

CREATE POLICY "Users can insert customer websites" ON customer_websites
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update customer websites" ON customer_websites
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete customer websites" ON customer_websites
    FOR DELETE USING (true);

-- Function to update updated_at timestamp for customer_websites
CREATE OR REPLACE FUNCTION update_customer_websites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_customer_websites_updated_at
    BEFORE UPDATE ON customer_websites
    FOR EACH ROW EXECUTE FUNCTION update_customer_websites_updated_at();

-- Grant necessary permissions
GRANT ALL ON customer_websites TO authenticated;

