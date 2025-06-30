import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, CardHeader, CardBody, Button, Badge, Spinner } from 'reactstrap';
import { Users, Back } from 'utils/Constant';
import Breadcrumbs from 'CommonElements/Breadcrumbs';
import { ProfileData } from 'utils/supabase/profileService';
import { UserService } from 'utils/supabase/userService';
import { toast } from 'react-toastify';
import Link from 'next/link';

const UserDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await UserService.getUserById(id as string);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user?.id) return;

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setLoading(true);
        await UserService.deleteUser(user.id);
        toast.success('User deleted successfully');
        router.push('/admin/users');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-body">
        <Breadcrumbs title="User Details" mainTitle="User Details" parent={Users} />
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody className="text-center">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading user details...</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-body">
        <Breadcrumbs title="User Not Found" mainTitle="User Not Found" parent={Users} />
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card>
                <CardBody className="text-center">
                  <h4>User not found</h4>
                  <p>The user you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
                  <Link href="/admin/users">
                    <Button color="primary">
                      <i className="fa fa-arrow-left me-2"></i>
                      Back to Users
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  const skills = user.skills ? user.skills.split(',').map(skill => skill.trim()) : [];

  return (
    <div className="page-body">
      <Breadcrumbs title="User Details" mainTitle="User Details" parent={Users} />
      <Container fluid>
        <Row>
          <Col md={12}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Link href="/admin/users">
                <Button color="secondary">
                  <i className="fa fa-arrow-left me-2"></i>
                  {Back}
                </Button>
              </Link>
              <div>
                <Link href={`/admin/users/edit/${user.id}`}>
                  <Button color="primary" className="me-2">
                    <i className="fa fa-edit me-2"></i>
                    Edit User
                  </Button>
                </Link>
                <Button color="danger" onClick={handleDeleteUser}>
                  <i className="fa fa-trash me-2"></i>
                  Delete User
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          {/* Profile Information */}
          <Col md={4}>
            <Card>
              <CardHeader>
                <h5 className="mb-0">Profile Information</h5>
              </CardHeader>
              <CardBody className="text-center">
                <div className="mb-3">
                  <img
                    src={user.avatar || '/assets/images/avtar/1.jpg'}
                    alt="Profile"
                    className="rounded-circle"
                    width="120"
                    height="120"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h4>{user.first_name} {user.last_name}</h4>
                <p className="text-muted">{user.username}</p>
                <Badge color="primary" className="mb-2">{user.role || 'No Role'}</Badge>
                <p className="text-muted mb-0">{user.company || 'No Company'}</p>
              </CardBody>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col md={8}>
            <Card>
              <CardHeader>
                <h5 className="mb-0">Contact Information</h5>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Email</label>
                      <p className="mb-0">{user.email}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Phone</label>
                      <p className="mb-0">{user.phone || 'Not provided'}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Website</label>
                      <p className="mb-0">
                        {user.website ? (
                          <a href={user.website} target="_blank" rel="noopener noreferrer">
                            {user.website}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Created</label>
                      <p className="mb-0">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Address Information */}
          <Col md={6}>
            <Card>
              <CardHeader>
                <h5 className="mb-0">Address Information</h5>
              </CardHeader>
              <CardBody>
                <div className="mb-3">
                  <label className="form-label fw-bold">Address</label>
                  <p className="mb-0">{user.address || 'Not provided'}</p>
                </div>
                <Row>
                  <Col md={4}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">City</label>
                      <p className="mb-0">{user.city || 'Not provided'}</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Postal Code</label>
                      <p className="mb-0">{user.postal_code || 'Not provided'}</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Country</label>
                      <p className="mb-0">{user.country || 'Not provided'}</p>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          {/* Skills */}
          <Col md={6}>
            <Card>
              <CardHeader>
                <h5 className="mb-0">Skills</h5>
              </CardHeader>
              <CardBody>
                {skills.length > 0 ? (
                  <div>
                    {skills.map((skill, index) => (
                      <Badge key={index} color="info" className="me-2 mb-2">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">No skills listed</p>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* About Me */}
        {user.about_me && (
          <Row>
            <Col md={12}>
              <Card>
                <CardHeader>
                  <h5 className="mb-0">About Me</h5>
                </CardHeader>
                <CardBody>
                  <p className="mb-0">{user.about_me}</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default UserDetailPage; 