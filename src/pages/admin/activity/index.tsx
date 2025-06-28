import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "reactstrap";
import {MenuWallet, Status, Tags,} from "utils/Constant";
import {toast} from "react-toastify";
import {DropDownList} from "@syncfusion/ej2-dropdowns";
import {TextBox} from "@syncfusion/ej2-inputs";
import {DialogEventArgs} from "@syncfusion/ej2-kanban";
import {ActivityService} from "utils/supabase/activityService";

import {ColumnDirective, ColumnsDirective, KanbanComponent,} from "@syncfusion/ej2-react-kanban";
import { log } from "console";
import CreateActivity from "./create";
import { Activity, ActivityStatus } from "Types/ActivityType";
import EditActivity from "./edit";

const ActivityKanban = () => {
    useEffect(() => {
        fetchKanbanDatas();
        fetchAssigneeData();
        fetchStatusData();
        fetchPriorityData();
    }, []);

    const [kanbanDatas, setKanbanDatas] = useState<any[]>([]);
    const [kanbanDatasFiltered, setKanbanDatasFiltered] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<ActivityStatus[]>([]);
    const [assigneeData, setAssigneeData] = useState<any[]>([]);
    const [priorityData, setPriorityData] = useState<any[]>([]);
    

    const fetchStatusData = async () => {
        try {
            const data = await ActivityService.getActivityStatus();
            const filteredData = data.filter((status: ActivityStatus) => status.is_active !== false);
            setStatusData(filteredData);
        } catch (error) {
            console.error('Error fetching priorities:', error);
            toast.error('Failed to load priorities');
        }
    }

    const fetchPriorityData = async () => {
        try {
            const data = await ActivityService.getActivityPriorities();
            setPriorityData(data);
        } catch (error) {
            console.log('Error fetching priorities:', error);
            toast.error('Failed to load priorities');
        }
    }

    

    // Function to filter kanbanDatas by tags
    const filterKanbanDatasByTags = (tags: string[]) => {
        if (!tags || tags.length === 0) {
            setKanbanDatasFiltered(kanbanDatas);
            return;
        }
        const filtered = kanbanDatas.filter((item: any) => {
            if (!item.tags) return false;
            const itemTags: string[] = item.tags.split(",").map((t: string) => t.trim());
            return tags.some((tag) => itemTags.map((t) => t.toLowerCase()).includes(tag.toLowerCase()));
        });
        setKanbanDatasFiltered(filtered);
    };

    const fetchKanbanDatas = async () => {
        try {
            const data = await ActivityService.getActivities();
            
            // Transform data for Kanban
            const transformedData = data.map((item: any) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                status: item.status,
                priority: item.priority,
                type: item.type,
                tags: item.tags || '',
                activity_start: item.activity_start,
                activity_end: item.activity_end,
                link: item.link,
                user_id: item.user_id,
                assignee: item.users ? `${item.users.first_name} ${item.users.last_name}` : 'Unassigned',
                activity_priorities: item.activity_priorities || { title: item.status, color: 'primary' },
                users: item.users,
                due_date: item.due_date,
                note: item.note,
                level: item.activity_priorities.level || 0,
                column_index: item.column_index || 0
            }));

            // Get all users to ensure all assignees are available for swimlanes
            const allUsers = await ActivityService.getUsers();
            const usersWithActivities = new Set(transformedData.map((item: any) => item.user_id));
            
            // Create empty cards for users who don't have any activities
            const emptyCards = allUsers
                .filter((user: any) => !usersWithActivities.has(user.id))
                .map((user: any) => ({
                    id: `empty-${user.id}`,
                    title: '',
                    status: "Open",
                    priority: '',
                    type: '',
                    tags: '',
                    activity_start: new Date().toISOString(),
                    activity_end: new Date().toISOString(),
                    link: '',
                    user_id: user.id,
                    assignee: `${user.first_name} ${user.last_name}`,
                    activity_priorities: { title: "Open", color: "primary" },
                    users: user,
                    due_date: '',
                    note: '',
                    isPlaceholder: true
                }));

            const allData = [...transformedData, ...emptyCards];
            setKanbanDatas(allData);
            setKanbanDatasFiltered(allData);
        } catch (error) {
            console.error('Error fetching activities:', error);
            toast.error('Failed to load activities');
        }
    };

    const fetchAssigneeData = async () => {
        try {
            const users = await ActivityService.getUsers();
            setAssigneeData(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const badgeData: string[] = ["badge-primary", "badge-secondary", "badge-success", "badge-danger", "badge-warning", "badge-info", "badge-light", "badge-dark"];

    function onDialogOpen(args: DialogEventArgs): void {
        if (args.requestType !== "Delete") {
            let curData: { [key: string]: Object } = args.data;
            
            let filledTextBox: TextBox = new TextBox({
                value: curData.id as string,
            });
            filledTextBox.appendTo(args.element?.querySelector("#Id") as HTMLInputElement);

            let statusDropObj: DropDownList = new DropDownList({
                value: curData.status as string,
                popupHeight: "300px",
                dataSource: statusData.map((status: any) => status.title),
                fields: {text: "title", value: "title"},
                placeholder: "Status",
            });
            statusDropObj.appendTo(args.element?.querySelector("#Status") as HTMLInputElement);

            let assigneeDropObj: DropDownList = new DropDownList({
                value: curData.user_id as string,
                popupHeight: "300px",
                dataSource: assigneeData,
                fields: {text: "first_name", value: "id"},
                placeholder: "Assignee",
            });
            assigneeDropObj.appendTo(args.element?.querySelector("#Assignee") as HTMLInputElement);

            let priorityObj: DropDownList = new DropDownList({
                value: curData.priority as string,
                popupHeight: "300px",
                dataSource: priorityData,
                fields: {text: "title", value: "title"},
                placeholder: "Priority",
            });
            priorityObj.appendTo(args.element?.querySelector("#Priority") as HTMLInputElement);

            
        }
    }

    const actionComplete = (args: any) => {    
        if (args.requestType === "cardRemoved") {
            args.deletedRecords.forEach((record: any) => {
                handleDelete(record.id);
            });
        } else if (args.requestType === "cardCreated" || args.requestType === "cardChanged") {
            args.changedRecords.forEach((record: any) => {
                if(record.title!==''){
                    handleSave(record);
                }
            });
        }
    };

    const handleSave = async (args: any) => {    
        try {
            const updateData = {
                id: args.id,
                status: args.status,
                type: args.type,
                priority: args.priority,
                tags: args.tags,
                activity_start: args.activity_start,
                activity_end: args.activity_end,
                link: args.link,
                user_id: args.user_id,
            };

            await ActivityService.updateActivity(args.id, updateData);
            fetchKanbanDatas();
            
            toast.success("Activity updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update activity");
        }
    };

    const handleDelete = async (id: string | number) => {
        try {
            await ActivityService.deleteActivity(Number(id));
            fetchKanbanDatas();
            toast.success("Activity deleted successfully");
        } catch (error) {
            toast.error("Failed to delete activity");
        }
    };


    

    const formatDate = (date: string) => {
        if (!date) return 'Not set';
        const dateObj = new Date(date);
        return dateObj.getFullYear() + "-" + 
               String(dateObj.getMonth() + 1).padStart(2, '0') + "-" + 
               String(dateObj.getDate()).padStart(2, '0') + " " + 
               String(dateObj.getHours()).padStart(2, '0') + ":" + 
               String(dateObj.getMinutes()).padStart(2, '0');
    }
    
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    
    const handleEditActivity = (activity: Activity) => {
        setSelectedActivity(activity);
        setEditModalOpen(true);
    };



    const cardTemplate = (props: any) => {
        if (props.isPlaceholder) {
            return (
                <div className="card-template">
                    <div className="card border-0 border-light" style={{margin: "0px", opacity: 0.5}}>
                        <div className="card-body text-center" style={{padding: '20px'}}>
                            <div className="text-muted">No activities assigned</div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="card-template">
                <div className="card border-0 border-primary" style={{margin: "0px"}}>
                    <div className="card-header" style={{padding: '10px 20px 0 20px', margin: 0}}>
                        <div className="card-title">{props.title}</div>
                    </div>
    
                    <div className="card-body" style={{padding: '20px'}}>
                        <div className="" style={{display: 'flex', gap: '3px', flexWrap: 'wrap'}}>
                            <div className="d-inline-block mr-1" key={0}>
                                <div className={`badge badge-${props.activity_priorities?.color || 'primary'}`}>
                                    {props.activity_priorities?.title || props.status}
                                </div>
                            </div>

                            {props.tags && props.tags.split(',').map((tag2: any, idx: number) => (
                                <div className="d-inline-block mr-1" key={idx}
                                     onClick={() => filterKanbanDatasByTags([tag2.trim()])}>
                                    <div className={`badge ${badgeData[idx % badgeData.length]}`}>{tag2.trim()}</div>
                                </div>
                            ))}
                        </div>

                        <div className="card-text">Start: {formatDate(props.activity_start)}</div>
                        <div className="card-text">End: {formatDate(props.activity_end)}</div>
                        {props.link && (
                            <div className="btn btn-primary mt-2">
                                <a href={props.link} target="_blank" className="text-white">
                                    <i className="icon-link"></i>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="page-body">
            <Breadcrumbs
                title={"Activity"}
                mainTitle={"Activity"}
                parent={"Activity"}
            />
            <Container fluid={true}>
                <Row className="" style={{ gap: '10px'}}>
                    <Col xl={12} sm={12}>
                        <CreateActivity onActivityCreated={fetchKanbanDatas} />
                        <EditActivity 
    activity={selectedActivity}
    isOpen={editModalOpen}
    onClose={() => setEditModalOpen(false)}
    onActivityUpdated={fetchKanbanDatas}
/>
                    </Col>
                    <Col xl={12} sm={12}>
                        <KanbanComponent
                            id="kanban"
                            style={{padding: "10px 0"}}
                            keyField="status"
                            dataSource={kanbanDatasFiltered}
                            cardSettings={{
                                headerField: "title",
                                template: cardTemplate,
                                showHeader: true,
                                selectionType: "Multiple",
                            }}
                            swimlaneSettings={{
                                keyField: "user_id", 
                                textField: "assignee",
                                allowDragAndDrop: true,
                            }}
                            cardDoubleClick={(args: any)=>{
                                args.cancel = true;
                                if(args.data.title!==''){
                                    handleEditActivity(args.data);
                                }
                            }}
                            sortSettings={{ sortBy: "Index", field: "level", direction: "Descending" }}
                            // dragStop={handleDragStop}
                            actionComplete={actionComplete}
                            allowDragAndDrop={true}
                            allowKeyboard={true}
                            enableTooltip={true}
                        >
                            <ColumnsDirective>
                                {statusData.map((status: any) => (
                                    <ColumnDirective 
                                        key={status.title}
                                        headerText={status.sub_title || status.title} 
                                        keyField={status.title}
                                    />
                                ))}
                            </ColumnsDirective>
                        </KanbanComponent>
                    </Col>
                </Row>
            </Container>

        </div>
    );
};

export default ActivityKanban;
