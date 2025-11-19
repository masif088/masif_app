-- Customer Content Templates Database Setup
-- Run this script in your Supabase SQL editor

-- Create customer_content_templates table
CREATE TABLE IF NOT EXISTS customer_content_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_content_templates_name ON customer_content_templates(name);
CREATE INDEX IF NOT EXISTS idx_customer_content_templates_created_at ON customer_content_templates(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE customer_content_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_content_templates table
CREATE POLICY "Users can view all customer content templates" ON customer_content_templates
    FOR SELECT USING (true);

CREATE POLICY "Users can insert customer content templates" ON customer_content_templates
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update customer content templates" ON customer_content_templates
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete customer content templates" ON customer_content_templates
    FOR DELETE USING (true);

-- Function to update updated_at timestamp for customer_content_templates
CREATE OR REPLACE FUNCTION update_customer_content_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_customer_content_templates_updated_at
    BEFORE UPDATE ON customer_content_templates
    FOR EACH ROW EXECUTE FUNCTION update_customer_content_templates_updated_at();

-- Grant necessary permissions
GRANT ALL ON customer_content_templates TO authenticated;

-- Insert sample content template (optional)
INSERT INTO customer_content_templates (name, content, description) VALUES
    ('Default Contact Template', 'Create temaplte content dengan nama {[name]}, hubungi {[phone]} atau email kami {[email]}', 'Template default untuk kontak customer')
ON CONFLICT DO NOTHING;

