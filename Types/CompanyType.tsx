export interface Company {
  id: number;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  industry?: string;
  founded_date?: string;
  is_active: boolean;
  leader_id?: string;
  created_at: string;
  updated_at: string;
  leader?: CompanyUser;
  members?: CompanyMember[];
}

export interface CompanyMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  avatar?: string;
  company_id: number;
}

export interface CompanyUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface CreateCompanyData {
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  industry?: string;
  founded_date?: string;
  is_active?: boolean;
  leader_id?: string;
}

export interface UpdateCompanyData {
  name?: string;
  description?: string;
  website?: string;
  logo?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  industry?: string;
  founded_date?: string;
  is_active?: boolean;
  leader_id?: string;
}

export interface CompanyStats {
  total: number;
  active: number;
  byIndustry: Record<string, number>;
  totalMembers: number;
  totalLeaders: number;
  recentCompanies: Company[];
}

export interface CompanyFilters {
  name?: string;
  industry?: string;
  is_active?: boolean;
  has_leader?: boolean;
}

export interface CompanyFormData {
  name: string;
  description: string;
  website: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  industry: string;
  founded_date: string;
  leader_id?: string;
  logo?: File | null;
} 