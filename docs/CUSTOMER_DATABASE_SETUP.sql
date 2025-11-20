-- Customer Database Setup for Supabase
-- Run this script in your Supabase SQL editor

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    register_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

);


-- Create customer_data_templates table
CREATE TABLE IF NOT EXISTS customer_data_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    key VARCHAR(100) NOT NULL UNIQUE,
    "group" VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_details table
-- Note: Added 'value' column to store the actual data value
CREATE TABLE IF NOT EXISTS customer_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    customer_data_template_id UUID REFERENCES customer_data_templates(id) ON DELETE CASCADE NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Prevent duplicate entries for same customer and template
    UNIQUE(customer_id, customer_data_template_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_register_at ON customers(register_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_data_templates_key ON customer_data_templates(key);
CREATE INDEX IF NOT EXISTS idx_customer_data_templates_title ON customer_data_templates(title);
CREATE INDEX IF NOT EXISTS idx_customer_data_templates_group ON customer_data_templates("group");

CREATE INDEX IF NOT EXISTS idx_customer_details_customer_id ON customer_details(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_details_template_id ON customer_details(customer_data_template_id);
CREATE INDEX IF NOT EXISTS idx_customer_details_created_at ON customer_details(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_data_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers table
-- Adjust these policies based on your access requirements
CREATE POLICY "Users can view all customers" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Users can insert customers" ON customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update customers" ON customers
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete customers" ON customers
    FOR DELETE USING (true);

-- RLS Policies for customer_data_templates table
CREATE POLICY "Users can view all customer data templates" ON customer_data_templates
    FOR SELECT USING (true);

CREATE POLICY "Users can insert customer data templates" ON customer_data_templates
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update customer data templates" ON customer_data_templates
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete customer data templates" ON customer_data_templates
    FOR DELETE USING (true);

-- RLS Policies for customer_details table
CREATE POLICY "Users can view all customer details" ON customer_details
    FOR SELECT USING (true);

CREATE POLICY "Users can insert customer details" ON customer_details
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update customer details" ON customer_details
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete customer details" ON customer_details
    FOR DELETE USING (true);

-- Function to update updated_at timestamp for customers
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp for customer_data_templates
CREATE OR REPLACE FUNCTION update_customer_data_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp for customer_details
CREATE OR REPLACE FUNCTION update_customer_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER trigger_update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_customers_updated_at();

CREATE TRIGGER trigger_update_customer_data_templates_updated_at
    BEFORE UPDATE ON customer_data_templates
    FOR EACH ROW EXECUTE FUNCTION update_customer_data_templates_updated_at();

CREATE TRIGGER trigger_update_customer_details_updated_at
    BEFORE UPDATE ON customer_details
    FOR EACH ROW EXECUTE FUNCTION update_customer_details_updated_at();

-- Create a view to see customers with their details
CREATE OR REPLACE VIEW customers_with_details AS
SELECT 
    c.id as customer_id,
    c.name as customer_name,
    c.register_at,
    c.created_at as customer_created_at,
    c.updated_at as customer_updated_at,
    json_agg(
        json_build_object(
            'detail_id', cd.id,
            'template_id', cdt.id,
            'template_title', cdt.title,
            'template_key', cdt.key,
            'value', cd.value,
            'created_at', cd.created_at,
            'updated_at', cd.updated_at
        )
    ) FILTER (WHERE cd.id IS NOT NULL) as details
FROM customers c
LEFT JOIN customer_details cd ON c.id = cd.customer_id
LEFT JOIN customer_data_templates cdt ON cd.customer_data_template_id = cdt.id
GROUP BY c.id, c.name, c.register_at, c.created_at, c.updated_at;

-- Grant necessary permissions
GRANT ALL ON customers TO authenticated;
GRANT ALL ON customer_data_templates TO authenticated;
GRANT ALL ON customer_details TO authenticated;
GRANT SELECT ON customers_with_details TO authenticated;

-- Insert sample customer data templates (optional)
INSERT INTO customer_data_templates (title, key) VALUES
    ('Email', 'email'),
    ('Phone', 'phone'),
    ('Address', 'address'),
    ('Company', 'company'),
    ('Notes', 'notes')
ON CONFLICT (key) DO NOTHING;

-- Insert sample customers (optional - uncomment and adjust as needed)
-- INSERT INTO customers (name, register_at) VALUES
--     ('John Doe', NOW() - INTERVAL '30 days'),
--     ('Jane Smith', NOW() - INTERVAL '15 days'),
--     ('Bob Johnson', NOW() - INTERVAL '7 days')
-- ON CONFLICT DO NOTHING;

