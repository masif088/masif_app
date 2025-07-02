-- Contact/Bookmark Email Table
CREATE TABLE IF NOT EXISTS contact_emails (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_emails_user_id ON contact_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_emails_email ON contact_emails(email);
CREATE INDEX IF NOT EXISTS idx_contact_emails_category ON contact_emails(category);
CREATE INDEX IF NOT EXISTS idx_contact_emails_favorite ON contact_emails(is_favorite);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_emails
CREATE POLICY "Users can view their own contacts" ON contact_emails
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own contacts" ON contact_emails
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own contacts" ON contact_emails
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own contacts" ON contact_emails
    FOR DELETE USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_emails_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_contact_emails_updated_at 
    BEFORE UPDATE ON contact_emails 
    FOR EACH ROW EXECUTE FUNCTION update_contact_emails_updated_at();

-- Insert sample categories
INSERT INTO contact_emails (user_id, name, email, category, notes, is_favorite) 
VALUES 
    ('your-user-id-here', 'John Doe', 'john@example.com', 'Work', 'Project manager', true),
    ('your-user-id-here', 'Jane Smith', 'jane@example.com', 'Personal', 'Friend', false),
    ('your-user-id-here', 'Bob Wilson', 'bob@company.com', 'Work', 'Developer', true)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON contact_emails TO authenticated;
GRANT USAGE ON SEQUENCE contact_emails_id_seq TO authenticated; 