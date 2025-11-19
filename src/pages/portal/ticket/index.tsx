import React from 'react';
import Breadcrumbs from 'CommonElements/Breadcrumbs';
import { Container } from 'reactstrap';

const TicketPage = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        title="Ticket"
        mainTitle="Ticket"
        parent="Portal"
      />
      <Container fluid>
        <div className="text-center py-5">
          <h4>Ticket Management</h4>
          <p className="text-muted">Ticket functionality coming soon...</p>
        </div>
      </Container>
    </div>
  );
};

export default TicketPage;

