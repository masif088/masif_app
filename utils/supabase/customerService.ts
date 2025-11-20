import { createClient } from './client';
import {
  Customer,
  CustomerDataTemplate,
  CustomerDetail,
  CreateCustomerData,
  UpdateCustomerData,
  CreateCustomerDetailData,
  UpdateCustomerDetailData,
  CustomerStats,
  CustomerContentTemplate,
  CreateContentTemplateData,
  UpdateContentTemplateData,
} from '../../Types/CustomerType';

export class CustomerService {
  private static supabase = createClient();

  // Get current user ID
  private static async getUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  // Get all customers
  static async getAllCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .select(`
          *,
          user_id,
          user:users(
              id,
              first_name,
              last_name,
              email,
              avatar
          ),
          details:customer_details(
            id,
            customer_id,
            customer_data_template_id,
            value,
            created_at,
            updated_at,
            template:customer_data_templates(
              id,
              title,
              key
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Get customer by ID
  static async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .select(`
          *,
          user_id,
          details:customer_details(
            id,
            customer_id,
            customer_data_template_id,
            value,
            created_at,
            updated_at,
            template:customer_data_templates(
              id,
              title,
              key
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  // Create a new customer
  static async createCustomer(customerData: CreateCustomerData): Promise<Customer | null> {
    try {
      // Get current user ID if not provided
      const userId = customerData.user_id || await this.getUserId();
      
      const dataToInsert = {
        ...customerData,
        user_id: userId,
      };

      const { data, error } = await this.supabase
        .from('customers')
        .insert([dataToInsert])
        .select(`
          *,
          user_id,
          details:customer_details(
            id,
            customer_id,
            customer_data_template_id,
            value,
            created_at,
            updated_at,
            template:customer_data_templates(
              id,
              title,
              key
            )
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Update a customer
  static async updateCustomer(id: string, updates: UpdateCustomerData): Promise<Customer | null> {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          user_id,
          details:customer_details(
            id,
            customer_id,
            customer_data_template_id,
            value,
            created_at,
            updated_at,
            template:customer_data_templates(
              id,
              title,
              key
            )
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Delete a customer
  static async deleteCustomer(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Get all customer data templates
  static async getAllTemplates(): Promise<CustomerDataTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('customer_data_templates')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      
      // Sort: "general" group first, then others, then by title
      const sorted = (data || []).sort((a, b) => {
        const aGroup = (a.group || '').toLowerCase();
        const bGroup = (b.group || '').toLowerCase();
        
        // If one is "general" and the other is not, "general" comes first
        if (aGroup === 'general' && bGroup !== 'general') return -1;
        if (bGroup === 'general' && aGroup !== 'general') return 1;
        
        // If both have groups, sort by group name
        if (aGroup && bGroup && aGroup !== bGroup) {
          return aGroup.localeCompare(bGroup);
        }
        
        // Then sort by title
        return (a.title || '').localeCompare(b.title || '');
      });
      
      return sorted;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  // Create a new template
  static async createTemplate(templateData: { title: string; key: string }): Promise<CustomerDataTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('customer_data_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  // Update a template
  static async updateTemplate(id: string, updates: { title?: string; key?: string }): Promise<CustomerDataTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('customer_data_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  // Delete a template
  static async deleteTemplate(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('customer_data_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  // Get customer details
  static async getCustomerDetails(customerId: string): Promise<CustomerDetail[]> {
    try {
      const { data, error } = await this.supabase
        .from('customer_details')
        .select(`
          *,
          template:customer_data_templates(
            id,
            title,
            key
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching customer details:', error);
      throw error;
    }
  }

  // Create customer detail
  static async createCustomerDetail(detailData: CreateCustomerDetailData): Promise<CustomerDetail | null> {
    try {
      const { data, error } = await this.supabase
        .from('customer_details')
        .insert([detailData])
        .select(`
          *,
          template:customer_data_templates(
            id,
            title,
            key
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating customer detail:', error);
      throw error;
    }
  }

  // Update customer detail
  static async updateCustomerDetail(id: string, updates: UpdateCustomerDetailData): Promise<CustomerDetail | null> {
    try {
      const { data, error } = await this.supabase
        .from('customer_details')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          template:customer_data_templates(
            id,
            title,
            key
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating customer detail:', error);
      throw error;
    }
  }

  // Delete customer detail
  static async deleteCustomerDetail(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('customer_details')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting customer detail:', error);
      throw error;
    }
  }

  // Upsert customer detail (create or update if exists)
  static async upsertCustomerDetail(
    customerId: string,
    templateId: string,
    value: string
  ): Promise<CustomerDetail | null> {
    try {
      // First, try to find existing detail
      const { data: existing } = await this.supabase
        .from('customer_details')
        .select('id')
        .eq('customer_id', customerId)
        .eq('customer_data_template_id', templateId)
        .single();

      if (existing) {
        // Update existing
        return await this.updateCustomerDetail(existing.id, { value });
      } else {
        // Create new
        return await this.createCustomerDetail({
          customer_id: customerId,
          customer_data_template_id: templateId,
          value,
        });
      }
    } catch (error) {
      console.error('Error upserting customer detail:', error);
      throw error;
    }
  }

  // Get customer statistics
  static async getCustomerStats(): Promise<CustomerStats> {
    try {
      // Get total customers
      const { data: customers, error: customersError } = await this.supabase
        .from('customers')
        .select('id');

      if (customersError) throw customersError;

      // Get total details
      const { data: details, error: detailsError } = await this.supabase
        .from('customer_details')
        .select('id');

      if (detailsError) throw detailsError;

      // Get recent customers
      const { data: recentCustomers, error: recentError } = await this.supabase
        .from('customers')
        .select(`
          *,
          user_id,
          details:customer_details(
            id,
            customer_id,
            customer_data_template_id,
            value,
            created_at,
            updated_at,
            template:customer_data_templates(
              id,
              title,
              key
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      return {
        total: customers?.length || 0,
        totalDetails: details?.length || 0,
        recentCustomers: recentCustomers || [],
      };
    } catch (error) {
      console.error('Error getting customer stats:', error);
      throw error;
    }
  }

  // Search customers
  static async searchCustomers(searchTerm: string): Promise<Customer[]> {
    try {
      const { data, error } = await this.supabase
        .from('customers')
        .select(`
          *,
          user_id,
          details:customer_details(
            id,
            customer_id,
            customer_data_template_id,
            value,
            created_at,
            updated_at,
            template:customer_data_templates(
              id,
              title,
              key
            )
          )
        `)
        .ilike('name', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  // ========== Content Template Methods ==========

  // Get all content templates
  static async getAllContentTemplates(): Promise<CustomerContentTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('customer_content_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching content templates:', error);
      throw error;
    }
  }

  // Get content template by ID
  static async getContentTemplateById(id: string): Promise<CustomerContentTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('customer_content_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching content template:', error);
      throw error;
    }
  }

  // Create a new content template
  static async createContentTemplate(templateData: CreateContentTemplateData): Promise<CustomerContentTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('customer_content_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating content template:', error);
      throw error;
    }
  }

  // Update a content template
  static async updateContentTemplate(id: string, updates: UpdateContentTemplateData): Promise<CustomerContentTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('customer_content_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating content template:', error);
      throw error;
    }
  }

  // Delete a content template
  static async deleteContentTemplate(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('customer_content_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting content template:', error);
      throw error;
    }
  }

  // Generate content from template with customer data
  static generateContentFromTemplate(template: CustomerContentTemplate, customer: Customer): string {
    let content = template.content;

    // Helper function to normalize key for matching (case insensitive, normalize spaces/underscores)
    const normalizeKey = (key: string): string => {
      return key.toLowerCase().replace(/[\s_]+/g, ' ').trim();
    };

    // Helper function to match and replace placeholder
    const replacePlaceholder = (pattern: string, value: string) => {
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      content = content.replace(new RegExp(escapedPattern, 'gi'), value);
    };

    // Replace {[name]} with customer name
    replacePlaceholder('{[name]}', customer.name || '');
    // Also support {{name}} format
    replacePlaceholder('{{name}}', customer.name || '');

    // Replace other placeholders from customer details
    if (customer.details && customer.details.length > 0) {
      customer.details.forEach((detail) => {
        if (detail.template?.key && detail.value) {
          const key = detail.template.key;
          const normalizedKey = normalizeKey(key);
          
          // Support {[key]} format
          replacePlaceholder(`{[${key}]}`, detail.value);
          
          // Support {{key}} format
          replacePlaceholder(`{{${key}}}`, detail.value);
          
          // Support [{{key}}] format
          replacePlaceholder(`[{{${key}}}]`, detail.value);
          
          // Also try matching with normalized key for flexible matching
          // This handles cases where template uses "Primary CTA" but key is "primary_cta"
          if (normalizedKey !== key.toLowerCase()) {
            replacePlaceholder(`{{${normalizedKey}}}`, detail.value);
            replacePlaceholder(`[{{${normalizedKey}}}]`, detail.value);
          }
        }
      });
      
      // Also try to match any remaining placeholders by checking all template keys
      // This handles cases where placeholder in template doesn't exactly match the key
      // Find all placeholders in content and try to match them
      const placeholderPatterns = [
        /\{\{([^}]+)\}\}/g,  // {{key}}
        /\[\{\{([^}]+)\}\}\]/g,  // [{{key}}]
        /\{\[([^\]]+)\]\}/g  // {[key]}
      ];
      
      placeholderPatterns.forEach(pattern => {
        let match;
        // Reset regex lastIndex to avoid issues
        pattern.lastIndex = 0;
        while ((match = pattern.exec(content)) !== null) {
          const placeholderKey = match[1]?.trim();
          if (placeholderKey && customer.details) {
            const normalizedPlaceholder = normalizeKey(placeholderKey);
            // Try to find matching detail
            const matchingDetail = customer.details.find(d => {
              if (!d.template?.key || !d.value) return false;
              return normalizeKey(d.template.key) === normalizedPlaceholder;
            });
            
            if (matchingDetail && matchingDetail.value) {
              replacePlaceholder(match[0], matchingDetail.value);
            }
          }
        }
      });
    }

    // Replace any remaining unmatched placeholders with empty string
    // Do this multiple times to catch nested or complex patterns
    let previousContent = '';
    let iterations = 0;
    while (previousContent !== content && iterations < 10) {
      previousContent = content;
      iterations++;
      
      // Support {[key]} format - matches {[anything]}
      content = content.replace(/\{\[[^\]]*\]\}/g, '');
      // Support {{key}} format - matches {{anything}}
      content = content.replace(/\{\{[^}]*\}\}/g, '');
      // Support [{{key}}] format - matches [{{anything}}]
      content = content.replace(/\[\{\{[^}]*\}\}\]/g, '');
    }

    return content;
  }
}

