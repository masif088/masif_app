import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, { useState, useEffect } from "react";
import { Col, Container, Row, Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Badge } from "reactstrap";
import { useRouter } from "next/router";
import { ActivityService } from 'utils/supabase/activityService';
import { ActivityStatus, CreateActivityStatusData } from 'Types/ActivityType';
import { toast } from 'react-toastify';

const ActivityStatusesPage = () => {
    const router = useRouter();
    
    const [statuses, setStatuses] = useState<ActivityStatus[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStatus, setEditingStatus] = useState<ActivityStatus | null>(null);
    const [newStatus, setNewStatus] = useState<CreateActivityStatusData>({
        title: '',
        sub_title: '',
        description: '',
        color: 'primary',
        level: 1,
        is_active: true
    });

    useEffect(() => {
        fetchStatuses();
    }, []);

    const fetchStatuses = async () => {
        try {
            const data = await ActivityService.getActivityStatuses();
            setStatuses(data);
        } catch (error) {
            console.error('Error fetching statuses:', error);
            toast.error('Failed to load statuses');
        }
    };

    const handleAddStatus = async () => {
        try {
            await ActivityService.createActivityStatus(newStatus);
            setShowAddModal(false);
            setNewStatus({
                title: '',
                sub_title: '',
                description: '',
                color: 'primary',
                level: 1,
                is_active: true
            });
            fetchStatuses();
            toast.success('Status added successfully');
        } catch (error) {
            console.error('Error adding status:', error);
            toast.error('Failed to add status');
        }
    };

    const handleEditStatus = async () => {
        if (!editingStatus) return;
        
        try {
            await ActivityService.updateActivityStatus(editingStatus.title, {
                sub_title: editingStatus.sub_title,
                description: editingStatus.description,
                color: editingStatus.color,
                level: editingStatus.level,
                is_active: editingStatus.is_active
            });
            setShowEditModal(false);
            setEditingStatus(null);
            fetchStatuses();
            toast.success('Status updated successfully');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDeleteStatus = async (title: string) => {
        if (!confirm('Are you sure you want to delete this status?')) return;
        
        try {
            await ActivityService.deleteActivityStatus(title);
            fetchStatuses();
            toast.success('Status deleted successfully');
        } catch (error) {
            console.error('Error deleting status:', error);
            toast.error('Failed to delete status');
        }
    };

    const toggleStatusActive = async (status: ActivityStatus) => {
        try {
            await ActivityService.updateActivityStatus(status.title, {
                sub_title: status.sub_title,
                description: status.description,
                color: status.color,
                level: status.level,
                is_active: !status.is_active
            });
            fetchStatuses();
            toast.success(`Status ${!status.is_active ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        }
    };

    // Available theme colors from _variables.scss
    const colorOptions = [
        { value: 'primary', label: 'Primary', hex: '#7366FF' },
        { value: 'secondary', label: 'Secondary', hex: '#FF3364' },
        { value: 'success', label: 'Success', hex: '#54BA4A' },
        { value: 'info', label: 'Info', hex: '#16C7F9' },
        { value: 'warning', label: 'Warning', hex: '#FFAA05' },
        { value: 'danger', label: 'Danger', hex: '#FC4438' }
    ];

    const getColorHex = (colorName: string) => {
        const color = colorOptions.find(c => c.value === colorName);
        return color ? color.hex : '#7366FF';
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="page-body">
            <Breadcrumbs
                title="Activity Statuses"
                mainTitle="Activity Statuses"
                parent="Admin"
            />
            <Container fluid={true}>
                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5>Status Management</h5>
                                    <div className="d-flex gap-2">
                                        <Button 
                                            color="outline-primary" 
                                            size="sm"
                                            onClick={() => setShowAddModal(true)}
                                        >
                                            <i className="icon-plus"></i> Add Status
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div className="status-list">
                                    {statuses.length === 0 ? (
                                        <div className="text-center text-muted py-3">
                                            No statuses yet. Add your first status above.
                                        </div>
                                    ) : (
                                        statuses.map((status) => (
                                            <div key={status.title} className={`status-item border-bottom py-3 ${!status.is_active ? 'opacity-50' : ''}`}>
                                                <Row className="align-items-center">
                                                    <Col md={2}>
                                                        <div className="d-flex align-items-center">
                                                            <div 
                                                                className="status-color-indicator me-2"
                                                                style={{
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: getColorHex(status.color),
                                                                    border: '2px solid #fff',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                }}
                                                            ></div>
                                                            <div>
                                                                <strong>{status.title}</strong>
                                                                <br />
                                                                <small className="text-muted">{status.sub_title}</small>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={2}>
                                                        {status.description && (
                                                            <small className="text-muted">
                                                                {status.description.length > 80 
                                                                    ? status.description.substring(0, 80) + '...' 
                                                                    : status.description}
                                                            </small>
                                                        )}
                                                    </Col>
                                                    <Col md={1}>
                                                        <Badge color={status.color}>
                                                            L{status.level}
                                                        </Badge>
                                                    </Col>
                                                    <Col md={1}>
                                                        <Badge color={status.is_active ? 'success' : 'secondary'}>
                                                            {status.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </Col>
                                                    <Col md={2}>
                                                        <small className="text-muted">
                                                            Created: {formatDate(status.created_at)}
                                                        </small>
                                                    </Col>
                                                    <Col md={4}>
                                                        <div className="d-flex gap-1 justify-content-end">
                                                            <Button
                                                                color={status.is_active ? "outline-secondary" : "outline-success"}
                                                                size="sm"
                                                                onClick={() => toggleStatusActive(status)}
                                                                title={status.is_active ? "Deactivate" : "Activate"}
                                                            >
                                                                <i className={status.is_active ? "icon-pause" : "icon-play"}></i>
                                                            </Button>
                                                            <Button
                                                                color="outline-warning"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setEditingStatus(status);
                                                                    setShowEditModal(true);
                                                                }}
                                                            >
                                                                <i className="icon-pencil"></i>
                                                            </Button>
                                                            <Button
                                                                color="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleDeleteStatus(status.title)}
                                                            >
                                                                <i className="icon-trash"></i>
                                                            </Button>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Add Status Modal */}
            <Modal isOpen={showAddModal} toggle={() => setShowAddModal(false)}>
                <ModalHeader toggle={() => setShowAddModal(false)}>Add New Status</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label>Title <span className="text-danger">*</span></Label>
                            <Input
                                type="text"
                                value={newStatus.title}
                                onChange={(e) => setNewStatus((prev: CreateActivityStatusData) => ({...prev, title: e.target.value}))}
                                placeholder="Status title (unique identifier)"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Sub Title <span className="text-danger">*</span></Label>
                            <Input
                                type="text"
                                value={newStatus.sub_title}
                                onChange={(e) => setNewStatus((prev: CreateActivityStatusData) => ({...prev, sub_title: e.target.value}))}
                                placeholder="Status sub title"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Description</Label>
                            <Input
                                type="textarea"
                                value={newStatus.description}
                                onChange={(e) => setNewStatus((prev: CreateActivityStatusData) => ({...prev, description: e.target.value}))}
                                placeholder="Status description (optional)"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Color <span className="text-danger">*</span></Label>
                            <Input
                                type="select"
                                value={newStatus.color}
                                onChange={(e) => setNewStatus((prev: CreateActivityStatusData) => ({...prev, color: e.target.value}))}
                            >
                                {colorOptions.map(color => (
                                    <option key={color.value} value={color.value}>
                                        {color.label}
                                    </option>
                                ))}
                            </Input>
                            <div className="d-flex align-items-center mt-2">
                                <div 
                                    className="me-2"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: getColorHex(newStatus.color),
                                        border: '2px solid #fff',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                ></div>
                                <small className="text-muted">{getColorHex(newStatus.color)}</small>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <Label>Level <span className="text-danger">*</span></Label>
                            <Input
                                type="number"
                                value={newStatus.level}
                                onChange={(e) => setNewStatus((prev: CreateActivityStatusData) => ({...prev, level: parseInt(e.target.value) || 1}))}
                                min="1"
                                max="10"
                            />
                        </FormGroup>
                        <FormGroup>
                            <div className="form-check">
                                <Input
                                    type="checkbox"
                                    id="isActive"
                                    checked={newStatus.is_active}
                                    onChange={(e) => setNewStatus((prev: CreateActivityStatusData) => ({...prev, is_active: e.target.checked}))}
                                />
                                <Label for="isActive" check>
                                    Active Status
                                </Label>
                            </div>
                            <small className="text-muted">Only active statuses can be assigned to activities</small>
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button color="primary" onClick={handleAddStatus}>Add Status</Button>
                </ModalFooter>
            </Modal>

            {/* Edit Status Modal */}
            <Modal isOpen={showEditModal} toggle={() => setShowEditModal(false)}>
                <ModalHeader toggle={() => setShowEditModal(false)}>Edit Status</ModalHeader>
                <ModalBody>
                    {editingStatus && (
                        <Form>
                            <FormGroup>
                                <Label>Title (Read Only)</Label>
                                <Input
                                    type="text"
                                    value={editingStatus.title}
                                    disabled
                                />
                                <small className="text-muted">Title cannot be changed as it&apos;s the primary key</small>
                            </FormGroup>
                            <FormGroup>
                                <Label>Sub Title <span className="text-danger">*</span></Label>
                                <Input
                                    type="text"
                                    value={editingStatus.sub_title}
                                    onChange={(e) => setEditingStatus((prev: ActivityStatus | null) => prev ? {...prev, sub_title: e.target.value} : null)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Description</Label>
                                <Input
                                    type="textarea"
                                    value={editingStatus.description || ''}
                                    onChange={(e) => setEditingStatus((prev: ActivityStatus | null) => prev ? {...prev, description: e.target.value} : null)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Color <span className="text-danger">*</span></Label>
                                <Input
                                    type="select"
                                    value={editingStatus.color}
                                    onChange={(e) => setEditingStatus((prev: ActivityStatus | null) => prev ? {...prev, color: e.target.value} : null)}
                                >
                                    {colorOptions.map(color => (
                                        <option key={color.value} value={color.value}>
                                            {color.label}
                                        </option>
                                    ))}
                                </Input>
                                <div className="d-flex align-items-center mt-2">
                                    <div 
                                        className="me-2"
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            backgroundColor: getColorHex(editingStatus.color),
                                            border: '2px solid #fff',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    ></div>
                                    <small className="text-muted">{getColorHex(editingStatus.color)}</small>
                                </div>
                            </FormGroup>
                            <FormGroup>
                                <Label>Level <span className="text-danger">*</span></Label>
                                <Input
                                    type="number"
                                    value={editingStatus.level}
                                    onChange={(e) => setEditingStatus((prev: ActivityStatus | null) => prev ? {...prev, level: parseInt(e.target.value) || 1} : null)}
                                    min="1"
                                    max="10"
                                />
                            </FormGroup>
                            <FormGroup>
                                <div className="form-check">
                                    <Input
                                        type="checkbox"
                                        id="editIsActive"
                                        checked={editingStatus.is_active}
                                        onChange={(e) => setEditingStatus((prev: ActivityStatus | null) => prev ? {...prev, is_active: e.target.checked} : null)}
                                    />
                                    <Label for="editIsActive" check>
                                        Active Status
                                    </Label>
                                </div>
                                <small className="text-muted">Only active statuses can be assigned to activities</small>
                            </FormGroup>
                        </Form>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button color="primary" onClick={handleEditStatus}>Save Changes</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default ActivityStatusesPage;
