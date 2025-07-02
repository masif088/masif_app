import { createClient } from './client';
import { Activity, User, ActivityPriority, CreateActivityFormData, ActivityFilters, ActivityStatus, ActivityType, ActivityNote, EmailData, ContactEmail, CreateContactEmailData } from '../../Types/ActivityType';
import { log } from 'console';
import Cookies from 'js-cookie';

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

    // Activity Notes Methods
    static async getActivityNotes(activityId: number): Promise<ActivityNote[]> {
        try {
            const { data, error } = await this.supabase
                .from('activity_notes')
                .select('*, users(*)')
                .eq('activity_id', activityId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching activity notes:', error);
            throw error;
        }
    }

    static async createActivityNote(noteData: Omit<ActivityNote, 'id' | 'created_at' | 'updated_at'>): Promise<ActivityNote | null> {
        try {
            const dataToInsert = {
                ...noteData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('activity_notes')
                .insert([dataToInsert])
                .select('*, users(*)')
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating activity note:', error);
            throw error;
        }
    }

    static async updateActivityNote(id: number, updates: Partial<ActivityNote>): Promise<ActivityNote | null> {
        try {
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('activity_notes')
                .update(updateData)
                .eq('id', id)
                .select('*, users(*)')
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating activity note:', error);
            throw error;
        }
    }

    static async deleteActivityNote(id: number): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('activity_notes')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting activity note:', error);
            throw error;
        }
    }

    // Email Methods
    static async sendActivityEmail(emailData: EmailData): Promise<boolean> {
        try {
            // Send email via API route
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: emailData.to,
                    cc: emailData.cc,
                    bcc: emailData.bcc,
                    subject: emailData.subject,
                    body: emailData.body,
                    activity_id: emailData.activity_id,
                    user_id: emailData.user_id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send email');
            }
            
            const user_id = JSON.parse(Cookies.get('user') || '{}').id;
            // Store email record in database
            const { error } = await this.supabase
                .from('activity_emails')
                .insert([{
                    activity_id: emailData.activity_id,
                    user_id: user_id,
                    to_emails: emailData.to,
                    cc_emails: emailData.cc || [],
                    bcc_emails: emailData.bcc || [],
                    subject: emailData.subject,
                    body: emailData.body,
                    status: 'sent'
                }]);

            if (error) throw error;
            
            return true;
        } catch (error) {
            console.error('Error sending email:'+Cookies.get('user_id'), error);
            throw error;
        }
    }

    static async getActivityEmails(activityId: number): Promise<any[]> {
        try {
            const { data, error } = await this.supabase
                .from('activity_emails')
                .select('*')
                .eq('activity_id', activityId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching activity emails:', error);
            throw error;
        }
    }

    // Contact Email Methods
    static async getContactEmails(): Promise<ContactEmail[]> {
        try {
            const user_id = JSON.parse(Cookies.get('user') || '{}').id;
            const { data, error } = await this.supabase
                .from('contact_emails')
                .select('*')
                .eq('user_id', user_id)
                .order('is_favorite', { ascending: false })
                .order('name', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching contact emails:', error);
            throw error;
        }
    }

    static async createContactEmail(contactData: CreateContactEmailData): Promise<ContactEmail | null> {
        try {
            const user_id = JSON.parse(Cookies.get('user') || '{}').id;
            const dataToInsert = {
                ...contactData,
                user_id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('contact_emails')
                .insert([dataToInsert])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating contact email:', error);
            throw error;
        }
    }

    static async updateContactEmail(id: number, updates: Partial<ContactEmail>): Promise<ContactEmail | null> {
        try {
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('contact_emails')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating contact email:', error);
            throw error;
        }
    }

    static async deleteContactEmail(id: number): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('contact_emails')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting contact email:', error);
            throw error;
        }
    }

    static async toggleFavorite(id: number, isFavorite: boolean): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('contact_emails')
                .update({ is_favorite: isFavorite })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            throw error;
        }
    }

} 