import { NextApiRequest, NextApiResponse } from 'next';
import { CrawlService } from 'utils/supabase/crawlService';
import { BFSCrawler } from 'utils/crawler/bfsCrawler';
import { CustomerService } from 'utils/supabase/customerService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { website_id, max_depth = 3, max_pages = 100 } = req.body;

    if (!website_id) {
      return res.status(400).json({ message: 'website_id is required' });
    }

    // Get website
    const website = await CustomerService.getWebsiteById(website_id);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Create crawl session
    const session = await CrawlService.createCrawlSession({
      website_id,
      max_depth,
      max_pages,
    });

    if (!session) {
      return res.status(500).json({ message: 'Failed to create crawl session' });
    }

    // Update session status to running
    await CrawlService.updateCrawlSession(session.id, {
      status: 'running',
      started_at: new Date().toISOString(),
    });

    // Start crawling in background (don't await)
    crawlInBackground(session.id, website.url, max_depth, max_pages).catch(error => {
      console.error('Background crawl error:', error);
      CrawlService.updateCrawlSession(session.id, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString(),
      });
    });

    // Return immediately
    res.status(200).json({
      message: 'Crawl started',
      session_id: session.id,
    });
  } catch (error: any) {
    console.error('Error starting crawl:', error);
    res.status(500).json({ message: 'Failed to start crawl', error: error.message });
  }
}

async function crawlInBackground(
  sessionId: string,
  baseUrl: string,
  maxDepth: number,
  maxPages: number
): Promise<void> {
  try {
    const crawler = new BFSCrawler({
      sessionId,
      baseUrl,
      maxDepth,
      maxPages,
      onProgress: async (progress) => {
        // Update session progress
        await CrawlService.updateCrawlSession(sessionId, {
          total_pages: progress.total,
          crawled_pages: progress.crawled,
          failed_pages: progress.failed,
        });
      },
    });

    await crawler.crawl();

    // Mark session as completed
    await CrawlService.updateCrawlSession(sessionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Crawl error:', error);
    await CrawlService.updateCrawlSession(sessionId, {
      status: 'failed',
      error_message: error.message,
      completed_at: new Date().toISOString(),
    });
    throw error;
  }
}

