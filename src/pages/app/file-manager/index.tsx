import { Apps, FileManagerHeading, Project } from 'utils/Constant';
import Breadcrumbs from '../../../../CommonElements/Breadcrumbs/index';
import FileManagerContainer from '@/components_source/app/FileManager';

const FileManager = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title={FileManagerHeading} mainTitle={FileManagerHeading} parent={Apps} />
            <FileManagerContainer />
        </div>
    )
}

export default FileManager
