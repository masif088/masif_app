-- Website Tracking & Analytics Database Setup for Supabase
-- Run this script in your Supabase SQL editor
-- Similar to Hotjar for heatmap and behavior analytics

-- Create tracking_sessions table
CREATE TABLE IF NOT EXISTS tracking_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID REFERENCES customer_websites(id) ON DELETE CASCADE NOT NULL,
    session_id VARCHAR(255) NOT NULL UNIQUE, -- Unique session ID from client
    visitor_id VARCHAR(255), -- Visitor identifier (can be same visitor across sessions)
    user_agent TEXT,
    referrer TEXT,
    ip_address VARCHAR(45),
    screen_width INTEGER,
    screen_height INTEGER,
    viewport_width INTEGER,
    viewport_height INTEGER,
    device_type VARCHAR(50), -- desktop, mobile, tablet
    browser VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- Duration in seconds
    page_views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    scrolls INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tracking_events table
CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_session_id UUID REFERENCES tracking_sessions(id) ON DELETE CASCADE NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('click', 'scroll', 'move', 'view', 'resize', 'keypress', 'form_submit')),
    page_url TEXT NOT NULL,
    x INTEGER, -- X coordinate
    y INTEGER, -- Y coordinate
    element_tag VARCHAR(50), -- tag name (button, a, div, etc)
    element_id VARCHAR(255),
    element_class TEXT,
    element_text TEXT, -- Text content of element
    element_selector TEXT, -- CSS selector
    scroll_position INTEGER,
    viewport_width INTEGER,
    viewport_height INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_data JSONB, -- Additional event data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create heatmap_data table
CREATE TABLE IF NOT EXISTS heatmap_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    website_id UUID REFERENCES customer_websites(id) ON DELETE CASCADE NOT NULL,
    page_url TEXT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    value INTEGER DEFAULT 1, -- Number of interactions at this point
    heatmap_type VARCHAR(20) NOT NULL CHECK (heatmap_type IN ('click', 'move', 'scroll')),
    viewport_width INTEGER,
    viewport_height INTEGER,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(website_id, page_url, x, y, heatmap_type, viewport_width, viewport_height, date)
);

-- Create page_views table for page analytics
CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_session_id UUID REFERENCES tracking_sessions(id) ON DELETE CASCADE NOT NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    load_time INTEGER, -- Page load time in milliseconds
    time_on_page INTEGER, -- Time spent on page in seconds
    scroll_depth INTEGER, -- Maximum scroll depth (0-100)
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_website_id ON tracking_sessions(website_id);
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_session_id ON tracking_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_started_at ON tracking_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_events_session_id ON tracking_events(tracking_session_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_type ON tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tracking_events_page_url ON tracking_events(page_url);
CREATE INDEX IF NOT EXISTS idx_tracking_events_timestamp ON tracking_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_website_id ON heatmap_data(website_id);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_page_url ON heatmap_data(page_url);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_type ON heatmap_data(heatmap_type);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_date ON heatmap_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(tracking_session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url);
CREATE INDEX IF NOT EXISTS idx_page_views_started_at ON page_views(started_at DESC);

-- Add comments
COMMENT ON TABLE tracking_sessions IS 'Stores user tracking sessions';
COMMENT ON TABLE tracking_events IS 'Stores individual tracking events (clicks, scrolls, etc)';
COMMENT ON TABLE heatmap_data IS 'Aggregated heatmap data for visualization';
COMMENT ON TABLE page_views IS 'Stores page view analytics';

-- Enable Row Level Security (RLS)
ALTER TABLE tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE heatmap_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tracking_sessions
CREATE POLICY "Users can view all tracking sessions" ON tracking_sessions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert tracking sessions" ON tracking_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update tracking sessions" ON tracking_sessions
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete tracking sessions" ON tracking_sessions
    FOR DELETE USING (true);

-- RLS Policies for tracking_events
CREATE POLICY "Users can view all tracking events" ON tracking_events
    FOR SELECT USING (true);

CREATE POLICY "Users can insert tracking events" ON tracking_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update tracking events" ON tracking_events
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete tracking events" ON tracking_events
    FOR DELETE USING (true);

-- RLS Policies for heatmap_data
CREATE POLICY "Users can view all heatmap data" ON heatmap_data
    FOR SELECT USING (true);

CREATE POLICY "Users can insert heatmap data" ON heatmap_data
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update heatmap data" ON heatmap_data
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete heatmap data" ON heatmap_data
    FOR DELETE USING (true);

-- RLS Policies for page_views
CREATE POLICY "Users can view all page views" ON page_views
    FOR SELECT USING (true);

CREATE POLICY "Users can insert page views" ON page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update page views" ON page_views
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete page views" ON page_views
    FOR DELETE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tracking_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_heatmap_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER trigger_update_tracking_sessions_updated_at
    BEFORE UPDATE ON tracking_sessions
    FOR EACH ROW EXECUTE FUNCTION update_tracking_sessions_updated_at();

CREATE TRIGGER trigger_update_heatmap_data_updated_at
    BEFORE UPDATE ON heatmap_data
    FOR EACH ROW EXECUTE FUNCTION update_heatmap_data_updated_at();

-- Function to aggregate events into heatmap data
CREATE OR REPLACE FUNCTION aggregate_heatmap_data()
RETURNS void AS $$
BEGIN
    -- Aggregate click events
    INSERT INTO heatmap_data (website_id, page_url, x, y, value, heatmap_type, viewport_width, viewport_height, date)
    SELECT 
        ts.website_id,
        te.page_url,
        te.x,
        te.y,
        COUNT(*) as value,
        'click' as heatmap_type,
        te.viewport_width,
        te.viewport_height,
        DATE(te.timestamp) as date
    FROM tracking_events te
    JOIN tracking_sessions ts ON te.tracking_session_id = ts.id
    WHERE te.event_type = 'click' 
        AND te.x IS NOT NULL 
        AND te.y IS NOT NULL
        AND te.timestamp >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY ts.website_id, te.page_url, te.x, te.y, te.viewport_width, te.viewport_height, DATE(te.timestamp)
    ON CONFLICT (website_id, page_url, x, y, heatmap_type, viewport_width, viewport_height, date) 
    DO UPDATE SET value = heatmap_data.value + EXCLUDED.value, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON tracking_sessions TO authenticated;
GRANT ALL ON tracking_events TO authenticated;
GRANT ALL ON heatmap_data TO authenticated;
GRANT ALL ON page_views TO authenticated;

