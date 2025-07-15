import { NextApiRequest, NextApiResponse } from 'next';
import { ActivityService } from '../../../../utils/supabase/activityService';
import { CreateActivityPriorityData } from '../../../../Types/ActivityType';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET':
                const priorities = await ActivityService.getActivityPriorities();
                res.status(200).json(priorities);
                break;

            case 'POST':
                const createData: CreateActivityPriorityData = req.body;
                
                // Validate required fields
                if (!createData.title || !createData.sub_title || !createData.color || createData.level === undefined) {
                    return res.status(400).json({ 
                        error: 'Missing required fields: title, sub_title, color, level' 
                    });
                }

                const newPriority = await ActivityService.createActivityPriority(createData);
                res.status(201).json(newPriority);
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                res.status(405).json({ error: `Method ${req.method} not allowed` });
        }
    } catch (error: any) {
        console.error('Activity priorities API error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
} 