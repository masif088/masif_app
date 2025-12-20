import { NextApiRequest, NextApiResponse } from 'next';
import { TrackingService } from '../../../../utils/supabase/trackingService';

// CORS headers helper
function setCorsHeaders(res: NextApiResponse, origin?: string) {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const pageViewData = req.body;
    
    if (!pageViewData.tracking_session_id || !pageViewData.page_url) {
      return res.status(400).json({ message: 'tracking_session_id and page_url are required' });
    }

    const pageView = await TrackingService.createPageView(pageViewData);
    
    // Update session page_views count
    const session = await TrackingService.getTrackingSessionById(pageViewData.tracking_session_id);
    if (session) {
      await TrackingService.updateTrackingSession(session.id, {
        page_views: (session.page_views || 0) + 1,
      });
    }

    res.status(200).json(pageView);
  } catch (error: any) {
    console.error('Error recording page view:', error);
    res.status(500).json({ message: 'Failed to record page view', error: error.message });
  }
}

