import { createClient } from './client';
import {
  TrackingSession,
  TrackingEvent,
  HeatmapData,
  PageView,
  CreateTrackingSessionData,
  UpdateTrackingSessionData,
  CreateTrackingEventData,
  CreatePageViewData,
  WebsiteAnalytics,
} from '../../Types/CustomerType';

export class TrackingService {
  private static supabase = createClient();

  // ========== Tracking Sessions ==========

  // Get or create tracking session
  static async getOrCreateSession(sessionData: CreateTrackingSessionData): Promise<TrackingSession | null> {
    try {
      // Try to find existing session
      const { data: existing } = await this.supabase
        .from('tracking_sessions')
        .select('*')
        .eq('session_id', sessionData.session_id)
        .maybeSingle();

      if (existing) {
        return existing;
      }

      // Create new session
      const { data, error } = await this.supabase
        .from('tracking_sessions')
        .insert([sessionData])
        .select(`
          *,
          website:customer_websites(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting or creating session:', error);
      throw error;
    }
  }

  // Get tracking session by ID
  static async getTrackingSessionById(id: string): Promise<TrackingSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('tracking_sessions')
        .select(`
          *,
          website:customer_websites(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tracking session:', error);
      throw error;
    }
  }

  // Get tracking session by session_id (client-side session ID)
  static async getTrackingSessionBySessionId(sessionId: string): Promise<TrackingSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('tracking_sessions')
        .select(`
          *,
          website:customer_websites(*)
        `)
        .eq('session_id', sessionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tracking session by session_id:', error);
      throw error;
    }
  }

  // Get all tracking sessions for a website
  static async getTrackingSessionsByWebsiteId(websiteId: string, limit: number = 100): Promise<TrackingSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('tracking_sessions')
        .select(`
          *,
          website:customer_websites(*)
        `)
        .eq('website_id', websiteId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tracking sessions:', error);
      throw error;
    }
  }

