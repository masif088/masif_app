import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, { useState, useEffect } from "react";
import { Col, Container, Row, Card, CardBody, CardHeader, Button, Badge, Progress } from "reactstrap";
import { ActivityService } from "utils/supabase/activityService";
import { ContactEmail } from "Types/ActivityType";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const ContactEmailDashboard = () => {
    const router = useRouter();
    const [contacts, setContacts] = useState<ContactEmail[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        favorites: 0,
        categories: {} as Record<string, number>,
        recentAdded: 0
    });

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const data = await ActivityService.getContactEmails();
            setContacts(data);
            
            // Calculate statistics
            const favorites = data.filter(contact => contact.is_favorite).length;
            const categories: Record<string, number> = {};
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            data.forEach(contact => {
                categories[contact.category] = (categories[contact.category] || 0) + 1;
            });

            const recentAdded = data.filter(contact => 
                contact.created_at && new Date(contact.created_at) > oneWeekAgo
            ).length;

            setStats({
                total: data.length,
                favorites,
                categories,
                recentAdded
            });
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'add':
                router.push('/admin/contact-email');
                break;
            case 'import':
                router.push('/admin/contact-email/import');
                break;
            case 'export':
                router.push('/admin/contact-email/export');
                break;
            case 'favorites':
                // Filter to show only favorites
                break;
        }
    };

    const getTopCategories = () => {
        return Object.entries(stats.categories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
    };

    if (loading) {
        return (
            <div className="page-body">
                <Container fluid={true}>
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="page-body">
            <Breadcrumbs
                title="Contact Dashboard"
                mainTitle="Contact Dashboard"
                parent="Contact Emails"
            />
            <Container fluid={true}>
                {/* Statistics Cards */}
                <Row className="mb-4">
                    <Col xl={3} md={6}>
                        <Card className="bg-primary text-white">
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h4 className="mb-0">{stats.total}</h4>
                                        <p className="mb-0">Total Contacts</p>
                                    </div>
                                    <div className="align-self-center">
                                        <i className="icon-users" style={{fontSize: '2rem'}}></i>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl={3} md={6}>
                        <Card className="bg-warning text-white">
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h4 className="mb-0">{stats.favorites}</h4>
                                        <p className="mb-0">Favorites</p>
                                    </div>
                                    <div className="align-self-center">
                                        <i className="icon-star" style={{fontSize: '2rem'}}></i>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl={3} md={6}>
                        <Card className="bg-success text-white">
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h4 className="mb-0">{Object.keys(stats.categories).length}</h4>
                                        <p className="mb-0">Categories</p>
                                    </div>
                                    <div className="align-self-center">
                                        <i className="icon-tag" style={{fontSize: '2rem'}}></i>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl={3} md={6}>
                        <Card className="bg-info text-white">
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h4 className="mb-0">{stats.recentAdded}</h4>
                                        <p className="mb-0">Added This Week</p>
                                    </div>
                                    <div className="align-self-center">
                                        <i className="icon-plus" style={{fontSize: '2rem'}}></i>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Row className="mb-4">
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <h5>Quick Actions</h5>
                            </CardHeader>
                            <CardBody>
                                <div className="d-flex gap-2 flex-wrap">
                                    <Button 
                                        color="primary" 
                                        onClick={() => handleQuickAction('add')}
                                    >
                                        <i className="icon-plus"></i> Add New Contact
                                    </Button>
                                    <Button 
                                        color="outline-primary" 
                                        onClick={() => handleQuickAction('import')}
                                    >
                                        <i className="icon-download"></i> Import Contacts
                                    </Button>
                                    <Button 
                                        color="outline-success" 
                                        onClick={() => handleQuickAction('export')}
                                    >
                                        <i className="icon-upload"></i> Export Contacts
                                    </Button>
                                    <Button 
                                        color="outline-warning" 
                                        onClick={() => handleQuickAction('favorites')}
                                    >
                                        <i className="icon-star"></i> View Favorites
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    {/* Category Distribution */}
                    <Col xl={6}>
                        <Card>
                            <CardHeader>
                                <h5>Category Distribution</h5>
                            </CardHeader>
                            <CardBody>
                                {getTopCategories().map(([category, count]) => (
                                    <div key={category} className="mb-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>{category}</span>
                                            <span className="text-muted">{count}</span>
                                        </div>
                                        <Progress 
                                            value={(count / stats.total) * 100} 
                                            color="primary"
                                            className="mb-0"
                                        />
                                    </div>
                                ))}
                                {Object.keys(stats.categories).length === 0 && (
                                    <div className="text-center text-muted py-3">
                                        No contacts found
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Recent Contacts */}
                    <Col xl={6}>
                        <Card>
                            <CardHeader>
                                <h5>Recent Contacts</h5>
                            </CardHeader>
                            <CardBody>
                                <div className="recent-contacts">
                                    {contacts
                                        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
                                        .slice(0, 5)
                                        .map(contact => (
                                            <div key={contact.id} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                                                <div>
                                                    <div className="fw-bold">{contact.name}</div>
                                                    <small className="text-muted">{contact.email}</small>
                                                </div>
                                                <div className="text-end">
                                                    <Badge color="info" className="mb-1">{contact.category}</Badge>
                                                    {contact.is_favorite && (
                                                        <i className="icon-star text-warning ms-1"></i>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    {contacts.length === 0 && (
                                        <div className="text-center text-muted py-3">
                                            No contacts found
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ContactEmailDashboard; 