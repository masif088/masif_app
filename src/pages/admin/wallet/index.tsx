import TimeLineCard from "@/components/TimeLineCard";
import PaperNote from "src/components/PaperNote";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, { useRef } from "react";
import { Col, Container, Row } from "reactstrap";
import {
  Dashboard,
  Default_Util,
  ImgPath,
  MenuWallet,
  Status,
  Tags,
  Welcometext,
  Welcometocuba,
  WhatsNew,
} from "utils/Constant";
import GreetingCard from "@/components/GreetingCard";
import Widgets1 from "../../../../CommonElements/Widgets1";
import {
  Widgets2Data,
  Widgets2Data2,
  WidgetsData3,
} from "@/Data/Dashboard/DefaultData";
import InfoCard from "@/components/InfoCard";
import OrderProfit from "@/components/dashboard/WidgetsWrapper/OrderProfit";
import GoodsReturn from "@/components/dashboard/WidgetsWrapper/GoodsReturn";
import Widgets2 from "../../../../CommonElements/Widgets2";
import { Gantt } from "@syncfusion/ej2-gantt";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { DropDownList } from "@syncfusion/ej2-dropdowns";
import { NumericTextBox, TextBox } from "@syncfusion/ej2-inputs";
import { Kanban, DialogEventArgs } from "@syncfusion/ej2-kanban";
import { createClient } from "utils/supabase/client";
import { log } from "console";

import {
  KanbanComponent,
  ColumnsDirective,
  ColumnDirective,
} from "@syncfusion/ej2-react-kanban";

