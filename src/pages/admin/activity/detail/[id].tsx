import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, { useEffect, useState } from "react";
import { Col, Container, Row, Card, CardBody, CardHeader, Badge, Button } from "reactstrap";
import { useRouter } from "next/router";
import { ActivityService } from "utils/supabase/activityService";
import { Activity, User, ActivityPriority, ActivityStatus, ActivityNote, EmailData } from "Types/ActivityType";
import { toast } from "react-toastify";
import Image from "next/image";
import Cookies from "js-cookie";
import CustomEditor from "src/components/Editor";
import ContactEmailManager from "src/components/ContactEmailManager";

interface ActivityWithRelations extends Activity {
    activity_priorities?: ActivityPriority;
    users?: User;
    activity_status?: ActivityStatus;
}

const ActivityDetail = () => {
    const router = useRouter();
    const { id } = router.query;
    const [activity, setActivity] = useState<ActivityWithRelations | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState<ActivityNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [isInternalNote, setIsInternalNote] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailData, setEmailData] = useState<EmailData>({
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        body: '',
        activity_id: 0
    });
    const [showContactManager, setShowContactManager] = useState(false);
    const [currentEmailField, setCurrentEmailField] = useState<'to' | 'cc' | 'bcc'>('to');
    const [editData, setEditData] = useState({
        user_id: '',
        status: '',
        priority: '',
        type: ''
    });
    const [users, setUsers] = useState<User[]>([]);
    const [statuses, setStatuses] = useState<ActivityStatus[]>([]);
    const [priorities, setPriorities] = useState<ActivityPriority[]>([]);

    useEffect(() => {
        if (id) {
            fetchActivityDetail();
            fetchActivityNotes();
            fetchUsers();
            fetchStatuses();
            fetchPriorities();
        }
    }, [id]);

    useEffect(() => {
        if (activity) {
            setEditData({
                user_id: activity.user_id,
                status: activity.status,
                priority: activity.priority,
                type: activity.type
            });
        }
    }, [activity]);

    const fetchActivityDetail = async () => {
        try {
            setLoading(true);
            const data = await ActivityService.getActivityById(Number(id));
            setActivity(data);
        } catch (error) {
            console.error('Error fetching activity:', error);
            toast.error('Failed to load activity details');
        } finally {
            setLoading(false);
        }
    };

    const fetchActivityNotes = async () => {
        try {
            const data = await ActivityService.getActivityNotes(Number(id));
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error('Failed to load notes');
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await ActivityService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchStatuses = async () => {
        try {
            const data = await ActivityService.getActivityStatus();
            setStatuses(data);
        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    };

    const fetchPriorities = async () => {
        try {
            const data = await ActivityService.getActivityPriorities();
            setPriorities(data);
        } catch (error) {
            console.error('Error fetching priorities:', error);
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
    };

    const handleBack = () => {
        router.push('/admin/activity');
    };

    const getRandomColor = () => {
        const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !activity) return;
        
        try {
            const user = JSON.parse(Cookies.get('user') || '{}');
            await ActivityService.createActivityNote({
                activity_id: activity.id!,
                user_id: user.id,
                content: newNote,
                is_internal: isInternalNote
            });
            
            setNewNote('');
            fetchActivityNotes();
            toast.success('Note added successfully');
        } catch (error) {
            console.error('Error adding note:', error);
            toast.error('Failed to add note');
        }
    };

    const handleSendEmail = async () => {
        if (!emailData.to.length || !emailData.subject || !emailData.body || !activity) return;
        
        try {
            await ActivityService.sendActivityEmail({
                ...emailData,
                activity_id: activity.id!
            });
            
            setShowEmailModal(false);
            setEmailData({
                to: [],
                cc: [],
                bcc: [],
                subject: '',
                body: '',
                activity_id: 0
            });
            toast.success('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error('Failed to send email');
        }
    };

    const addEmailRecipient = (type: 'to' | 'cc' | 'bcc', email: string) => {
        if (!email.trim()) return;
        setEmailData(prev => ({
            ...prev,
            [type]: [...(prev[type] || []), email.trim()]
        }));
    };

    const handleSelectContact = (email: string) => {
        addEmailRecipient(currentEmailField, email);
        setShowContactManager(false);
    };

    const removeEmailRecipient = (type: 'to' | 'cc' | 'bcc', index: number) => {
        setEmailData(prev => ({
            ...prev,
            [type]: (prev[type] || []).filter((_, i) => i !== index)
        }));
    };

    const handleSaveEdit = async () => {
        if (!activity) return;
        
        try {
            await ActivityService.updateActivity(activity.id!, {
                user_id: editData.user_id,
                status: editData.status,
                priority: editData.priority,
                type: editData.type
            });
            
            // Update local state immediately
            setActivity(prev => prev ? {
                ...prev,
                user_id: editData.user_id,
                status: editData.status,
                priority: editData.priority,
                type: editData.type
            } : null);
            
            toast.success('Activity updated successfully');
        } catch (error) {
            console.error('Error updating activity:', error);
            toast.error('Failed to update activity');
        }
    };

    if (loading) {
        return (
            <div className="page-body">
                <Container fluid={true}>
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="page-body">
                <Container fluid={true}>
                    <div className="text-center">
                        <h3>Activity not found</h3>
                        <Button color="primary" onClick={handleBack}>
                            Back to Activities
                        </Button>
                    </div>
                </Container>
            </div>
        );
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
                        <Card>
                            <CardHeader>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h4>Activity Details</h4>
                                    <Button color="secondary" onClick={handleBack}>
                                        <i className="icon-arrow-left"></i> Back to Activities
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col md={8}>
                                        <div className="mb-4">
                                            <h5 className="mb-3">{activity.title}</h5>
                                            <p className="text-muted" dangerouslySetInnerHTML={{ __html: activity.description }}></p>
                                        </div>

                                        <div className="row mb-4">
                                            <div className="col-md-6">
                                                <h6>Status</h6>
                                                <Badge color={activity.activity_status?.color || 'primary'}>
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

                                        {activity.tags && activity.tags.trim() && (
                                            <div className="row mb-4">
                                            <div className="col-md-6">
                                                <h6>Tags</h6>
                                                <div className="d-flex flex-wrap mt-1">
                                                    {activity.tags.split(',').map((tag, index) => (
                                                        <Badge key={index} color={getRandomColor()}>
                                                            {tag.trim()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            </div>
                                        )}

                                        {activity.link && (
                                            <div className="mb-4">
                                                <h6>Link</h6>
                                                <a href={activity.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                                    <i className="icon-link"></i> Open Link
                                                </a>
                                            </div>
                                        )}

                                        {activity.note && (
                                            <div className="mb-4">
                                                <h6>Notes</h6>
                                                <p>{activity.note}</p>
                                            </div>
                                        )}

                                        {/* Activity Notes Section */}
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6>Activity Notes</h6>
                                                <Button 
                                                    color="primary" 
                                                    size="sm"
                                                    onClick={() => setShowEmailModal(true)}
                                                >
                                                    <i className="icon-mail"></i> Send Email
                                                </Button>
                                            </div>
                                            
                                            {/* Add Note Form */}
                                            <Card className="mb-3">
                                                <CardBody>
                                                    <div className="mb-3">
                                                        <label className="form-label">Note Content</label>
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
                                                            <label className="form-check-label" htmlFor="internalNote">
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
                                                {notes.map((note) => (
                                                    <Card key={note.id} className={`mb-2 ${note.is_internal ? 'border-warning' : 'border-info'}`}>
                                                        <CardBody className="py-2">
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex align-items-center mb-1">
                                                                        <small className="text-muted me-2">
                                                                            {note.users?.first_name} {note.users?.last_name}
                                                                        </small>
                                                                        <Badge color={note.is_internal ? 'warning' : 'info'} size="sm">
                                                                            {note.is_internal ? 'Internal' : 'Public'}
                                                                        </Badge>
                                                                        <small className="text-muted ms-2">
                                                                            {note.created_at ? formatDate(note.created_at) : ''}
                                                                        </small>
                                                                    </div>
                                                                    <div 
                                                                        className="mb-0" 
                                                                        dangerouslySetInnerHTML={{ __html: note.content }}
                                                                        style={{maxWidth: '100%', overflow: 'hidden'}}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                ))}
                                                {notes.length === 0 && (
                                                    <div className="text-center text-muted py-3">
                                                        No notes yet. Add the first note above.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Col>

                                    <Col md={4}>
                                        <Card className="bg-dark">
                                            <CardBody>
                                                <h6>Assignee</h6>
                                                <br />
                                                <div className="d-flex align-items-center mb-3">
                                                    <div className="avatar avatar-sm me-3">
                                                        {activity.users?.avatar ? (
                                                            <Image 
                                                                src={activity.users.avatar} 
                                                                alt="User Avatar"
                                                                className="rounded-circle"
                                                                width="40"
                                                                height="40"
                                                            />
                                                        ) : (
                                                            <div className="avatar avatar-sm me-3">
                                                                <i className="icon-user"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0">
                                                            {activity.users?.first_name} {activity.users?.last_name}
                                                        </h6>
                                                        <small>{activity.users?.email}</small>
                                                    </div>
                                                </div>

                                                <h6>Activity Type</h6>
                                                <p>{activity.type || 'Not specified'}</p>

                                                <h6>Created</h6>
                                                <p>{activity.created_at ? formatDate(activity.created_at) : 'Not set'}</p>

                                                {activity.updated_at && (
                                                    <>
                                                        <h6>Last Updated</h6>
                                                        <p>{formatDate(activity.updated_at)}</p>
                                                    </>
                                                )}
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
                                                            onChange={(e) => setEditData(prev => ({...prev, user_id: e.target.value}))}
                                                        >
                                                            <option value="">Select Assignee</option>
                                                            {users.map((user) => (
                                                                <option key={user.id} value={user.id}>
                                                                    {user.first_name} {user.last_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Status</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={editData.status}
                                                            onChange={(e) => setEditData(prev => ({...prev, status: e.target.value}))}
                                                        >
                                                            <option value="">Select Status</option>
                                                            {statuses.map((status) => (
                                                                <option key={status.title} value={status.title}>
                                                                    {status.sub_title || status.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Priority</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={editData.priority}
                                                            onChange={(e) => setEditData(prev => ({...prev, priority: e.target.value}))}
                                                        >
                                                            <option value="">Select Priority</option>
                                                            {priorities.map((priority) => (
                                                                <option key={priority.title} value={priority.title}>
                                                                    {priority.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Type</label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={editData.type}
                                                            onChange={(e) => setEditData(prev => ({...prev, type: e.target.value}))}
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
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Email Modal */}
            {showEmailModal && (
                <div className="modal fade show" style={{display: 'block'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Send Email</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowEmailModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-4">
                                        <label className="form-label">To:</label>
                                        <div className="mb-2">
                                            <div className="input-group">
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    placeholder="Add email"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            addEmailRecipient('to', (e.target as HTMLInputElement).value);
                                                            (e.target as HTMLInputElement).value = '';
                                                        }
                                                    }}
                                                />
                                                <button 
                                                    className="btn btn-outline-secondary"
                                                    onClick={(e) => {
                                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                        addEmailRecipient('to', input.value);
                                                        input.value = '';
                                                    }}
                                                >
                                                    Add
                                                </button>
                                                <button 
                                                    className="btn btn-outline-info"
                                                    onClick={() => {
                                                        setCurrentEmailField('to');
                                                        setShowContactManager(true);
                                                    }}
                                                    title="Select from contacts"
                                                >
                                                    <i className="icon-users"></i>
                                                </button>
                                            </div>
                                            <div className="mt-2">
                                                {emailData.to.map((email, index) => (
                                                    <Badge key={index} color="primary" className="me-1 mb-1">
                                                        {email}
                                                        <button 
                                                            className="btn-close btn-close-white ms-1"
                                                            onClick={() => removeEmailRecipient('to', index)}
                                                        ></button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">CC:</label>
                                        <div className="mb-2">
                                            <div className="input-group">
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    placeholder="Add email"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            addEmailRecipient('cc', (e.target as HTMLInputElement).value);
                                                            (e.target as HTMLInputElement).value = '';
                                                        }
                                                    }}
                                                />
                                                <button 
                                                    className="btn btn-outline-secondary"
                                                    onClick={(e) => {
                                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                        addEmailRecipient('cc', input.value);
                                                        input.value = '';
                                                    }}
                                                >
                                                    Add
                                                </button>
                                                <button 
                                                    className="btn btn-outline-info"
                                                    onClick={() => {
                                                        setCurrentEmailField('cc');
                                                        setShowContactManager(true);
                                                    }}
                                                    title="Select from contacts"
                                                >
                                                    <i className="icon-users"></i>
                                                </button>
                                            </div>
                                            <div className="mt-2">
                                                {emailData.cc?.map((email, index) => (
                                                    <Badge key={index} color="secondary" className="me-1 mb-1">
                                                        {email}
                                                        <button 
                                                            className="btn-close btn-close-white ms-1"
                                                            onClick={() => removeEmailRecipient('cc', index)}
                                                        ></button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">BCC:</label>
                                        <div className="mb-2">
                                            <div className="input-group">
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    placeholder="Add email"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            addEmailRecipient('bcc', (e.target as HTMLInputElement).value);
                                                            (e.target as HTMLInputElement).value = '';
                                                        }
                                                    }}
                                                />
                                                <button 
                                                    className="btn btn-outline-secondary"
                                                    onClick={(e) => {
                                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                        addEmailRecipient('bcc', input.value);
                                                        input.value = '';
                                                    }}
                                                >
                                                    Add
                                                </button>
                                                <button 
                                                    className="btn btn-outline-info"
                                                    onClick={() => {
                                                        setCurrentEmailField('bcc');
                                                        setShowContactManager(true);
                                                    }}
                                                    title="Select from contacts"
                                                >
                                                    <i className="icon-users"></i>
                                                </button>
                                            </div>
                                            <div className="mt-2">
                                                {emailData.bcc?.map((email, index) => (
                                                    <Badge key={index} color="dark" className="me-1 mb-1">
                                                        {email}
                                                        <button 
                                                            className="btn-close btn-close-white ms-1"
                                                            onClick={() => removeEmailRecipient('bcc', index)}
                                                        ></button>
                                                    </Badge>
                                                ))}
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
                                        onChange={(e) => setEmailData(prev => ({...prev, subject: e.target.value}))}
                                        placeholder="Email subject"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Message:</label>
                                    <CustomEditor 
                                        setEdit={(value) => setEmailData(prev => ({...prev, body: value}))} 
                                        getEdit={emailData.body} 
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowEmailModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={handleSendEmail}
                                    disabled={!emailData.to.length || !emailData.subject || !emailData.body}
                                >
                                    Send Email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Manager Modal */}
            {showContactManager && (
                <div className="modal fade show" style={{display: 'block'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Select Contact for {currentEmailField.toUpperCase()}</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowContactManager(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <ContactEmailManager 
                                    onSelectContact={handleSelectContact}
                                    selectedEmails={emailData[currentEmailField] || []}
                                />
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowContactManager(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default ActivityDetail; 