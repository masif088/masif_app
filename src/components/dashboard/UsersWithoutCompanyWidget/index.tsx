import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Row, Col, Badge, Button } from 'reactstrap';
import { UserService } from 'utils/supabase/userService';
import { ProfileData } from 'utils/supabase/profileService';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Image from 'next/image';

const UsersWithoutCompanyWidget: React.FC = () => {
  const [users, setUsers] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, withoutCompany: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        UserService.getUsersWithoutCompany(),
        UserService.getUserStats()
      ]);
      
      setUsers(usersData.slice(0, 5)); // Show only first 5 users
      setStats(statsData);
    } catch (error) {
      console.error('Error loading users without company widget data:', error);
      toast.error('Failed to load widget data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h5>Users Without Company</h5>
        </CardHeader>
        <CardBody className="text-center">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Row className="align-items-center">
          <Col>
            <h5 className="mb-0">
              <i className="fa fa-user-times me-2 text-warning"></i>
              Users Without Company
            </h5>
          </Col>
          <Col className="text-end">
            <Badge color="warning" className="fs-6">
              {stats.withoutCompany}
            </Badge>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        {users.length === 0 ? (
          <div className="text-center py-4">
            <i className="fa fa-check-circle fa-3x text-success mb-3"></i>
            <h6 className="text-success">All Users Assigned!</h6>
            <p className="text-muted small">Every user is currently assigned to a company.</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <small className="text-muted">
                Showing {users.length} of {stats.withoutCompany} users without company
              </small>
            </div>
            
            <div className="user-list">
              {users.map((user) => (
                <div key={user.id} className="d-flex align-items-center mb-3 p-2 border rounded">
                  <div className="me-3">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={`${user.first_name} ${user.last_name}`}
                        width={40}
                        height={40}
                        className="rounded-circle"
                      />
                    ) : (
                      <div 
                        className="bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 40, height: 40 }}
                      >
                        <i className="fa fa-user text-white"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-muted small">{user.email}</div>
                    {user.role && (
                      <Badge color="primary" className="small">{user.role}</Badge>
                    )}
                  </div>
                  <div>
                    <Link href={`/admin/users/${user.id}`} className="btn btn-outline-primary btn-sm">
                      <i className="fa fa-eye"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {stats.withoutCompany > 5 && (
              <div className="text-center mt-3">
                <Link href="/admin/users/without-company" className="btn btn-warning btn-sm">
                  View All Users Without Company
                </Link>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default UsersWithoutCompanyWidget;
