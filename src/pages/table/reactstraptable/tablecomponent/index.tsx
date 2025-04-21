import TableComponentContainer from '@/components_source/Table/ReactStrapTable/TableComponent';
import Breadcrumbs from 'CommonElements/Breadcrumbs';
import { ReactstrapTables, TableComponents } from 'utils/Constant';

const TableComponent = () => {
  return (
    <div className="page-body">
      <Breadcrumbs mainTitle={TableComponents} parent={ReactstrapTables} title={TableComponents}/>
      <TableComponentContainer />
    </div>
  );
};

export default TableComponent;
