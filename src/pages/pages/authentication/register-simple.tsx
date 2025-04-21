import CommonRegisterForm from "@/components_source/Others/authentication/common/CommonRegisterForm";
import { Col, Container, Row } from "reactstrap";

const RegisterSimple = () => {
  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        <Col xs={12} className="p-0">
          <CommonRegisterForm />
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterSimple;
