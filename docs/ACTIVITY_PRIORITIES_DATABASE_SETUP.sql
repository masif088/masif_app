-- Activity Priorities Database Setup
-- This file contains the SQL commands to create the activity_priorities table

-- Create activity_priorities table
CREATE TABLE IF NOT EXISTS activity_priorities (
    title VARCHAR(255) PRIMARY KEY,
    sub_title VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(20) NOT NULL DEFAULT 'primary', -- Bootstrap color name
    level INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_priorities_level ON activity_priorities(level);
CREATE INDEX IF NOT EXISTS idx_activity_priorities_created_at ON activity_priorities(created_at);

-- Insert some default priority levels
INSERT INTO activity_priorities (title, sub_title, description, color, level) VALUES
('Low', 'Low Priority', 'Tasks that can be completed when time permits', 'success', 1),
('Medium', 'Medium Priority', 'Tasks that should be completed in a reasonable timeframe', 'warning', 2),
('High', 'High Priority', 'Tasks that need attention soon', 'info', 3),
('Critical', 'Critical Priority', 'Tasks that require immediate attention', 'danger', 4),
('Emergency', 'Emergency Priority', 'Urgent tasks that must be completed immediately', 'secondary', 5)
ON CONFLICT (title) DO NOTHING;

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_activity_priorities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_activity_priorities_updated_at
    BEFORE UPDATE ON activity_priorities
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_priorities_updated_at();

-- Add comments to the table and columns
COMMENT ON TABLE activity_priorities IS 'Stores activity priority levels with color coding and descriptions';
COMMENT ON COLUMN activity_priorities.title IS 'Unique identifier for the priority level (Primary Key)';
COMMENT ON COLUMN activity_priorities.sub_title IS 'Display subtitle for the priority level';
COMMENT ON COLUMN activity_priorities.description IS 'Optional detailed description of the priority level';
COMMENT ON COLUMN activity_priorities.color IS 'Bootstrap color name for visual representation (primary, secondary, success, info, warning, danger)';
COMMENT ON COLUMN activity_priorities.level IS 'Numeric level for ordering priorities (1=lowest, higher=more urgent)';
COMMENT ON COLUMN activity_priorities.created_at IS 'Timestamp when the priority was created';
COMMENT ON COLUMN activity_priorities.updated_at IS 'Timestamp when the priority was last updated';

-- Verify the table was created successfully
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'activity_priorities'
ORDER BY ordinal_position; 