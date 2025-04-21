import { Container, Row } from "reactstrap";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import HtmlSourcedData from "@/components/table/DataTable/DataSources/HtmlSourcedData";
import AjaxSourcedData from "@/components/table/DataTable/DataSources/AjaxSourcedData";
import JavaScriptSourcedData from "@/components/table/DataTable/DataSources/JavaScriptSourcedData";
import ServerSideProcessing from "@/components/table/DataTable/DataSources/ServerSideProcessing";
import { DATASourceDataTables, DataTables } from "utils/Constant";

const DataSources = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={DATASourceDataTables} mainTitle={DATASourceDataTables} parent={DataTables}/>
      <Container fluid={true}>
        <Row>
            <HtmlSourcedData />
            <AjaxSourcedData />
            <JavaScriptSourcedData />
            <ServerSideProcessing />
        </Row>
      </Container>
    </div>
  );
};

export default DataSources;
