-- Fix Company RLS Policies
-- This script modifies the RLS policies to allow all authenticated users to view companies
-- Run this in your Supabase SQL editor

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view companies they belong to or lead" ON companies;

-- Create a new more permissive policy that allows all authenticated users to view companies
CREATE POLICY "All authenticated users can view companies" ON companies
    FOR SELECT USING (auth.role() = 'authenticated');

-- Also create a policy for admin users to manage companies
CREATE POLICY "Admins can manage companies" ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'Administrator'
        )
    );

-- Keep the existing policies for insert, update, and delete
-- These remain restrictive as they should be

-- Alternative: If you want to keep the original policy but add an admin override
-- You can create a separate policy for admin users
-- CREATE POLICY "Admins can view all companies" ON companies
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM users 
--             WHERE id = auth.uid() 
--             AND role = 'Administrator'
--         )
--     );
