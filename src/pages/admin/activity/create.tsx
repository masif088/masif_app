import FeatherIconCom from 'CommonElements/Icons/FeatherIconCom';
import CommonModal from 'CommonElements/Ui-kits/CommonModal';
import React, { Fragment, useState, useEffect } from 'react'
import { Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { toast } from 'react-toastify';
import { ActivityService } from 'utils/supabase/activityService';
import { CompanyService } from 'utils/supabase/companyService';
import CommonButtons from "@/components/Buttons/common/CommonButtons";
import { User, ActivityPriority, CreateActivityFormData, ActivityStatus, ActivityType } from 'Types/ActivityType';
import { Company } from 'Types/CompanyType';
import dynamic from 'next/dynamic';
// import CustomEditor from '@/components/Editor';
// import { defaultButtonsData, defaultButtonsHeadingData, DefaultButtonsHeading } from 'Data/Ui-kits/CommonButtonsData';
interface CreateActivityProps {
    onActivityCreated?: () => void;
}

const CustomEditor = dynamic(() => import('src/components/Editor'), { ssr: false });

const CreateActivity: React.FC<CreateActivityProps> = ({ onActivityCreated }) => {
    const [modal, setModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [priorities, setPriorities] = useState<ActivityPriority[]>([]);
    const [statuses, setStatuses] = useState<ActivityStatus[]>([]);
    const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
    
    
    const [formData, setFormData] = useState<CreateActivityFormData>({
        title: '',
        description: '',
        status: 'Open',
        user_id: '',
        company_id: undefined,
        priority: '',
        type: '',
        tags: '',
        note: '',
        link: '',
        activity_start: '',
        activity_end: '',
    });

    const toggle = () => { 
        setModal(!modal);
        if (!modal) {
            // Reset form when opening modal
            setFormData({
                title: '',
                description: '',
                status: 'Open',
                user_id: '',
                company_id: undefined,
                priority: '',
                type: '',
                tags: '',
                note: '',
                link: '',
                activity_start: '',
                activity_end: '',
            });
        }
    };

    // Fetch users, priorities, and statuses on component mount
    useEffect(() => {
        fetchUsers();
        fetchCompanies();
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

    const fetchCompanies = async () => {
        try {
            const data = await CompanyService.getAllCompanies();
            setCompanies(data);
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast.error('Failed to load companies');
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

    const fetchActivityTypes = async () => {
        try {
            const data = await ActivityService.getActivityTypes();
            setActivityTypes(data);
        } catch (error) {
            console.error('Error fetching activity types:', error);
            toast.error('Failed to load activity types');
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'company_id' ? (value ? Number(value) : undefined) : value
        }));
    };

    const handleEditorChange = (value: string, name: string) => {
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
            if (!formData.title || !formData.description || !formData.status) {
                toast.error('Please fill in all required fields');
                return;
            }

            // Create activity using the service
            const newActivity = await ActivityService.createActivity(formData);

            if (newActivity) {
                toast.success('Activity created successfully!');
                toggle();
                
                // Call the callback to refresh the parent component's data
                if (onActivityCreated) {
                    onActivityCreated();
                }
            }

        } catch (error: any) {
            console.error('Error creating activity:', error);
            toast.error(error.message || 'Failed to create activity');
        } finally {
            setLoading(false);
        }
    };

    const ModalData = {
        isOpen: modal,
        header: true,
        // class: 'modal-xl',
        toggler: toggle,
        title: 'Create New Activity',
        size: 'xl'
    };

    return (
        <Fragment>
            <Button color='info' type="button" onClick={toggle} className="btn btn-pill btn-primary btn-air-primary" icon="Plus">
                Add Activity
            </Button>
            
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
                                
                                <CustomEditor 
                                setEdit={(value) => handleEditorChange(value, 'description')} 
                                getEdit={formData.description} />
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
                                <Label for="company_id" className="form-label">
                                    Company
                                </Label>
                                <Input
                                    id="company_id"
                                    name="company_id"
                                    type="select"
                                    value={formData.company_id || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
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
                    </Row>

                    <Row>
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
                                <CustomEditor 
                                setEdit={(value) => handleEditorChange(value, 'note')} 
                                getEdit={formData.note} />
                            </FormGroup>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <Button 
                            color="secondary" 
                            type="button" 
                            onClick={toggle}
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
                                    Creating...
                                </>
                            ) : (
                                'Create Activity'
                            )}
                        </Button>
                    </div>
                </Form>
            </CommonModal>
        </Fragment>
    );
};

export default CreateActivity;