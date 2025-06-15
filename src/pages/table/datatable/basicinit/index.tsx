import { Container } from "reactstrap";
import Breadcrumbs from "CommonElements/Breadcrumbs";

// import StateSaving from "@/components/table/datatable/basicinit/StateSaving";
// import ScrollVerticalDynamicHeight from "@/components/table/datatable/basicinit/ScrollVerticalDynamicHeight";
import { BasicInitHeading, DataTables } from "utils/Constant";

const BasicInit = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={BasicInitHeading} mainTitle={BasicInitHeading} parent={DataTables} />
      <Container fluid={true}>
          {/* <ZeroConfiguration />
          <StateSaving />
          <ScrollVerticalDynamicHeight /> */}
      </Container>
    </div>
  );
};

export default BasicInit;
