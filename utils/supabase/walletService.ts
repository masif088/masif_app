import { createClient } from './client';
import { 
  Wallet, 
  Transaction, 
  CreateWalletData, 
  CreateTransactionData, 
  WalletFilters, 
  TransactionFilters, 
  WalletStats 
} from '../../Types/WalletType';

export class WalletService {
  private static supabase = createClient();
  private static tableName = 'wallets';
  private static transactionTableName = 'wallet_transactions';

  // Create a new wallet
  static async createWallet(walletData: CreateWalletData): Promise<Wallet | null> {
    try {
      const dataToInsert = {
        ...walletData,
        balance: walletData.balance || 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([dataToInsert])
        .select('*, owner:users(*)')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  // Get all wallets with optional filters
  static async getWallets(filters?: WalletFilters): Promise<Wallet[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*, owner:users(*)')
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.owner_id) {
          query = query.eq('owner_id', filters.owner_id);
        }
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
        if (filters.currency) {
          query = query.eq('currency', filters.currency);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error;
    }
  }

  // Get wallet by ID
  static async getWalletById(walletId: string): Promise<Wallet | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*, owner:users(*)')
        .eq('id', walletId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      throw error;
    }
  }

  // Update wallet
  static async updateWallet(walletId: string, updateData: Partial<Wallet>): Promise<Wallet | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', walletId)
        .select('*, owner:users(*)')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating wallet:', error);
      throw error;
    }
  }

  // Delete wallet
  static async deleteWallet(walletId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', walletId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw error;
    }
  }

  // Create a new transaction
  static async createTransaction(transactionData: CreateTransactionData): Promise<Transaction | null> {
    try {
      const dataToInsert = {
        ...transactionData,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Start a transaction to update wallet balance and create transaction
      const { data: transaction, error: transactionError } = await this.supabase
        .from(this.transactionTableName)
        .insert([dataToInsert])
        .select('*, wallet:wallets(*), user:users(*)')
        .single();

      if (transactionError) throw transactionError;

      // Update wallet balance
      const wallet = await this.getWalletById(transactionData.wallet_id);
      if (!wallet) throw new Error('Wallet not found');

      const newBalance = transactionData.type === 'credit' 
        ? wallet.balance + transactionData.amount 
        : wallet.balance - transactionData.amount;

      await this.updateWallet(transactionData.wallet_id, { balance: newBalance });

      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Get all transactions with optional filters
  static async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      let query = this.supabase
        .from(this.transactionTableName)
        .select('*, wallet:wallets(*), user:users(*)')
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.wallet_id) {
          query = query.eq('wallet_id', filters.wallet_id);
        }
        if (filters.user_id) {
          query = query.eq('user_id', filters.user_id);
        }
        if (filters.type) {
          query = query.eq('type', filters.type);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from);
        }
        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to);
        }
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Get transaction by ID
  static async getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.transactionTableName)
        .select('*, wallet:wallets(*), user:users(*)')
        .eq('id', transactionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  // Get wallet statistics
  static async getWalletStats(): Promise<WalletStats> {
    try {
      // Get total wallets
      const { data: wallets, error: walletsError } = await this.supabase
        .from(this.tableName)
        .select('balance')
        .eq('is_active', true);

      if (walletsError) throw walletsError;

      // Get total transactions
      const { data: transactions, error: transactionsError } = await this.supabase
        .from(this.transactionTableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;

      const totalWallets = wallets?.length || 0;
      const totalBalance = wallets?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0;
      const totalTransactions = transactions?.length || 0;

      return {
        total_wallets: totalWallets,
        total_balance: totalBalance,
        total_transactions: totalTransactions,
        recent_transactions: transactions || []
      };
    } catch (error) {
      console.error('Error fetching wallet stats:', error);
      throw error;
    }
  }

  // Get all users for wallet assignment
  static async getUsers(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('id, first_name, last_name, email, avatar')
        .order('first_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Update transaction
  static async updateTransaction(transactionId: string, updateData: Partial<CreateTransactionData>): Promise<Transaction | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.transactionTableName)
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select('*, wallet:wallets(*), user:users(*)')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Delete transaction
  static async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.transactionTableName)
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Get transaction categories
  static async getTransactionCategories(): Promise<string[]> {
    // This could be fetched from a categories table or returned as static data
    return [
      'Salary',
      'Freelance',
      'Investment',
      'Shopping',
      'Food & Dining',
      'Transportation',
      'Entertainment',
      'Healthcare',
      'Education',
      'Utilities',
      'Rent',
      'Other'
    ];
  }

  // Get supported currencies
  static async getSupportedCurrencies(): Promise<{ code: string; name: string; symbol: string }[]> {
    return [
      { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' }
    ];
  }
} 