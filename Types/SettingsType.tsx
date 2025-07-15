export interface Setting {
    key: string;
    title: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'timestampz' | 'json' | 'image' | 'email' | 'url' | 'textarea';
    created_at: string;
    updated_at: string;
}

export interface CreateSettingData {
    key: string;
    title: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'timestampz' | 'json' | 'image' | 'email' | 'url' | 'textarea';
}

export interface UpdateSettingData {
    title?: string;
    value?: string;
    type?: 'string' | 'number' | 'boolean' | 'date' | 'timestampz' | 'json' | 'image' | 'email' | 'url' | 'textarea';
}

export interface SettingsGroup {
    key: string;
    title: string;
    settings: Setting[];
} 