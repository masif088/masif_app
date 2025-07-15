import { NextApiRequest, NextApiResponse } from 'next';
import { ActivityService } from '../../../../utils/supabase/activityService';
import { ActivityPriority } from '../../../../Types/ActivityType';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { title } = req.query;

    if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Priority title is required' });
    }

    try {
        switch (req.method) {
            case 'GET':
                const priority = await ActivityService.getActivityPriorityByTitle(title);
                if (!priority) {
                    return res.status(404).json({ error: 'Priority not found' });
                }
                res.status(200).json(priority);
                break;

            case 'PUT':
                const updateData: Partial<ActivityPriority> = req.body;
                
                // Remove title from updates as it's the primary key
                const { title: _, ...updates } = updateData;
                
                const updatedPriority = await ActivityService.updateActivityPriority(title, updates);
                if (!updatedPriority) {
                    return res.status(404).json({ error: 'Priority not found' });
                }
                res.status(200).json(updatedPriority);
                break;

            case 'DELETE':
                await ActivityService.deleteActivityPriority(title);
                res.status(204).end();
                break;

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                res.status(405).json({ error: `Method ${req.method} not allowed` });
        }
    } catch (error: any) {
        console.error('Activity priority API error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
} 