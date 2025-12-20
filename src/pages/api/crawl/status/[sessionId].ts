import { NextApiRequest, NextApiResponse } from 'next';
import { CrawlService } from 'utils/supabase/crawlService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    const session = await CrawlService.getCrawlSessionById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Crawl session not found' });
    }

    res.status(200).json(session);
  } catch (error: any) {
    console.error('Error fetching crawl status:', error);
    res.status(500).json({ message: 'Failed to fetch crawl status', error: error.message });
  }
}

