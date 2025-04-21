import CommonRegisterForm from "@/components_source/Others/authentication/common/CommonRegisterForm";
import { Col, Container, Row } from "reactstrap";
import { ImgPath } from "utils/Constant";
import RatioImage from "utils/RatioImage.tsx";

const RegisterWithImage = () => {
  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        <Col xl={5} className="b-center bg-size">
        <RatioImage className="bg-img-cover bg-center img-fluid w-100" src={`${ImgPath}/login/3.jpg`} alt=""/>

        </Col>
        <Col xl={7} className="p-0">
          <CommonRegisterForm alignLogo="text-start" />
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterWithImage;
