import { NewProjectHeading, App } from 'utils/Constant';
import Breadcrumbs from '../../../../../CommonElements/Breadcrumbs/index';
import CreateNewContainer from '@/components_source/app/project/CreateNew';

const NewProject = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title={NewProjectHeading} mainTitle={NewProjectHeading} parent={App} />
            <CreateNewContainer />
        </div>
    )
}

export default NewProject
