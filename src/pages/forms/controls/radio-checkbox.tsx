import AnimatedButtons from "@/components_source/Forms/Control/Radio-Checkbox/AnimatedButtons";
import BasicRadioAndCheckbox from "@/components_source/Forms/Control/Radio-Checkbox/BasicRadioAndCheckbox";
import CustomCheckBox from "@/components_source/Forms/Control/Radio-Checkbox/CustomCheckBox";
import CustomRadio from "@/components_source/Forms/Control/Radio-Checkbox/CustomRadio";
import DefaultCheckBox from "@/components_source/Forms/Control/Radio-Checkbox/DefaultCheckBox";
import DefaultRadio from "@/components_source/Forms/Control/Radio-Checkbox/DefaultRadio";
import DefaultSwitches from "@/components_source/Forms/Control/Radio-Checkbox/DefaultSwitches";
import ImagesWithCheckBox from "@/components_source/Forms/Control/Radio-Checkbox/ImagesWithCheckBox";
import ImagesWithRadio from "@/components_source/Forms/Control/Radio-Checkbox/ImagesWithRadio";
import InlineInputTypes from "@/components_source/Forms/Control/Radio-Checkbox/InlineInputTypes";
import OutlinedCheckBoxStyles from "@/components_source/Forms/Control/Radio-Checkbox/OutlinedCheckBoxStyles";
import RadioToggleButtons from "@/components_source/Forms/Control/Radio-Checkbox/RadioToggleButtons";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { FormControlsHeading, RadioCheckBoxHeading } from "utils/Constant";

const RadioCheckBox = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={RadioCheckBoxHeading}
        parent={FormControlsHeading}
        title={RadioCheckBoxHeading}
      />
      <Container fluid={true}>
        <Row>
          <DefaultCheckBox />
          <CustomCheckBox />
          <DefaultRadio />
          <ImagesWithCheckBox />
          <ImagesWithRadio />
          <CustomRadio />
          <DefaultSwitches />
          <InlineInputTypes />
          <AnimatedButtons />
          <BasicRadioAndCheckbox />
          <RadioToggleButtons />
          <OutlinedCheckBoxStyles/>
        </Row>
      </Container>
    </div>
  );
};

export default RadioCheckBox;
