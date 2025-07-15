import { SettingsService } from './supabase/settingsService';

/**
 * Settings Helper - Easy access to common application settings
 */
export class SettingsHelper {
    // Cache for frequently accessed settings
    private static cache: Map<string, { value: any; timestamp: number }> = new Map();
    private static cacheExpiry = 5 * 60 * 1000; // 5 minutes

    /**
     * Get a cached setting value or fetch from database
     */
    private static async getCachedSetting(key: string): Promise<string | null> {
        const cached = this.cache.get(key);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < this.cacheExpiry) {
            return cached.value;
        }

        try {
            const value = await SettingsService.getSettingValue(key);
            this.cache.set(key, { value, timestamp: now });
            return value;
        } catch (error) {
            console.error(`Error fetching setting ${key}:`, error);
            return null;
        }
    }

    /**
     * Clear cache for a specific key or all keys
     */
    static clearCache(key?: string) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Get application title
     */
    static async getAppTitle(): Promise<string> {
        const title = await this.getCachedSetting('app_title');
        return title || 'My Application';
    }

    /**
     * Get application logo URL
     */
    static async getAppLogo(): Promise<string | null> {
        return await this.getCachedSetting('app_logo');
    }

    /**
     * Get last inbox fetch timestamp
     */
    static async getLastInboxFetch(): Promise<Date | null> {
        const timestamp = await this.getCachedSetting('last_inbox_fetch');
        return timestamp ? new Date(timestamp) : null;
    }

    /**
     * Update last inbox fetch timestamp
     */
    static async updateLastInboxFetch(): Promise<void> {
        try {
            await SettingsService.upsertSetting({
                key: 'last_inbox_fetch',
                title: 'Last Inbox Fetch',
                value: new Date().toISOString(),
                type: 'timestampz'
            });
            this.clearCache('last_inbox_fetch');
        } catch (error) {
            console.error('Error updating last inbox fetch:', error);
        }
    }

    /**
     * Get any timestampz setting by key
     */
    static async getTimestampzSetting(key: string): Promise<Date | null> {
        const timestamp = await this.getCachedSetting(key);
        return timestamp ? new Date(timestamp) : null;
    }

    /**
     * Update any timestampz setting by key
     */
    static async updateTimestampzSetting(key: string, title: string, date?: Date): Promise<void> {
        try {
            await SettingsService.upsertSetting({
                key,
                title,
                value: (date || new Date()).toISOString(),
                type: 'timestampz'
            });
            this.clearCache(key);
        } catch (error) {
            console.error(`Error updating timestampz setting ${key}:`, error);
        }
    }

    /**
     * Get formatted timestamp string for display
     */
    static async getFormattedTimestamp(key: string, locale: string = 'en-US'): Promise<string | null> {
        const timestamp = await this.getTimestampzSetting(key);
        return timestamp ? timestamp.toLocaleString(locale) : null;
    }

    /**
     * Get IMAP settings
     */
    static async getImapSettings(): Promise<any> {
        const settings = await this.getCachedSetting('imap_settings');
        return settings ? JSON.parse(settings) : null;
    }

    /**
     * Get email signature
     */
    static async getEmailSignature(): Promise<string> {
        const signature = await this.getCachedSetting('email_signature');
        return signature || '';
    }

    /**
     * Get maintenance mode status
     */
    static async isMaintenanceMode(): Promise<boolean> {
        const maintenance = await this.getCachedSetting('maintenance_mode');
        return maintenance === 'true';
    }

    /**
     * Get pagination limit
     */
    static async getPaginationLimit(): Promise<number> {
        const limit = await this.getCachedSetting('pagination_limit');
        return limit ? parseInt(limit) : 10;
    }

    /**
     * Get timezone
     */
    static async getTimezone(): Promise<string> {
        const timezone = await this.getCachedSetting('timezone');
        return timezone || 'UTC';
    }

    /**
     * Get date format
     */
    static async getDateFormat(): Promise<string> {
        const format = await this.getCachedSetting('date_format');
        return format || 'MM/DD/YYYY';
    }

    /**
     * Get theme settings
     */
    static async getThemeSettings(): Promise<any> {
        const theme = await this.getCachedSetting('theme_settings');
        return theme ? JSON.parse(theme) : {
            primaryColor: '#007bff',
            darkMode: false,
            sidebarCollapsed: false
        };
    }

    /**
     * Get notification settings
     */
    static async getNotificationSettings(): Promise<any> {
        const notifications = await this.getCachedSetting('notification_settings');
        return notifications ? JSON.parse(notifications) : {
            email: true,
            push: true,
            desktop: true
        };
    }

    /**
     * Get feature flags
     */
    static async getFeatureFlags(): Promise<any> {
        const flags = await this.getCachedSetting('feature_flags');
        return flags ? JSON.parse(flags) : {};
    }

    /**
     * Check if a feature is enabled
     */
    static async isFeatureEnabled(featureName: string): Promise<boolean> {
        const flags = await this.getFeatureFlags();
        return flags[featureName] === true;
    }

    /**
     * Get contact information
     */
    static async getContactInfo(): Promise<any> {
        const contact = await this.getCachedSetting('contact_info');
        return contact ? JSON.parse(contact) : {
            email: '',
            phone: '',
            address: ''
        };
    }

    /**
     * Get system limits
     */
    static async getSystemLimits(): Promise<any> {
        const limits = await this.getCachedSetting('system_limits');
        return limits ? JSON.parse(limits) : {
            maxFileSize: 10485760, // 10MB
            maxUsers: 100,
            maxActivities: 1000
        };
    }

    /**
     * Get backup settings
     */
    static async getBackupSettings(): Promise<any> {
        const backup = await this.getCachedSetting('backup_settings');
        return backup ? JSON.parse(backup) : {
            enabled: false,
            frequency: 'daily',
            retention: 30
        };
    }

    /**
     * Get security settings
     */
    static async getSecuritySettings(): Promise<any> {
        const security = await this.getCachedSetting('security_settings');
        return security ? JSON.parse(security) : {
            sessionTimeout: 3600,
            passwordMinLength: 8,
            enableTwoFactor: false
        };
    }

    /**
     * Batch get multiple settings
     */
    static async getBatchSettings(keys: string[]): Promise<Record<string, string | null>> {
        const promises = keys.map(key => 
            this.getCachedSetting(key).then(value => ({ key, value }))
        );
        
        const results = await Promise.all(promises);
        return results.reduce((acc, { key, value }) => {
            acc[key] = value;
            return acc;
        }, {} as Record<string, string | null>);
    }

    /**
     * Initialize default settings (useful for first-time setup)
     */
    static async initializeDefaults(): Promise<void> {
        const defaults = [
            {
                key: 'app_title',
                title: 'Application Title',
                value: 'My Application',
                type: 'string' as const
            },
            {
                key: 'pagination_limit',
                title: 'Pagination Limit',
                value: '10',
                type: 'number' as const
            },
            {
                key: 'timezone',
                title: 'Default Timezone',
                value: 'UTC',
                type: 'string' as const
            },
            {
                key: 'date_format',
                title: 'Date Format',
                value: 'MM/DD/YYYY',
                type: 'string' as const
            },
            {
                key: 'maintenance_mode',
                title: 'Maintenance Mode',
                value: 'false',
                type: 'boolean' as const
            },
            {
                key: 'last_inbox_fetch',
                title: 'Last Inbox Fetch',
                value: new Date().toISOString(),
                type: 'timestampz' as const
            },
            {
                key: 'app_installed_at',
                title: 'Application Installed At',
                value: new Date().toISOString(),
                type: 'timestampz' as const
            },
            {
                key: 'theme_settings',
                title: 'Theme Settings',
                value: JSON.stringify({
                    primaryColor: '#007bff',
                    darkMode: false,
                    sidebarCollapsed: false
                }),
                type: 'json' as const
            },
            {
                key: 'notification_settings',
                title: 'Notification Settings',
                value: JSON.stringify({
                    email: true,
                    push: true,
                    desktop: true
                }),
                type: 'json' as const
            }
        ];

        for (const setting of defaults) {
            try {
                await SettingsService.upsertSetting(setting);
            } catch (error) {
                console.error(`Error initializing default setting ${setting.key}:`, error);
            }
        }
    }
} 