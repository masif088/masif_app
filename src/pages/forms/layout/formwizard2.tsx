import BusinessVerticalWizard from "@/components_source/Forms/Layout/Wizard-2/BusinessVerticalWizard";
import CustomHorizontalWizard from "@/components_source/Forms/Layout/Wizard-2/CustomHorizontalWizard";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { FormLayoutHeading, FormWizard2Heading } from "utils/Constant";

const FormWizard = () => {
  return (
    <div className="page-body form-wizard-2">
      <Breadcrumbs
        mainTitle={FormWizard2Heading}
        parent={FormLayoutHeading}
        title={FormWizard2Heading}
      />
      <Container fluid={true}>
        <Row>
          <CustomHorizontalWizard heading="Custom horizontal wizard" xs={12} />
          <BusinessVerticalWizard
            heading="Business vertical wizard"
            firstXl={3}
            secondXl={9}
            horizontalWizardWrapperClassName="vertical-options"
          />
          <CustomHorizontalWizard
            colClass="main-vertical-wizard"
            diffrentId
            heading="Custom vertical wizard"
            horizontalWizardWrapperClassName="vertical-options vertical-variations"
            firstXl={3}
            secondXl={9}
          />
          <BusinessVerticalWizard
            heading="Business horizontal wizard"
            xs={12}
          />
        </Row>
      </Container>
    </div>
  );
};

export default FormWizard;
