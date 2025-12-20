import { NextApiRequest, NextApiResponse } from 'next';
import { TrackingService } from '../../../../../utils/supabase/trackingService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { websiteId } = req.query;
    const { startDate, endDate } = req.query;

    if (!websiteId || typeof websiteId !== 'string') {
      return res.status(400).json({ message: 'websiteId is required' });
    }

    const analytics = await TrackingService.getWebsiteAnalytics(
      websiteId,
      startDate as string | undefined,
      endDate as string | undefined
    );

    res.status(200).json(analytics);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
}

