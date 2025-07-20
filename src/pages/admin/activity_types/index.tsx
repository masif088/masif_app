import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, { useState, useEffect } from "react";
import { Col, Container, Row, Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";
import { useRouter } from "next/router";
import { ActivityService } from 'utils/supabase/activityService';
import { ActivityType, CreateActivityTypeData } from 'Types/ActivityType';
import { toast } from 'react-toastify';

const ActivityTypesPage = () => {
    const router = useRouter();
    
    const [types, setTypes] = useState<ActivityType[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingType, setEditingType] = useState<ActivityType | null>(null);
    const [newType, setNewType] = useState<CreateActivityTypeData>({
        title: '',
        sub_title: '',
        description: ''
    });

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            const data = await ActivityService.getActivityTypes();
            setTypes(data);
        } catch (error) {
            console.error('Error fetching types:', error);
            toast.error('Failed to load activity types');
        }
    };

    const handleAddType = async () => {
        try {
            await ActivityService.createActivityType(newType);
            setShowAddModal(false);
            setNewType({
                title: '',
                sub_title: '',
                description: ''
            });
            fetchTypes();
            toast.success('Activity type added successfully');
        } catch (error) {
            console.error('Error adding type:', error);
            toast.error('Failed to add activity type');
        }
    };

    const handleEditType = async () => {
        if (!editingType) return;
        
        try {
            await ActivityService.updateActivityType(editingType.id, {
                title: editingType.title,
                sub_title: editingType.sub_title,
                description: editingType.description
            });
            setShowEditModal(false);
            setEditingType(null);
            fetchTypes();
            toast.success('Activity type updated successfully');
        } catch (error) {
            console.error('Error updating type:', error);
            toast.error('Failed to update activity type');
        }
    };

    const handleDeleteType = async (id: number) => {
        if (!confirm('Are you sure you want to delete this activity type?')) return;
        
        try {
            await ActivityService.deleteActivityType(id);
            fetchTypes();
            toast.success('Activity type deleted successfully');
        } catch (error) {
            console.error('Error deleting type:', error);
            toast.error('Failed to delete activity type');
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="page-body">
            <Breadcrumbs
                title="Activity Types"
                mainTitle="Activity Types"
                parent="Admin"
            />
            <Container fluid={true}>
                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5>Activity Type Management</h5>
                                    <div className="d-flex gap-2">
                                        <Button 
                                            color="outline-primary" 
                                            size="sm"
                                            onClick={() => setShowAddModal(true)}
                                        >
                                            <i className="icon-plus"></i> Add Activity Type
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div className="type-list">
                                    {types.length === 0 ? (
                                        <div className="text-center text-muted py-3">
                                            No activity types yet. Add your first activity type above.
                                        </div>
                                    ) : (
                                        types.map((type) => (
                                            <div key={type.id} className="type-item border-bottom py-3">
                                                <Row className="align-items-center">
                                                    <Col md={3}>
                                                        <div>
                                                            <strong>{type.title}</strong>
                                                            <br />
                                                            <small className="text-muted">{type.sub_title}</small>
                                                        </div>
                                                    </Col>
                                                    <Col md={4}>
                                                        {type.description && (
                                                            <small className="text-muted">
                                                                {type.description.length > 100 
                                                                    ? type.description.substring(0, 100) + '...' 
                                                                    : type.description}
                                                            </small>
                                                        )}
                                                    </Col>
                                                    <Col md={2}>
                                                        <small className="text-muted">
                                                            ID: {type.id}
                                                        </small>
                                                    </Col>
                                                    <Col md={2}>
                                                        <small className="text-muted">
                                                            Created: {formatDate(type.created_at)}
                                                        </small>
                                                    </Col>
                                                    <Col md={1}>
                                                        <div className="d-flex gap-1 justify-content-end">
                                                            <Button
                                                                color="outline-warning"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setEditingType(type);
                                                                    setShowEditModal(true);
                                                                }}
                                                            >
                                                                <i className="icon-pencil"></i>
                                                            </Button>
                                                            <Button
                                                                color="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleDeleteType(type.id)}
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

            {/* Add Activity Type Modal */}
            <Modal isOpen={showAddModal} toggle={() => setShowAddModal(false)}>
                <ModalHeader toggle={() => setShowAddModal(false)}>Add New Activity Type</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label>Title <span className="text-danger">*</span></Label>
                            <Input
                                type="text"
                                value={newType.title}
                                onChange={(e) => setNewType(prev => ({...prev, title: e.target.value}))}
                                placeholder="Activity type title"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Sub Title <span className="text-danger">*</span></Label>
                            <Input
                                type="text"
                                value={newType.sub_title}
                                onChange={(e) => setNewType(prev => ({...prev, sub_title: e.target.value}))}
                                placeholder="Activity type sub title"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Description</Label>
                            <Input
                                type="textarea"
                                value={newType.description}
                                onChange={(e) => setNewType(prev => ({...prev, description: e.target.value}))}
                                placeholder="Activity type description (optional)"
                            />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button color="primary" onClick={handleAddType}>Add Activity Type</Button>
                </ModalFooter>
            </Modal>

            {/* Edit Activity Type Modal */}
            <Modal isOpen={showEditModal} toggle={() => setShowEditModal(false)}>
                <ModalHeader toggle={() => setShowEditModal(false)}>Edit Activity Type</ModalHeader>
                <ModalBody>
                    {editingType && (
                        <Form>
                            <FormGroup>
                                <Label>ID (Read Only)</Label>
                                <Input
                                    type="text"
                                    value={editingType.id}
                                    disabled
                                />
                                <small className="text-muted">ID is auto-generated and cannot be changed</small>
                            </FormGroup>
                            <FormGroup>
                                <Label>Title <span className="text-danger">*</span></Label>
                                <Input
                                    type="text"
                                    value={editingType.title}
                                    onChange={(e) => setEditingType(prev => prev ? {...prev, title: e.target.value} : null)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Sub Title <span className="text-danger">*</span></Label>
                                <Input
                                    type="text"
                                    value={editingType.sub_title}
                                    onChange={(e) => setEditingType(prev => prev ? {...prev, sub_title: e.target.value} : null)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Description</Label>
                                <Input
                                    type="textarea"
                                    value={editingType.description || ''}
                                    onChange={(e) => setEditingType(prev => prev ? {...prev, description: e.target.value} : null)}
                                />
                            </FormGroup>
                        </Form>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button color="primary" onClick={handleEditType}>Save Changes</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default ActivityTypesPage;
