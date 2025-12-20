export interface Customer {
  id: string;
  name: string;
  register_at: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  details?: CustomerDetail[];
  websites?: CustomerWebsite[];
  user?: User;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar?: string;
}

export interface CustomerDataTemplate {
  id: string;
  title: string;
  key: string;
  group?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerDetail {
  id: string;
  customer_id: string;
  customer_data_template_id: string;
  value?: string;
  created_at: string;
  updated_at: string;
  template?: CustomerDataTemplate;
}

export interface CreateCustomerData {
  name: string;
  register_at?: string;
  user_id?: string;
}

export interface UpdateCustomerData {
  name?: string;
  register_at?: string;
  user_id?: string;
}

export interface CreateCustomerDetailData {
  customer_id: string;
  customer_data_template_id: string;
  value?: string;
}

export interface UpdateCustomerDetailData {
  value?: string;
}

export interface CustomerStats {
  total: number;
  recentCustomers: Customer[];
  totalDetails: number;
}

export interface CustomerFormData {
  name: string;
  register_at: string;
  details?: { template_id: string; value: string }[];
}

export interface CustomerContentTemplate {
  id: string;
  name: string;
  content: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContentTemplateData {
  name: string;
  content: string;
  description?: string;
}

export interface UpdateContentTemplateData {
  name?: string;
  content?: string;
  description?: string;
}

export interface CustomerWebsite {
  id: string;
  customer_id: string;
  url: string;
  name?: string;
  description?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerWebsiteData {
  customer_id: string;
  url: string;
  name?: string;
  description?: string;
  is_primary?: boolean;
}

export interface UpdateCustomerWebsiteData {
  url?: string;
  name?: string;
  description?: string;
  is_primary?: boolean;
}

export type CrawlSessionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type CrawlPageStatus = 'pending' | 'crawling' | 'completed' | 'failed';

export interface CrawlSession {
  id: string;
  website_id: string;
  status: CrawlSessionStatus;
  started_at?: string;
  completed_at?: string;
  total_pages: number;
  crawled_pages: number;
  failed_pages: number;
  error_message?: string;
  max_depth: number;
  max_pages: number;
  created_at: string;
  updated_at: string;
  website?: CustomerWebsite;
  pages?: CrawlPage[];
}

export interface CrawlPage {
  id: string;
  crawl_session_id: string;
  url: string;
  title?: string;
  description?: string;
  depth: number;
  status: CrawlPageStatus;
  http_status_code?: number;
  content_type?: string;
  content_length?: number;
  html_content?: string;
  text_content?: string;
  meta_tags?: Record<string, any>;
  links?: string[];
  images?: string[];
  error_message?: string;
  crawled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCrawlSessionData {
  website_id: string;
  max_depth?: number;
  max_pages?: number;
}

export interface UpdateCrawlSessionData {
  status?: CrawlSessionStatus;
  started_at?: string;
  completed_at?: string;
  total_pages?: number;
  crawled_pages?: number;
  failed_pages?: number;
  error_message?: string;
}

export interface CreateCrawlPageData {
  crawl_session_id: string;
  url: string;
  depth: number;
  status?: CrawlPageStatus;
}

export interface UpdateCrawlPageData {
  title?: string;
  description?: string;
  status?: CrawlPageStatus;
  http_status_code?: number;
  content_type?: string;
  content_length?: number;
  html_content?: string;
  text_content?: string;
  meta_tags?: Record<string, any>;
  links?: string[];
  images?: string[];
  error_message?: string;
  crawled_at?: string;
}

// ========== Tracking & Analytics Types ==========

export type TrackingEventType = 'click' | 'scroll' | 'move' | 'view' | 'resize' | 'keypress' | 'form_submit';
export type HeatmapType = 'click' | 'move' | 'scroll';
export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface TrackingSession {
  id: string;
  website_id: string;
  session_id: string;
  visitor_id?: string;
  user_agent?: string;
  referrer?: string;
  ip_address?: string;
  screen_width?: number;
  screen_height?: number;
  viewport_width?: number;
  viewport_height?: number;
  device_type?: DeviceType;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  started_at: string;
  ended_at?: string;
  duration?: number;
  page_views: number;
  clicks: number;
  scrolls: number;
  created_at: string;
  updated_at: string;
  website?: CustomerWebsite;
}

export interface TrackingEvent {
  id: string;
  tracking_session_id: string;
  event_type: TrackingEventType;
  page_url: string;
  x?: number;
  y?: number;
  element_tag?: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  element_selector?: string;
  scroll_position?: number;
  viewport_width?: number;
  viewport_height?: number;
  timestamp: string;
  event_data?: Record<string, any>;
  created_at: string;
}

export interface HeatmapData {
  id: string;
  website_id: string;
  page_url: string;
  x: number;
  y: number;
  value: number;
  heatmap_type: HeatmapType;
  viewport_width?: number;
  viewport_height?: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface PageView {
  id: string;
  tracking_session_id: string;
  page_url: string;
  page_title?: string;
  referrer?: string;
  load_time?: number;
  time_on_page?: number;
  scroll_depth?: number;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface CreateTrackingSessionData {
  website_id: string;
  session_id: string;
  visitor_id?: string;
  user_agent?: string;
  referrer?: string;
  ip_address?: string;
  screen_width?: number;
  screen_height?: number;
  viewport_width?: number;
  viewport_height?: number;
  device_type?: DeviceType;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
}

export interface UpdateTrackingSessionData {
  ended_at?: string;
  duration?: number;
  page_views?: number;
  clicks?: number;
  scrolls?: number;
}

export interface CreateTrackingEventData {
  tracking_session_id: string;
  event_type: TrackingEventType;
  page_url: string;
  x?: number;
  y?: number;
  element_tag?: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  element_selector?: string;
  scroll_position?: number;
  viewport_width?: number;
  viewport_height?: number;
  event_data?: Record<string, any>;
}

export interface CreatePageViewData {
  tracking_session_id: string;
  page_url: string;
  page_title?: string;
  referrer?: string;
  load_time?: number;
  time_on_page?: number;
  scroll_depth?: number;
}

export interface WebsiteAnalytics {
  total_sessions: number;
  total_page_views: number;
  total_clicks: number;
  average_session_duration: number;
  average_pages_per_session: number;
  bounce_rate: number;
  top_pages: Array<{ url: string; views: number }>;
  top_referrers: Array<{ referrer: string; count: number }>;
  device_types: Array<{ type: DeviceType; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
}

