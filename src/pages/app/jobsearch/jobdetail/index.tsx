import Breadcrumbs from "../../../../../CommonElements/Breadcrumbs/index";
import JobDetailsContainer from "@/components_source/Miscellaneous/jobSearch/jobDetails";
import { JobDetailHeading, JobSearch } from "utils/Constant";

const JobDetail = () => {
  return (
    <div className="page-body">
      <Breadcrumbs title={JobDetailHeading} mainTitle={JobDetailHeading} parent={JobSearch}/>
      <JobDetailsContainer />
    </div>
  );
};

export default JobDetail;