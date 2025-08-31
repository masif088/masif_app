import React, { useState, useEffect } from 'react';
import { Card, CardBody, Col, Container, Row, Badge, Button } from 'reactstrap';
import Image from 'next/image';
import { UserService } from 'utils/supabase/userService';
import { ProfileData } from 'utils/supabase/profileService';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface UsersWithoutCompanyProps {
  limit?: number;
  showViewAll?: boolean;
  title?: string;
}

const UsersWithoutCompany: React.FC<UsersWithoutCompanyProps> = ({ 
  limit = 6, 
  showViewAll = true, 
  title = "Users Without Company" 
}) => {
  const [users, setUsers] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsersWithoutCompany();
  }, []);

  const loadUsersWithoutCompany = async () => {
    try {
      setLoading(true);
      const usersData = await UserService.getUsersWithoutCompany();
      setUsers(usersData.slice(0, limit));
    } catch (error) {
      console.error('Error loading users without company:', error);
      toast.error('Failed to load users without company');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container fluid>
        <Row>
          <Col sm={12}>
            <Card>
              <CardBody className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col sm={12}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>{title}</h5>
            {showViewAll && (
              <Link href="/admin/users/without-company" className="btn btn-warning btn-sm">
                View All ({users.length})
              </Link>
            )}
          </div>
        </Col>
      </Row>
      
      <Row className="user-cards-items">
        {users.length === 0 ? (
          <Col sm={12}>
            <Card>
              <CardBody className="text-center">
                <i className="fa fa-users fa-3x text-muted mb-3"></i>
                <h6>No Users Without Company</h6>
                <p className="text-muted">All users are currently assigned to companies.</p>
              </CardBody>
            </Card>
          </Col>
        ) : (
          users.map((user) => (
            <Col xl={4} sm={6} xxl={3} className="col-ed-4 box-col-4" key={user.id}>
              <Card className="social-profile">
                <CardBody>
                  <div className="social-img-wrap">
                    <div className="social-img">
                      {user.avatar ? (
                        <Image 
                          width={68} 
                          height={68} 
                          src={user.avatar} 
                          className="img-fluid rounded-circle" 
                          alt="user" 
                        />
                      ) : (
                        <div 
                          className="bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 68, height: 68 }}
                        >
                          <i className="fa fa-user fa-2x text-white"></i>
                        </div>
                      )}
                    </div>
                    <div className="edit-icon">
                      <Badge color="warning">No Company</Badge>
                    </div>
                  </div>
                  <div className="social-details">
                    <h5 className="mb-1">
                      <Link href={`/admin/users/${user.id}`} className="text-decoration-none">
                        {user.first_name} {user.last_name}
                      </Link>
                    </h5>
                    <span className="f-light">{user.email}</span>
                    {user.role && (
                      <div className="mt-2">
                        <Badge color="primary">{user.role}</Badge>
                      </div>
                    )}
                    {user.phone && (
                      <div className="mt-2">
                        <small className="text-muted">
                          <i className="fa fa-phone me-1"></i>
                          {user.phone}
                        </small>
                      </div>
                    )}
                    <div className="mt-3">
                      <Link href={`/admin/users/${user.id}`} className="btn btn-outline-primary btn-sm me-2">
                        <i className="fa fa-eye me-1"></i>
                        View
                      </Link>
                      <Link href={`/admin/users/${user.id}?edit=true`} className="btn btn-outline-secondary btn-sm">
                        <i className="fa fa-edit me-1"></i>
                        Edit
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default UsersWithoutCompany;
