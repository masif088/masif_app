import { createClient } from './client';
import { ProfileData } from './profileService';

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username?: string;
  company_id?: number | null;
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
  company_id?: number | null;
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
      
      // Fetch company names for users with company_id
      const usersWithCompanies = await Promise.all(
        (data || []).map(async (user) => {
          if (user.company_id) {
            const { data: companyData } = await this.supabase
              .from('companies')
              .select('name')
              .eq('id', user.company_id)
              .single();
            
            return {
              ...user,
              company: companyData ? { name: companyData.name } : null
            };
          }
          return {
            ...user,
            company: null
          };
        })
      );

      return usersWithCompanies;
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
      
      // Fetch company name if user has company_id
      if (data && data.company_id) {
        const { data: companyData } = await this.supabase
          .from('companies')
          .select('name')
          .eq('id', data.company_id)
          .single();
        
        return {
          ...data,
          company: companyData ? { name: companyData.name } : null
        };
      }
      
      return {
        ...data,
        company: null
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Create new user
  static async createUser(userData: CreateUserData): Promise<ProfileData | null> {
    try {
      // Create user via API route
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      return result.user;
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
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,role.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch company names for users with company_id
      const usersWithCompanies = await Promise.all(
        (data || []).map(async (user) => {
          if (user.company_id) {
            const { data: companyData } = await this.supabase
              .from('companies')
              .select('name')
              .eq('id', user.company_id)
              .single();
            
            return {
              ...user,
              company: companyData ? { name: companyData.name } : null
            };
          }
          return {
            ...user,
            company: null
          };
        })
      );

      return usersWithCompanies;
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
  static async getUsersByCompany(companyId: number): Promise<ProfileData[]> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users by company:', error);
      throw error;
    }
  }

  // Get users without company
  static async getUsersWithoutCompany(): Promise<ProfileData[]> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .is('company_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Return users with null company
      return (data || []).map(user => ({
        ...user,
        company: null
      }));
    } catch (error) {
      console.error('Error fetching users without company:', error);
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
    withoutCompany: number;
    byRole: Record<string, number>;
    byCompany: Record<string, number>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('role, company_id');

      if (error) throw error;

      const total = data?.length || 0;
      const withoutCompany = data?.filter(user => !user.company_id).length || 0;
      const byRole: Record<string, number> = {};
      const byCompany: Record<string, number> = {};

      // Get unique company IDs
      const companyIds = Array.from(new Set(data?.filter(user => user.company_id).map(user => user.company_id) || []));
      
      // Fetch company names
      let companyNames: Record<number, string> = {};
      if (companyIds.length > 0) {
        const { data: companiesData } = await this.supabase
          .from('companies')
          .select('id, name')
          .in('id', companyIds);
        
        companyNames = (companiesData || []).reduce((acc, company) => {
          acc[company.id] = company.name;
          return acc;
        }, {} as Record<number, string>);
      }

      data?.forEach(user => {
        if (user.role) {
          byRole[user.role] = (byRole[user.role] || 0) + 1;
        }
        if (user.company_id && companyNames[user.company_id]) {
          byCompany[companyNames[user.company_id]] = (byCompany[companyNames[user.company_id]] || 0) + 1;
        }
      });

      return { total, withoutCompany, byRole, byCompany };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }
} 