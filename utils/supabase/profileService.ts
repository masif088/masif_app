import { log } from 'console';
import { createClient } from './client';

export interface ProfileData {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    username?: string;
    company_id?: number | null;
    company?: {
        name: string;
    };
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    about_me?: string;
    website?: string;
    avatar?: string;
    created_at?: string;
    updated_at?: string;
    role?: string;
    phone?: string;
    skills?: string;
}

export interface ProjectData {
    id?: number;
    user_id: string;
    project_name: string;
    date: string;
    status: string;
    price: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export class ProfileService {
    private static supabase = createClient();
    private static tableName = 'users';

    // Get current user profile
    static async getCurrentUserProfile(): Promise<ProfileData | null> {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    // Update user profile
    static async updateProfile(profileData: Partial<ProfileData>): Promise<ProfileData | null> {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const updateData = {
                ...profileData,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from(this.tableName)
                .upsert({
                    id: user.id,
                    ...updateData
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    // Upload profile image
    static async uploadProfileImage(file: File): Promise<string | null> {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `/profile_path/${fileName}`;

            const { error: uploadError } = await this.supabase.storage
                .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_STORAGE || 'masif-app')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            console.log(uploadError);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = this.supabase.storage
                .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_STORAGE || 'masif-app')
                .getPublicUrl(filePath);

            // Update profile with new avatar URL
            await this.updateProfile({ avatar: data.publicUrl });

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading profile image:', error);
            throw error;
        }
    }

    // Get user projects
    static async getUserProjects(): Promise<ProjectData[]> {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await this.supabase
                .from('user_projects')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching user projects:', error);
            throw error;
        }
    }

    // Create new project
    static async createProject(projectData: Omit<ProjectData, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<ProjectData | null> {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const dataToInsert = {
                ...projectData,
                user_id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('user_projects')
                .insert([dataToInsert])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }

    // Update project
    static async updateProject(id: number, updates: Partial<ProjectData>): Promise<ProjectData | null> {
        try {
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('user_projects')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    }

    // Delete project
    static async deleteProject(id: number): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('user_projects')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }

    // Get countries list
    static async getCountries(): Promise<{ id: number; name: string; code: string }[]> {
        // This could be fetched from a countries table or returned as static data
        return [
            { id: 1, name: 'Germany', code: 'DE' },
            { id: 2, name: 'Canada', code: 'CA' },
            { id: 3, name: 'United States', code: 'US' },
            { id: 4, name: 'Australia', code: 'AU' },
            { id: 5, name: 'United Kingdom', code: 'GB' },
            { id: 6, name: 'France', code: 'FR' },
            { id: 7, name: 'Japan', code: 'JP' },
            { id: 8, name: 'India', code: 'IN' }
        ];
    }
} 