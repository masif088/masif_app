import React from 'react';
import { Card, CardBody, CardHeader, Row, Col, Badge, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Wallet } from '../../../../../../Types/WalletType';
import { MoreVertical, Edit, Trash2, Eye } from 'react-feather';

interface WalletCardProps {
  wallet: Wallet;
  onEdit: (wallet: Wallet) => void;
  onDelete: (walletId: string) => void;
  onView: (wallet: Wallet) => void;
  onAddTransaction: (wallet: Wallet) => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ 
  wallet, 
  onEdit, 
  onDelete, 
  onView, 
  onAddTransaction 
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

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

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'success';
    if (balance < 0) return 'danger';
    return 'secondary';
  };

  return (
    <Card className="wallet-card h-100">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">{wallet.name}</h5>
          <small className="text-muted">
            Owner: {wallet.owner?.first_name} {wallet.owner?.last_name}
          </small>
        </div>
        <div className="d-flex align-items-center">
          <Badge 
            color={wallet.is_active ? 'success' : 'secondary'} 
            className="me-2"
          >
            {wallet.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
            <DropdownToggle color="transparent" className="p-0 border-0">
              <MoreVertical size={16} />
            </DropdownToggle>
            <DropdownMenu end>
              <DropdownItem onClick={() => onView(wallet)}>
                <Eye size={14} className="me-2" />
                View Details
              </DropdownItem>
              <DropdownItem onClick={() => onAddTransaction(wallet)}>
                <Edit size={14} className="me-2" />
                Add Transaction
              </DropdownItem>
              <DropdownItem onClick={() => onEdit(wallet)}>
                <Edit size={14} className="me-2" />
                Edit Wallet
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem 
                onClick={() => onDelete(wallet.id)}
                className="text-danger"
              >
                <Trash2 size={14} className="me-2" />
                Delete Wallet
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardHeader>
      <CardBody>
        <Row>
          <Col xs={12}>
            <div className="text-center mb-3">
              <h3 className={`text-${getBalanceColor(wallet.balance)} mb-1`}>
                {formatCurrency(wallet.balance, wallet.currency)}
              </h3>
              <small className="text-muted">{wallet.currency}</small>
            </div>
          </Col>
        </Row>
        
        {wallet.description && (
          <Row>
            <Col xs={12}>
              <p className="text-muted small mb-0">
                {wallet.description}
              </p>
            </Col>
          </Row>
        )}
        
        <Row className="mt-3">
          <Col xs={6}>
            <small className="text-muted d-block">Created</small>
            <small className="text-dark">
              {new Date(wallet.created_at).toLocaleDateString()}
            </small>
          </Col>
          <Col xs={6}>
            <small className="text-muted d-block">Updated</small>
            <small className="text-dark">
              {new Date(wallet.updated_at).toLocaleDateString()}
            </small>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default WalletCard; 