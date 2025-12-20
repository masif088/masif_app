import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  Badge,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Alert,
  Spinner,
} from "reactstrap";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  X,
  FileText,
} from "react-feather";
import { toast } from "react-toastify";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import {
  Customer,
  CustomerDataTemplate,
  CustomerDetail,
  CustomerContentTemplate,
  CustomerWebsite,
} from "Types/CustomerType";
import { CustomerService } from "utils/supabase/customerService";

const CustomerDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [templates, setTemplates] = useState<CustomerDataTemplate[]>([]);
  const [contentTemplates, setContentTemplates] = useState<CustomerContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContentPreviewModal, setShowContentPreviewModal] = useState(false);
  const [showWebsiteModal, setShowWebsiteModal] = useState(false);
  const [showDeleteWebsiteModal, setShowDeleteWebsiteModal] = useState(false);

  // Content template states
  const [selectedContentTemplateId, setSelectedContentTemplateId] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [selectedContentTemplate, setSelectedContentTemplate] = useState<CustomerContentTemplate | null>(null);

  // Form states
  const [customerForm, setCustomerForm] = useState({
    name: "",
    register_at: "",
  });

  // Store all detail values by template_id
  const [detailValues, setDetailValues] = useState<Map<string, string>>(new Map());

  // Website states
  const [websites, setWebsites] = useState<CustomerWebsite[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<CustomerWebsite | null>(null);
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [websiteForm, setWebsiteForm] = useState({
    url: "",
    name: "",
    description: "",
    is_primary: false,
  });

  useEffect(() => {
    if (id) {
      loadCustomer();
      loadTemplates();
      loadContentTemplates();
      loadWebsites();
    }
  }, [id]);

  // Update detailValues when templates are loaded and customer is available
  useEffect(() => {
    if (customer && templates.length > 0) {
      const valuesMap = new Map<string, string>();
      templates.forEach((template) => {
        // Check if customer has this detail
        const existingDetail = customer.details?.find(
          (d) => d.customer_data_template_id === template.id
        );
        // Use existing value from detailValues if available, otherwise use existing detail or empty
        const currentValue = detailValues.get(template.id);
        valuesMap.set(
          template.id,
          currentValue !== undefined
            ? currentValue
            : existingDetail?.value || ""
        );
      });
      // Only update if there are new templates not in detailValues
      const hasNewTemplates = templates.some(
        (t) => !detailValues.has(t.id)
      );
      if (hasNewTemplates) {
        setDetailValues(valuesMap);
      }
    }
  }, [customer?.id, templates.map((t) => t.id).join(",")]);

  const loadCustomer = async () => {
    if (!id || typeof id !== "string") return;
    
    setLoading(true);
    try {
      const customerData = await CustomerService.getCustomerById(id);
      if (customerData) {
        setCustomer(customerData);
        setCustomerForm({
          name: customerData.name,
          register_at: customerData.register_at
            ? customerData.register_at.split("T")[0]
            : new Date().toISOString().split("T")[0],
        });
        
        // Initialize detail values map
        const valuesMap = new Map<string, string>();
        if (customerData.details) {
          customerData.details.forEach((detail) => {
            valuesMap.set(detail.customer_data_template_id, detail.value || "");
          });
        }
        setDetailValues(valuesMap);
      } else {
        toast.error("Customer not found");
        router.push("/admin/customer");
      }
    } catch (error) {
      console.error("Error loading customer:", error);
      toast.error("Failed to load customer");
      router.push("/admin/customer");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesData = await CustomerService.getAllTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const loadContentTemplates = async () => {
    try {
      const contentTemplatesData = await CustomerService.getAllContentTemplates();
      setContentTemplates(contentTemplatesData);
    } catch (error) {
      console.error("Error loading content templates:", error);
    }
  };

  const loadWebsites = async () => {
    if (!id || typeof id !== "string") return;
    try {
      const websitesData = await CustomerService.getCustomerWebsites(id);
      setWebsites(websitesData);
    } catch (error) {
      console.error("Error loading websites:", error);
    }
  };

  const handleBack = () => {
    router.push("/admin/customer");
  };

  const handleEdit = () => {
    if (customer) {
      setShowEditModal(true);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setModalLoading(true);
    try {
      await CustomerService.updateCustomer(customer.id, {
        name: customerForm.name,
        register_at: customerForm.register_at,
      });
      toast.success("Customer updated successfully");
      setShowEditModal(false);
      loadCustomer();
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = () => {
    if (!customer) return;
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!customer) return;

    try {
      await CustomerService.deleteCustomer(customer.id);
      toast.success("Customer deleted successfully");
      router.push("/admin/customer");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  const handleDetailValueChange = (templateId: string, value: string) => {
    const newValues = new Map(detailValues);
    newValues.set(templateId, value);
    setDetailValues(newValues);
  };

  const handleSaveAllDetails = async () => {
    if (!customer) return;

    setSavingDetails(true);
    try {
      // Get existing details to compare
      const existingDetails = customer.details || [];
      const existingDetailMap = new Map(
        existingDetails.map((d) => [d.customer_data_template_id, d])
      );

      // Process all templates
      for (const template of templates) {
        const value = detailValues.get(template.id) || "";
        const trimmedValue = value.trim();
        const existingDetail = existingDetailMap.get(template.id);

        if (trimmedValue) {
          // Update or create detail
          await CustomerService.upsertCustomerDetail(
            customer.id,
            template.id,
            trimmedValue
          );
        } else if (existingDetail) {
          // Delete detail if value is empty and it existed before
          await CustomerService.deleteCustomerDetail(existingDetail.id);
        }
      }

      toast.success("All details saved successfully");
      loadCustomer();
    } catch (error) {
      console.error("Error saving details:", error);
      toast.error("Failed to save details");
    } finally {
      setSavingDetails(false);
    }
  };

  const handleGenerateContent = () => {
    if (!customer || !selectedContentTemplateId) {
      toast.error("Please select a content template");
      return;
    }

    const selectedTemplate = contentTemplates.find(
      (t) => t.id === selectedContentTemplateId
    );

    if (!selectedTemplate) {
      toast.error("Content template not found");
      return;
    }

    // Generate content using customer data
    const generated = CustomerService.generateContentFromTemplate(
      selectedTemplate,
      customer
    );

    setGeneratedContent(generated);
    setSelectedContentTemplate(selectedTemplate);
    setShowContentPreviewModal(true);
  };

  // Website handlers
  const handleAddWebsite = () => {
    setIsEditingWebsite(false);
    setSelectedWebsite(null);
    setWebsiteForm({
      url: "",
      name: "",
      description: "",
      is_primary: false,
    });
    setShowWebsiteModal(true);
  };

  const handleEditWebsite = (website: CustomerWebsite) => {
    setIsEditingWebsite(true);
    setSelectedWebsite(website);
    setWebsiteForm({
      url: website.url,
      name: website.name || "",
      description: website.description || "",
      is_primary: website.is_primary,
    });
    setShowWebsiteModal(true);
  };

  const handleDeleteWebsite = (website: CustomerWebsite) => {
    setSelectedWebsite(website);
    setShowDeleteWebsiteModal(true);
  };

  const handleSubmitWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setModalLoading(true);
    try {
      if (isEditingWebsite && selectedWebsite) {
        await CustomerService.updateWebsite(selectedWebsite.id, websiteForm);
        toast.success("Website updated successfully");
      } else {
        await CustomerService.createWebsite({
          customer_id: customer.id,
          ...websiteForm,
        });
        toast.success("Website added successfully");
      }
      setShowWebsiteModal(false);
      loadWebsites();
    } catch (error) {
      console.error("Error saving website:", error);
      toast.error("Failed to save website");
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDeleteWebsite = async () => {
    if (!selectedWebsite) return;

    try {
      await CustomerService.deleteWebsite(selectedWebsite.id);
      toast.success("Website deleted successfully");
      setShowDeleteWebsiteModal(false);
      setSelectedWebsite(null);
      loadWebsites();
    } catch (error) {
      console.error("Error deleting website:", error);
      toast.error("Failed to delete website");
    }
  };

  if (loading) {
    return (
      <div className="page-body">
        <Breadcrumbs
          title="Customer Detail"
          mainTitle="Customer Detail"
          parent="Customer"
        />
        <Container fluid>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "400px" }}
          >
            <Spinner color="primary" />
          </div>
        </Container>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="page-body">
        <Breadcrumbs
          title="Customer Detail"
          mainTitle="Customer Detail"
          parent="Customer"
        />
        <Container fluid>
          <div className="text-center py-5">
            <h3>Customer not found</h3>
            <Button color="primary" onClick={handleBack} className="mt-3">
              <i className="icon-arrow-left"></i>
              Back to Customers
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-body">
      <Breadcrumbs
        title="Customer Detail"
        mainTitle={`Customer Detail - ${customer.name}`}
        parent="Customer"
      />
      <Container fluid>
        <Row className="mb-3">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h5>{customer.name}</h5>
            </div>
          </Col>
          <Col className="d-flex align-items-center justify-content-end">
            <div className="d-flex gap-2">
              <Button color="secondary" onClick={handleBack}>
                <i className="icon-arrow-left"></i> Back
              </Button>
              <Button color="warning" onClick={handleEdit}>
                <i className="icon-pencil"></i> Edit
              </Button>
              <Button color="danger" onClick={handleDelete}>
                <i className="icon-trash"></i> Delete
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          {/* Customer Information */}
          <Col md={4}>
            <Card>
              <CardHeader>
                <h5 className="mb-0">Customer Information</h5>
              </CardHeader>
              <CardBody>
                <Table borderless>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Name:</strong>
                      </td>
                      <td>{customer.name}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Register Date:</strong>
                      </td>
                      <td>
                        {customer.register_at
                          ? new Date(customer.register_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Created:</strong>
                      </td>
                      <td>
                        {new Date(customer.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Last Updated:</strong>
                      </td>
                      <td>
                        {new Date(customer.updated_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
            {/* Content Template Generator */}
            {contentTemplates.length > 0 && (
              <Card className="mt-3">
                <CardHeader>
                  <h5 className="mb-0">Generate Content</h5>
                </CardHeader>
                <CardBody>
                  
                      <FormGroup>
                        <Label for="content-template-select">Select Content Template</Label>
                        <Input
                          type="select"
                          id="content-template-select"
                          value={selectedContentTemplateId}
                          onChange={(e) => setSelectedContentTemplateId(e.target.value)}
                        >
                          <option value="">-- Select Template --</option>
                          {contentTemplates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                              {template.description ? ` - ${template.description}` : ""}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                  
                      <Button
                        color="success"
                        size="sm"
                        onClick={handleGenerateContent}
                        disabled={!selectedContentTemplateId}
                      >
                    <i className="icon-file"></i> Generate
                      </Button>
                  
                </CardBody>
              </Card>
            )}

            {/* Customer Websites */}
            <Card className="mt-3">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Websites</h5>
                <Button color="primary" size="sm" onClick={handleAddWebsite}>
                  <Plus size={16} className="me-1" />
                  Add Website
                </Button>
              </CardHeader>
              <CardBody>
                {websites.length > 0 ? (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>URL</th>
                        <th>Primary</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {websites.map((website) => (
                        <tr key={website.id}>
                          <td>
                            {website.name || (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <a
                              href={website.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              {website.url}
                            </a>
                          </td>
                          <td>
                            {website.is_primary ? (
                              <Badge color="success">Primary</Badge>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                color="outline-info"
                                size="sm"
                                onClick={() => router.push(`/admin/customer/${customer.id}/website/${website.id}`)}
                                title="View Details"
                              >
                                <i className="icon-eye"></i>
                              </Button>
                              <Button
                                color="outline-primary"
                                size="sm"
                                onClick={() => handleEditWebsite(website)}
                                title="Edit"
                              >
                                <i className="icon-pencil"></i>
                              </Button>
                              <Button
                                color="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteWebsite(website)}
                                title="Delete"
                              >
                                <i className="icon-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert color="info" className="text-center mb-0">
                    No websites added yet. Click &quot;Add Website&quot; to add one.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Customer Details */}
          <Col md={8}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Customer Details</h5>
                <Button 
                  color="primary" 
                  size="sm" 
                  onClick={handleSaveAllDetails}
                  disabled={savingDetails}
                >
                  {savingDetails ? (
                    <>
                      <Spinner size="sm" className="me-1" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="icon-save"></i> Save All
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {templates.length > 0 ? (
                  <Form>
                    {templates.map((template) => {
                      const currentValue = detailValues.get(template.id) || "";
                      return (
                        <FormGroup key={template.id} className="mb-3">
                          <Label for={`detail-${template.id}`}>
                            <strong>{template.group} - {template.title}</strong>
                            <br />
                            {/* <small className="text-muted">
                              {template.key}
                            </small> */}
                          </Label>
                          <Input
                            type="text"
                            id={`detail-${template.id}`}
                            value={currentValue}
                            onChange={(e) =>
                              handleDetailValueChange(template.id, e.target.value)
                            }
                            placeholder={`Enter ${template.title.toLowerCase()}`}
                          />
                        </FormGroup>
                      );
                    })}
                  </Form>
                ) : (
                  <Alert color="warning" className="text-center">
                    No templates available. Please create a template first.
                  </Alert>
                )}
              </CardBody>
            </Card>

            
          </Col>
        </Row>

        {/* Edit Customer Modal */}
        <Modal
          isOpen={showEditModal}
          toggle={() => setShowEditModal(false)}
        >
          <ModalHeader toggle={() => setShowEditModal(false)}>
            Edit Customer
          </ModalHeader>
          <Form onSubmit={handleSubmitEdit}>
            <ModalBody>
              <FormGroup>
                <Label for="edit-name">Customer Name *</Label>
                <Input
                  type="text"
                  id="edit-name"
                  value={customerForm.name}
                  onChange={(e) =>
                    setCustomerForm({ ...customerForm, name: e.target.value })
                  }
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="edit-register_at">Register Date *</Label>
                <Input
                  type="date"
                  id="edit-register_at"
                  value={customerForm.register_at}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      register_at: e.target.value,
                    })
                  }
                  required
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={modalLoading}>
                {modalLoading ? <Spinner size="sm" /> : "Update"}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          toggle={() => setShowDeleteModal(false)}
        >
          <ModalHeader toggle={() => setShowDeleteModal(false)}>
            Confirm Delete
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete customer{" "}
              <strong>{customer.name}</strong>? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>

        {/* Content Preview Modal */}
        <Modal
          isOpen={showContentPreviewModal}
          toggle={() => setShowContentPreviewModal(false)}
          size="lg"
        >
          <ModalHeader toggle={() => setShowContentPreviewModal(false)}>
            Generated Content Preview
          </ModalHeader>
          <ModalBody>
            {selectedContentTemplate && customer && (
              <>
                <FormGroup>
                  <Label>Template:</Label>
                  <p className="mb-2">
                    <strong>{selectedContentTemplate.name}</strong>
                    {selectedContentTemplate.description && (
                      <small className="text-muted d-block">
                        {selectedContentTemplate.description}
                      </small>
                    )}
                  </p>
                </FormGroup>
                <FormGroup>
                  <Label>Customer:</Label>
                  <p className="mb-2">
                    <strong>{customer.name}</strong>
                  </p>
                </FormGroup>
                <FormGroup>
                  <Label>Generated Content:</Label>
                  <div
                    style={{
                      padding: "15px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                      border: "1px solid #dee2e6",
                      whiteSpace: "pre-wrap",
                      minHeight: "150px",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                    dangerouslySetInnerHTML={{ __html: generatedContent || "No content generated" }}
                  />
                </FormGroup>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => setShowContentPreviewModal(false)}
            >
              Close
            </Button>
            <Button
              color="primary"
              onClick={() => {
                if (generatedContent) {
                  navigator.clipboard.writeText(generatedContent);
                  toast.success("Content copied to clipboard!");
                }
              }}
            >
              Copy Content
            </Button>
          </ModalFooter>
        </Modal>

        {/* Website Form Modal */}
        <Modal
          isOpen={showWebsiteModal}
          toggle={() => setShowWebsiteModal(false)}
        >
          <ModalHeader toggle={() => setShowWebsiteModal(false)}>
            {isEditingWebsite ? "Edit Website" : "Add Website"}
          </ModalHeader>
          <Form onSubmit={handleSubmitWebsite}>
            <ModalBody>
              <FormGroup>
                <Label for="website-url">URL *</Label>
                <Input
                  type="url"
                  id="website-url"
                  value={websiteForm.url}
                  onChange={(e) =>
                    setWebsiteForm({ ...websiteForm, url: e.target.value })
                  }
                  placeholder="https://example.com"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="website-name">Name</Label>
                <Input
                  type="text"
                  id="website-name"
                  value={websiteForm.name}
                  onChange={(e) =>
                    setWebsiteForm({ ...websiteForm, name: e.target.value })
                  }
                  placeholder="e.g., Main Website, Blog, E-commerce"
                />
              </FormGroup>
              <FormGroup>
                <Label for="website-description">Description</Label>
                <Input
                  type="textarea"
                  id="website-description"
                  rows={3}
                  value={websiteForm.description}
                  onChange={(e) =>
                    setWebsiteForm({ ...websiteForm, description: e.target.value })
                  }
                  placeholder="Optional description for this website"
                />
              </FormGroup>
              <FormGroup check>
                <Input
                  type="checkbox"
                  id="website-primary"
                  checked={websiteForm.is_primary}
                  onChange={(e) =>
                    setWebsiteForm({ ...websiteForm, is_primary: e.target.checked })
                  }
                />
                <Label for="website-primary" check>
                  Set as primary website
                </Label>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => setShowWebsiteModal(false)}
              >
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={modalLoading}>
                {modalLoading ? (
                  <Spinner size="sm" />
                ) : isEditingWebsite ? (
                  "Update"
                ) : (
                  "Add"
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* Delete Website Confirmation Modal */}
        <Modal
          isOpen={showDeleteWebsiteModal}
          toggle={() => setShowDeleteWebsiteModal(false)}
        >
          <ModalHeader toggle={() => setShowDeleteWebsiteModal(false)}>
            Confirm Delete
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete this website?
              {selectedWebsite && (
                <>
                  <br />
                  <strong>{selectedWebsite.name || selectedWebsite.url}</strong>
                </>
              )}
              <br />
              This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => setShowDeleteWebsiteModal(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onClick={handleConfirmDeleteWebsite}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default CustomerDetailPage;

