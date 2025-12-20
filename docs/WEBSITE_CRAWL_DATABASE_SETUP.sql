-- Website Crawl Database Setup for Supabase
-- Run this script in your Supabase SQL editor

-- Create crawl_sessions table
CREATE TABLE IF NOT EXISTS crawl_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID REFERENCES customer_websites(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_pages INTEGER DEFAULT 0,
    crawled_pages INTEGER DEFAULT 0,
    failed_pages INTEGER DEFAULT 0,
    error_message TEXT,
    max_depth INTEGER DEFAULT 3,
    max_pages INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crawl_pages table
CREATE TABLE IF NOT EXISTS crawl_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    crawl_session_id UUID REFERENCES crawl_sessions(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    depth INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'crawling', 'completed', 'failed')) NOT NULL,
    http_status_code INTEGER,
    content_type VARCHAR(100),
    content_length INTEGER,
    html_content TEXT,
    text_content TEXT,
    meta_tags JSONB,
    links JSONB, -- Array of links found on this page
    images JSONB, -- Array of images found on this page
    error_message TEXT,
    crawled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(crawl_session_id, url)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crawl_sessions_website_id ON crawl_sessions(website_id);
CREATE INDEX IF NOT EXISTS idx_crawl_sessions_status ON crawl_sessions(status);
CREATE INDEX IF NOT EXISTS idx_crawl_sessions_created_at ON crawl_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_session_id ON crawl_pages(crawl_session_id);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_url ON crawl_pages(url);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_status ON crawl_pages(status);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_depth ON crawl_pages(depth);

-- Add comments
COMMENT ON TABLE crawl_sessions IS 'Stores crawl sessions for website crawling';
COMMENT ON TABLE crawl_pages IS 'Stores individual pages crawled during a session';

-- Enable Row Level Security (RLS)
ALTER TABLE crawl_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crawl_sessions
CREATE POLICY "Users can view all crawl sessions" ON crawl_sessions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert crawl sessions" ON crawl_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update crawl sessions" ON crawl_sessions
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete crawl sessions" ON crawl_sessions
    FOR DELETE USING (true);

-- RLS Policies for crawl_pages
CREATE POLICY "Users can view all crawl pages" ON crawl_pages
    FOR SELECT USING (true);

CREATE POLICY "Users can insert crawl pages" ON crawl_pages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update crawl pages" ON crawl_pages
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete crawl pages" ON crawl_pages
    FOR DELETE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_crawl_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_crawl_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER trigger_update_crawl_sessions_updated_at
    BEFORE UPDATE ON crawl_sessions
    FOR EACH ROW EXECUTE FUNCTION update_crawl_sessions_updated_at();

CREATE TRIGGER trigger_update_crawl_pages_updated_at
    BEFORE UPDATE ON crawl_pages
    FOR EACH ROW EXECUTE FUNCTION update_crawl_pages_updated_at();

-- Grant necessary permissions
GRANT ALL ON crawl_sessions TO authenticated;
GRANT ALL ON crawl_pages TO authenticated;

