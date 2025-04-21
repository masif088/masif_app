import GroupButtonContainer from "@/components_source/Buttons/GroupButton";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Col, Container, Row } from "reactstrap";
import { Buttons, ButtonGroupHeading } from "utils/Constant";

const GroupButton = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        title={ButtonGroupHeading}
        mainTitle={ButtonGroupHeading}
        parent={Buttons}
      />
      <Container fluid={true}>
        <GroupButtonContainer />
      </Container>
    </div>
  );
};

export default GroupButton;
