import { NextApiRequest, NextApiResponse } from 'next';
import { TrackingService } from '../../../../utils/supabase/trackingService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    
    if (events.length === 0) {
      return res.status(400).json({ message: 'At least one event is required' });
    }

    // Validate events
    for (const event of events) {
      if (!event.tracking_session_id || !event.event_type || !event.page_url) {
        return res.status(400).json({ 
          message: 'tracking_session_id, event_type, and page_url are required for each event' 
        });
      }
    }

    // Batch insert events
    const createdEvents = await TrackingService.batchCreateTrackingEvents(events);
    
    // Update session stats
    if (events.length > 0) {
      const sessionId = events[0].tracking_session_id;
      const session = await TrackingService.getTrackingSessionById(sessionId);
      
      if (session) {
        const clickCount = events.filter(e => e.event_type === 'click').length;
        const scrollCount = events.filter(e => e.event_type === 'scroll').length;
        
        await TrackingService.updateTrackingSession(session.id, {
          clicks: (session.clicks || 0) + clickCount,
          scrolls: (session.scrolls || 0) + scrollCount,
        });
      }
    }

    res.status(200).json({ 
      message: 'Events recorded',
      count: createdEvents.length 
    });
  } catch (error: any) {
    console.error('Error recording tracking events:', error);
    res.status(500).json({ message: 'Failed to record tracking events', error: error.message });
  }
}

