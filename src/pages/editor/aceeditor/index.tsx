import Breadcrumbs from 'CommonElements/Breadcrumbs'
import dynamic from 'next/dynamic';
import { AceEditorHeading, Editors } from 'utils/Constant';

const AceEditor = () => {
const AceCodeEditorContainer = dynamic(() => import('@/components_source/Miscellaneous/editors/AceCodeEditor'), { ssr: false });

    return (
        <div className='page-body'>
            <Breadcrumbs title={AceEditorHeading} mainTitle={AceEditorHeading} parent={Editors} />
            <AceCodeEditorContainer/>
        </div>
    )
}

export default AceEditor