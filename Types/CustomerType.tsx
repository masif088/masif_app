export interface Customer {
  id: string;
  name: string;
  register_at: string;
  created_at: string;
  updated_at: string;
  details?: CustomerDetail[];
}

export interface CustomerDataTemplate {
  id: string;
  title: string;
  key: string;
  group?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerDetail {
  id: string;
  customer_id: string;
  customer_data_template_id: string;
  value?: string;
  created_at: string;
  updated_at: string;
  template?: CustomerDataTemplate;
}

export interface CreateCustomerData {
  name: string;
  register_at?: string;
}

export interface UpdateCustomerData {
  name?: string;
  register_at?: string;
}

export interface CreateCustomerDetailData {
  customer_id: string;
  customer_data_template_id: string;
  value?: string;
}

export interface UpdateCustomerDetailData {
  value?: string;
}

export interface CustomerStats {
  total: number;
  recentCustomers: Customer[];
  totalDetails: number;
}

export interface CustomerFormData {
  name: string;
  register_at: string;
  details?: { template_id: string; value: string }[];
}

export interface CustomerContentTemplate {
  id: string;
  name: string;
  content: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContentTemplateData {
  name: string;
  content: string;
  description?: string;
}

export interface UpdateContentTemplateData {
  name?: string;
  content?: string;
  description?: string;
}

