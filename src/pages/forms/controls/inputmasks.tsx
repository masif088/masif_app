import InputMasksContainer from "@/components_source/Forms/Control/InputMasksContainer";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { FormControlsHeading, InputMasksHeading } from "utils/Constant";

const InputMasks = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={InputMasksHeading}
        parent={FormControlsHeading}
        title={InputMasksHeading}
      />
      <Container fluid={true}>
        <Row>
          <InputMasksContainer />
        </Row>
      </Container>
    </div>
  );
};

export default InputMasks;
