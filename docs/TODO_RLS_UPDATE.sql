-- Update RLS Policies to Allow User Assignment
-- Run this script in your Supabase SQL editor to allow users to assign todos to other users

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert their own todos" ON todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON todos;

-- Create new policies that allow users to create todos for any user
-- (Users can create todos and assign them to any user)
CREATE POLICY "Users can insert todos for any user" ON todos
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create new policy that allows users to update todos they own
-- This allows changing user_id as long as you own the todo
-- USING checks the current row, WITH CHECK validates the new row
CREATE POLICY "Users can update todos they own" ON todos
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Alternative: If you want to allow users to update todos assigned to them (not just owned)
-- Uncomment the following policy and comment out the one above:
-- CREATE POLICY "Users can update todos assigned to them" ON todos
--     FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = user_id)
--     WITH CHECK (true);

-- Create function to create todo with user assignment (bypasses RLS)
CREATE OR REPLACE FUNCTION create_todo_with_user(
    p_user_id UUID,
    p_title VARCHAR(255),
    p_description TEXT DEFAULT NULL,
    p_completed BOOLEAN DEFAULT false,
    p_due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_priority VARCHAR(10) DEFAULT 'medium',
    p_tags TEXT[] DEFAULT NULL,
    p_parent_id UUID DEFAULT NULL,
    p_order_index INTEGER DEFAULT 0,
    p_color VARCHAR(7) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_todo_id UUID;
BEGIN
    -- Check if current user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    -- Insert todo with specified user_id
    INSERT INTO todos (
        user_id,
        title,
        description,
        completed,
        due_date,
        priority,
        tags,
        parent_id,
        order_index,
        color
    ) VALUES (
        p_user_id,
        p_title,
        p_description,
        p_completed,
        p_due_date,
        p_priority,
        p_tags,
        p_parent_id,
        p_order_index,
        p_color
    ) RETURNING id INTO v_todo_id;
    
    RETURN v_todo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update todo with user assignment (bypasses RLS)
CREATE OR REPLACE FUNCTION update_todo_with_user(
    p_todo_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_title VARCHAR(255) DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_completed BOOLEAN DEFAULT NULL,
    p_due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_priority VARCHAR(10) DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_parent_id UUID DEFAULT NULL,
    p_order_index INTEGER DEFAULT NULL,
    p_color VARCHAR(7) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_current_user_id UUID;
    v_todo_owner_id UUID;
BEGIN
    -- Check if current user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;
    
    v_current_user_id := auth.uid();
    
    -- Get current todo owner
    SELECT user_id INTO v_todo_owner_id
    FROM todos
    WHERE id = p_todo_id;
    
    -- Check if todo exists
    IF v_todo_owner_id IS NULL THEN
        RAISE EXCEPTION 'Todo not found';
    END IF;
    
    -- Check if current user owns the todo
    IF v_todo_owner_id != v_current_user_id THEN
        RAISE EXCEPTION 'You do not have permission to update this todo';
    END IF;
    
    -- Update todo
    UPDATE todos
    SET
        user_id = COALESCE(p_user_id, user_id),
        title = COALESCE(p_title, title),
        description = COALESCE(p_description, description),
        completed = COALESCE(p_completed, completed),
        due_date = COALESCE(p_due_date, due_date),
        priority = COALESCE(p_priority, priority),
        tags = COALESCE(p_tags, tags),
        parent_id = COALESCE(p_parent_id, parent_id),
        order_index = COALESCE(p_order_index, order_index),
        color = COALESCE(p_color, color),
        updated_at = NOW()
    WHERE id = p_todo_id;
    
    RETURN p_todo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_todo_with_user(UUID, VARCHAR, TEXT, BOOLEAN, TIMESTAMP WITH TIME ZONE, VARCHAR, TEXT[], UUID, INTEGER, VARCHAR(7)) TO authenticated;
GRANT EXECUTE ON FUNCTION update_todo_with_user(UUID, UUID, VARCHAR, TEXT, BOOLEAN, TIMESTAMP WITH TIME ZONE, VARCHAR, TEXT[], UUID, INTEGER, VARCHAR(7)) TO authenticated;

