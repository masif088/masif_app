import React, { useContext, useEffect } from "react";
import Breadcrumbs from "../../../../CommonElements/Breadcrumbs";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { todoListInterFace } from "Types/TodoListType";
import { todoListContext } from "helper/TodoList";
import { Apps, ToDoHeading } from "utils/Constant";
import TodoHeader from "@/components_source/app/To-do/TodoHeader";
import TodoList from "@/components_source/app/To-do/TodoList";
import TodoSideBar from "@/components_source/app/To-do/TodoSideBar";
import TodoCheckbox from "@/components_source/app/To-do/TodoCheckbox";

const TodoApp = ({
  todoList,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { setTodoList } = useContext(todoListContext);
  useEffect(() => {
    setTodoList(todoList);
  }, []);

  return (
    <div className="page-body">
      <Breadcrumbs title={ToDoHeading} mainTitle={ToDoHeading} parent={Apps} />
      <Container fluid={true} className="email-wrap bookmark-wrap todo-wrap">
        <Row>
          <Col xl={3} className="xl-30 box-col-12">
            <TodoSideBar />
          </Col>
          <Col xl={9} className="xl-70 box-col-12">
            <Card>
              <TodoHeader />
              <CardBody>
                <div className="todo">
                  <div className="todo-list-wrapper">
                    <div className="todo-list-container">
                      <TodoCheckbox />
                      <TodoList />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TodoApp;

export const getServerSideProps: GetServerSideProps<{
  todoList: todoListInterFace[];
}> = async () => {
  const res = await fetch(process.env.API_URL + "/todoList");
  const todoList = await res.json();
  return {
    props: {
      todoList,
    },
  };
};
