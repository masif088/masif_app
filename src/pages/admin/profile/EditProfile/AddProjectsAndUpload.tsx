import { Card, Col, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { AddprojectAndUpload, Date, Price, ProjectName, Status, } from "utils/Constant";
import AddProjectsAndUploadTableBody from "./AddProjectsAndUploadTableBody";
import CommonCardHeading from 'CommonElements/CommonCardHeading';
import { useState } from 'react';
import { ProjectData } from 'utils/supabase/profileService';
import { useProfile } from './ProfileProvider';

const AddProjectsAndUpload = () => {
  const { projects, loading, createProject, updateProject, deleteProject } = useProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [formData, setFormData] = useState({
    project_name: '',
    date: '',
    status: '',
    price: '',
    description: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openModal = (project?: ProjectData) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        project_name: project.project_name,
        date: project.date,
        status: project.status,
        price: project.price,
        description: project.description || ''
      });
    } else {
      setEditingProject(null);
      setFormData({
        project_name: '',
        date: '',
        status: '',
        price: '',
        description: ''
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProject(null);
    setFormData({
      project_name: '',
      date: '',
      status: '',
      price: '',
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProject) {
        await updateProject(editingProject.id!, formData);
      } else {
        await createProject(formData);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <Col md={12}>
      <Card>
        <CommonCardHeading Heading={AddprojectAndUpload} bigHeadingClassName="card-title mb-0" />
        <div className="card-body">
          <div className="mb-3">
            <Button color="primary" onClick={() => openModal()}>
              <i className="fa fa-plus me-2"></i>
              Add New Project
            </Button>
          </div>
          <div className="table-responsive">
            <Table className="table card-table table-vcenter text-nowrap">
              <thead>
                <tr>
                  <th>{ProjectName}</th>
                  <th>{Date}</th>
                  <th>{Status}</th>
                  <th>{Price}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <AddProjectsAndUploadTableBody 
                projects={projects}
                onEdit={openModal}
                onDelete={handleDelete}
                loading={loading}
              />
            </Table>
          </div>
        </div>
      </Card>

      {/* Add/Edit Project Modal */}
      <Modal isOpen={modalOpen} toggle={closeModal} size="lg">
        <ModalHeader toggle={closeModal}>
          {editingProject ? 'Edit Project' : 'Add New Project'}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="row">
              <div className="col-md-6">
                <FormGroup>
                  <Label>{ProjectName}</Label>
                  <Input
                    type="text"
                    placeholder="Enter project name"
                    value={formData.project_name}
                    onChange={(e) => handleInputChange('project_name', e.target.value)}
                    required
                  />
                </FormGroup>
              </div>
              <div className="col-md-6">
                <FormGroup>
                  <Label>{Date}</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </FormGroup>
              </div>
              <div className="col-md-6">
                <FormGroup>
                  <Label>{Status}</Label>
                  <select
                    className="form-control btn-square form-select"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </FormGroup>
              </div>
              <div className="col-md-6">
                <FormGroup>
                  <Label>{Price}</Label>
                  <Input
                    type="text"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </FormGroup>
              </div>
              <div className="col-12">
                <FormGroup>
                  <Label>Description</Label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter project description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </FormGroup>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingProject ? 'Update' : 'Create')}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </Col>
  );
};

export default AddProjectsAndUpload;
