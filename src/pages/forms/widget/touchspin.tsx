import ButtonsWithPrefixAndPostFix from "@/components_source/Forms/Widget/TouchSpin/ButtonsWithPrefixAndPostFix";
import DefaultTouchSpin from "@/components_source/Forms/Widget/TouchSpin/DefaultTouchSpin";
import IconsWithPrefixAndPostFix from "@/components_source/Forms/Widget/TouchSpin/IconsWithPrefixAndPostFix";
import OutlinedTouchSpin from "@/components_source/Forms/Widget/TouchSpin/OutlinedTouchSpin";
import RoundedTouchSpin from "@/components_source/Forms/Widget/TouchSpin/RoundedTouchSpin.tsx";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { TouchSpinHeading, FormWidgetsHeading } from "utils/Constant";

const TouchSpin = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={TouchSpinHeading}
        parent={FormWidgetsHeading}
        title={TouchSpinHeading}
      />
      <Container fluid={true}>
        <div className="bootstrap-touchspin">
          <Row>
            <DefaultTouchSpin />
            <OutlinedTouchSpin />
            <IconsWithPrefixAndPostFix />
            <ButtonsWithPrefixAndPostFix />
            <RoundedTouchSpin />
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default TouchSpin;
