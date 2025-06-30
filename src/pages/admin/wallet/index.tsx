import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  TabContent, 
  TabPane, 
  Nav, 
  NavItem, 
  NavLink,
  Alert,
  Spinner
} from 'reactstrap';
import { toast } from 'react-toastify';
import { Plus, DollarSign, CreditCard, TrendingUp, Users } from 'react-feather';
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { MenuWallet } from "utils/Constant";

// Components
import { 
  WalletCard, 
  TransactionTable, 
  WalletModal, 
  TransactionModal 
} from '../../../components/wallet';

// Services and Types
import { WalletService } from '../../../../utils/supabase/walletService';
import { Wallet, Transaction, WalletStats } from '../../../../Types/WalletType';

const WalletPage = () => {
  // State management
  const [activeTab, setActiveTab] = useState('1');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Modal states
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Update filtered transactions when selectedWallet changes
  useEffect(() => {
    if (selectedWallet) {
      const filtered = transactions.filter(t => t.wallet_id === selectedWallet.id);
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [selectedWallet, transactions]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [walletsData, transactionsData, statsData] = await Promise.all([
        WalletService.getWallets(),
        WalletService.getTransactions(),
        WalletService.getWalletStats()
      ]);

      setWallets(walletsData);
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading wallet data:', error);
      setError(error.message || 'Failed to load wallet data');
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  // Wallet actions
  const handleCreateWallet = () => {
    setEditingWallet(null);
    setWalletModalOpen(true);
  };

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setWalletModalOpen(true);
  };

  const handleDeleteWallet = async (walletId: string) => {
    if (window.confirm('Are you sure you want to delete this wallet? This action cannot be undone.')) {
      try {
        await WalletService.deleteWallet(walletId);
        toast.success('Wallet deleted successfully');
        loadData();
      } catch (error: any) {
        console.error('Error deleting wallet:', error);
        toast.error(error.message || 'Failed to delete wallet');
      }
    }
  };

  const handleViewWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setActiveTab('2'); // Switch to transactions tab
  };

  const handleClearWalletFilter = () => {
    setSelectedWallet(null);
    setFilteredTransactions(transactions);
  };

  const handleAddTransaction = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setTransactionModalOpen(true);
  };

  const handleWalletModalSuccess = () => {
    toast.success('Wallet saved successfully');
    loadData();
  };

  const handleTransactionModalSuccess = () => {
    toast.success('Transaction created successfully');
    loadData();
  };

  // Transaction actions
  const handleViewTransaction = (transaction: Transaction) => {
    // You can implement a transaction detail modal here
    console.log('View transaction:', transaction);
  };

  const handleExportTransactions = () => {
    // Implement export functionality
    console.log('Export transactions');
    toast.info('Export functionality coming soon');
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

  if (loading) {
    return (
      <div className="page-body">
        <Breadcrumbs title={MenuWallet} mainTitle={MenuWallet} parent={MenuWallet} />
        <Container fluid={true}>
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-3">Loading wallet data...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-body">
      <Breadcrumbs title={MenuWallet} mainTitle={MenuWallet} parent={MenuWallet} />
      
      <Container fluid={true}>
        {error && (
          <Alert color="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        {stats && (
          <Row className="mb-4">
            <Col xl={3} md={6}>
              <Card className="stat-card">
                <CardBody>
                  <div className="d-flex align-items-center">
                    <div className="stat-icon bg-primary">
                      <CreditCard size={24} />
                    </div>
                    <div className="ms-3">
                      <h4 className="mb-1">{stats.total_wallets}</h4>
                      <p className="text-muted mb-0">Total Wallets</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6}>
              <Card className="stat-card">
                <CardBody>
                  <div className="d-flex align-items-center">
                    <div className="stat-icon bg-success">
                      <DollarSign size={24} />
                    </div>
                    <div className="ms-3">
                      <h4 className="mb-1">{formatCurrency(stats.total_balance, 'USD')}</h4>
                      <p className="text-muted mb-0">Total Balance</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6}>
              <Card className="stat-card">
                <CardBody>
                  <div className="d-flex align-items-center">
                    <div className="stat-icon bg-info">
                      <TrendingUp size={24} />
                    </div>
                    <div className="ms-3">
                      <h4 className="mb-1">{stats.total_transactions}</h4>
                      <p className="text-muted mb-0">Total Transactions</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6}>
              <Card className="stat-card">
                <CardBody>
                  <div className="d-flex align-items-center">
                    <div className="stat-icon bg-warning">
                      <Users size={24} />
                    </div>
                    <div className="ms-3">
                      <h4 className="mb-1">{wallets.length > 0 ? new Set(wallets.map(w => w.owner_id)).size : 0}</h4>
                      <p className="text-muted mb-0">Active Users</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* Tabs */}
        <Card>
          <CardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Digital Wallet Management</h5>
              <div>
                <Button 
                  color="primary" 
                  className="me-2"
                  onClick={handleCreateWallet}
                >
                  <Plus size={16} className="me-1" />
                  Create Wallet
                </Button>
                <Button 
                  color="success"
                  onClick={() => setTransactionModalOpen(true)}
                >
                  <Plus size={16} className="me-1" />
                  Add Transaction
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={activeTab === '1' ? 'active' : ''}
                  onClick={() => setActiveTab('1')}
                >
                  Wallets ({wallets.length})
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === '2' ? 'active' : ''}
                  onClick={() => setActiveTab('2')}
                >
                  Transactions ({transactions.length})
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={activeTab} className="mt-3">
              <TabPane tabId="1">
                {/* Wallets Grid */}
                {wallets.length > 0 ? (
                  <Row>
                    {wallets.map(wallet => (
                      <Col key={wallet.id} xl={4} lg={6} md={6} sm={12} className="mb-4">
                        <WalletCard
                          wallet={wallet}
                          onEdit={handleEditWallet}
                          onDelete={handleDeleteWallet}
                          onView={handleViewWallet}
                          onAddTransaction={handleAddTransaction}
                        />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="text-center py-5">
                    <CreditCard size={48} className="text-muted mb-3" />
                    <h5>No wallets found</h5>
                    <p className="text-muted">Create your first wallet to get started</p>
                    <Button color="primary" onClick={handleCreateWallet}>
                      <Plus size={16} className="me-1" />
                      Create Wallet
                    </Button>
                  </div>
                )}
              </TabPane>

              <TabPane tabId="2">
                {/* Transactions Table */}
                {selectedWallet && (
                  <div className="mb-3 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">Showing transactions for: <strong>{selectedWallet.name}</strong></h6>
                        <small className="text-muted">
                          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                        </small>
                      </div>
                      <Button 
                        color="outline-secondary" 
                        size="sm"
                        onClick={handleClearWalletFilter}
                      >
                        Clear Filter
                      </Button>
                    </div>
                  </div>
                )}
                <TransactionTable
                  transactions={filteredTransactions}
                  onViewTransaction={handleViewTransaction}
                  onExport={handleExportTransactions}
                />
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </Container>

      {/* Modals */}
      <WalletModal
        isOpen={walletModalOpen}
        toggle={() => setWalletModalOpen(false)}
        wallet={editingWallet}
        onSuccess={handleWalletModalSuccess}
      />

      <TransactionModal
        isOpen={transactionModalOpen}
        toggle={() => setTransactionModalOpen(false)}
        selectedWallet={selectedWallet}
        onSuccess={handleTransactionModalSuccess}
      />
    </div>
  );
};

export default WalletPage;
