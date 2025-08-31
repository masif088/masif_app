import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, Button, Input, FormGroup, Label } from 'reactstrap';
import { Users, Search, Edit, Delete } from 'utils/Constant';
import Breadcrumbs from 'CommonElements/Breadcrumbs';
import { ProfileData } from 'utils/supabase/profileService';
import { createClient } from 'utils/supabase/client';
import { toast } from 'react-toastify';
import UserModal from './UserModal';
import UserStats from './UserStats';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';

const UsersPage = () => {
  const { user, session, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ProfileData | null>(null);
  const [viewMode, setViewMode] = useState<'create' | 'edit' | 'view'>('create');

  const supabase = createClient();

  useEffect(() => {
    if (session && !authLoading) {
      loadUsers();
    }
  }, [session, authLoading]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingUser(null);
    setViewMode('create');
    setModalOpen(true);
  };

  const openEditModal = (user: ProfileData) => {
    setEditingUser(user);
    setViewMode('edit');
    setModalOpen(true);
  };

  const openViewModal = (user: ProfileData) => {
    setEditingUser(user);
    setViewMode('view');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleUserSaved = () => {
    closeModal();
    loadUsers();
    toast.success(viewMode === 'create' ? 'User created successfully' : 'User updated successfully');
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);

        if (error) throw error;
        
        setUsers(prev => prev.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      } finally {
        setLoading(false);
      }
    }
  };

  // Show loading state while authentication is in progress
  if (authLoading) {
    return (
      <div className="page-body">
        <Breadcrumbs title="Users Management" mainTitle="Users" parent={Users} />
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading authentication...</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Show error if not authenticated
  if (!session || !user) {
    return (
      <div className="page-body">
        <Breadcrumbs title="Users Management" mainTitle="Users" parent={Users} />
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody className="text-center">
                  <h4>Authentication Required</h4>
                  <p>Please log in to access this page.</p>
                  <Link href="/authentication/login">
                    <Button color="primary">Go to Login</Button>
                  </Link>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-body">
      <Breadcrumbs title="Users Management" mainTitle="Users" parent={Users} />
      <Container fluid>
        {/* User Statistics */}
        <UserStats />
        
        {/* Users Table */}
        <Row>
          <Col sm={12}>
            <Card>
              <CardHeader>
                <Row className="align-items-center">
                  <Col md={6}>
                    <h4 className="card-title mb-0">Users Management</h4>
                  </Col>
                  <Col md={6} className="text-end">
                    <Link href="/admin/users/without-company" className="btn btn-warning me-2">
                      <i className="fa fa-users me-1"></i>
                      Users Without Company
                    </Link>
                    <Button 
                      color="primary" 
                      outline
                      size="sm"
                      onClick={openCreateModal}
                    >
                      <i className="icon-plus me-2"></i>
                      Add User
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Row className="mb-3">
                  <Col md={4}>
                    <FormGroup>
                      <Label>{Search}</Label>
                      <Input
                        type="text"
                        placeholder="Search users by name, email, company, or role..."
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Filter by Company</Label>
                      <select 
                        className="form-control"
                        onChange={(e) => {
                          if (e.target.value === 'without-company') {
                            window.location.href = '/admin/users/without-company';
                          }
                        }}
                      >
                        <option value="">All Users</option>
                        <option value="without-company">Users Without Company</option>
                      </select>
                    </FormGroup>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <div className="text-muted">
                      {filteredUsers.length} of {users.length} users
                    </div>
                  </Col>
                </Row>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center">Loading users...</td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center">No users found</td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm me-2">
                                  {user.avatar ? (
                                    <Image
                                      src={user.avatar}
                                      alt="avatar"
                                      className="rounded-circle"
                                      width="40"
                                      height="40"
                                    />
                                  ) : (
                                    <div
                                      className="rounded-circle d-flex align-items-center justify-content-center"
                                      style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#f8f9fa',
                                        border: '2px solid #dee2e6'
                                      }}
                                    >
                                      <i className="fa fa-user" style={{ fontSize: '1rem', color: '#6c757d' }}></i>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="fw-bold">
                                    <Link href={`/admin/users/${user.id}`} className="text-decoration-none">
                                      {user.first_name} {user.last_name}
                                    </Link>
                                  </div>
                                  <small className="text-muted">{user.username}</small>
                                </div>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>{user.company?.name || '-'}</td>
                            <td>{user.role || '-'}</td>
                            <td>{user.phone || '-'}</td>
                            <td>
                              <div className="d-flex gap-1 justify-content-start">
                                <Button
                                  color="outline-info"
                                  size="sm"
                                  onClick={() => openViewModal(user)}
                                  title="View"
                                >
                                  <i className="fa fa-eye"></i>
                                </Button>
                                <Button
                                  color="outline-warning"
                                  size="sm"
                                  onClick={() => openEditModal(user)}
                                  title="Edit"
                                >
                                  <i className="fa fa-edit"></i>
                                </Button>
                                <Button
                                  color="outline-danger"
                                  size="sm"
                                  onClick={() => user.id && handleDeleteUser(user.id)}
                                  title="Delete"
                                >
                                  <i className="fa fa-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <UserModal
          isOpen={modalOpen}
          toggle={closeModal}
          user={editingUser}
          mode={viewMode}
          onSaved={handleUserSaved}
        />
      </Container>
    </div>
  );
};

export default UsersPage; 