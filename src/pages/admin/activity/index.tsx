import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "reactstrap";
import {MenuWallet, Status, Tags,} from "utils/Constant";
import {toast} from "react-toastify";
import {DropDownList} from "@syncfusion/ej2-dropdowns";
import {TextBox} from "@syncfusion/ej2-inputs";
import {DialogEventArgs} from "@syncfusion/ej2-kanban";
import {createClient} from "utils/supabase/client";

import {ColumnDirective, ColumnsDirective, KanbanComponent,} from "@syncfusion/ej2-react-kanban";
import { log } from "console";

const Wallet = () => {
    useEffect(() => {
        fetchKanbanDatas();
        fetchAssigneeData()
    }, []);


    const [kanbanDatas, setKanbanDatas] = useState<Object[]>([]);
    const [kanbanDatasFiltered, setKanbanDatasFiltered] = useState<Object[]>([]);
    const [statusData, setStatusData] = useState<string[]>([]);

    // Function to filter kanbanDatas by tags
    const filterKanbanDatasByTags = (tags: string[]) => {
        if (!tags || tags.length === 0) {
            setKanbanDatasFiltered(kanbanDatas);
            return;
        }
        const filtered = kanbanDatas.filter((item: any) => {


            if (!item.tags) return false;
            // item.tags could be a comma-separated string or array
            // item.tags is a string with pattern tag1,tag2,tag3
            const itemTags: string[] = item.tags.split(",").map((t: string) => t.trim());

            console.log(itemTags, tags);
            // Check if any of the filter tags are present in itemTags
            // return tags.some((tag) => itemTags.includes(tag));
            // Check if any of the filter tags are present in itemTags (case-insensitive)
            return tags.some((tag) => itemTags.map((t) => t.toLowerCase()).includes(tag.toLowerCase()));
        });
        console.log(filtered);
        setKanbanDatasFiltered(filtered);

    };


    const fetchKanbanDatas = async () => {
        const {data, error} = await createClient().from("activities").select("*, activity_priorities(*), users(*)");
        if (error) throw error;
        console.log(data);
        data.forEach((item: any) => {
            item.assignee = item.users.first_name + " " + item.users.last_name;
        });

        const {data: statusData, error: statusError} = await createClient().from("activity_priorities").select("*");
        if (statusError) throw statusError;
        // Convert statusData to array of titles
        console.log(statusData);
        const statusTitles = statusData.map((status: any) => status.title);
        console.log(statusTitles);

        setStatusData(statusTitles);

        // Get all users to ensure all assignees are available for swimlanes
        const {data: allUsers, error: usersError} = await createClient().from("users").select("*");
        if (usersError) throw usersError;

        // Create empty cards for users who don't have any activities
        const usersWithActivities = new Set(data.map((item: any) => item.user_id));
        const emptyCards = allUsers
            .filter((user: any) => !usersWithActivities.has(user.id))
            .map((user: any) => ({
                id: `empty-${user.id}`,
                status: "Open",
                summary: "",
                type: "",
                priority: "",
                tags: "",
                activity_start: new Date().toISOString(),
                activity_end: new Date().toISOString(),
                link: "",
                user_id: user.id,
                assignee: user.first_name + " " + user.last_name,
                activity_priorities: { title: "Open", color: "primary" },
                users: user,
                isPlaceholder: true // Flag to identify placeholder cards
            }));

        const allData = [...data, ...emptyCards];
        setKanbanDatas(allData);
        setKanbanDatasFiltered(allData);
    };

    // let statusData: string[] = [
    //   "Open",
    //   "InProgress",
    //   "Close",
    //   "Testing",
    //   "Validate",
    //   "Others",
    // ];

    const [assigneeData, setAssigneeData] = useState<any[]>([]);
    const fetchAssigneeData = async () => {
        let d:any = {};
        const {data,error} = await createClient().from("users").select("*");
        if (data){
            data.forEach((item: any) => {
                d[item.id] = item;
            })
        }
        setAssigneeData(d);
        if (error) throw error;
    }
    // let assigneeData: string[] = ["Asif", "Nancy Davloio", "Andrew Fuller", "Janet Leverling", "Steven walker", "Robert King", "Margaret hamilt", "Michael Suyama",];
    let priorityData: string[] = ["Low", "Normal", "Critical", "Release Breaker", "High",];
    let badgeData: string[] = ["badge-primary", "badge-secondary", "badge-success", "badge-danger", "badge-warning", "badge-info", "badge-light", "badge-dark",];
    function onDialogOpen(args: DialogEventArgs): void {
        if (args.requestType !== "Delete") {
            let curData: { [key: string]: Object } = args.data;
            console.log(curData);
            console.log(statusData);
            let filledTextBox: TextBox = new TextBox({
                value: curData.id as string,
            });
            filledTextBox.appendTo(args.element?.querySelector("#Id") as HTMLInputElement);

            let statusDropObj: DropDownList = new DropDownList({
                value: curData.status as string,
                popupHeight: "300px",
                dataSource: statusData,
                fields: {text: "title", value: "title"},
                placeholder: "Status",
            });
            statusDropObj.appendTo(args.element?.querySelector("#Status") as HTMLInputElement);

            let assigneeDropObj: DropDownList = new DropDownList({
                value: curData.assignee as string,
                popupHeight: "300px",
                dataSource: Object.values(assigneeData),
                fields: {text: "last_name", value: "id"},
                placeholder: "Assignee",
            });
            assigneeDropObj.appendTo(args.element?.querySelector("#Assignee") as HTMLInputElement);
            let priorityObj: DropDownList = new DropDownList({
                value: curData.priority as string,
                popupHeight: "300px",
                dataSource: priorityData,
                fields: {text: "priority", value: "priority"},
                placeholder: "Priority",
            });
            priorityObj.appendTo(args.element?.querySelector("#Priority") as HTMLInputElement);
            let textareaObj: TextBox = new TextBox({
                placeholder: "Summary", multiline: true, value: curData.summary as string,
            });
            textareaObj.appendTo(args.element?.querySelector("#Summary") as HTMLInputElement);
        }
    }

    const actionComplete = (args: any) => {

        if (args.requestType === "cardRemoved") {
            args.deletedRecords.forEach((record: any) => {
                handleDelete(record.id);
            });
        } else if (args.requestType === "cardCreated" || args.requestType === "cardChanged") {
            args.changedRecords.forEach((record: any) => {
                handleSave(record);
            });
        }
        // fetchKanbanDatas()
    };


    const handleSave = async (args: any) => {
        console.log(args);
        try {
            const {data, error} = await createClient().from("activities").upsert({
                id: args.id,
                status: args.status,
                description: args.description,
                type: args.type,
                priority: args.priority,
                tags: args.tags,
                activity_start: args.activity_start,
                activity_end: args.activity_end,
                link: args.link,
                user_id: args.user_id, // rank_id: args.rank_id,
            });
            if (data) {
                // Update kanbanDataFiltered to reflect the new user_id and assignee
                setKanbanDatasFiltered(prevData => 
                    prevData.map((item: any) => 
                        item.id === args.id 
                            ? {
                                ...item,
                                user_id: args.user_id,
                                assignee: args.user_id // Update assignee to match user_id
                              }
                            : item
                    )
                );
            }
            // fetchKanbanDatas()
            if (error) throw error;
            toast.success("Task saved successfully");
        } catch (error) {
            console.log(error);

            toast.error("Failed to save task");
        }
    };

    const handleDelete = async (id: string | number) => {
        try {
            const {error} = await createClient()
                .from("activities")
                .delete()
                .eq("id", id);

            fetchKanbanDatas();
            if (error) throw error;
            toast.success("Task deleted successfully");
        } catch (error) {
            toast.error("Failed to delete task");
        }
    };
    const formatDate = (date: string) => {
        const dateObj = new Date(date);
        return dateObj.getFullYear() + "-" + (dateObj.getMonth() + 1) + "-" + dateObj.getDate() + " " + dateObj.getHours() + ":" + dateObj.getMinutes();
    }

    const cardTemplate = (props: any) => {
        return (<div className="card-template">

                <div className="card border-0 border-primary" style={{margin: "0px"}}>
                    <div className="card-header" style={{padding: '10px 20px 0 20px', margin: 0}}>
                        <div className="card-title">{props.title}</div>
                    </div>
                    <div className="card-body" style={{padding: '20px',}}>

                        <div className="" style={{display: 'flex', gap: '3px', flexWrap: 'wrap'}}>
                            <div className="d-inline-block mr-1" key={0}>

                                <div
                                    className={`badge badge-${props.activity_priorities.color} }`}>{props.activity_priorities.title}</div>
                            </div>

                            {props.tags.split(',').map((tag2: any, idx: number) => (
                                <div className="d-inline-block mr-1" key={idx}
                                     onClick={() => filterKanbanDatasByTags([tag2.trim()])}>
                                    <div className={`badge ${badgeData[idx]}`}>{tag2}</div>
                                </div>))}
                        </div>

                        <div className="card-text"> Start: {formatDate(props.activity_start)}</div>
                        <div className="card-text"> End: {formatDate(props.activity_end)}</div>
                        {props.link && (<div className="btn btn-primary">
                                <a href={props.link} target="_blank" className="text-white">
                                    <i className="icon-link"></i>
                                </a>
                            </div>)}
                    </div>
                </div>
            </div>);
    };

    return (<div className="page-body">
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
                            style={{padding: "10px 0"}}
                            keyField="status"
                            dataSource={kanbanDatasFiltered}
                            cardSettings={{
                                contentField: "summary",
                                headerField: "id",
                                template: cardTemplate.bind(this),
                                showHeader: true,
                                selectionType: "Multiple"
                            }}
                            dialogSettings={{
                                template: "#dialogTemplate",
                                fields: [{text: "Id", key: "id", type: "TextBox"}, {
                                    text: "Status",
                                    key: "status",
                                    type: "DropDown"
                                }, {text: "Summary", key: "summary", type: "TextArea"}, {
                                    text: "Type",
                                    key: "type",
                                    type: "TextBox"
                                }, {text: "Priority", key: "priority", type: "DropDown"}, {
                                    text: "Tags",
                                    key: "tags",
                                    type: "TextBox"
                                }, {text: "Estimate", key: "estimate", type: "Numeric"},

                                    {text: "assignee", key: "user_id", type: "DropDown"}]
                            }}
                            dialogOpen={onDialogOpen}
                            swimlaneSettings={{keyField: "user_id", textField: "assignee",showEmptyRow: true}}
                            actionComplete={actionComplete}
                            allowDragAndDrop={true}
                            allowKeyboard={true}
                            enableTooltip={true}
                            columnsTemplate="#test"
                        >
                            <ColumnsDirective>
                                <ColumnDirective headerText="To Do" keyField="Open"/>
                                <ColumnDirective headerText="In Progress" keyField="InProgress"/>
                                <ColumnDirective headerText="Testing" keyField="Testing"/>
                                <ColumnDirective headerText="Done" keyField="Done"/>
                                <ColumnDirective headerText="Others" keyField="Others"/>
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
                                name="user_id"
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
        </div>);
};

export default Wallet;
