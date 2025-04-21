import { JobApplyHeading, JobSearch } from 'utils/Constant';
import Breadcrumbs from '../../../../../CommonElements/Breadcrumbs/index';
import JobApplyContainer from "@/components_source/Miscellaneous/jobSearch/JobApply";

const JobApply = () => {
    return (
        <div className='page-body'>
            <Breadcrumbs title={JobApplyHeading} mainTitle={JobApplyHeading} parent={JobSearch} />
          <JobApplyContainer/>
        </div>
    )
}

export default JobApply
