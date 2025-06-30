# Digital Wallet System Setup Instructions

This document provides step-by-step instructions to set up the digital wallet system with Supabase integration.

## Overview

The digital wallet system provides:
- **Multiple Wallets**: Users can create and manage multiple wallets
- **Transaction Tracking**: Complete transaction history with user tracking
- **Owner Management**: Each wallet has an owner with full control
- **Real-time Balance Updates**: Automatic balance calculations
- **Multi-currency Support**: Support for 10+ currencies
- **Transaction Categories**: Organized transaction categorization
- **Security**: Row Level Security (RLS) policies
- **Responsive UI**: Modern, mobile-friendly interface

## Prerequisites

1. Supabase project set up
2. Next.js application with required dependencies
3. Environment variables configured
4. Existing user management system

## Environment Variables

Make sure you have the following environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `docs/WALLET_DATABASE_SETUP.sql`

This will create:
- `wallets` table for wallet data
- `transactions` table for transaction history
- Row Level Security (RLS) policies
- Automatic balance update triggers
- Transaction validation functions

## Features Implemented

### Wallet Management
- ✅ Create multiple wallets with different currencies
- ✅ Assign wallets to specific users (owners)
- ✅ Set initial balance and description
- ✅ Edit wallet details
- ✅ Delete wallets (with confirmation)
- ✅ View wallet details and balance

### Transaction Management
- ✅ Create credit/debit transactions
- ✅ Track transaction user (who performed the transaction)
- ✅ Categorize transactions (Salary, Shopping, etc.)
- ✅ Add reference IDs for external tracking
- ✅ Automatic balance updates
- ✅ Insufficient funds validation

### User Interface
- ✅ Modern card-based wallet display
- ✅ Transaction table with filtering and sorting
- ✅ Statistics dashboard
- ✅ Modal forms for creating/editing
- ✅ Responsive design
- ✅ Loading states and error handling

### Security Features
- ✅ Row Level Security (RLS) ensures users can only access their own wallets
- ✅ Transaction validation prevents negative balances
- ✅ User authentication required for all operations
- ✅ Input validation and sanitization

## File Structure

```
├── Types/
│   └── WalletType.tsx                 # TypeScript interfaces
├── utils/supabase/
│   └── walletService.ts               # Wallet service layer
├── src/components/
│   ├── WalletCard/
│   │   └── index.tsx                  # Wallet display component
│   ├── TransactionTable/
│   │   └── index.tsx                  # Transaction table component
│   ├── WalletModal/
│   │   └── index.tsx                  # Wallet creation/editing modal
│   └── TransactionModal/
│       └── index.tsx                  # Transaction creation modal
├── src/pages/admin/wallet/
│   └── index.tsx                      # Main wallet page
├── public/assets/scss/components/
│   └── _wallet.scss                   # Wallet component styles
└── docs/
    ├── WALLET_DATABASE_SETUP.sql      # Database setup script
    └── WALLET_SETUP_INSTRUCTIONS.md   # This file
```

## Usage Guide

### Accessing the Wallet System

1. Navigate to `/admin/wallet` in the application
2. View wallet statistics and overview
3. Use tabs to switch between wallets and transactions
4. Use action buttons to create new wallets or transactions

### Creating a Wallet

1. Click the "Create Wallet" button
2. Fill in required fields:
   - **Wallet Name**: Descriptive name for the wallet
   - **Owner**: Select the user who will own this wallet
   - **Currency**: Choose from supported currencies
   - **Initial Balance**: Optional starting balance
   - **Description**: Optional wallet description
3. Click "Create Wallet" to save

### Creating a Transaction

1. Click "Add Transaction" button or use the dropdown on a wallet card
2. Fill in required fields:
   - **Wallet**: Select the target wallet
   - **User**: Select the user performing the transaction
   - **Type**: Credit (add money) or Debit (remove money)
   - **Amount**: Transaction amount
   - **Description**: Transaction description
   - **Category**: Optional transaction category
   - **Reference ID**: Optional external reference
3. Click "Create Transaction" to save

### Managing Wallets

- **View Details**: Click the eye icon to view wallet details
- **Edit Wallet**: Click the edit icon to modify wallet settings
- **Add Transaction**: Click the transaction icon to add a transaction
- **Delete Wallet**: Click the delete icon (with confirmation)

### Transaction Management

- **Filter**: Use the filter options to find specific transactions
- **Search**: Search across description, category, reference, or user
- **Sort**: Click column headers to sort transactions
- **Export**: Export transaction data (coming soon)

## Supported Currencies

The system supports the following currencies:
- USD (US Dollar) - $
- EUR (Euro) - €
- GBP (British Pound) - £
- JPY (Japanese Yen) - ¥
- CAD (Canadian Dollar) - C$
- AUD (Australian Dollar) - A$
- CHF (Swiss Franc) - CHF
- CNY (Chinese Yuan) - ¥
- INR (Indian Rupee) - ₹
- BRL (Brazilian Real) - R$

## Transaction Categories

Predefined transaction categories:
- Salary
- Freelance
- Investment
- Shopping
- Food & Dining
- Transportation
- Entertainment
- Healthcare
- Education
- Utilities
- Rent
- Other

## Database Schema

### Wallets Table
```sql
CREATE TABLE wallets (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES auth.users(id),
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    wallet_id UUID REFERENCES wallets(id),
    user_id UUID REFERENCES auth.users(id),
    type VARCHAR(10) CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    reference_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Features

### Row Level Security (RLS)
- Users can only view and manage their own wallets
- Users can only view transactions from their wallets
- All operations require authentication

### Transaction Validation
- Prevents negative transaction amounts
- Prevents debit transactions that would result in negative balance
- Automatic balance updates on transaction creation/modification/deletion

### Data Integrity
- Foreign key constraints ensure data consistency
- Check constraints validate transaction types and statuses
- Automatic timestamp updates

## Troubleshooting

### Common Issues

1. **Wallets not loading**: Check if user is authenticated and RLS policies are set up
2. **Transaction creation fails**: Verify wallet exists and has sufficient funds
3. **Balance not updating**: Check if triggers are properly created
4. **Permission errors**: Ensure RLS policies are correctly configured

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify Supabase connection in Network tab
3. Check Supabase logs for server-side errors
4. Ensure environment variables are correctly set
5. Verify database tables and policies are created

### Performance Optimization

- Database indexes are created for better query performance
- Pagination can be implemented for large transaction lists
- Caching can be added for frequently accessed data
- Image optimization for user avatars

## Future Enhancements

- [ ] Transaction export functionality (CSV, PDF)
- [ ] Wallet transfer between users
- [ ] Recurring transactions
- [ ] Transaction templates
- [ ] Advanced analytics and reporting
- [ ] Multi-wallet transaction support
- [ ] API endpoints for external integrations
- [ ] Mobile app support
- [ ] Push notifications for transactions
- [ ] Budget tracking and limits

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the database setup script
3. Verify all environment variables are set
4. Check Supabase dashboard for any errors
5. Review browser console for client-side errors 