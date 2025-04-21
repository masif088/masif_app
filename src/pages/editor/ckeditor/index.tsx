
import Breadcrumbs from "CommonElements/Breadcrumbs";
import dynamic from "next/dynamic";
import { CKEditorHeading, Editors } from "utils/Constant";

const CkEditor = () => {
  const CkEditorContainer = dynamic(() => import('@/components_source/Miscellaneous/editors/CkEditor'), { ssr: false });
  return (
    <div className="page-body">
      <Breadcrumbs title={CKEditorHeading} mainTitle={CKEditorHeading} parent={Editors}/>
      <CkEditorContainer />
    </div>
  );
};

export default CkEditor;
