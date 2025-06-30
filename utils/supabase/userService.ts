import { createClient } from './client';
import { ProfileData } from './profileService';

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username?: string;
  company?: string;
  role?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  about_me?: string;
  website?: string;
  skills?: string;
  avatar?: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  company?: string;
  role?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  about_me?: string;
  website?: string;
  skills?: string;
  avatar?: string;
}

export class UserService {
  private static supabase = createClient();

  // Get all users
  static async getAllUsers(): Promise<ProfileData[]> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Create new user
  static async createUser(userData: CreateUserData): Promise<ProfileData | null> {
    try {
      // Create user in auth
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name
        }
      });

      if (authError) throw authError;

      // Insert into users table
      const { data, error } = await this.supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          username: userData.username,
          company: userData.company,
          role: userData.role,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          postal_code: userData.postal_code,
          country: userData.country,
          about_me: userData.about_me,
          website: userData.website,
          skills: userData.skills,
          avatar: userData.avatar
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(id: string, userData: UpdateUserData): Promise<ProfileData | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    try {
      // Delete from users table
      const { error: userError } = await this.supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (userError) throw userError;

      // Delete from auth (optional - you might want to keep auth user)
      // const { error: authError } = await this.supabase.auth.admin.deleteUser(id);
      // if (authError) throw authError;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Search users
  static async searchUsers(searchTerm: string): Promise<ProfileData[]> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Get users by role
  static async getUsersByRole(role: string): Promise<ProfileData[]> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  // Get users by company
  static async getUsersByCompany(company: string): Promise<ProfileData[]> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('company', company)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users by company:', error);
      throw error;
    }
  }

  // Upload user image
  static async uploadUserImage(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `masif_app/profile_path/${fileName}`;

      const { error: uploadError } = await this.supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_STORAGE || 'masif-app')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = this.supabase.storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_STORAGE || 'masif-app')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading user image:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
    byCompany: Record<string, number>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('role, company');

      if (error) throw error;

      const total = data?.length || 0;
      const byRole: Record<string, number> = {};
      const byCompany: Record<string, number> = {};

      data?.forEach(user => {
        if (user.role) {
          byRole[user.role] = (byRole[user.role] || 0) + 1;
        }
        if (user.company) {
          byCompany[user.company] = (byCompany[user.company] || 0) + 1;
        }
      });

      return { total, byRole, byCompany };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }
} 