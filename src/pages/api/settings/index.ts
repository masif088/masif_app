import { NextApiRequest, NextApiResponse } from 'next';
import { SettingsService } from 'utils/supabase/settingsService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const { key, type } = req.query;
                
                if (key && typeof key === 'string') {
                    // Get specific setting by key
                    const setting = await SettingsService.getSettingByKey(key);
                    if (!setting) {
                        return res.status(404).json({ error: 'Setting not found' });
                    }
                    return res.status(200).json(setting);
                } else if (type && typeof type === 'string') {
                    // Get settings by type
                    const settings = await SettingsService.getSettingsByType(type);
                    return res.status(200).json(settings);
                } else {
                    // Get all settings
                    const settings = await SettingsService.getSettings();
                    return res.status(200).json(settings);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                return res.status(500).json({ error: 'Failed to fetch settings' });
            }

        case 'POST':
            try {
                const { key, title, value, type } = req.body;
                
                if (!key || !title || !value || !type) {
                    return res.status(400).json({ error: 'Missing required fields' });
                }

                const setting = await SettingsService.createSetting({
                    key,
                    title,
                    value,
                    type
                });

                return res.status(201).json(setting);
            } catch (error) {
                console.error('Error creating setting:', error);
                return res.status(500).json({ error: 'Failed to create setting' });
            }

        case 'PUT':
            try {
                const { key } = req.query;
                const { title, value, type } = req.body;
                
                if (!key || typeof key !== 'string') {
                    return res.status(400).json({ error: 'Setting key is required' });
                }

                const updates: any = {};
                if (title) updates.title = title;
                if (value !== undefined) updates.value = value;
                if (type) updates.type = type;

                const setting = await SettingsService.updateSetting(key, updates);
                
                if (!setting) {
                    return res.status(404).json({ error: 'Setting not found' });
                }

                return res.status(200).json(setting);
            } catch (error) {
                console.error('Error updating setting:', error);
                return res.status(500).json({ error: 'Failed to update setting' });
            }

        case 'DELETE':
            try {
                const { key } = req.query;
                
                if (!key || typeof key !== 'string') {
                    return res.status(400).json({ error: 'Setting key is required' });
                }

                await SettingsService.deleteSetting(key);
                return res.status(200).json({ message: 'Setting deleted successfully' });
            } catch (error) {
                console.error('Error deleting setting:', error);
                return res.status(500).json({ error: 'Failed to delete setting' });
            }

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);
    }
} 