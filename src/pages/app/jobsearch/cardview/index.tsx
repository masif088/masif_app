import { Col, Container, Row } from "reactstrap";
import Breadcrumbs from "../../../../../CommonElements/Breadcrumbs/index";
import CardsClass from "@/components_source/Miscellaneous/jobSearch/JobSearch/Cards";
import CardsPagination from "@/components_source/Miscellaneous/jobSearch/JobSearch/Cards/CardsPagination";
import Sidebar from "@/components_source/Miscellaneous/jobSearch/JobSearch/Sidebar/index";
import { CardViewHeading, Href, JobSearch } from "utils/Constant";
import { useState } from "react";

const CardView = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  return (
    <div className="page-body">
      <Breadcrumbs
        title={CardViewHeading}
        mainTitle={CardViewHeading}
        parent={JobSearch}
      />
      <Container fluid={true}>
        <Row>
          <Col xl={3} className="xl-40  box-col-12 job-card-view">
            <div className="md-sidebar">
              <a
                onClick={() => setShowSideBar(!showSideBar)}
                className="email-aside-toggle md-sidebar-toggle btn btn-primary"
                href={Href}
              >
                job filter
              </a>
              <div className={`md-sidebar-aside job-sidebar ${showSideBar ? "open" : ""} `}>
                <div className="default-according style-1 faq-accordion job-accordion">
                  <Sidebar />
                </div>
              </div>
            </div>
          </Col>
          <Col xl={9} className="xl-60 box-col-12">
            <Row>
              <CardsClass />
              <CardsPagination />
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CardView;
