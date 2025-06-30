import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Input, Row, Col, FormGroup, Label, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardBody } from 'reactstrap';
import { Transaction, Wallet } from '../../../../Types/WalletType';
import { Filter, Download, Eye, Calendar, TrendingUp, TrendingDown, DollarSign } from 'react-feather';
import { WalletService } from 'utils/supabase/walletService';

interface TransactionTableProps {
  transactions: Transaction[];
  onViewTransaction: (transaction: Transaction) => void;
  onExport?: () => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  onViewTransaction,
  onExport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterWallet, setFilterWallet] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'credit' ? 'success' : 'danger';
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const isDateInRange = (dateString: string) => {
    if (!dateFrom && !dateTo) return true;
    
    const transactionDate = new Date(dateString);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null; // Include entire day
    
    if (fromDate && toDate) {
      return transactionDate >= fromDate && transactionDate <= toDate;
    } else if (fromDate) {
      return transactionDate >= fromDate;
    } else if (toDate) {
      return transactionDate <= toDate;
    }
    
    return true;
  };

  const filteredAndSortedTransactions = transactions
    .filter(transaction => {
      const matchesSearch = 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.wallet?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !filterType || transaction.type === filterType;
      const matchesStatus = !filterStatus || transaction.status === filterStatus;
      const matchesCategory = !filterCategory || transaction.category === filterCategory;
      const matchesWallet = !filterWallet || transaction.wallet_id === filterWallet;
      const matchesDateRange = isDateInRange(transaction.created_at);

      return matchesSearch && matchesType && matchesStatus && matchesCategory && matchesWallet && matchesDateRange;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField as keyof Transaction];
      let bValue: any = b[sortField as keyof Transaction];

      if (sortField === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Calculate summary statistics
  const summary = filteredAndSortedTransactions.reduce((acc, transaction) => {
    const amount = transaction.amount || 0;
    const currency = transaction.wallet?.currency || 'USD';
    
    if (transaction.type === 'credit') {
      acc.totalCredits += amount;
    } else {
      acc.totalDebits += amount;
    }
    
    acc.totalTransactions += 1;
    acc.currencies.add(currency);
    
    return acc;
  }, {
    totalCredits: 0,
    totalDebits: 0,
    totalTransactions: 0,
    currencies: new Set<string>()
  });

  const netAmount = summary.totalCredits - summary.totalDebits;
  const primaryCurrency = summary.currencies.size > 0 ? Array.from(summary.currencies)[0] : 'USD';

  const categories = Array.from(new Set(transactions.map(t => t.category).filter(Boolean)));
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    const loadWallets = async () => {
      try {
        const walletsData = await WalletService.getWallets({ is_active: true });
        setWallets(walletsData);
      } catch (error) {
        console.error('Error loading wallets:', error);
      }
    };
    
    loadWallets();
  }, []);

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatus('');
    setFilterCategory('');
    setFilterWallet('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="transaction-table">
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col xl={3} md={6}>
          <Card className="summary-card">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="summary-icon bg-primary">
                  <TrendingUp size={20} />
                </div>
                <div className="ms-3">
                  <h6 className="mb-1">Total Credits</h6>
                  <h4 className="text-success mb-0">
                    {formatCurrency(summary.totalCredits, primaryCurrency)}
                  </h4>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="summary-card">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="summary-icon bg-danger">
                  <TrendingDown size={20} />
                </div>
                <div className="ms-3">
                  <h6 className="mb-1">Total Debits</h6>
                  <h4 className="text-danger mb-0">
                    {formatCurrency(summary.totalDebits, primaryCurrency)}
                  </h4>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="summary-card">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="summary-icon bg-info">
                  <DollarSign size={20} />
                </div>
                <div className="ms-3">
                  <h6 className="mb-1">Net Amount</h6>
                  <h4 className={`${netAmount >= 0 ? 'text-success' : 'text-danger'} mb-0`}>
                    {formatCurrency(Math.abs(netAmount), primaryCurrency)}
                    <small className="ms-1">
                      ({netAmount >= 0 ? '+' : '-'})
                    </small>
                  </h4>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="summary-card">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="summary-icon bg-warning">
                  <Calendar size={20} />
                </div>
                <div className="ms-3">
                  <h6 className="mb-1">Transactions</h6>
                  <h4 className="text-warning mb-0">
                    {summary.totalTransactions}
                  </h4>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={3}>
          <FormGroup>
            <Label for="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md={2}>
          <FormGroup>
            <Label for="wallet">Wallet</Label>
            <Input
              id="wallet"
              type="select"
              value={filterWallet}
              onChange={(e) => setFilterWallet(e.target.value)}
            >
              <option value="">All Wallets</option>
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} ({wallet.currency})
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        <Col md={2}>
          <FormGroup>
            <Label for="type">Type</Label>
            <Input
              id="type"
              type="select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </Input>
          </FormGroup>
        </Col>
        <Col md={2}>
          <FormGroup>
            <Label for="status">Status</Label>
            <Input
              id="status"
              type="select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </Input>
          </FormGroup>
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button 
            color="primary" 
            className="me-2"
            onClick={onExport}
            disabled={!onExport}
          >
            <Download size={14} className="me-1" />
            Export
          </Button>
          <Button 
            color="outline-secondary"
            onClick={clearAllFilters}
          >
            <Filter size={14} className="me-1" />
            Clear
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={2}>
          <FormGroup>
            <Label for="dateFrom">Date From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md={2}>
          <FormGroup>
            <Label for="dateTo">Date To</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </FormGroup>
        </Col>
        <Col md={3}>
          <FormGroup>
            <Label for="category">Category</Label>
            <Input
              id="category"
              type="select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>

      {/* Table */}
      <div className="table-responsive">
        <Table striped hover>
          <thead>
            <tr>
              <th 
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('created_at')}
              >
                Date
                {sortField === 'created_at' && (
                  <span className="ms-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th>Wallet</th>
              <th>Description</th>
              <th>Category</th>
              <th>User</th>
              <th 
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('amount')}
              >
                Amount
                {sortField === 'amount' && (
                  <span className="ms-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th>Type</th>
              <th>Status</th>
              <th>Reference</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTransactions.map(transaction => (
              <tr key={transaction.id}>
                <td>
                  {new Date(transaction.created_at).toLocaleDateString()}
                  <br />
                  <small className="text-muted">
                    {new Date(transaction.created_at).toLocaleTimeString()}
                  </small>
                </td>
                <td>
                  <div>
                    <strong>{transaction.wallet?.name || 'Unknown Wallet'}</strong>
                    <br />
                    <small className="text-muted">
                      {transaction.wallet?.currency || 'USD'}
                    </small>
                  </div>
                </td>
                <td>{transaction.description}</td>
                <td>
                  {transaction.category && (
                    <Badge color="light" className="text-dark">
                      {transaction.category}
                    </Badge>
                  )}
                </td>
                <td>
                  {transaction.user && (
                    <div>
                      {transaction.user.first_name} {transaction.user.last_name}
                      <br />
                      <small className="text-muted">{transaction.user.email}</small>
                    </div>
                  )}
                </td>
                <td>
                  <span className={`text-${getTypeColor(transaction.type)} fw-bold`}>
                    {formatCurrency(transaction.amount, transaction.wallet?.currency || 'USD')}
                  </span>
                </td>
                <td>
                  <Badge color={getTypeColor(transaction.type)}>
                    {transaction.type.toUpperCase()}
                  </Badge>
                </td>
                <td>
                  <Badge color={getStatusColor(transaction.status)}>
                    {transaction.status.toUpperCase()}
                  </Badge>
                </td>
                <td>
                  {transaction.reference_id && (
                    <small className="text-muted">{transaction.reference_id}</small>
                  )}
                </td>
                <td>
                  <Button
                    color="outline-primary"
                    size="sm"
                    onClick={() => onViewTransaction(transaction)}
                  >
                    <Eye size={12} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {filteredAndSortedTransactions.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted">No transactions found</p>
        </div>
      )}
    </div>
  );
};

export default TransactionTable; 