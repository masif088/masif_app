-- Todo List Database Setup for Supabase
-- Run this script in your Supabase SQL editor

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')) NOT NULL,
    tags TEXT[], -- Array of tags
    parent_id UUID REFERENCES todos(id) ON DELETE CASCADE, -- For nested subtasks
    order_index INTEGER DEFAULT 0 NOT NULL, -- For drag and drop ordering
    color VARCHAR(7), -- Hex color code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    todo_id UUID REFERENCES todos(id) ON DELETE CASCADE NOT NULL,
    text VARCHAR(500) NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    note TEXT, -- Optional note for checklist item
    order_index INTEGER DEFAULT 0 NOT NULL, -- For ordering checklist items
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_parent_id ON todos(parent_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_order_index ON todos(order_index);
CREATE INDEX IF NOT EXISTS idx_checklist_items_todo_id ON checklist_items(todo_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_completed ON checklist_items(completed);
CREATE INDEX IF NOT EXISTS idx_checklist_items_order_index ON checklist_items(order_index);

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for todos table
CREATE POLICY "Users can view their own todos" ON todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for checklist_items table
CREATE POLICY "Users can view checklist items from their todos" ON checklist_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM todos 
            WHERE todos.id = checklist_items.todo_id 
            AND todos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert checklist items to their todos" ON checklist_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM todos 
            WHERE todos.id = checklist_items.todo_id 
            AND todos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update checklist items from their todos" ON checklist_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM todos 
            WHERE todos.id = checklist_items.todo_id 
            AND todos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete checklist items from their todos" ON checklist_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM todos 
            WHERE todos.id = checklist_items.todo_id 
            AND todos.user_id = auth.uid()
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for todos updated_at
CREATE TRIGGER trigger_update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for checklist_items updated_at
CREATE TRIGGER trigger_update_checklist_items_updated_at
    BEFORE UPDATE ON checklist_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get all nested subtasks recursively
CREATE OR REPLACE FUNCTION get_todo_with_subtasks(todo_uuid UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title VARCHAR,
    description TEXT,
    completed BOOLEAN,
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR,
    tags TEXT[],
    parent_id UUID,
    order_index INTEGER,
    color VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE todo_tree AS (
        -- Base case: start with the root todo
        SELECT 
            t.id,
            t.user_id,
            t.title,
            t.description,
            t.completed,
            t.due_date,
            t.priority,
            t.tags,
            t.parent_id,
            t.order_index,
            t.color,
            t.created_at,
            t.updated_at,
            0 AS level
        FROM todos t
        WHERE t.id = todo_uuid
        
        UNION ALL
        
        -- Recursive case: get all children
        SELECT 
            t.id,
            t.user_id,
            t.title,
            t.description,
            t.completed,
            t.due_date,
            t.priority,
            t.tags,
            t.parent_id,
            t.order_index,
            t.color,
            t.created_at,
            t.updated_at,
            tt.level + 1 AS level
        FROM todos t
        INNER JOIN todo_tree tt ON t.parent_id = tt.id
    )
    SELECT * FROM todo_tree ORDER BY level, order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to delete todo and all nested subtasks
CREATE OR REPLACE FUNCTION delete_todo_cascade(todo_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete checklist items first (handled by CASCADE, but explicit for clarity)
    DELETE FROM checklist_items WHERE todo_id IN (
        SELECT id FROM get_todo_with_subtasks(todo_uuid)
    );
    
    -- Delete all nested subtasks recursively
    WITH RECURSIVE todo_tree AS (
        SELECT id FROM todos WHERE id = todo_uuid
        UNION ALL
        SELECT t.id FROM todos t
        INNER JOIN todo_tree tt ON t.parent_id = tt.id
    )
    DELETE FROM todos WHERE id IN (SELECT id FROM todo_tree);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.todos TO anon, authenticated;
GRANT ALL ON public.checklist_items TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_todo_with_subtasks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_todo_cascade(UUID) TO authenticated;

-- Optional: Create view for todos with checklist count
CREATE OR REPLACE VIEW todos_with_checklist_count AS
SELECT 
    t.*,
    COUNT(ci.id) FILTER (WHERE ci.completed = false) AS incomplete_checklist_count,
    COUNT(ci.id) FILTER (WHERE ci.completed = true) AS complete_checklist_count,
    COUNT(ci.id) AS total_checklist_count
FROM todos t
LEFT JOIN checklist_items ci ON t.id = ci.todo_id
GROUP BY t.id;

-- Grant access to the view
GRANT SELECT ON todos_with_checklist_count TO authenticated;

-- Optional: Create view for todos with subtask count
CREATE OR REPLACE VIEW todos_with_subtask_count AS
SELECT 
    t.*,
    COUNT(st.id) FILTER (WHERE st.completed = false) AS incomplete_subtask_count,
    COUNT(st.id) FILTER (WHERE st.completed = true) AS complete_subtask_count,
    COUNT(st.id) AS total_subtask_count
FROM todos t
LEFT JOIN todos st ON st.parent_id = t.id
GROUP BY t.id;

-- Grant access to the view
GRANT SELECT ON todos_with_subtask_count TO authenticated;

-- Sample data (optional - uncomment and modify user_id as needed)
-- INSERT INTO todos (user_id, title, description, priority, due_date, tags) VALUES
--     ('your-user-id-here', 'Complete project documentation', 'Write comprehensive documentation for the project', 'high', NOW() + INTERVAL '7 days', ARRAY['work', 'documentation']),
--     ('your-user-id-here', 'Review code changes', 'Review and test all recent code changes', 'medium', NOW() + INTERVAL '3 days', ARRAY['work', 'review']);

-- INSERT INTO checklist_items (todo_id, text, completed, order_index) VALUES
--     ((SELECT id FROM todos WHERE title = 'Complete project documentation' LIMIT 1), 'Write introduction section', false, 0),
--     ((SELECT id FROM todos WHERE title = 'Complete project documentation' LIMIT 1), 'Document API endpoints', false, 1),
--     ((SELECT id FROM todos WHERE title = 'Complete project documentation' LIMIT 1), 'Add code examples', false, 2);