const Wallet = () => {
  useEffect(() => {
    fetchKanbanDatas();
  }, []);

  let kanbanData: Object[] = [
    {
      Id: 1,
      Status: "Open",
      Summary: "Analyze the new requirements gathered from the customer.",
      Summary2: "Analyze the new requirements gathered from the customer.",
      Type: "Story",
      Priority: "Low",
      Tags: "Analyze,Customer",
      Estimate: 3.5,
      Assignee: "Nancy Davloio",
      RankId: 1,
    },
    {
      Id: 2,
      Status: "InProgress",
      Summary: "Improve application performance",
      Type: "Improvement",
      Priority: "Normal",
      Tags: "Improvement",
      Estimate: 6,
      Assignee: "Andrew Fuller",
      RankId: 1,
    },
    {
      Id: 3,
      Status: "Open",
      Summary:
        "Arrange a web meeting with the customer to get new requirements.",
      Type: "Others",
      Priority: "Critical",
      Tags: "Meeting",
      Estimate: 5.5,
      Assignee: "Janet Leverling",
      RankId: 2,
    },
    {
      Id: 4,
      Status: "InProgress",
      Summary: "Fix the issues reported in the IE browser.",
      Type: "Bug",
      Priority: "Release Breaker",
      Tags: "IE",
      Estimate: 2.5,
      Assignee: "Janet Leverling",
      RankId: 2,
    },
    {
      Id: 5,
      Status: "Testing",
      Summary: "Fix the issues reported by the customer.",
      Type: "Bug",
      Priority: "Low",
      Tags: "Customer",
      Estimate: "3.5",
      Assignee: "Steven walker",
      RankId: 1,
    },
    {
      Id: 6,
      Status: "Close",
      Summary:
        "Arrange a web meeting with the customer to get the login page requirements.",
      Type: "Others",
      Priority: "Low",
      Tags: "Meeting",
      Estimate: 2,
      Assignee: "Michael Suyama",
      RankId: 1,
    },
    {
      Id: 7,
      Status: "Validate",
      Summary: "Validate new requirements",
      Type: "Improvement",
      Priority: "Low",
      Tags: "Validation",
      Estimate: 1.5,
      Assignee: "Robert King",
      RankId: 1,
    },
    {
      Id: 8,
      Status: "Close",
      Summary: "Login page validation",
      Type: "Story",
      Priority: "Release Breaker",
      Tags: "Validation,Fix",
      Estimate: 2.5,
      Assignee: "Laura Callahan",
      RankId: 2,
    },
    {
      Id: 9,
      Status: "Testing",
      Summary: "Fix the issues reported in Safari browser.",
      Type: "Bug",
      Priority: "Release Breaker",
      Tags: "Fix,Safari",
      Estimate: 1.5,
      Assignee: "Nancy Davloio",
      RankId: 2,
    },
    {
      Id: 10,
      Status: "Close",
      Summary: "Test the application in the IE browser.",
      Type: "Story",
      Priority: "Low",
      Tags: "Testing,IE",
      Estimate: 5.5,
      Assignee: "Margaret hamilt",
      RankId: 3,
    },
    {
      Id: 11,
      Status: "Validate",
      Summary: "Validate the issues reported by the customer.",
      Type: "Story",
      Priority: "High",
      Tags: "Validation,Fix",
      Estimate: 1,
      Assignee: "Steven walker",
      RankId: 1,
    },
    {
      Id: 12,
      Status: "Testing",
      Summary: "Check Login page validation.",
      Type: "Story",
      Priority: "Release Breaker",
      Tags: "Testing",
      Estimate: 0.5,
      Assignee: "Michael Suyama",
      RankId: 3,
    },
    {
      Id: 13,
      Status: "Open",
      Summary: "API improvements.",
      Type: "Improvement",
      Priority: "High",
      Tags: "Grid,API",
      Estimate: 3.5,
      Assignee: "Robert King",
      RankId: 3,
    },
    {
      Id: 14,
      Status: "InProgress",
      Summary: "Add responsive support to application",
      Type: "Epic",
      Priority: "Critical",
      Tags: "Responsive",
      Estimate: 6,
      Assignee: "Laura Callahan",
      RankId: 3,
    },
    {
      Id: 15,
      Status: "Open",
      Summary: "Show the retrieved data from the server in grid control.",
      Type: "Story",
      Priority: "High",
      Tags: "Database,SQL",
      Estimate: 5.5,
      Assignee: "Margaret hamilt",
      RankId: 4,
    },
    {
      Id: 16,
      Status: "InProgress",
      Summary: "Fix cannot open users default database SQL error.",
      Priority: "Critical",
      Type: "Bug",
      Tags: "Database,Sql2008",
      Estimate: 2.5,
      Assignee: "Janet Leverling",
      RankId: 4,
    },
    {
      Id: 17,
      Status: "Testing",
      Summary: "Fix the issues reported in data binding.",
      Type: "Story",
      Priority: "Normal",
      Tags: "Databinding",
      Estimate: "3.5",
      Assignee: "Janet Leverling",
      RankId: 4,
    },
    {
      Id: 18,
      Status: "Close",
      Summary: "Analyze SQL server 2008 connection.",
      Type: "Story",
      Priority: "Release Breaker",
      Tags: "Grid,Sql",
      Estimate: 2,
      Assignee: "Andrew Fuller",
      RankId: 4,
    },
    {
      Id: 19,
      Status: "Validate",
      Summary: "Validate databinding issues.",
      Type: "Story",
      Priority: "Low",
      Tags: "Validation",
      Estimate: 1.5,
      Assignee: "Margaret hamilt",
      RankId: 1,
    },
    {
      Id: 20,
      Status: "Close",
      Summary: "Analyze grid control.",
      Type: "Story",
      Priority: "High",
      Tags: "Analyze",
      Estimate: 2.5,
      Assignee: "Margaret hamilt",
      RankId: 5,
    },
    {
      Id: 21,
      Status: "Close",
      Summary: "Stored procedure for initial data binding of the grid.",
      Type: "Others",
      Priority: "Release Breaker",
      Tags: "Databinding",
      Estimate: 1.5,
      Assignee: "Steven walker",
      RankId: 6,
    },
    {
      Id: 22,
      Status: "Close",
      Summary: "Analyze stored procedures.",
      Type: "Story",
      Priority: "Release Breaker",
      Tags: "Procedures",
      Estimate: 5.5,
      Assignee: "Janet Leverling",
      RankId: 7,
    },
    {
      Id: 23,
      Status: "Validate",
      Summary: "Validate editing issues.",
      Type: "Story",
      Priority: "Critical",
      Tags: "Editing",
      Estimate: 1,
      Assignee: "Nancy Davloio",
      RankId: 1,
    },
    {
      Id: 24,
      Status: "Testing",
      Summary: "Test editing functionality.",
      Type: "Story",
      Priority: "Normal",
      Tags: "Editing,Test",
      Estimate: 0.5,
      Assignee: "Nancy Davloio",
      RankId: 5,
    },
    {
      Id: 25,
      Status: "Open",
      Summary: "Enhance editing functionality.",
      Type: "Improvement",
      Priority: "Low",
      Tags: "Editing",
      Estimate: 3.5,
      Assignee: "Andrew Fuller",
      AssigneeName: "Andrew Fuller22",
      RankId: 5,
      link: "https://www.google.com",
    },
  ];

  const [kanbanDatas, setKanbanDatas] = useState<Object[]>([]);


  const fetchKanbanDatas = async () => {
    const { data, error } = await createClient().from("kanban_tasks").select("*");
    if (error) throw error;
    console.log(data);
    setKanbanDatas(data);
    console.log(kanbanDatas);
  };

  let statusData: string[] = [
    "Open",
    "InProgress",
    "Close",
    "Testing",
    "Validate",
    "Others",
  ];

  let assigneeData: string[] = [
    "Asif",
    "Nancy Davloio",
    "Andrew Fuller",
    "Janet Leverling",
    "Steven walker",
    "Robert King",
    "Margaret hamilt",
    "Michael Suyama",
  ];
  let priorityData: string[] = [
    "Low",
    "Normal",
    "Critical",
    "Release Breaker",
    "High",
  ];

  function onDialogOpen(args: DialogEventArgs): void {
    if (args.requestType !== "Delete") {
      let curData: { [key: string]: Object } = args.data;
      let filledTextBox: TextBox = new TextBox({
        value: curData.id as string,
      });
      filledTextBox.appendTo(
        args.element?.querySelector("#Id") as HTMLInputElement
      );
      let numericObj: NumericTextBox = new NumericTextBox({
        value: curData.estimate as number,
        placeholder: "Estimate",
      });
      numericObj.appendTo(
        args.element?.querySelector("#Estimate") as HTMLInputElement
      );
      let statusDropObj: DropDownList = new DropDownList({
        value: curData.status as string,
        popupHeight: "300px",
        dataSource: statusData,
        fields: { text: "status", value: "status" },
        placeholder: "Status",
      });
      statusDropObj.appendTo(
        args.element?.querySelector("#Status") as HTMLInputElement
      );
      let assigneeDropObj: DropDownList = new DropDownList({
        value: curData.assignee as string,
        popupHeight: "300px",
        dataSource: assigneeData,
        fields: { text: "assignee", value: "assignee" },
        placeholder: "Assignee",
      });
      assigneeDropObj.appendTo(
        args.element?.querySelector("#Assignee") as HTMLInputElement
      );
      let priorityObj: DropDownList = new DropDownList({
        value: curData.priority as string,
        popupHeight: "300px",
        dataSource: priorityData,
        fields: { text: "priority", value: "priority" },
        placeholder: "Priority",
      });
      priorityObj.appendTo(
        args.element?.querySelector("#Priority") as HTMLInputElement
      );
      let textareaObj: TextBox = new TextBox({
        placeholder: "Summary",
        multiline: true,
        value: curData.summary as string,
      });
      textareaObj.appendTo(
        args.element?.querySelector("#Summary") as HTMLInputElement
      );
    }
  }

  const actionComplete = (args: any) => {

    if (args.requestType === "cardRemoved") {
      args.deletedRecords.forEach((record: any) => {
        handleDelete(record.id);
      });
    } else if (
      args.requestType === "cardCreated" ||
      args.requestType === "cardChanged"
    ) {
        args.changedRecords.forEach((record: any) => {
            handleSave(record);
        });
    }
  };


  const handleSave = async (args: any) => {
    try {
      const { data, error } = await createClient().from("kanban_tasks").upsert({
        id: args.id,
        status: args.status,
        summary: args.summary,
        type: args.type,
        priority: args.priority,
        tags: args.tags,
        estimate: args.estimate,
        assignee: args.assignee,
        rank_id: args.rank_id,
      });
      if (error) throw error;
      toast.success("Task saved successfully");
    } catch (error) {
    
      toast.error("Failed to save task");
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      const { error } = await createClient()
        .from("kanban_tasks")
        .delete()
        .eq("id", id);

        fetchKanbanDatas();
      if (error) throw error;
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const cardTemplate = (props: any) => {
    return (
      <div className="card-template">
        
        <div className="card border-0 border-primary" style={{ margin: "0px" }}>
          <div className="card-header">
            <div className="card-title">{props.summary}</div>
          </div>
          <div className="card-body">
            <div className="card-title">{props.summary}</div>
            <div className="card-text">{props.tags}</div>
            <div className="card-text">{props.priority}</div>
            <div className="card-text">{props.type}</div>
            <div className="card-text">{props.id}</div>
            <div className="card-text">{props.assignee}</div>
            <div className="card-text">{props.estimate}</div>
            <div className="btn btn-primary">
              <a href={props.link} target="_blank" className="text-white">
                <i className="icon-link"></i>
              </a>
            </div>
            <button
              onClick={() => {
                handleDelete(props.id)
            
              }}
              className="btn btn-danger"
            >
              <i className="icon-trash"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-body">
      <Breadcrumbs
        title={MenuWallet}
        mainTitle={MenuWallet}
        parent={MenuWallet}
      />
      <Container fluid={true}>
        <Row className="">
          <Col xl={12} sm={12}>
            <KanbanComponent
              id="kanban"
              style={{ padding: "10px 0" }}
              keyField="status"
              dataSource={kanbanDatas}
              cardSettings={{
                contentField: "summary",
                headerField: "id",
                template: cardTemplate.bind(this),
                showHeader: true,
                selectionType: "Multiple"
              }}
              dialogSettings={{ 
                template: "#dialogTemplate",
                fields: [
                  { text: "Id", key: "id", type: "TextBox" },
                  { text: "Status", key: "status", type: "DropDown" },
                  { text: "Summary", key: "summary", type: "TextArea" },
                  { text: "Type", key: "type", type: "TextBox" },
                  { text: "Priority", key: "priority", type: "DropDown" },
                  { text: "Tags", key: "tags", type: "TextBox" },
                  { text: "Estimate", key: "estimate", type: "Numeric" },
                  { text: "Assignee", key: "assignee", type: "DropDown" }
                ]
              }}
              dialogOpen={onDialogOpen}
              swimlaneSettings={{ keyField: "assignee" }}
              actionComplete={actionComplete}
              allowDragAndDrop={true}
              allowKeyboard={true}
              enableTooltip={true}
              columnsTemplate="#test"
            >
              <ColumnsDirective>
                <ColumnDirective headerText="To Do" keyField="Open" />
                <ColumnDirective headerText="In Progress"keyField="InProgress"/>
                <ColumnDirective headerText="Testing" keyField="Testing" />
                <ColumnDirective headerText="Done" keyField="Close" />
                <ColumnDirective headerText="Others" keyField="Others" />
              </ColumnsDirective>
            </KanbanComponent>
          </Col>
        </Row>
      </Container>
      <script id="test" type="text/x-template">
        <div>
          <h1>Test</h1>
        </div>
      </script>
      <script id="dialogTemplate" type="text/x-template">
        <table>
          <tbody>
            <tr>
              <td className="e-label">ID</td>
              <td>
                <input
                  id="Id"
                  name="Id"
                  type="text"
                  className="e-field"
                  value="${id}"
                  disabled
                  required
                />
              </td>
            </tr>
            <tr>
              <td className="e-label">Status</td>
              <td>
                <input
                  type="text"
                  name="status"
                  id="Status"
                  className="e-field"
                  required
                />
              </td>
            </tr>
            <tr>
              <td className="e-label">Assigne</td>
              <td>
                <input
                  type="text"
                  name="assignee"
                  id="Assignee"
                  className="e-field"
                />
              </td>
            </tr>
            <tr>
              <td className="e-label">Priority</td>
              <td>
                <input
                  type="text"
                  name="priority"
                  id="Priority"
                  className="e-field"
                />
              </td>
            </tr>
            <tr>
              <td className="e-label">Summary</td>
              <td>
                <textarea name="summary" id="Summary" className="e-field">
                  {}
                </textarea>
                <span className="e-float-line"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </script>
    </div>
  );
};

export default Wallet;
