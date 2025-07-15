import { createClient } from './client';
import { Setting, CreateSettingData, UpdateSettingData } from '../../Types/SettingsType';

export class SettingsService {
    private static supabase = createClient();

    // Get all settings
    static async getSettings(): Promise<Setting[]> {
        try {
            const { data, error } = await this.supabase
                .from('settings')
                .select('*')
                .order('key', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching settings:', error);
            throw error;
        }
    }

    // Get a specific setting by key
    static async getSettingByKey(key: string): Promise<Setting | null> {
        try {
            const { data, error } = await this.supabase
                .from('settings')
                .select('*')
                .eq('key', key)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Setting not found
                }
                throw error;
            }
            return data;
        } catch (error) {
            console.error('Error fetching setting by key:', error);
            throw error;
        }
    }

    // Create a new setting
    static async createSetting(settingData: CreateSettingData): Promise<Setting | null> {
        try {
            const { data, error } = await this.supabase
                .from('settings')
                .insert([settingData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating setting:', error);
            throw error;
        }
    }

    // Update a setting
    static async updateSetting(key: string, updates: UpdateSettingData): Promise<Setting | null> {
        try {
            const { data, error } = await this.supabase
                .from('settings')
                .update(updates)
                .eq('key', key)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating setting:', error);
            throw error;
        }
    }

    // Delete a setting
    static async deleteSetting(key: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('settings')
                .delete()
                .eq('key', key);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting setting:', error);
            throw error;
        }
    }

    // Upsert a setting (insert if not exists, update if exists)
    static async upsertSetting(settingData: CreateSettingData): Promise<Setting | null> {
        try {
            const { data, error } = await this.supabase
                .from('settings')
                .upsert([settingData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error upserting setting:', error);
            throw error;
        }
    }

    // Get settings by type
    static async getSettingsByType(type: string): Promise<Setting[]> {
        try {
            const { data, error } = await this.supabase
                .from('settings')
                .select('*')
                .eq('type', type)
                .order('key', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching settings by type:', error);
            throw error;
        }
    }

    // Bulk update settings
    static async bulkUpdateSettings(settings: { key: string; updates: UpdateSettingData }[]): Promise<Setting[]> {
        try {
            const promises = settings.map(({ key, updates }) => 
                this.updateSetting(key, updates)
            );
            
            const results = await Promise.all(promises);
            return results.filter(result => result !== null) as Setting[];
        } catch (error) {
            console.error('Error bulk updating settings:', error);
            throw error;
        }
    }

    // Get settings value by key (returns just the value)
    static async getSettingValue(key: string): Promise<string | null> {
        try {
            const setting = await this.getSettingByKey(key);
            return setting ? setting.value : null;
        } catch (error) {
            console.error('Error fetching setting value:', error);
            throw error;
        }
    }

    // Helper method to get boolean value
    static async getBooleanSetting(key: string): Promise<boolean> {
        try {
            const value = await this.getSettingValue(key);
            return value === 'true';
        } catch (error) {
            console.error('Error fetching boolean setting:', error);
            return false;
        }
    }

    // Helper method to get number value
    static async getNumberSetting(key: string): Promise<number> {
        try {
            const value = await this.getSettingValue(key);
            return value ? parseFloat(value) : 0;
        } catch (error) {
            console.error('Error fetching number setting:', error);
            return 0;
        }
    }

    // Helper method to get JSON value
    static async getJsonSetting(key: string): Promise<any> {
        try {
            const value = await this.getSettingValue(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Error fetching JSON setting:', error);
            return null;
        }
    }

    // Helper method to get timestampz value
    static async getTimestampzSetting(key: string): Promise<Date | null> {
        try {
            const value = await this.getSettingValue(key);
            return value ? new Date(value) : null;
        } catch (error) {
            console.error('Error fetching timestampz setting:', error);
            return null;
        }
    }

    // Helper method to set timestampz value
    static async setTimestampzSetting(key: string, title: string, date: Date): Promise<Setting | null> {
        try {
            return await this.upsertSetting({
                key,
                title,
                value: date.toISOString(),
                type: 'timestampz'
            });
        } catch (error) {
            console.error('Error setting timestampz setting:', error);
            throw error;
        }
    }
} 