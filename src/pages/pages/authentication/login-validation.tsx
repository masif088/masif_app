import CommonForm from "@/components_source/Others/authentication/common/CommonForm";
import { Col, Container, Row } from "reactstrap";

const LoginWithBackGroundImage = () => {
  return (
    <Container fluid>
      <Row>
        <Col xl={7} className="b-center bg-size order-1 loginImageBg1" />
        <Col xl={5} className="p-0">
          <CommonForm alignLogo="text-start" />
        </Col>
      </Row>
    </Container>
  );
};

export default LoginWithBackGroundImage;
