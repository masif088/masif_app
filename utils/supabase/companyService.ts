import { createClient } from './client';
import { 
  Company, 
  CreateCompanyData, 
  UpdateCompanyData, 
  CompanyStats,
  CompanyMember
} from '../../Types/CompanyType';

export class CompanyService {
  private static supabase = createClient();

  // Get all companies
  static async getAllCompanies(): Promise<Company[]> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('*, leader:users!leader_id(id, first_name, last_name, email, avatar, role)')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  // Get company by ID
  static async getCompanyById(id: number): Promise<Company | null> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select(`
          *,
          leader:users!leader_id(
            id,
            first_name,
            last_name,
            email,
            avatar,
            role
          ),
          members:users!company_id(
            id,
            first_name,
            last_name,
            email,
            role,
            avatar,
            company_id
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  }

  // Create a new company
  static async createCompany(companyData: CreateCompanyData): Promise<Company | null> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .insert([companyData])
        .select(`
          *,
          leader:users!leader_id(
            id,
            first_name,
            last_name,
            email,
            avatar,
            role
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  // Update a company
  static async updateCompany(id: number, updates: UpdateCompanyData): Promise<Company | null> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          leader:users!leader_id(
            id,
            first_name,
            last_name,
            email,
            avatar,
            role
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  // Delete a company
  static async deleteCompany(id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  // Search companies
  static async searchCompanies(searchTerm: string): Promise<Company[]> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select(`
          *,
          leader:users!leader_id(
            id,
            first_name,
            last_name,
            email,
            avatar,
            role
          )
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching companies:', error);
      throw error;
    }
  }

  // Get companies by industry
  static async getCompaniesByIndustry(industry: string): Promise<Company[]> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select(`
          *,
          leader:users!leader_id(
            id,
            first_name,
            last_name,
            email,
            avatar,
            role
          )
        `)
        .eq('industry', industry)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching companies by industry:', error);
      throw error;
    }
  }

  // Upload company logo
  static async uploadCompanyLogo(file: File, companyId: number): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}_${Date.now()}.${fileExt}`;
      const filePath = `companies/${fileName}`;

      const { error: uploadError } = await this.supabase.storage
        .from('company-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = this.supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      // Update company with new logo URL
      const { error: updateError } = await this.supabase
        .from('companies')
        .update({ logo: publicUrl })
        .eq('id', companyId);

      if (updateError) throw updateError;

      return publicUrl;
    } catch (error) {
      console.error('Error uploading company logo:', error);
      throw error;
    }
  }

  // Update company leader
  static async updateCompanyLeader(companyId: number, leaderId: string): Promise<Company | null> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .update({ leader_id: leaderId })
        .eq('id', companyId)
        .select(`
          *,
          leader:users!leader_id(
            id,
            first_name,
            last_name,
            email,
            avatar,
            role
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating company leader:', error);
      throw error;
    }
  }

  // Remove company leader
  static async removeCompanyLeader(companyId: number): Promise<Company | null> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .update({ leader_id: null })
        .eq('id', companyId)
        .select(`
          *,
          leader:users!leader_id(
            id,
            first_name,
            last_name,
            email,
            avatar,
            role
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error removing company leader:', error);
      throw error;
    }
  }

  // Get company members
  static async getCompanyMembers(companyId: number): Promise<CompanyMember[]> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          role,
          avatar,
          company_id
        `)
        .eq('company_id', companyId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching company members:', error);
      throw error;
    }
  }

  // Assign user to company
  static async assignUserToCompany(userId: string, companyId: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({ company_id: companyId })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error assigning user to company:', error);
      throw error;
    }
  }

  // Remove user from company
  static async removeUserFromCompany(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({ company_id: null })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing user from company:', error);
      throw error;
    }
  }

  // Get company statistics
  static async getCompanyStats(): Promise<CompanyStats> {
    try {
      // Get total companies
      const { data: companies, error: companiesError } = await this.supabase
        .from('companies')
        .select('id, industry, is_active, leader_id');

      if (companiesError) throw companiesError;

      // Get total members
      const { data: members, error: membersError } = await this.supabase
        .from('users')
        .select('id, company_id')
        .not('company_id', 'is', null);

      if (membersError) throw membersError;

      // Get recent companies
      const { data: recentCompanies, error: recentError } = await this.supabase
        .from('companies')
        .select(`
          *,
          leader:users!leader_id(
            id,
            first_name,
            last_name,
            email,
            avatar,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Calculate stats
      const total = companies?.length || 0;
      const active = companies?.filter(c => c.is_active).length || 0;
      const totalMembers = members?.length || 0;
      const totalLeaders = companies?.filter(c => c.leader_id).length || 0;

      // Group by industry
      const byIndustry = companies?.reduce((acc, company) => {
        if (company.industry) {
          acc[company.industry] = (acc[company.industry] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        total,
        active,
        totalMembers,
        totalLeaders,
        byIndustry,
        recentCompanies: recentCompanies || []
      };
    } catch (error) {
      console.error('Error getting company stats:', error);
      throw error;
    }
  }
} 