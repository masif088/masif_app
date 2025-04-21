import CustomerSidebar from "@/components_source/Dashboard/Pos/CustomerSidebar";
import OurProducts from "@/components_source/Dashboard/Pos/OurProducts";
import ShopCategories from "@/components_source/Dashboard/Pos/ShopCategories";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Col, Container, Row } from "reactstrap";
import { POS } from "utils/Constant";

const PosDashboard = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={POS} mainTitle={POS} parent="Dashboard" />
      <Container fluid={true}>
        <Row>
          <Col xxl={9} xl={8}>
            <Row>
                <ShopCategories/>
                <OurProducts/>
            </Row>
          </Col>
          <Col xxl={3} md={4} className="customer-sidebar-left">
            <CustomerSidebar />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PosDashboard;
