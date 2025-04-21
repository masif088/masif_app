import CommonForm from "@/components_source/Others/authentication/common/CommonForm";
import { Col, Container, Row } from "reactstrap";
import { ImgPath } from "utils/Constant";
import RatioImage from "utils/RatioImage.tsx";

const LoginWithBackGroundImage = () => {
  return (
    <Container fluid>
      <Row>
        <Col xl={7} className="b-center bg-size">
        <RatioImage className="bg-img-cover bg-center img-fluid w-100" src={`${ImgPath}/login/2.jpg`} alt=""/>
        </Col>
        <Col xl={5} className="p-0">
          <CommonForm alignLogo="text-start" />
        </Col>
      </Row>
    </Container>
  );
};

export default LoginWithBackGroundImage;
