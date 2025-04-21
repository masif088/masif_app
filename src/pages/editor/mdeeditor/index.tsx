import Breadcrumbs from "CommonElements/Breadcrumbs";
import dynamic from "next/dynamic";
import { Editors, MDEEditorHeading } from "utils/Constant";

const MdeEditor = () => {
  const MdeEditorContainer = dynamic(() => import('@/components_source/Miscellaneous/editors/MdeEditor'), { ssr: false });

  return (
    <div className="page-body">
      <Breadcrumbs title={MDEEditorHeading} mainTitle={MDEEditorHeading} parent={Editors}/>
      <MdeEditorContainer />
    </div>
  );
};

export default MdeEditor;
