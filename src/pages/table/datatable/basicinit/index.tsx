import { Container } from "reactstrap";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import ZeroConfiguration from "@/components/table/DataTable/BasicInit/ZeroConfiguration";
import StateSaving from "@/components/table/DataTable/BasicInit/StateSaving";
import ScrollVerticalDynamicHeight from "@/components/table/DataTable/BasicInit/ScrollVerticalDynamicHeight";
import { BasicInitHeading, DataTables } from "utils/Constant";

const BasicInit = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={BasicInitHeading} mainTitle={BasicInitHeading} parent={DataTables} />
      <Container fluid={true}>
          <ZeroConfiguration />
          <StateSaving />
          <ScrollVerticalDynamicHeight />
      </Container>
    </div>
  );
};

export default BasicInit;
