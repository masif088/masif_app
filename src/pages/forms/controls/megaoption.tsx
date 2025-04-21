import DefaultStyle from "@/components_source/Forms/Control/MegaOptions/DefaultStyle";
import HorizontalStyle from "@/components_source/Forms/Control/MegaOptions/HorizontalStyle";
import InlineStyle from "@/components_source/Forms/Control/MegaOptions/InlineStyle";
import OfferStyleBorder from "@/components_source/Forms/Control/MegaOptions/OfferStyleBorder";
import SolidBorderStyle from "@/components_source/Forms/Control/MegaOptions/SolidBorderStyle";
import VariationCheckBox from "@/components_source/Forms/Control/MegaOptions/VariationCheckBox";
import VariationRadio from "@/components_source/Forms/Control/MegaOptions/VariationRadio";
import VerticalStyle from "@/components_source/Forms/Control/MegaOptions/VerticalStyle";
import WithoutBordersStyle from "@/components_source/Forms/Control/MegaOptions/WithoutBordersStyle";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import {  FormControlsHeading, MegaOptionHeading } from "utils/Constant";

const MegaOption = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={MegaOptionHeading}
        parent={FormControlsHeading}
        title={MegaOptionHeading}
      />
      <Container fluid={true}>
        <Row>
        <VariationRadio/>
        <VariationCheckBox/>
        <DefaultStyle/>
        <WithoutBordersStyle/>
        <SolidBorderStyle/>
        <OfferStyleBorder/>
        <InlineStyle/>
        <VerticalStyle/>
        <HorizontalStyle/>

        </Row>
      </Container>
    </div>
  );
};

export default MegaOption;
