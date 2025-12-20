import { NextApiRequest, NextApiResponse } from 'next';
import { TrackingService } from '../../../../../utils/supabase/trackingService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { websiteId } = req.query;
    const { pageUrl, type, viewportWidth, viewportHeight, date } = req.query;

    if (!websiteId || typeof websiteId !== 'string') {
      return res.status(400).json({ message: 'websiteId is required' });
    }

    if (!pageUrl || typeof pageUrl !== 'string') {
      return res.status(400).json({ message: 'pageUrl is required' });
    }

    const heatmapType = (type as 'click' | 'move' | 'scroll') || 'click';

    const heatmapData = await TrackingService.getHeatmapData(
      websiteId,
      pageUrl,
      heatmapType,
      viewportWidth ? parseInt(viewportWidth as string) : undefined,
      viewportHeight ? parseInt(viewportHeight as string) : undefined,
      date as string | undefined
    );

    res.status(200).json(heatmapData);
  } catch (error: any) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ message: 'Failed to fetch heatmap data', error: error.message });
  }
}

