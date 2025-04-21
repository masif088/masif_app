import BasicTablesContainer from "@/components_source/Table/ReactStrapTable/BasicTable";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import { BootstrapBasicTables, BootstrapTables } from "utils/Constant";

const BasicTables = () => {
  return (
    <div className="page-body">
      <Breadcrumbs mainTitle={BootstrapBasicTables} parent={BootstrapTables} title={BootstrapBasicTables}/>
      <BasicTablesContainer />
    </div>
  );
};

export default BasicTables;
