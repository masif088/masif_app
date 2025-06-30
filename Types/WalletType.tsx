export interface Wallet {
  id: string;
  name: string;
  owner_id: string;
  balance: number;
  currency: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner?: User;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category?: string;
  reference_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
  wallet?: Wallet;
  user?: User;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}

export interface CreateWalletData {
  name: string;
  owner_id: string;
  balance?: number;
  currency: string;
  description?: string;
}

export interface CreateTransactionData {
  wallet_id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category?: string;
  reference_id?: string;
}

export interface WalletFilters {
  owner_id?: string;
  is_active?: boolean;
  currency?: string;
}

export interface TransactionFilters {
  wallet_id?: string;
  user_id?: string;
  type?: 'credit' | 'debit';
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  date_from?: string;
  date_to?: string;
  category?: string;
}

export interface WalletStats {
  total_wallets: number;
  total_balance: number;
  total_transactions: number;
  recent_transactions: Transaction[];
} 