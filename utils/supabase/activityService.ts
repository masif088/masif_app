import { createClient } from './client';
import { Activity, User, ActivityPriority, CreateActivityPriorityData, CreateActivityFormData, ActivityFilters, ActivityStatus, CreateActivityStatusData, ActivityType, CreateActivityTypeData, ActivityNote, EmailData, ContactEmail, CreateContactEmailData, ContactEmailCategory, CreateContactEmailCategoryData } from '../../Types/ActivityType';
import { log } from 'console';
import Cookies from 'js-cookie';
import { EmailMessage } from 'utils/imapService';

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
                .order('level', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching activity priorities:', error);
            throw error;
        }
    }

    // Create a new activity priority
    static async createActivityPriority(priorityData: CreateActivityPriorityData): Promise<ActivityPriority | null> {
        try {
            const dataToInsert = {
                ...priorityData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('activity_priorities')
                .insert([dataToInsert])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating activity priority:', error);
            throw error;
        }
    }

    // Update an activity priority
    static async updateActivityPriority(title: string, updates: Partial<ActivityPriority>): Promise<ActivityPriority | null> {
        try {
            const { data, error } = await this.supabase
                .from('activity_priorities')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('title', title)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating activity priority:', error);
            throw error;
        }
    }

    // Delete an activity priority
    static async deleteActivityPriority(title: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('activity_priorities')
                .delete()
                .eq('title', title);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting activity priority:', error);
            throw error;
        }
    }

    // Get activity priority by title
    static async getActivityPriorityByTitle(title: string): Promise<ActivityPriority | null> {
        try {
            const { data, error } = await this.supabase
                .from('activity_priorities')
                .select('*')
                .eq('title', title)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching activity priority:', error);
            throw error;
        }
    }

    static async getActivityStatus(): Promise<ActivityStatus[]> {
        try {
            const { data, error } = await this.supabase
                .from('activity_statuses')
                .select('*')
                .order('level', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching activity statuses:', error);
            throw error;
        }
    }

    // Alias for getActivityStatus (plural)
    static async getActivityStatuses(): Promise<ActivityStatus[]> {
        return this.getActivityStatus();
    }

    // Create a new activity status
    static async createActivityStatus(statusData: CreateActivityStatusData): Promise<ActivityStatus | null> {
        try {
            const dataToInsert = {
                ...statusData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('activity_statuses')
                .insert([dataToInsert])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating activity status:', error);
            throw error;
        }
    }

    // Update an activity status by title
    static async updateActivityStatus(title: string, updates: Partial<ActivityStatus>): Promise<ActivityStatus | null> {
        try {
            const dataToUpdate = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('activity_statuses')
                .update(dataToUpdate)
                .eq('title', title)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating activity status:', error);
            throw error;
        }
    }

    // Delete an activity status by title
    static async deleteActivityStatus(title: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('activity_statuses')
                .delete()
                .eq('title', title);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting activity status:', error);
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

    // Create a new activity type
    static async createActivityType(typeData: CreateActivityTypeData): Promise<ActivityType | null> {
        try {
            const dataToInsert = {
                ...typeData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('activity_types')
                .insert([dataToInsert])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating activity type:', error);
            throw error;
        }
    }

    // Update an activity type
    static async updateActivityType(id: number, updates: Partial<CreateActivityTypeData>): Promise<ActivityType | null> {
        try {
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('activity_types')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating activity type:', error);
            throw error;
        }
    }

    // Delete an activity type
    static async deleteActivityType(id: number): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('activity_types')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting activity type:', error);
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

    static async createActivityNoteWithTime(noteData: Omit<ActivityNote, 'id'>): Promise<ActivityNote | null> {
        try {
            const dataToInsert = {
                ...noteData,
                // created_at: new Date().toISOString(),
                // updated_at: new Date().toISOString()
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
                    body: emailData.body + `<br>This from ticket/activity <span style="color: red;" id="activity-id-${emailData.activity_id}">#${emailData.activity_id}</span> please let me know if you have question<br><br><!-- ACTIVITY_METADATA: {"activity_id": ${emailData.activity_id}} -->`,
                    activity_id: emailData.activity_id,
                    user_id: emailData.user_id
                }),
            });

            console.log('Sending email:', emailData);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send email');
            }
            
            // Email sent successfully - database logging is handled by the API route
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

    // Contact Email Categories Methods
    static async getContactEmailCategories(): Promise<ContactEmailCategory[]> {
        try {
            const user_id = JSON.parse(Cookies.get('user') || '{}').id;
            const { data, error } = await this.supabase
                .from('contact_email_categories')
                .select('*')
                .eq('user_id', user_id)
                .order('is_default', { ascending: false })
                .order('name', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching contact email categories:', error);
            throw error;
        }
    }

    static async createContactEmailCategory(categoryData: CreateContactEmailCategoryData): Promise<ContactEmailCategory | null> {
        try {
            const user_id = JSON.parse(Cookies.get('user') || '{}').id;
            const dataToInsert = {
                ...categoryData,
                user_id,
                color: categoryData.color || 'primary',
                is_default: categoryData.is_default || false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('contact_email_categories')
                .insert([dataToInsert])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating contact email category:', error);
            throw error;
        }
    }

    static async initializeDefaultCategories(): Promise<void> {
        try {
            const user_id = JSON.parse(Cookies.get('user') || '{}').id;
            
            // Check if user already has categories
            const { data: existingCategories, error: checkError } = await this.supabase
                .from('contact_email_categories')
                .select('id')
                .eq('user_id', user_id)
                .limit(1);

            if (checkError) throw checkError;

            // If user has no categories, create default ones
            if (!existingCategories || existingCategories.length === 0) {
                const defaultCategories = [
                    { name: 'General', color: 'primary', is_default: true },
                    { name: 'Work', color: 'info', is_default: false },
                    { name: 'Personal', color: 'success', is_default: false },
                    { name: 'Family', color: 'warning', is_default: false },
                    { name: 'Friends', color: 'secondary', is_default: false },
                    { name: 'Business', color: 'danger', is_default: false }
                ];

                const categoriesToInsert = defaultCategories.map(cat => ({
                    ...cat,
                    user_id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }));

                const { error: insertError } = await this.supabase
                    .from('contact_email_categories')
                    .insert(categoriesToInsert);

                if (insertError) throw insertError;
            }
        } catch (error) {
            console.error('Error initializing default categories:', error);
            throw error;
        }
    }

    static async createActivityFromEmail(email: EmailMessage): Promise<Activity | null> {
        try {
            const dataToInsert = {
                title: email.subject,
                description: email.body,
                user_id: JSON.parse(Cookies.get('user') || '{}').id,
                status: 'Open',
                priority: 'Low',
                type: 'Email',
                column_index: 0,
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
            console.error('Error creating activity from email:', error);
            throw error;
        }
    }

} 