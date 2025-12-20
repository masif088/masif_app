import { createClient } from './client';
import {
  CrawlSession,
  CrawlPage,
  CreateCrawlSessionData,
  UpdateCrawlSessionData,
  CreateCrawlPageData,
  UpdateCrawlPageData,
  CustomerWebsite,
} from 'Types/CustomerType';

export class CrawlService {
  private static supabase = createClient();

  // Get crawl session by ID
  static async getCrawlSessionById(id: string): Promise<CrawlSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('crawl_sessions')
        .select(`
          *,
          website:customer_websites(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching crawl session:', error);
      throw error;
    }
  }

  // Get all crawl sessions for a website
  static async getCrawlSessionsByWebsiteId(websiteId: string): Promise<CrawlSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('crawl_sessions')
        .select(`
          *,
          website:customer_websites(*)
        `)
        .eq('website_id', websiteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching crawl sessions:', error);
      throw error;
    }
  }

  // Create a new crawl session
  static async createCrawlSession(sessionData: CreateCrawlSessionData): Promise<CrawlSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('crawl_sessions')
        .insert([{
          ...sessionData,
          max_depth: sessionData.max_depth || 3,
          max_pages: sessionData.max_pages || 100,
        }])
        .select(`
          *,
          website:customer_websites(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating crawl session:', error);
      throw error;
    }
  }

  // Update crawl session
  static async updateCrawlSession(id: string, updates: UpdateCrawlSessionData): Promise<CrawlSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('crawl_sessions')
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
      console.error('Error updating crawl session:', error);
      throw error;
    }
  }

  // Get pages for a crawl session
  static async getCrawlPagesBySessionId(sessionId: string): Promise<CrawlPage[]> {
    try {
      const { data, error } = await this.supabase
        .from('crawl_pages')
        .select('*')
        .eq('crawl_session_id', sessionId)
        .order('depth', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching crawl pages:', error);
      throw error;
    }
  }

  // Create crawl page
  static async createCrawlPage(pageData: CreateCrawlPageData): Promise<CrawlPage | null> {
    try {
      const { data, error } = await this.supabase
        .from('crawl_pages')
        .insert([pageData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating crawl page:', error);
      throw error;
    }
  }

  // Update crawl page
  static async updateCrawlPage(id: string, updates: UpdateCrawlPageData): Promise<CrawlPage | null> {
    try {
      // Ensure meta_tags, links, and images are properly formatted for JSONB
      const formattedUpdates: any = { ...updates };
      
      if (formattedUpdates.meta_tags && typeof formattedUpdates.meta_tags === 'object') {
        // Ensure it's a plain object that can be stored as JSONB
        formattedUpdates.meta_tags = formattedUpdates.meta_tags;
      }
      
      if (formattedUpdates.links && Array.isArray(formattedUpdates.links)) {
        formattedUpdates.links = formattedUpdates.links;
      }
      
      if (formattedUpdates.images && Array.isArray(formattedUpdates.images)) {
        formattedUpdates.images = formattedUpdates.images;
      }

      const { data, error } = await this.supabase
        .from('crawl_pages')
        .update(formattedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating crawl page:', error);
        console.error('Update data:', formattedUpdates);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error updating crawl page:', error);
      throw error;
    }
  }

  // Upsert crawl page (create or update if exists)
  static async upsertCrawlPage(pageData: CreateCrawlPageData & UpdateCrawlPageData): Promise<CrawlPage | null> {
    try {
      // Check if page exists
      const { data: existing, error: fetchError } = await this.supabase
        .from('crawl_pages')
        .select('id')
        .eq('crawl_session_id', pageData.crawl_session_id)
        .eq('url', pageData.url)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing) {
        // Update existing page with all provided data
        const updateData: UpdateCrawlPageData = {
          ...pageData,
        };
        delete (updateData as any).crawl_session_id;
        delete (updateData as any).url;
        delete (updateData as any).depth;
        return await this.updateCrawlPage(existing.id, updateData);
      } else {
        // Create new page
        return await this.createCrawlPage({
          crawl_session_id: pageData.crawl_session_id,
          url: pageData.url,
          depth: pageData.depth,
          status: pageData.status || 'pending',
        });
      }
    } catch (error: any) {
      // If no existing page, create new one
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        return await this.createCrawlPage({
          crawl_session_id: pageData.crawl_session_id,
          url: pageData.url,
          depth: pageData.depth,
          status: pageData.status || 'pending',
        });
      }
      console.error('Error upserting crawl page:', error);
      throw error;
    }
  }

  // Update session statistics
  static async updateSessionStats(sessionId: string): Promise<void> {
    try {
      // Count total, crawled, and failed pages
      const { data: pages, error: pagesError } = await this.supabase
        .from('crawl_pages')
        .select('status')
        .eq('crawl_session_id', sessionId);

      if (pagesError) throw pagesError;

      const total = pages?.length || 0;
      const crawled = pages?.filter(p => p.status === 'completed').length || 0;
      const failed = pages?.filter(p => p.status === 'failed').length || 0;

      await this.updateCrawlSession(sessionId, {
        total_pages: total,
        crawled_pages: crawled,
        failed_pages: failed,
      });
    } catch (error) {
      console.error('Error updating session stats:', error);
      throw error;
    }
  }

  // Delete crawl session and all pages
  static async deleteCrawlSession(id: string): Promise<void> {
    try {
      // Pages will be deleted automatically due to CASCADE
      const { error } = await this.supabase
        .from('crawl_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting crawl session:', error);
      throw error;
    }
  }
}

