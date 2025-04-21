import BasicTypeAhead from "@/components_source/Forms/Widget/TypeAhead/BasicTypeAhead";
import BloodHound from "@/components_source/Forms/Widget/TypeAhead/BloodHound";
import CustomTemplates from "@/components_source/Forms/Widget/TypeAhead/CustomTemplates";
import MultipleSectionsWithHeaders from "@/components_source/Forms/Widget/TypeAhead/MultipleSectionsWithHeaders";
import PreFetch from "@/components_source/Forms/Widget/TypeAhead/PreFetch";
import RtlSupport from "@/components_source/Forms/Widget/TypeAhead/RTL/RtlSupport";
import RemoteTypeAhead from "@/components_source/Forms/Widget/TypeAhead/RemoteTypeAhead";
import ScrollableDropdownMenu from "@/components_source/Forms/Widget/TypeAhead/ScrollableDropdownMenu";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { TypeAheadHeading, FormWidgetsHeading } from "utils/Constant";

const TypeAhead = () => {
  return (
    <div className="page-body">
      <Breadcrumbs
        mainTitle={TypeAheadHeading}
        parent={FormWidgetsHeading}
        title={TypeAheadHeading}
      />
      <Container fluid={true}>
        <div className="typeahead typeahead-wrapper">
          <Row>
            <BasicTypeAhead/>
            <PreFetch/>
            <BloodHound/>
            <RemoteTypeAhead/>
            <CustomTemplates/>
            <MultipleSectionsWithHeaders/>
            <ScrollableDropdownMenu/>
            <RtlSupport/>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default TypeAhead;
