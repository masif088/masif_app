import { createClient } from './client';
import { Activity, User, ActivityPriority, CreateActivityFormData, ActivityFilters, ActivityStatus, ActivityType } from '../../Types/ActivityType';
import { log } from 'console';

export class ActivityService {
    private static supabase = createClient();

    // Create a new activity
    static async createActivity(activityData: CreateActivityFormData): Promise<Activity | null> {
        try {
            const dataToInsert = {
                ...activityData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('activities')
                .insert([dataToInsert])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating activity:', error);
            throw error;
        }
    }

    // Get all activities with related data
    static async getActivities(filters?: ActivityFilters): Promise<Activity[]> {
        try {
            let query = this.supabase
                .from('activities')
                .select('*, activity_priorities(title, level,color), users(*)')
                

            // Apply filters if provided
            if (filters) {
                if (filters.status) {
                    query = query.eq('status', filters.status);
                }
                if (filters.priority) {
                    query = query.eq('priority', filters.priority);
                }
                if (filters.user_id) {
                    query = query.eq('user_id', filters.user_id);
                }
                if (filters.date_from) {
                    query = query.gte('created_at', filters.date_from);
                }
                if (filters.date_to) {
                    query = query.lte('created_at', filters.date_to);
                }
            }

            query = query.order('column_index', { ascending: true }).order('updated_at', { ascending: false });
            
            
            const { data, error } = await query;
            
        

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    }

    // Get a single activity by ID
    static async getActivityById(id: number): Promise<Activity | null> {
        try {
            const { data, error } = await this.supabase
                .from('activities')
                .select('*, activity_priorities(*), users(*)')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching activity:', error);
            throw error;
        }
    }

    // Update an activity
    static async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | null> {
        try {
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('activities')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating activity:', error);
            throw error;
        }
    }

    // Delete an activity
    static async deleteActivity(id: number): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('activities')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting activity:', error);
            throw error;
        }
    }

    // Get all users
    static async getUsers(): Promise<User[]> {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .order('first_name', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    // Get all activity priorities
    static async getActivityPriorities(): Promise<ActivityPriority[]> {
        try {
            const { data, error } = await this.supabase
                .from('activity_priorities')
                .select('*')
                .order('title', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching activity priorities:', error);
            throw error;
        }
    }

    static async getActivityStatus(): Promise<ActivityStatus[]> {
        try {
            const { data, error } = await this.supabase
                .from('activity_statuses')
                .select('*')
                .order('order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching activity priorities:', error);
            throw error;
        }
    }

    // Get all activity types
    static async getActivityTypes(): Promise<ActivityType[]> {
        try {
            const { data, error } = await this.supabase
                .from('activity_types')
                .select('*')
                .order('title', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching activity types:', error);
            throw error;
        }
    }

    // Get activities by user ID
    static async getActivitiesByUser(userId: string): Promise<Activity[]> {
        try {
            const { data, error } = await this.supabase
                .from('activities')
                .select('*, activity_priorities(*), users(*)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching user activities:', error);
            throw error;
        }
    }

    // Search activities by title or description
    static async searchActivities(searchTerm: string): Promise<Activity[]> {
        try {
            const { data, error } = await this.supabase
                .from('activities')
                .select('*, activity_priorities(*), users(*)')
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching activities:', error);
            throw error;
        }
    }

    // Get activity statistics
    static async getActivityStats(): Promise<{
        total: number;
        open: number;
        inProgress: number;
        testing: number;
        done: number;
        others: number;
    }> {
        try {
            const { data, error } = await this.supabase
                .from('activities')
                .select('status');

            if (error) throw error;

            const activities = data || [];
            const stats = {
                total: activities.length,
                open: activities.filter(a => a.status === 'Open').length,
                inProgress: activities.filter(a => a.status === 'InProgress').length,
                testing: activities.filter(a => a.status === 'Testing').length,
                done: activities.filter(a => a.status === 'Done').length,
                others: activities.filter(a => a.status === 'Others').length,
            };

            return stats;
        } catch (error) {
            console.error('Error fetching activity stats:', error);
            throw error;
        }
    }

    // Initialize column indices for activities that don't have them

} 