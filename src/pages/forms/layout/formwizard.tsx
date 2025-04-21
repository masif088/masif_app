import NumberingWizard from "@/components_source/Forms/Layout/Wizard-1/NumberingWizard";
import ShippingForm from "@/components_source/Forms/Layout/Wizard-1/ShippingForm";
import StudentValidationForm from "@/components_source/Forms/Layout/Wizard-1/StudentValidationForm";
import VerticalValidationWizard from "@/components_source/Forms/Layout/Wizard-1/VerticalValidationWizard";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { FormLayoutHeading, FormWizardHeading } from "utils/Constant";

const FormWizard = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={FormWizardHeading}
        parent={FormLayoutHeading}
        title={FormWizardHeading}
      />
      <Container fluid={true}>
        <Row>
        <NumberingWizard/>
        <StudentValidationForm/>
        <VerticalValidationWizard/>
        <ShippingForm/>
        </Row>
      </Container>
    </div>
  );
};

export default FormWizard;
