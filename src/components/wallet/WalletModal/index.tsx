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
import { Wallet, CreateWalletData } from '../../../../Types/WalletType';
import { WalletService } from '../../../../utils/supabase/walletService';

interface WalletModalProps {
  isOpen: boolean;
  toggle: () => void;
  wallet?: Wallet | null;
  onSuccess: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ 
  isOpen, 
  toggle, 
  wallet, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<CreateWalletData>({
    name: '',
    owner_id: '',
    balance: 0,
    currency: 'USD',
    description: ''
  });
  const [users, setUsers] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<{ code: string; name: string; symbol: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadCurrencies();
      if (wallet) {
        setIsEditMode(true);
        setFormData({
          name: wallet.name,
          owner_id: wallet.owner_id,
          balance: wallet.balance,
          currency: wallet.currency,
          description: wallet.description || ''
        });
      } else {
        setIsEditMode(false);
        setFormData({
          name: '',
          owner_id: '',
          balance: 0,
          currency: 'USD',
          description: ''
        });
      }
      setError('');
    }
  }, [isOpen, wallet]);

  const loadUsers = async () => {
    try {
      const usersData = await WalletService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    }
  };

  const loadCurrencies = async () => {
    try {
      const currenciesData = await WalletService.getSupportedCurrencies();
      setCurrencies(currenciesData);
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Wallet name is required');
      return false;
    }
    if (!formData.owner_id) {
      setError('Please select a wallet owner');
      return false;
    }
    if ((formData.balance || 0) < 0) {
      setError('Balance cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isEditMode && wallet) {
        await WalletService.updateWallet(wallet.id, formData);
      } else {
        await WalletService.createWallet(formData);
      }
      
      onSuccess();
      toggle();
    } catch (error: any) {
      console.error('Error saving wallet:', error);
      setError(error.message || 'Failed to save wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      owner_id: '',
      balance: 0,
      currency: 'USD',
      description: ''
    });
    setError('');
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleCancel} size="lg">
      <ModalHeader toggle={handleCancel}>
        {isEditMode ? 'Edit Wallet' : 'Create New Wallet'}
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
                <Label for="name">Wallet Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter wallet name"
                  required
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="owner_id">Owner *</Label>
                <Input
                  id="owner_id"
                  name="owner_id"
                  type="select"
                  value={formData.owner_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select owner</option>
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
                <Label for="currency">Currency *</Label>
                <Input
                  id="currency"
                  name="currency"
                  type="select"
                  value={formData.currency}
                  onChange={handleInputChange}
                  required
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="balance">Initial Balance</Label>
                <Input
                  id="balance"
                  name="balance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.balance}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label for="description">Description</Label>
            <Input
              id="description"
              name="description"
              type="textarea"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter wallet description (optional)"
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
          {loading ? 'Saving...' : (isEditMode ? 'Update Wallet' : 'Create Wallet')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default WalletModal; 