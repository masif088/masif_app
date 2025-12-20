import { CrawlPage, CustomerWebsite } from 'Types/CustomerType';
import { CrawlService } from 'utils/supabase/crawlService';

interface CrawlOptions {
  maxDepth: number;
  maxPages: number;
  sessionId: string;
  baseUrl: string;
  onProgress?: (progress: CrawlProgress) => void;
}

interface CrawlProgress {
  total: number;
  crawled: number;
  failed: number;
  currentUrl?: string;
  status: 'running' | 'completed' | 'failed';
}

export class BFSCrawler {
  private visited: Set<string> = new Set();
  private queue: Array<{ url: string; depth: number }> = [];
  private options: CrawlOptions;
  private isCancelled: boolean = false;

  constructor(options: CrawlOptions) {
    this.options = options;
  }

  cancel(): void {
    this.isCancelled = true;
  }

  private normalizeUrl(url: string, baseUrl: string): string {
    try {
      // If URL is relative, make it absolute
      if (url.startsWith('/')) {
        const base = new URL(baseUrl);
        return new URL(url, base.origin).href;
      }
      // If URL doesn't have protocol, add it
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        const base = new URL(baseUrl);
        return new URL(url, base.origin).href;
      }
      return new URL(url).href;
    } catch (error) {
      return url;
    }
  }

  private isSameDomain(url: string, baseUrl: string): boolean {
    try {
      const urlObj = new URL(url);
      const baseObj = new URL(baseUrl);
      return urlObj.hostname === baseObj.hostname;
    } catch {
      return false;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Only crawl http and https
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private shouldCrawl(url: string, baseUrl: string, depth: number): boolean {
    if (this.isCancelled) return false;
    if (depth > this.options.maxDepth) return false;
    if (this.visited.has(url)) return false;
    if (!this.isValidUrl(url)) return false;
    if (!this.isSameDomain(url, baseUrl)) return false;
    
    // Skip common non-HTML resources
    const skipExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.css', '.js', '.zip', '.rar', '.exe', '.dmg'];
    const lowerUrl = url.toLowerCase();
    if (skipExtensions.some(ext => lowerUrl.includes(ext))) return false;

    return true;
  }

  private async fetchPage(url: string): Promise<{ html: string; status: number; contentType: string }> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        // Timeout after 10 seconds
        signal: AbortSignal.timeout(10000),
      });

      const contentType = response.headers.get('content-type') || '';
      
      // Only process HTML content
      if (!contentType.includes('text/html')) {
        throw new Error(`Not HTML content: ${contentType}`);
      }

      const html = await response.text();
      return {
        html,
        status: response.status,
        contentType,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch ${url}: ${error.message}`);
    }
  }

  private extractLinks(html: string, baseUrl: string): string[] {
    const links: string[] = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      if (href) {
        const normalizedUrl = this.normalizeUrl(href, baseUrl);
        if (this.isValidUrl(normalizedUrl) && this.isSameDomain(normalizedUrl, baseUrl)) {
          links.push(normalizedUrl);
        }
      }
    }

    return Array.from(new Set(links)); // Remove duplicates
  }

  private extractImages(html: string, baseUrl: string): string[] {
    const images: string[] = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      if (src) {
        const normalizedUrl = this.normalizeUrl(src, baseUrl);
        if (this.isValidUrl(normalizedUrl)) {
          images.push(normalizedUrl);
        }
      }
    }

    return Array.from(new Set(images)); // Remove duplicates
  }

  private extractMetaTags(html: string): Record<string, any> {
    const meta: Record<string, any> = {};
    
    // Extract title from <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      meta.title = titleMatch[1].trim();
      meta['html:title'] = titleMatch[1].trim(); // Also store as html:title for reference
    }

    // Extract all meta tags (both name and property)
    // Pattern: <meta name="..." content="..."> or <meta property="..." content="...">
    const metaRegex = /<meta[^>]+(?:name|property)=["']([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = metaRegex.exec(html)) !== null) {
      const name = match[1];
      const content = match[2];
      
      // Store both with original name and normalized key
      meta[name] = content;
      
      // Also store common meta tags with normalized keys for easy access
      const normalizedKey = name.toLowerCase().replace(/[:\s]+/g, '_');
      if (!meta[normalizedKey]) {
        meta[normalizedKey] = content;
      }
    }

    // Extract description (fallback if not in meta tags)
    if (!meta.description && !meta['og:description']) {
      const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
      if (descMatch) {
        meta.description = descMatch[1];
      }
    }

    // Extract Open Graph tags
    const ogTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:site_name'];
    ogTags.forEach(tag => {
      if (meta[tag]) {
        // Already extracted by main regex, but ensure it's accessible
        meta[`og_${tag.replace('og:', '')}`] = meta[tag];
      }
    });

    // Extract Twitter Card tags
    const twitterTags = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:site', 'twitter:creator'];
    twitterTags.forEach(tag => {
      if (meta[tag]) {
        meta[`twitter_${tag.replace('twitter:', '')}`] = meta[tag];
      }
    });

    // Extract other common meta tags
    const commonTags = ['keywords', 'author', 'robots', 'viewport', 'charset', 'language'];
    commonTags.forEach(tag => {
      if (meta[tag]) {
        meta[`meta_${tag}`] = meta[tag];
      }
    });

    return meta;
  }

  private extractTextContent(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, ' ');
    
    // Decode HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text.substring(0, 5000); // Limit to 5000 characters
  }

  async crawl(): Promise<void> {
    const { baseUrl, sessionId, maxPages, onProgress } = this.options;
    
    // Initialize queue with base URL
    this.queue.push({ url: baseUrl, depth: 0 });
    this.visited.add(baseUrl);

    let crawledCount = 0;
    let failedCount = 0;

    while (this.queue.length > 0 && !this.isCancelled) {
      if (crawledCount >= maxPages) {
        break;
      }

      const { url, depth } = this.queue.shift()!;

      try {
        // Update page status to crawling
        const page = await CrawlService.upsertCrawlPage({
          crawl_session_id: sessionId,
          url,
          depth,
          status: 'crawling',
        });

        if (!page) continue;

        // Fetch page
        const { html, status, contentType } = await this.fetchPage(url);

        // Extract data
        const links = this.extractLinks(html, baseUrl);
        const images = this.extractImages(html, baseUrl);
        const metaTags = this.extractMetaTags(html);
        const textContent = this.extractTextContent(html);

        // Update page with data
        // Ensure meta_tags is properly formatted as JSONB
        const metaTagsForDB = metaTags && Object.keys(metaTags).length > 0 
          ? metaTags 
          : null;

        const updateData: any = {
          status: 'completed',
          http_status_code: status,
          content_type: contentType,
          text_content: textContent,
          meta_tags: metaTagsForDB, // Save all meta tags to database as JSONB
          links: links && links.length > 0 ? links : null,
          images: images && images.length > 0 ? images : null,
          crawled_at: new Date().toISOString(),
        };

        // Only store HTML if it's not too large (limit to 100KB)
        if (html.length <= 100000) {
          updateData.html_content = html;
        }

        // Set title - prioritize og:title, then html title, then meta title
        updateData.title = metaTags['og:title'] || metaTags.title || metaTags['html:title'] || metaTags['twitter:title'] || '';
        
        // Set description - prioritize og:description, then meta description, then twitter description
        updateData.description = metaTags['og:description'] || metaTags.description || metaTags['twitter:description'] || '';

        // Log meta tags for debugging
        if (metaTagsForDB && Object.keys(metaTagsForDB).length > 0) {
          console.log(`Saving ${Object.keys(metaTagsForDB).length} meta tags for ${url}`);
        }

        await CrawlService.updateCrawlPage(page.id, updateData);

        crawledCount++;

        // Add new links to queue
        for (const link of links) {
          if (this.shouldCrawl(link, baseUrl, depth + 1)) {
            this.queue.push({ url: link, depth: depth + 1 });
            this.visited.add(link);
          }
        }

        // Update session stats
        await CrawlService.updateSessionStats(sessionId);

        // Report progress
        if (onProgress) {
          onProgress({
            total: this.visited.size,
            crawled: crawledCount,
            failed: failedCount,
            currentUrl: url,
            status: 'running',
          });
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        console.error(`Error crawling ${url}:`, error);
        failedCount++;

        // Update page status to failed
        try {
          const page = await CrawlService.upsertCrawlPage({
            crawl_session_id: sessionId,
            url,
            depth,
            status: 'failed',
            error_message: error.message?.substring(0, 500) || 'Unknown error',
          });

          if (page) {
            await CrawlService.updateCrawlPage(page.id, {
              status: 'failed',
              error_message: error.message?.substring(0, 500) || 'Unknown error',
            });
          }
        } catch (updateError) {
          console.error('Error updating failed page:', updateError);
        }

        // Update session stats
        await CrawlService.updateSessionStats(sessionId);

        // Report progress
        if (onProgress) {
          onProgress({
            total: this.visited.size,
            crawled: crawledCount,
            failed: failedCount,
            currentUrl: url,
            status: 'running',
          });
        }
      }
    }

    // Final update
    if (onProgress) {
      onProgress({
        total: this.visited.size,
        crawled: crawledCount,
        failed: failedCount,
        status: this.isCancelled ? 'failed' : 'completed',
      });
    }
  }
}

