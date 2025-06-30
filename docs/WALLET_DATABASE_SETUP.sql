-- Wallet Database Setup for Supabase
-- Run this script in your Supabase SQL editor

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(10) CHECK (type IN ('credit', 'debit')) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    reference_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_owner_id ON wallets(owner_id);
CREATE INDEX IF NOT EXISTS idx_wallets_currency ON wallets(currency);
CREATE INDEX IF NOT EXISTS idx_wallets_is_active ON wallets(is_active);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

-- Enable Row Level Security (RLS)
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wallets table
CREATE POLICY "Users can view their own wallets" ON wallets
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own wallets" ON wallets
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own wallets" ON wallets
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own wallets" ON wallets
    FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS policies for transactions table
CREATE POLICY "Users can view transactions from their wallets" ON transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM wallets 
            WHERE wallets.id = transactions.wallet_id 
            AND wallets.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert transactions to their wallets" ON transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM wallets 
            WHERE wallets.id = transactions.wallet_id 
            AND wallets.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update transactions from their wallets" ON transactions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM wallets 
            WHERE wallets.id = transactions.wallet_id 
            AND wallets.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete transactions from their wallets" ON transactions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM wallets 
            WHERE wallets.id = transactions.wallet_id 
            AND wallets.owner_id = auth.uid()
        )
    );

-- Create function to update wallet balance on transaction
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'credit' THEN
            UPDATE wallets 
            SET balance = balance + NEW.amount, updated_at = NOW()
            WHERE id = NEW.wallet_id;
        ELSE
            UPDATE wallets 
            SET balance = balance - NEW.amount, updated_at = NOW()
            WHERE id = NEW.wallet_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle balance updates when transaction amount or type changes
        IF OLD.type = 'credit' AND NEW.type = 'credit' THEN
            UPDATE wallets 
            SET balance = balance - OLD.amount + NEW.amount, updated_at = NOW()
            WHERE id = NEW.wallet_id;
        ELSIF OLD.type = 'debit' AND NEW.type = 'debit' THEN
            UPDATE wallets 
            SET balance = balance + OLD.amount - NEW.amount, updated_at = NOW()
            WHERE id = NEW.wallet_id;
        ELSIF OLD.type = 'credit' AND NEW.type = 'debit' THEN
            UPDATE wallets 
            SET balance = balance - OLD.amount - NEW.amount, updated_at = NOW()
            WHERE id = NEW.wallet_id;
        ELSIF OLD.type = 'debit' AND NEW.type = 'credit' THEN
            UPDATE wallets 
            SET balance = balance + OLD.amount + NEW.amount, updated_at = NOW()
            WHERE id = NEW.wallet_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Handle balance updates when transaction is deleted
        IF OLD.type = 'credit' THEN
            UPDATE wallets 
            SET balance = balance - OLD.amount, updated_at = NOW()
            WHERE id = OLD.wallet_id;
        ELSE
            UPDATE wallets 
            SET balance = balance + OLD.amount, updated_at = NOW()
            WHERE id = OLD.wallet_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic wallet balance updates
CREATE TRIGGER trigger_update_wallet_balance
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- Create function to validate transaction amount
CREATE OR REPLACE FUNCTION validate_transaction_amount()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent negative amounts
    IF NEW.amount <= 0 THEN
        RAISE EXCEPTION 'Transaction amount must be greater than 0';
    END IF;
    
    -- Prevent debit transactions that would result in negative balance
    IF NEW.type = 'debit' THEN
        DECLARE
            current_balance DECIMAL(15,2);
        BEGIN
            SELECT balance INTO current_balance FROM wallets WHERE id = NEW.wallet_id;
            IF current_balance - NEW.amount < 0 THEN
                RAISE EXCEPTION 'Insufficient funds in wallet';
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transaction amount validation
CREATE TRIGGER trigger_validate_transaction_amount
    BEFORE INSERT OR UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION validate_transaction_amount();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.wallets TO anon, authenticated;
GRANT ALL ON public.transactions TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert some sample data (optional)
-- INSERT INTO wallets (name, owner_id, balance, currency, description) VALUES
--     ('Main Wallet', 'your-user-id-here', 1000.00, 'USD', 'Primary wallet for daily transactions'),
--     ('Savings Wallet', 'your-user-id-here', 5000.00, 'USD', 'Wallet for savings and investments'),
--     ('Travel Wallet', 'your-user-id-here', 500.00, 'EUR', 'Wallet for travel expenses');

-- INSERT INTO transactions (wallet_id, user_id, type, amount, description, category) VALUES
--     ('wallet-id-1', 'your-user-id-here', 'credit', 1000.00, 'Initial deposit', 'Salary'),
--     ('wallet-id-1', 'your-user-id-here', 'debit', 50.00, 'Grocery shopping', 'Food & Dining'),
--     ('wallet-id-2', 'your-user-id-here', 'credit', 5000.00, 'Savings deposit', 'Investment'); 