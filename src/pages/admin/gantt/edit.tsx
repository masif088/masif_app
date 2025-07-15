import FeatherIconCom from 'CommonElements/Icons/FeatherIconCom';
import CommonModal from 'CommonElements/Ui-kits/CommonModal';
import React, { Fragment, useState, useEffect } from 'react'
import { Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { toast } from 'react-toastify';
import { ActivityService } from 'utils/supabase/activityService';
import { User, ActivityPriority, Activity, ActivityStatus, ActivityType } from 'Types/ActivityType';

interface EditActivityProps {
    activity?: Activity | null;
    isOpen: boolean;
    onClose: () => void;
    onActivityUpdated?: () => void;
}

const EditActivity: React.FC<EditActivityProps> = ({ activity, isOpen, onClose, onActivityUpdated }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>([]);
    const [priorities, setPriorities] = useState<ActivityPriority[]>([]);
    const [statuses, setStatuses] = useState<ActivityStatus[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    
    const [formData, setFormData] = useState<Partial<Activity>>({
        title: '',
        description: '',
        status: 'Open',
        user_id: '',
        priority: '',
        type: '',
        tags: '',
        note: '',
        link: '',
        activity_start: '',
        activity_end: ''
    });

    // Update form data when activity prop changes
    useEffect(() => {
        if (activity) {
            // Format dates to ensure they are in the correct format for input fields
            const formatDateForInput = (dateString: string | undefined): string => {
                if (!dateString) return '';
                try {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return '';
                    return date.toISOString().split('T')[0];
                } catch (error) {
                    console.error('Error formatting date:', error);
                    return '';
                }
            };

            const formatDateTimeForInput = (dateTimeString: string | undefined): string => {
                if (!dateTimeString) return '';
                try {
                    const date = new Date(dateTimeString);
                    if (isNaN(date.getTime())) return '';
                    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
                } catch (error) {
                    console.error('Error formatting datetime:', error);
                    return '';
                }
            };
            setFormData({
                id: activity.id,
                title: activity.title || '',
                description: activity.description || '',
                status: activity.status || 'Open',
                user_id: activity.user_id || '',
                priority: activity.priority || '',
                type: activity.type || '',
                tags: activity.tags || '',
                note: activity.note || '',
                link: activity.link || '',
                activity_start: formatDateTimeForInput(activity.activity_start) || '',
                activity_end: formatDateTimeForInput(activity.activity_end) || ''
            });
        }
    }, [activity]);

    // Fetch users, priorities, and statuses on component mount
    useEffect(() => {
        fetchUsers();
        fetchPriorities();
        fetchStatuses();
        fetchActivityTypes();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await ActivityService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        }
    };

    const fetchActivityTypes = async () => {
        try {
            const data = await ActivityService.getActivityTypes();
            setActivityTypes(data);
        } catch (error) {
            console.error('Error fetching activity types:', error);
            toast.error('Failed to load activity types');
        }
    };


    const fetchPriorities = async () => {
        try {
            const data = await ActivityService.getActivityPriorities();
            setPriorities(data);
        } catch (error) {
            console.error('Error fetching priorities:', error);
            toast.error('Failed to load priorities');
        }
    };

    const fetchStatuses = async () => {
        try {
            const data = await ActivityService.getActivityStatus();
            setStatuses(data);
        } catch (error) {
            console.error('Error fetching statuses:', error);
            toast.error('Failed to load statuses');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.title || !formData.description || !formData.user_id) {
                toast.error('Please fill in all required fields');
                return;
            }

            if (!formData.id) {
                toast.error('Activity ID is missing');
                return;
            }

            // Update activity using the service
            const updatedActivity = await ActivityService.updateActivity(formData.id, formData);

            if (updatedActivity) {
                toast.success('Activity updated successfully!');
                onClose();
                
                // Call the callback to refresh the parent component's data
                if (onActivityUpdated) {
                    onActivityUpdated();
                }
            }

        } catch (error: any) {
            console.error('Error updating activity:', error);
            toast.error(error.message || 'Failed to update activity');
        } finally {
            setLoading(false);
        }
    };

    const ModalData = {
        isOpen: isOpen,
        header: true,
        class: 'modal-xl',
        toggler: onClose,
        title: 'Edit Activity',
        size: 'xl'
    };

    return (
        <Fragment>
            <CommonModal modalData={ModalData}>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="title" className="form-label">
                                    Title <span className="text-danger">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter activity title"
                                />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="type" className="form-label">
                                    Type
                                </Label>
                                <Input
                                    id="type"
                                    name="type"
                                    type="select"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Type</option>
                                    {activityTypes.map((type) => (
                                        <option key={type.id} value={type.title}>
                                            {type.title}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <FormGroup>
                                <Label for="description" className="form-label">
                                    Description <span className="text-danger">*</span>
                                </Label>
                                <Input
                                    id="description"
                                    name="description"
                                    type="textarea"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter activity description"
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="user_id" className="form-label">
                                    Assignee <span className="text-danger">*</span>
                                </Label>
                                <Input
                                    id="user_id"
                                    name="user_id"
                                    type="select"
                                    value={formData.user_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Assignee</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.first_name} {user.last_name}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                        
                        <Col md={6}>
                            <FormGroup>
                                <Label for="status" className="form-label">
                                    Status
                                </Label>
                                <Input
                                    id="status"
                                    name="status"
                                    type="select"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Status</option>
                                    {statuses.map((status) => (
                                        <option key={status.title} value={status.title}>
                                            {status.sub_title || status.title}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="priority" className="form-label">
                                    Priority
                                </Label>
                                <Input
                                    id="priority"
                                    name="priority"
                                    type="select"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Priority</option>
                                    {priorities.map((priority) => (
                                        <option key={priority.title} value={priority.title}>
                                            {priority.title}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                        
                        <Col md={6}>
                            <FormGroup>
                                <Label for="activity_start" className="form-label">
                                    Start Date
                                </Label>
                                <Input
                                    id="activity_start"
                                    name="activity_start"
                                    type="datetime-local"
                                    value={formData.activity_start}
                                    onChange={handleInputChange}
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="activity_end" className="form-label">
                                    Activity End <span className="txt-danger">*</span>
                                </Label>
                                <Input
                                    id="activity_end"
                                    name="activity_end"
                                    type="datetime-local"
                                    value={formData.activity_end}
                                    onChange={handleInputChange}
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label for="tags" className="form-label">
                                    Tags
                                </Label>
                                <Input
                                    id="tags"
                                    name="tags"
                                    type="text"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="Enter tags (comma separated)"
                                />
                            </FormGroup>
                        </Col>
                        
                        <Col md={6}>
                            <FormGroup>
                                <Label for="link" className="form-label">
                                    Link
                                </Label>
                                <Input
                                    id="link"
                                    name="link"
                                    type="url"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                    placeholder="Enter activity link"
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <FormGroup>
                                <Label for="note" className="form-label">
                                    Notes
                                </Label>
                                <Input
                                    id="note"
                                    name="note"
                                    type="textarea"
                                    rows={3}
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    placeholder="Enter additional notes"
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <Button 
                            color="secondary" 
                            type="button" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            color="primary" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Updating...
                                </>
                            ) : (
                                'Update Activity'
                            )}
                        </Button>
                    </div>
                </Form>
            </CommonModal>
        </Fragment>
    );
};

export default EditActivity; 