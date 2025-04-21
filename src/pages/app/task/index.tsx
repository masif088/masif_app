import { useContext, useEffect, useState } from "react";
import Breadcrumbs from "../../../../CommonElements/Breadcrumbs";
import { Container, Row } from "reactstrap";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import NavClass from "@/components_source/app/Tasks/NavClass";
import TabClass from "@/components_source/app/Tasks/TabClass";
import TaskContext from "helper/Task";

const TaskLists = ({
  taskList,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { setAllTask } = useContext(TaskContext);

  useEffect(() => {
    setAllTask(taskList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeTab, setActiveTab] = useState("1");
  const activeToggle = (tab: string) => {
    setActiveTab(tab);
  };
  0;

  return (
    <div className="page-body">
      <Breadcrumbs title="Tasks" mainTitle="Tasks" parent="Apps" />
      <Container fluid>
        <div className="email-wrap bookmark-wrap tasks-items">
          <Row>
            <NavClass activeToggle={activeToggle} />
            <TabClass activeTab={activeTab} />
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default TaskLists;

export interface taskListInterFace {
  id: number;
  title: string;
  collection: string;
  description: string;
}

export interface taskNew {
  title: string;
  collection: string;
  description: string;
}

export const getServerSideProps: GetServerSideProps<{
  taskList: taskListInterFace[];
}> = async () => {
  const res = await fetch(process.env.API_URL + "/taskList");
  const taskList = await res.json();
  return {
    props: {
      taskList,
    },
  };
};
