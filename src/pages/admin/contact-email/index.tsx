import Breadcrumbs from "CommonElements/Breadcrumbs";
import React from "react";
import { Col, Container, Row, Card, CardBody, CardHeader, Button } from "reactstrap";
import ContactEmailManager from "src/components/ContactEmailManager";
import { useRouter } from "next/router";

const ContactEmailPage = () => {
    const router = useRouter();
    
    const handleSelectContact = (email: string) => {
        // This is just for the standalone page - in email modal it will be used differently
        console.log('Selected email:', email);
    };

    const handleImportContacts = () => {
        router.push('/admin/contact-email/import');
    };

    const handleExportContacts = () => {
        router.push('/admin/contact-email/export');
    };

    const handleDashboard = () => {
        router.push('/admin/contact-email/dashboard');
    };

    return (
        <div className="page-body">
            <Breadcrumbs
                title="Contact Emails"
                mainTitle="Contact Emails"
                parent="Admin"
            />
            <Container fluid={true}>
                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5>Email Contact Management</h5>
                                    <div className="d-flex gap-2">
                                        <Button 
                                            color="outline-info" 
                                            size="sm"
                                            onClick={handleDashboard}
                                        >
                                            <i className="icon-bar-chart"></i> Dashboard
                                        </Button>
                                        <Button 
                                            color="outline-primary" 
                                            size="sm"
                                            onClick={handleImportContacts}
                                        >
                                            <i className="icon-download"></i> Import Contacts
                                        </Button>
                                        <Button 
                                            color="outline-success" 
                                            size="sm"
                                            onClick={handleExportContacts}
                                        >
                                            <i className="icon-upload"></i> Export Contacts
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <ContactEmailManager 
                                    onSelectContact={handleSelectContact}
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ContactEmailPage; 