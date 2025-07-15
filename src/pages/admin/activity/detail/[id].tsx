import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, {useEffect, useState} from "react";
import {Badge, Button, Card, CardBody, Col, Container, Row,} from "reactstrap";
import {useRouter} from "next/router";
import {ActivityService} from "utils/supabase/activityService";
import {CompanyService} from "utils/supabase/companyService";
import {Activity, ActivityNote, ActivityPriority, ActivityStatus, EmailData, User,} from "Types/ActivityType";
import {Company} from "Types/CompanyType";
import {toast} from "react-toastify";
import Image from "next/image";
import Cookies from "js-cookie";
import CustomEditor from "src/components/Editor";
import ContactEmailManager from "src/components/ContactEmailManager";
import CommonModal from "CommonElements/Ui-kits/CommonModal";
import { Icon } from "@iconify/react";

interface ActivityWithRelations extends Activity {
    activity_priorities?: ActivityPriority;
    users?: User;
    activity_status?: ActivityStatus;
    companies?: Company;
}

const ActivityDetail = () => {
    const router = useRouter();
    const {id} = router.query;
    const [activity, setActivity] = useState<ActivityWithRelations | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState<ActivityNote[]>([]);
    const [newNote, setNewNote] = useState("");
    const [isInternalNote, setIsInternalNote] = useState(true);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailData, setEmailData] = useState<EmailData>({
        to: [], cc: [], bcc: [], subject: "", body: "", activity_id: 0,
    });
    const [showContactManager, setShowContactManager] = useState(false);
    const [currentEmailField, setCurrentEmailField] = useState<"to" | "cc" | "bcc">("to");
    const [editData, setEditData] = useState({
        user_id: "", status: "", priority: "", type: "", company_id: "",
    });
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [statuses, setStatuses] = useState<ActivityStatus[]>([]);
    const [priorities, setPriorities] = useState<ActivityPriority[]>([]);
    const [editingNote, setEditingNote] = useState<number | null>(null);
    const [editNoteContent, setEditNoteContent] = useState("");
    const [fetchingEmails, setFetchingEmails] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);

    useEffect(() => {
        if (id) {
            fetchActivityDetail();
            fetchActivityNotes();
            fetchUsers();
            fetchCompanies();
            fetchStatuses();
            fetchPriorities();
        }

    }, [id]);

    

    useEffect(() => {
        if (activity) {
            setEditData({
                user_id: activity.user_id, status: activity.status, priority: activity.priority, type: activity.type, company_id: activity.company_id ? activity.company_id.toString() : "",
            });
        }
    }, [activity]);

    const fetchActivityDetail = async () => {
        try {
            setLoading(true);
            const data = await ActivityService.getActivityById(Number(id));
            setActivity(data);
        } catch (error) {
            console.error("Error fetching activity:", error);
            toast.error("Failed to load activity details");
        } finally {
            setLoading(false);
        }
    };

    const fetchActivityNotes = async () => {
        try {
            const data = await ActivityService.getActivityNotes(Number(id));
            setNotes(data);
        } catch (error) {
            console.error("Error fetching notes:", error);
            toast.error("Failed to load notes");
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await ActivityService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const data = await CompanyService.getAllCompanies();
            setCompanies(data);
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
    };

    const fetchStatuses = async () => {
        try {
            const data = await ActivityService.getActivityStatus();
            setStatuses(data);
        } catch (error) {
            console.error("Error fetching statuses:", error);
        }
    };

    const fetchPriorities = async () => {
        try {
            const data = await ActivityService.getActivityPriorities();
            setPriorities(data);
        } catch (error) {
            console.error("Error fetching priorities:", error);
        }
    };

    const formatDate = (date: string) => {
        if (!date) return "Not set";
        const dateObj = new Date(date);
        return (dateObj.getFullYear() + "-" + String(dateObj.getMonth() + 1).padStart(2, "0") + "-" + String(dateObj.getDate()).padStart(2, "0") + " " + String(dateObj.getHours()).padStart(2, "0") + ":" + String(dateObj.getMinutes()).padStart(2, "0"));
    };

    const handleBack = () => {
        router.push("/admin/activity");
    };

    const getRandomColor = () => {
        const colors = ["primary", "secondary", "success", "danger", "warning", "info", "dark",];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !activity) return;

        try {
            const user = JSON.parse(Cookies.get("user") || "{}");
            await ActivityService.createActivityNote({
                activity_id: activity.id!, user_id: user.id, content: newNote, is_internal: isInternalNote, email: null, email_uid: null,
            });

            fetchActivityNotes();
            setNewNote("");
            toast.success("Note added successfully");
        } catch (error) {
            console.error("Error adding note:", error);
            toast.error("Failed to add note");
        }
        // newNote = "";
    };

    const handleDeleteNote = async (noteId: number) => {
        if (!confirm("Are you sure you want to delete this note?")) return;

        try {
            await ActivityService.deleteActivityNote(noteId);
            fetchActivityNotes();
            toast.success("Note deleted successfully");
        } catch (error) {
            console.error("Error deleting note:", error);
            toast.error("Failed to delete note");
        }
    };

    const handleEditNote = (note: ActivityNote) => {
        setEditingNote(note.id!);
        setEditNoteContent(note.content);
    };

    const handleSaveEditNote = async (noteId: number) => {
        if (!editNoteContent.trim()) return;

        try {
            await ActivityService.updateActivityNote(noteId, {
                content: editNoteContent,
            });

            fetchActivityNotes();
            setEditingNote(null);
            setEditNoteContent("");
            toast.success("Note updated successfully");
        } catch (error) {
            console.error("Error updating note:", error);
            toast.error("Failed to update note");
        }
    };

    const handleCancelEdit = () => {
        setEditingNote(null);
        setEditNoteContent("");
    };

    const handleTestConnection = async () => {
        setTestingConnection(true);
        try {
            const response = await fetch('/api/imap/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
            } else {
                toast.error(data.message || 'Failed to test connection');
            }
        } catch (error) {
            console.error('Error testing connection:', error);
            toast.error('Failed to test IMAP connection');
        } finally {
            setTestingConnection(false);
        }
    };

    const handleFetchEmails = async () => {
        if (!activity) return;
        
        setFetchingEmails(true);
        try {
            const user = JSON.parse(Cookies.get("user") || "{}");
            const response = await fetch('/api/imap/fetch-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    activityId: activity.id,
                    userId: user.id,
                    days: 7 // Fetch emails from last 7 days
                })
            });
        

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                fetchActivityNotes(); // Refresh notes to show new emails
            } else {
                toast.error(data.message || 'Failed to fetch emails');
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
            toast.error('Failed to fetch emails from inbox');
        } finally {
            setFetchingEmails(false);
        }
    };

    const handleSendEmail = async () => {
        if (!emailData.to.length || !emailData.subject || !emailData.body || !activity) return;

        // Add activity reference to email body
      
        try {
            // Send the email
            await ActivityService.sendActivityEmail({
                ...emailData, activity_id: activity.id!,
            });

            // Create a note with the email content
            const user = JSON.parse(Cookies.get("user") || "{}");
            const emailNoteContent = `
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
                    <h6 style="color: #495057; margin-bottom: 10px;"><i class="icon-mail"></i> Email Sent</h6>
                    <div style="margin-bottom: 8px;"><strong>To:</strong> ${emailData.to.join(', ')}</div>
                    ${emailData.cc?.length ? `<div style="margin-bottom: 8px;"><strong>CC:</strong> ${emailData.cc.join(', ')}</div>` : ''}
                    ${emailData.bcc?.length ? `<div style="margin-bottom: 8px;"><strong>BCC:</strong> ${emailData.bcc.join(', ')}</div>` : ''}
                    <div style="margin-bottom: 8px;"><strong>Subject:</strong> ${emailData.subject}</div>
                    <div style="margin-bottom: 8px;"><strong>Message:</strong></div>
                    <div style="border-left: 3px solid #007bff; padding-left: 15px;">${emailData.body}</div>
                </div>
            `;

            await ActivityService.createActivityNote({
                activity_id: activity.id!,
                user_id: user.id,
                content: emailNoteContent,
                is_internal: false, // Email notes are public
                email: null,
                email_uid: null,
            });

            // Refresh the notes to show the new email note
            fetchActivityNotes();

            setShowEmailModal(false);
            setEmailData({
                to: [], cc: [], bcc: [], subject: "", body: "", activity_id: 0,
            });
            toast.success("Email sent and saved as note");
        } catch (error) {
            console.error("Error sending email:", error);
            toast.error("Failed to send email");
        }
    };

    const addEmailRecipient = (type: "to" | "cc" | "bcc", email: string) => {
        if (!email.trim()) return;
        setEmailData((prev) => ({
            ...prev, [type]: [...(prev[type] || []), email.trim()],
        }));
    };

    const handleSelectContact = (email: string) => {
        addEmailRecipient(currentEmailField, email);
        setShowContactManager(false);
    };

    const removeEmailRecipient = (type: "to" | "cc" | "bcc", index: number) => {
        setEmailData((prev) => ({
            ...prev, [type]: (prev[type] || []).filter((_, i) => i !== index),
        }));
    };

    const handleSaveEdit = async () => {
        if (!activity) return;

        try {
            await ActivityService.updateActivity(activity.id!, {
                user_id: editData.user_id, status: editData.status, priority: editData.priority, type: editData.type, company_id: editData.company_id ? Number(editData.company_id) : undefined,
            });

            // Update local state immediately
            setActivity((prev) => prev ? {
                ...prev,
                user_id: editData.user_id,
                status: editData.status,
                priority: editData.priority,
                type: editData.type,
                company_id: editData.company_id ? Number(editData.company_id) : undefined,
            } : null);

            toast.success("Activity updated successfully");
        } catch (error) {
            console.error("Error updating activity:", error);
            toast.error("Failed to update activity");
        }
    };

    const getCompanyName = (companyId: number | undefined) => {
        if (!companyId) return "Not assigned";
        const company = companies.find(c => c.id === companyId);
        return company ? company.name : "Unknown Company";
    };

    if (loading) {
        return (<div className="page-body">
            <Container fluid={true}>
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </Container>
        </div>);
    }

    if (!activity) {
        return (<div className="page-body">
            <Container fluid={true}>
                <div className="text-center">
                    <h3>Activity not found</h3>
                    <Button color="primary" onClick={handleBack}>
                        Back to Activities
                    </Button>
                </div>
            </Container>
        </div>);
    }

    return (
        <div className="page-body">
        <Breadcrumbs
            title="Activity Detail"
            mainTitle="Activity Detail"
            parent="Activity"
        />
        <Container fluid={true}>
            <Row>
                <Col xl={12}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h4>
                            #{activity.id} - {activity.title}
                        </h4>
                        <Button color="secondary" onClick={handleBack}>
                            <i className="icon-arrow-left"></i> Back to Activities
                        </Button>
                    </div>
                    <br/>
                </Col>

                <Col xl={8} className="overflow-auto" style={{maxHeight: "80vh"}}>
                    <Card>
                        <CardBody>
                            <div className="mb-4">
                                <p
                                    className="text-muted"
                                    dangerouslySetInnerHTML={{
                                        __html: activity.description,
                                    }}
                                ></p>
                            </div>
                            {activity.note && (<div>
                                <h6>Notes</h6>
                                <p
                                    className="text-muted"
                                    dangerouslySetInnerHTML={{
                                        __html: activity.note,
                                    }}
                                ></p>
                            </div>)}
                        </CardBody>
                    </Card>

                    {/* Activity Notes Section */}
                    <div className="mb-4">
                        {/* Add Note Form */}
                        <Card className="mb-3">
                            <CardBody>
                                <div className="mb-3">

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <label className="form-label">Note Content</label>
                                        <div className="d-flex gap-2">
                                           
                                            <Button
                                                color="primary"
                                                size="sm"
                                                onClick={() => setShowEmailModal(true)}
                                            >
                                                <i className="icon-mail"></i> Send Email
                                            </Button>
                                        </div>
                                    </div>
                                    <CustomEditor
                                        setEdit={(value) => setNewNote(value)}
                                        getEdit={newNote}

                                    />
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="internalNote"
                                            
                                            checked={isInternalNote}
                                            onChange={(e) => setIsInternalNote(e.target.checked)}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="internalNote"
                                        >
                                            Internal Note
                                        </label>
                                    </div>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        onClick={handleAddNote}
                                        disabled={!newNote.trim()}
                                    >
                                        Add Note
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Notes List */}
                        <div className="notes-list">
                            {notes.map((note) => (<Card
                                key={note.id}
                                className={`mb-2 ${note.is_internal ? "border-warning" : "border-info"}`}
                            >
                                <CardBody>
                                    <div className="d-flex justify-content-between align-items-start gap-2">
                                        {note.email_uid ? (<div className="avatar avatar-sm">
                                            <Icon icon="mdi:envelope" width="24" height="24" />
                                            </div>):(
                                            note.users?.avatar ? (<Image
                                                src={note.users.avatar}
                                                alt="User Avatar"
                                                className="rounded-circle"
                                                width="40"
                                                height="40"
                                            />) : (<div className="avatar avatar-sm me-3">
                                                <i className="icon-user"></i>
                                            </div>)
                                        )}
                                        

                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center">
                                                    <div className="me-2">
                                                        {note.users?.first_name}{" "}
                                                        {note.users?.last_name}
                                                        {note.email && (<span className="text-muted"> <i className="icon-mail"></i> {note.email}</span>)}
                                                    </div>
                                                    <Badge
                                                        color={note.is_internal ? "warning" : "info"}
                                                        size="sm"
                                                    >
                                                        {note.is_internal ? "Internal" : "Public"}
                                                    </Badge>
                                                </div>
                                                
                                                {/* Edit/Delete buttons for internal notes */}
                                                {note.is_internal && (
                                                    <div className="d-flex gap-1">
                                                        {editingNote === note.id ? (
                                                            <>
                                                                <Button
                                                                    color="success"
                                                                    size="sm"
                                                                    onClick={() => handleSaveEditNote(note.id!)}
                                                                    disabled={!editNoteContent.trim()}
                                                                >
                                                                    <i className="icon-check"></i>
                                                                </Button>
                                                                <Button
                                                                    color="secondary"
                                                                    size="sm"
                                                                    onClick={handleCancelEdit}
                                                                >
                                                                    <i className="icon-close"></i>
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    color="warning"
                                                                    size="sm"
                                                                    onClick={() => handleEditNote(note)}
                                                                    title="Edit note"
                                                                >
                                                                    <i className="icon-pencil"></i>
                                                                </Button>
                                                                <Button
                                                                    color="danger"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteNote(note.id!)}
                                                                    title="Delete note"
                                                                >
                                                                    <i className="icon-trash"></i>
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className='mb-2'>
                                                <small className="text-muted">
                                                    {note.created_at ? formatDate(note.created_at) : ""}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Note content - show editor when editing */}
                                    {editingNote === note.id ? (
                                        <div className="mt-2">
                                            <CustomEditor
                                                setEdit={setEditNoteContent}
                                                getEdit={editNoteContent}
                                                clearEditor={() => setEditNoteContent("")}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="mt-2"
                                            dangerouslySetInnerHTML={{
                                                __html: note.content,
                                            }}
                                            style={{maxWidth: "100%", overflow: "hidden"}}
                                        />
                                    )}
                                </CardBody>
                            </Card>))}
                            {notes.length === 0 && (<div className="text-center text-muted py-3">
                                No notes yet. Add the first note above.
                            </div>)}
                        </div>
                    </div>
                </Col>
                <Col xl={4} className="overflow-auto" style={{maxHeight: "80vh"}}>
                    <Card className="bg-dark">
                        <CardBody>
                            <h6>Activity Status</h6>
                            <br/>
                            <div className="d-flex align-items-center mb-3">
                                <div className="avatar avatar-sm me-3">
                                    {activity.users?.avatar ? (<Image
                                        src={activity.users.avatar}
                                        alt="User Avatar"
                                        className="rounded-circle"
                                        width="40"
                                        height="40"
                                    />) : (<div className="avatar avatar-sm me-3">
                                        <i className="icon-user"></i>
                                    </div>)}
                                </div>
                                <div>
                                    <h6 className="mb-0">
                                        {activity.users?.first_name}{" "}
                                        {activity.users?.last_name}
                                    </h6>
                                    <small>{activity.users?.email}</small>
                                </div>
                            </div>
                            
                            <h6>Company</h6>
                            <p>{getCompanyName(activity.company_id)}</p>
                            
                            {activity.link && (<div className="mb-4">
                                <h6>Link</h6>
                                <a
                                    href={activity.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    <i className="icon-link"></i> Open Link
                                </a>
                            </div>)}


                            <h6>Activity Type</h6>
                            <p>{activity.type || "Not specified"}</p>

                            <h6>Created</h6>
                            <p>
                                {activity.created_at ? formatDate(activity.created_at) : "Not set"}
                            </p>

                            {activity.updated_at && (<>
                                <h6>Last Updated</h6>
                                <p>{formatDate(activity.updated_at)}</p>
                            </>)}

                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h6>Status</h6>
                                    <Badge
                                        color={activity.activity_status?.color || "primary"}
                                    >
                                        {activity.activity_status?.title || activity.status}
                                    </Badge>
                                </div>
                                <div className="col-md-6">
                                    <h6>Priority</h6>
                                    <Badge color="warning">{activity.priority}</Badge>
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <h6>Start Date</h6>
                                    <p>{formatDate(activity.activity_start)}</p>
                                </div>
                                <div className="col-md-6">
                                    <h6>End Date</h6>
                                    <p>{formatDate(activity.activity_end)}</p>
                                </div>
                            </div>

                            {activity.tags && activity.tags.trim() && (<div className="row mb-4">
                                <div className="col-md-6">
                                    <h6>Tags</h6>
                                    <div className="d-flex flex-wrap mt-1">
                                        {activity.tags.split(",").map((tag, index) => (
                                            <Badge key={index} color="primary">
                                                {tag.trim()}
                                            </Badge>))}
                                    </div>
                                </div>
                            </div>)}
                        </CardBody>
                    </Card>

                    {/* Edit Activity Section */}
                    <div className="mt-3">
                        <Card className="border-primary">
                            <CardBody>
                                <h6 className="mb-3">Edit Activity</h6>
                                <div className="mb-3">
                                    <label className="form-label">Assignee</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={editData.user_id}
                                        onChange={(e) => setEditData((prev) => ({
                                            ...prev, user_id: e.target.value,
                                        }))}
                                    >
                                        <option value="">Select Assignee</option>
                                        {users.map((user) => (<option key={user.id} value={user.id}>
                                            {user.first_name} {user.last_name}
                                        </option>))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Company</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={editData.company_id}
                                        onChange={(e) => setEditData((prev) => ({
                                            ...prev, company_id: e.target.value,
                                        }))}
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map((company) => (<option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={editData.status}
                                        onChange={(e) => setEditData((prev) => ({
                                            ...prev, status: e.target.value,
                                        }))}
                                    >
                                        <option value="">Select Status</option>
                                        {statuses.map((status) => (<option key={status.title} value={status.title}>
                                            {status.sub_title || status.title}
                                        </option>))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Priority</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={editData.priority}
                                        onChange={(e) => setEditData((prev) => ({
                                            ...prev, priority: e.target.value,
                                        }))}
                                    >
                                        <option value="">Select Priority</option>
                                        {priorities.map((priority) => (
                                            <option key={priority.title} value={priority.title}>
                                                {priority.title}
                                            </option>))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Type</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={editData.type}
                                        onChange={(e) => setEditData((prev) => ({
                                            ...prev, type: e.target.value,
                                        }))}
                                        placeholder="Activity type"
                                    />
                                </div>
                                <Button
                                    color="success"
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    className="w-100"
                                >
                                    <i className="icon-check"></i> Save Changes
                                </Button>
                            </CardBody>
                        </Card>
                    </div>
                </Col>
            </Row>
        </Container>

        {/* Email Modal */}
        <CommonModal 
            modalData={{ 
                isOpen: showEmailModal, 
                toggler: () => setShowEmailModal(false), 
                title: "Send Email",
                size: "lg"
            }}
        >
            <div className="email-modal-content">
                <div className="row">
                    <div className="col-md-6">
                        <label className="form-label">To:</label>
                        <div className="input-group mb-2">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Enter email address"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        const input = e.target as HTMLInputElement;
                                        addEmailRecipient("to", input.value);
                                        input.value = "";
                                    }
                                }}
                            />
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                    setCurrentEmailField("to");
                                    setShowContactManager(true);
                                }}
                            >
                                <i className="icon-user"></i>
                            </button>
                        </div>
                        <div className="mt-2">
                            {emailData.to.map((email, index) => (
                                <Badge key={index} color="primary" className="me-1 mb-1">
                                    {email}
                                    <button
                                        className="btn-close btn-close-white ms-1"
                                        onClick={() => removeEmailRecipient("to", index)}
                                    ></button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">CC:</label>
                        <div className="input-group mb-2">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Enter email address"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        const input = e.target as HTMLInputElement;
                                        addEmailRecipient("cc", input.value);
                                        input.value = "";
                                    }
                                }}
                            />
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                    setCurrentEmailField("cc");
                                    setShowContactManager(true);
                                }}
                            >
                                <i className="icon-user"></i>
                            </button>
                        </div>
                        <div className="mt-2">
                            {emailData.cc?.map((email, index) => (
                                <Badge key={index} color="secondary" className="me-1 mb-1">
                                    {email}
                                    <button
                                        className="btn-close btn-close-white ms-1"
                                        onClick={() => removeEmailRecipient("cc", index)}
                                    ></button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <label className="form-label">BCC:</label>
                        <div className="input-group mb-2">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Enter email address"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        const input = e.target as HTMLInputElement;
                                        addEmailRecipient("bcc", input.value);
                                        input.value = "";
                                    }
                                }}
                            />
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                    setCurrentEmailField("bcc");
                                    setShowContactManager(true);
                                }}
                            >
                                <i className="icon-user"></i>
                            </button>
                        </div>
                        <div className="mt-2">
                            {emailData.bcc?.map((email, index) => (
                                <Badge key={index} color="dark" className="me-1 mb-1">
                                    {email}
                                    <button
                                        className="btn-close btn-close-white ms-1"
                                        onClick={() => removeEmailRecipient("bcc", index)}
                                    ></button>
                                </Badge>))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mb-3">
                <label className="form-label">Subject:</label>
                <input
                    type="text"
                    className="form-control"
                    value={emailData.subject}
                    onChange={(e) => setEmailData((prev) => ({
                        ...prev, subject: e.target.value,
                    }))}
                    placeholder="Email subject"
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Message:</label>
                <CustomEditor
                    setEdit={(value) => setEmailData((prev) => ({...prev, body: value}))}
                    getEdit={emailData.body}
                />
                {emailData.body}
            </div>
            <div className="d-flex justify-content-end gap-2">
                <Button
                    color="secondary"
                    onClick={() => setShowEmailModal(false)}
                >
                    Cancel
                </Button>
                <Button
                    color="primary"
                    onClick={handleSendEmail}
                    disabled={!emailData.to.length || !emailData.subject || !emailData.body}
                >
                    Send Email
                </Button>
            </div>
        </CommonModal>

        {/* Contact Manager Modal */}
        {showContactManager && (
            <CommonModal
                modalData={{
                    isOpen: showContactManager,
                    toggler: () => setShowContactManager(false),
                    title: "Select Contact",
                    size: "lg"
                }}
            >
                <ContactEmailManager
                    onSelectContact={handleSelectContact}
                />
            </CommonModal>
        )}
    </div>);
};

export default ActivityDetail;

