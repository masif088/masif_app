import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Form, 
  FormGroup, 
  Label, 
  Input, 
  Row, 
  Col,
  Alert
} from 'reactstrap';
import { Transaction, CreateTransactionData, Wallet } from '../../../../Types/WalletType';
import { WalletService } from '../../../../utils/supabase/walletService';

interface TransactionModalProps {
  isOpen: boolean;
  toggle: () => void;
  selectedWallet?: Wallet | null;
  transaction?: Transaction | null;
  onSuccess: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  toggle, 
  selectedWallet,
  transaction,
  onSuccess 
}) => {
  const [formData, setFormData] = useState<CreateTransactionData>({
    wallet_id: '',
    user_id: '',
    type: 'credit',
    amount: 0,
    description: '',
    category: '',
    reference_id: ''
  });
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedWalletData, setSelectedWalletData] = useState<Wallet | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadWallets();
      loadUsers();
      loadCategories();
      if (transaction) {
        setIsEditMode(true);
        setFormData({
          wallet_id: transaction.wallet_id,
          user_id: transaction.user_id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description || '',
          category: transaction.category || '',
          reference_id: transaction.reference_id || ''
        });
        if (transaction.wallet) {
          setSelectedWalletData(transaction.wallet);
        }
      } else {
        setIsEditMode(false);
        setFormData({
          wallet_id: selectedWallet?.id || '',
          user_id: '',
          type: 'credit',
          amount: 0,
          description: '',
          category: '',
          reference_id: ''
        });
        if (selectedWallet) {
          setSelectedWalletData(selectedWallet);
        }
      }
      setError('');
    }
  }, [isOpen, selectedWallet, transaction]);

  const loadWallets = async () => {
    try {
      const walletsData = await WalletService.getWallets({ is_active: true });
      setWallets(walletsData);
    } catch (error) {
      console.error('Error loading wallets:', error);
      setError('Failed to load wallets');
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await WalletService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await WalletService.getTransactionCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));

    // Update selected wallet when wallet_id changes
    if (name === 'wallet_id') {
      const wallet = wallets.find(w => w.id === value);
      setSelectedWalletData(wallet || null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.wallet_id) {
      setError('Please select a wallet');
      return false;
    }
    if (!formData.user_id) {
      setError('Please select a user');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Transaction description is required');
      return false;
    }
    if ((formData.amount || 0) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    if (formData.type === 'debit' && selectedWalletData) {
      if ((selectedWalletData.balance || 0) < (formData.amount || 0)) {
        setError('Insufficient funds in wallet');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isEditMode && transaction) {
        await WalletService.updateTransaction(transaction.id, formData);
      } else {
        await WalletService.createTransaction(formData);
      }
      onSuccess();
      toggle();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      setError(error.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      wallet_id: '',
      user_id: '',
      type: 'credit',
      amount: 0,
      description: '',
      category: '',
      reference_id: ''
    });
    setSelectedWalletData(null);
    setError('');
    setIsEditMode(false);
    toggle();
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹',
      'BRL': 'R$'
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Modal isOpen={isOpen} toggle={handleCancel} size="lg">
      <ModalHeader toggle={handleCancel}>
        {isEditMode ? 'Edit Transaction' : 'Create New Transaction'}
      </ModalHeader>
      <ModalBody>
        {error && (
          <Alert color="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        <Form>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="wallet_id">Wallet *</Label>
                <Input
                  id="wallet_id"
                  name="wallet_id"
                  type="select"
                  value={formData.wallet_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select wallet</option>
                  {wallets.map(wallet => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} - {formatCurrency(wallet.balance || 0, wallet.currency)}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="user_id">User *</Label>
                <Input
                  id="user_id"
                  name="user_id"
                  type="select"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="type">Transaction Type *</Label>
                <Input
                  id="type"
                  name="type"
                  type="select"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="credit">Credit (Add Money)</option>
                  <option value="debit">Debit (Remove Money)</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="amount">Amount *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
                {selectedWalletData && (
                  <small className="text-muted">
                    Current balance: {formatCurrency(selectedWalletData.balance || 0, selectedWalletData.currency)}
                  </small>
                )}
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  type="select"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="reference_id">Reference ID</Label>
                <Input
                  id="reference_id"
                  name="reference_id"
                  type="text"
                  value={formData.reference_id}
                  onChange={handleInputChange}
                  placeholder="Optional reference ID"
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label for="description">Description *</Label>
            <Input
              id="description"
              name="description"
              type="textarea"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter transaction description"
              required
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          color="primary" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEditMode ? 'Update Transaction' : 'Create Transaction')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TransactionModal; 