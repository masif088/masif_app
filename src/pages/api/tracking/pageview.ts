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

    // Set timeout for the entire operation (10 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000);
    });

    const operationPromise = (async () => {
      // First, verify that the session exists
      const session = await TrackingService.getTrackingSessionById(pageViewData.tracking_session_id);
      if (!session) {
        console.error('Session not found:', pageViewData.tracking_session_id);
        return res.status(404).json({ message: 'Tracking session not found' });
      }

      // Create page view
      const pageView = await TrackingService.createPageView(pageViewData);
      
      // Update session page_views count (don't wait for this to complete)
      TrackingService.updateTrackingSession(session.id, {
        page_views: (session.page_views || 0) + 1,
      }).catch(err => {
        console.error('Error updating session page_views:', err);
        // Don't fail the request if update fails
      });

      return res.status(200).json(pageView);
    })();

    await Promise.race([operationPromise, timeoutPromise]);
  } catch (error: any) {
    // Don't send response if already sent
    if (res.headersSent) {
      return;
    }

    console.error('Error recording page view:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      body: req.body
    });

    // If timeout, return 504 Gateway Timeout
    if (error?.message === 'Request timeout') {
      return res.status(504).json({ 
        message: 'Request timeout', 
        error: 'The request took too long to process'
      });
    }

    res.status(500).json({ 
      message: 'Failed to record page view', 
      error: error?.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error?.details : undefined
    });
  }
}

