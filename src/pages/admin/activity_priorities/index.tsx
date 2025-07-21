import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, { useState, useEffect } from "react";
import { Col, Container, Row, Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Badge } from "reactstrap";
import { useRouter } from "next/router";
import { ActivityService } from 'utils/supabase/activityService';
import { ActivityPriority, CreateActivityPriorityData } from 'Types/ActivityType';
import { toast } from 'react-toastify';

const ActivityPrioritiesPage = () => {
    const router = useRouter();
    
    const [priorities, setPriorities] = useState<ActivityPriority[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPriority, setEditingPriority] = useState<ActivityPriority | null>(null);
    const [newPriority, setNewPriority] = useState<CreateActivityPriorityData>({
        title: '',
        sub_title: '',
        description: '',
        color: 'primary',
        level: 1
    });

    useEffect(() => {
        fetchPriorities();
    }, []);

    const fetchPriorities = async () => {
        try {
            const data = await ActivityService.getActivityPriorities();
            setPriorities(data);
        } catch (error) {
            console.error('Error fetching priorities:', error);
            toast.error('Failed to load priorities');
        }
    };

    const handleAddPriority = async () => {
        try {
            await ActivityService.createActivityPriority(newPriority);
            setShowAddModal(false);
            setNewPriority({
                title: '',
                sub_title: '',
                description: '',
                color: 'primary',
                level: 1
            });
            fetchPriorities();
            toast.success('Priority added successfully');
        } catch (error) {
            console.error('Error adding priority:', error);
            toast.error('Failed to add priority');
        }
    };

    const handleEditPriority = async () => {
        if (!editingPriority) return;
        
        try {
            await ActivityService.updateActivityPriority(editingPriority.title, {
                sub_title: editingPriority.sub_title,
                description: editingPriority.description,
                color: editingPriority.color,
                level: editingPriority.level
            });
            setShowEditModal(false);
            setEditingPriority(null);
            fetchPriorities();
            toast.success('Priority updated successfully');
        } catch (error) {
            console.error('Error updating priority:', error);
            toast.error('Failed to update priority');
        }
    };

    const handleDeletePriority = async (title: string) => {
        if (!confirm('Are you sure you want to delete this priority?')) return;
        
        try {
            await ActivityService.deleteActivityPriority(title);
            fetchPriorities();
            toast.success('Priority deleted successfully');
        } catch (error) {
            console.error('Error deleting priority:', error);
            toast.error('Failed to delete priority');
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
                title="Activity Priorities"
                mainTitle="Activity Priorities"
                parent="Admin"
            />
            <Container fluid={true}>
                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5>Priority Management</h5>
                                    <div className="d-flex gap-2">
                                        <Button 
                                            color="primary" 
                                            outline
                                            size="sm"
                                            onClick={() => setShowAddModal(true)}
                                        >
                                            <i className="icon-plus"></i> Add Priority
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div className="priority-list">
                                    {priorities.length === 0 ? (
                                        <div className="text-center text-muted py-3">
                                            No priorities yet. Add your first priority above.
                                        </div>
                                    ) : (
                                        priorities.map((priority) => (
                                            <div key={priority.title} className="priority-item border-bottom py-3">
                                                <Row className="align-items-center">
                                                    <Col md={2}>
                                                        <div className="d-flex align-items-center">
                                                            <div 
                                                                className="priority-color-indicator me-2"
                                                                style={{
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: getColorHex(priority.color),
                                                                    border: '2px solid #fff',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                }}
                                                            ></div>
                                                            <div>
                                                                <strong>{priority.title}</strong>
                                                                <br />
                                                                <small className="text-muted">{priority.sub_title}</small>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={3}>
                                                        {priority.description && (
                                                            <small className="text-muted">
                                                                {priority.description.length > 100 
                                                                    ? priority.description.substring(0, 100) + '...' 
                                                                    : priority.description}
                                                            </small>
                                                        )}
                                                    </Col>
                                                    <Col md={2}>
                                                        <Badge color={priority.color}>
                                                            Level {priority.level}
                                                        </Badge>
                                                    </Col>
                                                    <Col md={2}>
                                                        <small className="text-muted">
                                                            Created: {formatDate(priority.created_at)}
                                                        </small>
                                                    </Col>
                                                    <Col md={3}>
                                                        <div className="d-flex gap-1 justify-content-end">
                                                            <Button
                                                                color="outline-warning"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setEditingPriority(priority);
                                                                    setShowEditModal(true);
                                                                }}
                                                            >
                                                                <i className="icon-pencil"></i>
                                                            </Button>
                                                            <Button
                                                                color="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleDeletePriority(priority.title)}
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

            {/* Add Priority Modal */}
            <Modal isOpen={showAddModal} toggle={() => setShowAddModal(false)}>
                <ModalHeader toggle={() => setShowAddModal(false)}>Add New Priority</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label>Title <span className="text-danger">*</span></Label>
                            <Input
                                type="text"
                                value={newPriority.title}
                                onChange={(e) => setNewPriority(prev => ({...prev, title: e.target.value}))}
                                placeholder="Priority title (unique identifier)"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Sub Title <span className="text-danger">*</span></Label>
                            <Input
                                type="text"
                                value={newPriority.sub_title}
                                onChange={(e) => setNewPriority(prev => ({...prev, sub_title: e.target.value}))}
                                placeholder="Priority sub title"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Description</Label>
                            <Input
                                type="textarea"
                                value={newPriority.description}
                                onChange={(e) => setNewPriority(prev => ({...prev, description: e.target.value}))}
                                placeholder="Priority description (optional)"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Color <span className="text-danger">*</span></Label>
                            <Input
                                type="select"
                                value={newPriority.color}
                                onChange={(e) => setNewPriority(prev => ({...prev, color: e.target.value}))}
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
                                        backgroundColor: getColorHex(newPriority.color),
                                        border: '2px solid #fff',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                ></div>
                                <small className="text-muted">{getColorHex(newPriority.color)}</small>
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <Label>Level <span className="text-danger">*</span></Label>
                            <Input
                                type="number"
                                value={newPriority.level}
                                onChange={(e) => setNewPriority(prev => ({...prev, level: parseInt(e.target.value) || 1}))}
                                min="1"
                                max="10"
                            />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button color="primary" onClick={handleAddPriority}>Add Priority</Button>
                </ModalFooter>
            </Modal>

            {/* Edit Priority Modal */}
            <Modal isOpen={showEditModal} toggle={() => setShowEditModal(false)}>
                <ModalHeader toggle={() => setShowEditModal(false)}>Edit Priority</ModalHeader>
                <ModalBody>
                    {editingPriority && (
                        <Form>
                            <FormGroup>
                                <Label>Title (Read Only)</Label>
                                <Input
                                    type="text"
                                    value={editingPriority.title}
                                    disabled
                                />
                                <small className="text-muted">Title cannot be changed as it&apos;s the primary key</small>
                            </FormGroup>
                            <FormGroup>
                                <Label>Sub Title <span className="text-danger">*</span></Label>
                                <Input
                                    type="text"
                                    value={editingPriority.sub_title}
                                    onChange={(e) => setEditingPriority(prev => prev ? {...prev, sub_title: e.target.value} : null)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Description</Label>
                                <Input
                                    type="textarea"
                                    value={editingPriority.description || ''}
                                    onChange={(e) => setEditingPriority(prev => prev ? {...prev, description: e.target.value} : null)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Color <span className="text-danger">*</span></Label>
                                <Input
                                    type="select"
                                    value={editingPriority.color}
                                    onChange={(e) => setEditingPriority(prev => prev ? {...prev, color: e.target.value} : null)}
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
                                            backgroundColor: getColorHex(editingPriority.color),
                                            border: '2px solid #fff',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    ></div>
                                    <small className="text-muted">{getColorHex(editingPriority.color)}</small>
                                </div>
                            </FormGroup>
                            <FormGroup>
                                <Label>Level <span className="text-danger">*</span></Label>
                                <Input
                                    type="number"
                                    value={editingPriority.level}
                                    onChange={(e) => setEditingPriority(prev => prev ? {...prev, level: parseInt(e.target.value) || 1} : null)}
                                    min="1"
                                    max="10"
                                />
                            </FormGroup>
                        </Form>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button color="primary" onClick={handleEditPriority}>Save Changes</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default ActivityPrioritiesPage;
