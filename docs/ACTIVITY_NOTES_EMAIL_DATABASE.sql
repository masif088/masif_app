-- Activity Notes Table
CREATE TABLE IF NOT EXISTS activity_notes (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Emails Table (for tracking sent emails)
CREATE TABLE IF NOT EXISTS activity_emails (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_emails TEXT[] NOT NULL,
    cc_emails TEXT[] DEFAULT '{}',
    bcc_emails TEXT[] DEFAULT '{}',
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'sent' -- sent, failed, pending
);

-- Add color column to activity_statuses if it doesn't exist
ALTER TABLE activity_statuses 
ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT 'primary';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_notes_activity_id ON activity_notes(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_notes_user_id ON activity_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_notes_created_at ON activity_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_emails_activity_id ON activity_emails(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_emails_user_id ON activity_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_emails_sent_at ON activity_emails(sent_at);

-- Enable Row Level Security (RLS)
ALTER TABLE activity_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_notes
CREATE POLICY "Users can view notes for activities they are assigned to" ON activity_notes
    FOR SELECT USING (
        activity_id IN (
            SELECT id FROM activities 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert notes for activities they are assigned to" ON activity_notes
    FOR INSERT WITH CHECK (
        activity_id IN (
            SELECT id FROM activities 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own notes" ON activity_notes
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notes" ON activity_notes
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for activity_emails
CREATE POLICY "Users can view emails for activities they are assigned to" ON activity_emails
    FOR SELECT USING (
        activity_id IN (
            SELECT id FROM activities 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert emails for activities they are assigned to" ON activity_emails
    FOR INSERT WITH CHECK (
        activity_id IN (
            SELECT id FROM activities 
            WHERE user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_activity_notes_updated_at 
    BEFORE UPDATE ON activity_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample activity statuses with colors if they don't exist
INSERT INTO activity_statuses (title, sub_title, description, level, is_active, color) 
VALUES 
    ('Open', 'Open Tasks', 'Tasks that are open and ready to be worked on', 1, true, 'primary'),
    ('In Progress', 'In Progress Tasks', 'Tasks currently being worked on', 2, true, 'warning'),
    ('Testing', 'Testing Tasks', 'Tasks under testing phase', 3, true, 'info'),
    ('Done', 'Completed Tasks', 'Tasks that have been completed', 4, true, 'success'),
    ('On Hold', 'On Hold Tasks', 'Tasks that are temporarily paused', 5, true, 'secondary')
ON CONFLICT (title) DO NOTHING;

-- Sample data for testing (optional)
-- INSERT INTO activity_notes (activity_id, user_id, content, is_internal) 
-- VALUES 
--     (1, 'your-user-id-here', 'This is a sample public note', false),
--     (1, 'your-user-id-here', 'This is a sample internal note', true);

-- Grant necessary permissions
GRANT ALL ON activity_notes TO authenticated;
GRANT ALL ON activity_emails TO authenticated;
GRANT USAGE ON SEQUENCE activity_notes_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE activity_emails_id_seq TO authenticated; 