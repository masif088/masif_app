import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Row, Col, Badge } from 'reactstrap';
import { UserService } from 'utils/supabase/userService';
import { toast } from 'react-toastify';

interface UserStats {
  total: number;
  withoutCompany: number;
  byRole: Record<string, number>;
  byCompany: Record<string, number>;
}

const UserStats: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const userStats = await UserService.getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
      toast.error('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  if (!stats) {
    return null;
  }

  const topRoles = Object.entries(stats.byRole)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topCompanies = Object.entries(stats.byCompany)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Row>
      {/* Total Users */}
      <Col md={2}>
        <Card className="bg-primary text-white">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{stats.total}</h4>
                <p className="mb-0">Total Users</p>
              </div>
              <div>
                <i className="fa fa-users fa-2x"></i>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* Users Without Company */}
      <Col md={2}>
        <Card className="bg-warning text-white">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{stats.withoutCompany}</h4>
                <p className="mb-0">Without Company</p>
              </div>
              <div>
                <i className="fa fa-user-times fa-2x"></i>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* Active Users */}
      <Col md={2}>
        <Card className="bg-success text-white">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{stats.total - stats.withoutCompany}</h4>
                <p className="mb-0">With Company</p>
              </div>
              <div>
                <i className="fa fa-user-check fa-2x"></i>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* Roles Count */}
      <Col md={2}>
        <Card className="bg-info text-white">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{Object.keys(stats.byRole).length}</h4>
                <p className="mb-0">Different Roles</p>
              </div>
              <div>
                <i className="fa fa-id-badge fa-2x"></i>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* Companies Count */}
      <Col md={2}>
        <Card className="bg-secondary text-white">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">{Object.keys(stats.byCompany).length}</h4>
                <p className="mb-0">Companies</p>
              </div>
              <div>
                <i className="fa fa-building fa-2x"></i>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* Top Roles */}
      <Col md={6}>
        <Card>
          <CardHeader>
            <h5 className="mb-0">Top Roles</h5>
          </CardHeader>
          <CardBody>
            {topRoles.length > 0 ? (
              <div>
                {topRoles.map(([role, count]) => (
                  <div key={role} className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">{role}</span>
                    <Badge color="primary">{count} users</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No role data available</p>
            )}
          </CardBody>
        </Card>
      </Col>

      {/* Top Companies */}
      <Col md={6}>
        <Card>
          <CardHeader>
            <h5 className="mb-0">Top Companies</h5>
          </CardHeader>
          <CardBody>
            {topCompanies.length > 0 ? (
              <div>
                {topCompanies.map(([company, count]) => (
                  <div key={company} className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">{company}</span>
                    <Badge color="success">{count} users</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No company data available</p>
            )}
          </CardBody>
        </Card>
      </Col>

      {/* Role Distribution */}
      <Col md={12}>
        <Card>
          <CardHeader>
            <h5 className="mb-0">Role Distribution</h5>
          </CardHeader>
          <CardBody>
            <Row>
              {Object.entries(stats.byRole).map(([role, count]) => {
                const percentage = ((count / stats.total) * 100).toFixed(1);
                return (
                  <Col md={4} key={role} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{role}</span>
                      <span className="text-muted">{count} ({percentage}%)</span>
                    </div>
                    <div className="progress mt-1" style={{ height: '8px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${percentage}%` }}
                        aria-valuenow={parseFloat(percentage)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default UserStats; 