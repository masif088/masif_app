import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardHeader, CardBody, Button, Input, Badge } from 'reactstrap';
import { Users, Search, Edit, Delete } from 'utils/Constant';
import Breadcrumbs from 'CommonElements/Breadcrumbs';
import { ProfileData } from 'utils/supabase/profileService';
import { UserService } from 'utils/supabase/userService';
import { toast } from 'react-toastify';
import UserModal from './UserModal';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';

const UsersWithoutCompanyPage = () => {
  const { user, session, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ProfileData | null>(null);
  const [viewMode, setViewMode] = useState<'create' | 'edit' | 'view'>('create');

  useEffect(() => {
    if (session && !authLoading) {
      loadUsersWithoutCompany();
    }
  }, [session, authLoading]);

  const loadUsersWithoutCompany = async () => {
    try {
      setLoading(true);
      const usersData = await UserService.getUsersWithoutCompany();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users without company:', error);
      toast.error('Failed to load users without company');
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
    loadUsersWithoutCompany();
    toast.success(viewMode === 'create' ? 'User created successfully' : 'User updated successfully');
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setLoading(true);
        await UserService.deleteUser(userId);
        await loadUsersWithoutCompany();
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="page-body">
      <Breadcrumbs
        title="Users Without Company"
        mainTitle="Users Without Company"
        parent="Admin"
      />
      
      <Container fluid>
        <Row>
          <Col sm={12}>
            <Card>
              <CardHeader>
                <Row>
                  <Col sm={6}>
                    <h5>Users Without Company</h5>
                    <span>Manage users who are not assigned to any company</span>
                  </Col>
                  <Col sm={6} className="text-end">
                    <Link href="/admin/users" className="btn btn-secondary me-2">
                      <i className="fa fa-arrow-left me-1"></i>
                      Back to All Users
                    </Link>
                    <Button color="primary" onClick={openCreateModal}>
                      <i className="fa fa-plus me-1"></i>
                      Add User
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              
              <CardBody>
                <Row className="mb-3">
                  <Col sm={6}>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fa fa-search"></i>
                      </span>
                      <Input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                  </Col>
                  <Col sm={6} className="text-end">
                    <Badge color="info" className="me-2">
                      Total: {filteredUsers.length}
                    </Badge>
                    <Badge color="warning">
                      Without Company: {users.length}
                    </Badge>
                  </Col>
                </Row>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Company</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center">
                            <div className="spinner-border" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center">
                            {searchTerm ? 'No users found matching your search' : 'No users without company found'}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                {user.avatar ? (
                                  <Image
                                    src={user.avatar}
                                    alt={`${user.first_name} ${user.last_name}`}
                                    width={40}
                                    height={40}
                                    className="rounded-circle me-2"
                                  />
                                ) : (
                                  <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 40, height: 40 }}>
                                    <i className="fa fa-user text-white"></i>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div>
                                <strong>{user.first_name} {user.last_name}</strong>
                                {user.username && (
                                  <div className="text-muted small">@{user.username}</div>
                                )}
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              {user.role ? (
                                <Badge color="primary">{user.role}</Badge>
                              ) : (
                                <span className="text-muted">No role</span>
                              )}
                            </td>
                            <td>{user.phone || <span className="text-muted">No phone</span>}</td>
                            <td>
                              <Badge color="warning">No Company</Badge>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <Button
                                  color="info"
                                  size="sm"
                                  onClick={() => openViewModal(user)}
                                  title="View User"
                                >
                                  <i className="fa fa-eye"></i>
                                </Button>
                                <Button
                                  color="primary"
                                  size="sm"
                                  onClick={() => openEditModal(user)}
                                  title="Edit User"
                                >
                                  <i className="fa fa-edit"></i>
                                </Button>
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id!)}
                                  title="Delete User"
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

export default UsersWithoutCompanyPage;
