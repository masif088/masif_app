import { App, ProjectListHeading } from "utils/Constant";
import Breadcrumbs from "../../../../../CommonElements/Breadcrumbs/index";
import ProjectListContainer from "@/components_source/app/project/ProjectList";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { projectListData } from "Types/projectTypes";
import { useContext, useEffect } from "react";
import ProjectContext from "helper/project";

const ProjectList = ({
  allProjectData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { getAllProjectData } = useContext(ProjectContext);

  useEffect(() => {
    getAllProjectData(allProjectData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-body">
      <Breadcrumbs
        title={ProjectListHeading}
        mainTitle={ProjectListHeading}
        parent={App}
      />
      <ProjectListContainer />
    </div>
  );
};

export default ProjectList;

export const getServerSideProps: GetServerSideProps<{
  allProjectData: projectListData[];
}> = async () => {
  const res = await fetch(process.env.API_URL + "/allProject");
  const allProjectData = await res.json();
  return {
    props: {
      allProjectData,
    },
  };
};
