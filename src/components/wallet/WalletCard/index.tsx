import React from 'react';
import { Card, CardBody, CardHeader, Row, Col, Badge, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Wallet } from '../../../../Types/WalletType';
import { MoreVertical, Edit, Trash2, Eye, Plus } from 'react-feather';

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
      <CardHeader>
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <h5 className="mb-1 text-truncate">{wallet.name}</h5>
            <small className="text-muted d-block">
              Owner: {wallet.owner?.first_name} {wallet.owner?.last_name}
            </small>
          </div>
          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <Badge 
              color={wallet.is_active ? 'success' : 'secondary'} 
              className="d-none d-sm-inline"
            >
              {wallet.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
              <DropdownToggle color="transparent" className="p-0 border-0 text-white">
                <MoreVertical size={16} />
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem onClick={() => onView(wallet)}>
                  <Eye size={14} className="me-2" />
                  View Details
                </DropdownItem>
                <DropdownItem onClick={() => onAddTransaction(wallet)}>
                  <Plus size={14} className="me-2" />
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
        </div>
      </CardHeader>
      <CardBody>
        <Row className="g-0">
          <Col xs={12}>
            <div className="text-center mb-3">
              <div className={`display-6 fw-bold text-${getBalanceColor(wallet.balance)} mb-1`}>
                {formatCurrency(wallet.balance, wallet.currency)}
              </div>
              <small className="text-muted">{wallet.currency}</small>
            </div>
          </Col>
        </Row>
        
        {/* Mobile Status Badge */}
        <Row className="g-0 d-sm-none">
          <Col xs={12} className="text-center mb-3">
            <Badge 
              color={wallet.is_active ? 'success' : 'secondary'}
              className="px-3 py-1"
            >
              {wallet.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </Col>
        </Row>
        
        {wallet.description && (
          <Row className="g-0">
            <Col xs={12}>
              <div className="bg-light p-2 rounded mb-3">
                <small className="text-muted">
                  {wallet.description}
                </small>
              </div>
            </Col>
          </Row>
        )}
        
        <Row className="g-0 small">
          <Col xs={6} className="pe-2">
            <div className="border-end">
              <div className="text-muted">Created</div>
              <div className="fw-medium">
                {new Date(wallet.created_at).toLocaleDateString()}
              </div>
            </div>
          </Col>
          <Col xs={6} className="ps-2">
            <div className="text-muted">Updated</div>
            <div className="fw-medium">
              {new Date(wallet.updated_at).toLocaleDateString()}
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default WalletCard; 