  // Update tracking session
  static async updateTrackingSession(id: string, updates: UpdateTrackingSessionData): Promise<TrackingSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('tracking_sessions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          website:customer_websites(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating tracking session:', error);
      throw error;
    }
  }

  // ========== Tracking Events ==========

  // Create tracking event
  static async createTrackingEvent(eventData: CreateTrackingEventData): Promise<TrackingEvent | null> {
    try {
      const { data, error } = await this.supabase
        .from('tracking_events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating tracking event:', error);
      throw error;
    }
  }

  // Batch create tracking events
  static async batchCreateTrackingEvents(events: CreateTrackingEventData[]): Promise<TrackingEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('tracking_events')
        .insert(events)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error batch creating tracking events:', error);
      throw error;
    }
  }

  // Get events for a session
  static async getEventsBySessionId(sessionId: string): Promise<TrackingEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('tracking_events')
        .select('*')
        .eq('tracking_session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tracking events:', error);
      throw error;
    }
  }

  // Get events for a website
  static async getEventsByWebsiteId(websiteId: string, limit: number = 1000): Promise<TrackingEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('tracking_events')
        .select(`
          *,
          tracking_session:tracking_sessions!inner(website_id)
        `)
        .eq('tracking_session.website_id', websiteId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tracking events:', error);
      throw error;
    }
  }

  // ========== Heatmap Data ==========

  // Get heatmap data for a page
  static async getHeatmapData(
    websiteId: string,
    pageUrl: string,
    heatmapType: 'click' | 'move' | 'scroll',
    viewportWidth?: number,
    viewportHeight?: number,
    date?: string
  ): Promise<HeatmapData[]> {
    try {
      let query = this.supabase
        .from('heatmap_data')
        .select('*')
        .eq('website_id', websiteId)
        .eq('page_url', pageUrl)
        .eq('heatmap_type', heatmapType);

      if (viewportWidth) {
        query = query.eq('viewport_width', viewportWidth);
      }
      if (viewportHeight) {
        query = query.eq('viewport_height', viewportHeight);
      }
      if (date) {
        query = query.eq('date', date);
      } else {
        // Default to last 30 days
        query = query.gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      }

      const { data, error } = await query.order('value', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      throw error;
    }
  }

  // Upsert heatmap data
  static async upsertHeatmapData(heatmapData: {
    website_id: string;
    page_url: string;
    x: number;
    y: number;
    value: number;
    heatmap_type: 'click' | 'move' | 'scroll';
    viewport_width?: number;
    viewport_height?: number;
    date?: string;
  }): Promise<HeatmapData | null> {
    try {
      const { data, error } = await this.supabase
        .from('heatmap_data')
        .upsert([{
          ...heatmapData,
          date: heatmapData.date || new Date().toISOString().split('T')[0],
        }], {
          onConflict: 'website_id,page_url,x,y,heatmap_type,viewport_width,viewport_height,date',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting heatmap data:', error);
      throw error;
    }
  }

  // ========== Page Views ==========

  // Create page view
  static async createPageView(pageViewData: CreatePageViewData): Promise<PageView | null> {
    try {
      const { data, error } = await this.supabase
        .from('page_views')
        .insert([pageViewData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating page view:', error);
      throw error;
    }
  }

  // Get page views for a website
  static async getPageViewsByWebsiteId(websiteId: string, limit: number = 100): Promise<PageView[]> {
    try {
      const { data, error } = await this.supabase
        .from('page_views')
        .select(`
          *,
          tracking_session:tracking_sessions!inner(website_id)
        `)
        .eq('tracking_session.website_id', websiteId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching page views:', error);
      throw error;
    }
  }

  // ========== Analytics ==========

  // Get website analytics
  static async getWebsiteAnalytics(websiteId: string, startDate?: string, endDate?: string): Promise<WebsiteAnalytics> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endDate || new Date().toISOString();

      // Get sessions
      const { data: sessions } = await this.supabase
        .from('tracking_sessions')
        .select('*')
        .eq('website_id', websiteId)
        .gte('started_at', start)
        .lte('started_at', end);

      // Get page views
      const { data: pageViews } = await this.supabase
        .from('page_views')
        .select(`
          *,
          tracking_session:tracking_sessions!inner(website_id)
        `)
        .eq('tracking_session.website_id', websiteId)
        .gte('started_at', start)
        .lte('started_at', end);

      // Get events
      const { data: events } = await this.supabase
        .from('tracking_events')
        .select(`
          *,
          tracking_session:tracking_sessions!inner(website_id)
        `)
        .eq('tracking_session.website_id', websiteId)
        .gte('timestamp', start)
        .lte('timestamp', end);

      const sessionsList = sessions || [];
      const pageViewsList = pageViews || [];
      const eventsList = events || [];

      // Calculate metrics
      const totalSessions = sessionsList.length;
      const totalPageViews = pageViewsList.length;
      const totalClicks = eventsList.filter(e => e.event_type === 'click').length;
      
      const totalDuration = sessionsList.reduce((sum, s) => sum + (s.duration || 0), 0);
      const averageSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
      
      const averagePagesPerSession = totalSessions > 0 ? totalPageViews / totalSessions : 0;
      
      // Bounce rate: sessions with only 1 page view
      const bounceSessions = sessionsList.filter(s => s.page_views <= 1).length;
      const bounceRate = totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0;

      // Top pages
      const pageViewsMap = new Map<string, number>();
      pageViewsList.forEach(pv => {
        const count = pageViewsMap.get(pv.page_url) || 0;
        pageViewsMap.set(pv.page_url, count + 1);
      });
      const topPages = Array.from(pageViewsMap.entries())
        .map(([url, views]) => ({ url, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Top referrers
      const referrerMap = new Map<string, number>();
      sessionsList.forEach(s => {
        if (s.referrer) {
          const count = referrerMap.get(s.referrer) || 0;
          referrerMap.set(s.referrer, count + 1);
        }
      });
      const topReferrers = Array.from(referrerMap.entries())
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Device types
      const deviceMap = new Map<string, number>();
      sessionsList.forEach(s => {
        if (s.device_type) {
          const count = deviceMap.get(s.device_type) || 0;
          deviceMap.set(s.device_type, count + 1);
        }
      });
      const deviceTypes = Array.from(deviceMap.entries())
        .map(([type, count]) => ({ type: type as any, count }))
        .sort((a, b) => b.count - a.count);

      // Browsers
      const browserMap = new Map<string, number>();
      sessionsList.forEach(s => {
        if (s.browser) {
          const count = browserMap.get(s.browser) || 0;
          browserMap.set(s.browser, count + 1);
        }
      });
      const browsers = Array.from(browserMap.entries())
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        total_sessions: totalSessions,
        total_page_views: totalPageViews,
        total_clicks: totalClicks,
        average_session_duration: Math.round(averageSessionDuration),
        average_pages_per_session: Math.round(averagePagesPerSession * 100) / 100,
        bounce_rate: Math.round(bounceRate * 100) / 100,
        top_pages: topPages,
        top_referrers: topReferrers,
        device_types: deviceTypes,
        browsers: browsers,
      };
    } catch (error) {
      console.error('Error getting website analytics:', error);
      throw error;
    }
  }
}

