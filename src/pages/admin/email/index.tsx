import React from 'react';
import Breadcrumbs from 'CommonElements/Breadcrumbs';
import { Container } from 'reactstrap';

const EmailPage = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        title="Email"
        mainTitle="Email"
        parent="Admin"
      />
      <Container fluid>
        <div className="text-center py-5">
          <h4>Email Management</h4>
          <p className="text-muted">Email functionality coming soon...</p>
        </div>
      </Container>
    </div>
  );
};

export default EmailPage;

