import BasicFloatingInputControl from "@/components_source/Forms/Control/BaseInputs/BasicFloatingInputControl";
import BasicForm from "@/components_source/Forms/Control/BaseInputs/BasicForm";
import BasicHTMLInputControl from "@/components_source/Forms/Control/BaseInputs/BasicHTMLInputControl";
import EdgesInputStyle from "@/components_source/Forms/Control/BaseInputs/EdgesInputStyle";
import FileInput from "@/components_source/Forms/Control/BaseInputs/FileInput";
import FlatInputStyle from "@/components_source/Forms/Control/BaseInputs/FlatInputStyle";
import FloatingForm from "@/components_source/Forms/Control/BaseInputs/FloatingForm";
import FormControlSizing from "@/components_source/Forms/Control/BaseInputs/FormControlSizing";
import RaiseInputStyle from "@/components_source/Forms/Control/BaseInputs/RaiseInputStyle";
import SelectSizing from "@/components_source/Forms/Control/BaseInputs/SelectSizing";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { BaseInputsHeading, FormControlsHeading } from "utils/Constant";

const FormValidation = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={BaseInputsHeading}
        parent={FormControlsHeading}
        title={BaseInputsHeading}
      />
      <Container fluid={true}>
        <Row>
          <BasicForm />
          <FloatingForm />
          <SelectSizing />
          <FormControlSizing />
          <FileInput />
          <FlatInputStyle/>
          <BasicHTMLInputControl/>
          <BasicFloatingInputControl/>
          <EdgesInputStyle/>
          <RaiseInputStyle/>
        </Row>
      </Container>
    </div>
  );
};

export default FormValidation;
