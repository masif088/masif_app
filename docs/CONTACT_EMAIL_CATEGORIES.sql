-- Contact Email Categories Table
CREATE TABLE IF NOT EXISTS contact_email_categories (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT 'primary',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_email_categories_user_id ON contact_email_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_email_categories_name ON contact_email_categories(name);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_email_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_email_categories
CREATE POLICY "Users can view their own categories" ON contact_email_categories
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own categories" ON contact_email_categories
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own categories" ON contact_email_categories
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own categories" ON contact_email_categories
    FOR DELETE USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_email_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_contact_email_categories_updated_at 
    BEFORE UPDATE ON contact_email_categories 
    FOR EACH ROW EXECUTE FUNCTION update_contact_email_categories_updated_at();

-- Insert default categories (these will be created for each user when they first access the system)
-- Note: In the application, we'll create these programmatically for each user
