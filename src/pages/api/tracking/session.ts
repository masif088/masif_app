import { NextApiRequest, NextApiResponse } from 'next';
import { TrackingService } from '../../../../utils/supabase/trackingService';

// CORS headers helper
function setCorsHeaders(res: NextApiResponse, origin?: string) {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
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

  if (req.method === 'POST') {
    try {
      const sessionData = req.body;
      
      // Validate required fields
      if (!sessionData.website_id || !sessionData.session_id) {
        return res.status(400).json({ message: 'website_id and session_id are required' });
      }

      const session = await TrackingService.getOrCreateSession(sessionData);
      
      res.status(200).json(session);
    } catch (error: any) {
      console.error('Error handling tracking session:', error);
      res.status(500).json({ message: 'Failed to handle tracking session', error: error.message });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { session_id, ...updates } = req.body;
      
      if (!session_id) {
        return res.status(400).json({ message: 'session_id is required' });
      }

      // Find session by session_id (client-side session ID)
      const session = await TrackingService.getTrackingSessionBySessionId(session_id);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      const updated = await TrackingService.updateTrackingSession(session.id, updates);
      
      res.status(200).json(updated);
    } catch (error: any) {
      console.error('Error updating tracking session:', error);
      res.status(500).json({ message: 'Failed to update tracking session', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

