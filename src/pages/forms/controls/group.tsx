import BasicInputGroups from "@/components_source/Forms/Control/InputGroups/BasicInputGroups";
import ButtonAddons from "@/components_source/Forms/Control/InputGroups/ButtonAddons";
import ButtonsWithDropDowns from "@/components_source/Forms/Control/InputGroups/ButtonsWithDropDowns";
import CheckBoxesAndRadios from "@/components_source/Forms/Control/InputGroups/CheckBoxesAndRadios";
import CustomFileInput from "@/components_source/Forms/Control/InputGroups/CustomFileInput";
import CustomForms from "@/components_source/Forms/Control/InputGroups/CustomForms";
import MultipleInputs from "@/components_source/Forms/Control/InputGroups/MultipleInputs";
import SegmentedButtons from "@/components_source/Forms/Control/InputGroups/SegmentedButtons";
import Sizing from "@/components_source/Forms/Control/InputGroups/Sizing";
import VariationOfAddons from "@/components_source/Forms/Control/InputGroups/VariationOfAddons";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import {
  FormControlsHeading,
  InputGroupsHeading,
} from "utils/Constant";

const InputGroups = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={InputGroupsHeading}
        parent={FormControlsHeading}
        title={InputGroupsHeading}
      />
      <Container fluid={true}>
        <Row>
          <ButtonAddons/>
          <CustomForms/>
          <CustomFileInput/>
          <ButtonsWithDropDowns/>
          <SegmentedButtons/>
          <CheckBoxesAndRadios/>
          <Sizing/>
          <MultipleInputs/>
          <BasicInputGroups/>
          <VariationOfAddons/>
        </Row>
      </Container>
    </div>
  );
};

export default InputGroups;
