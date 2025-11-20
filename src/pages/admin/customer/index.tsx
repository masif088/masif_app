import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
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
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  FileText,
} from "react-feather";
import { toast } from "react-toastify";
import Breadcrumbs from "CommonElements/Breadcrumbs";

// Dynamically import CustomEditor to avoid SSR issues
const CustomEditor = dynamic(() => import("src/components/Editor"), {
  ssr: false,
});
import {
  Customer,
  CustomerDataTemplate,
  CustomerDetail,
  CustomerStats,
  CustomerFormData,
  CustomerContentTemplate,
} from "../../../../Types/CustomerType";
import { CustomerService } from "../../../../utils/supabase/customerService";

const CustomerManagement = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [templates, setTemplates] = useState<CustomerDataTemplate[]>([]);
  const [contentTemplates, setContentTemplates] = useState<CustomerContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showContentTemplateModal, setShowContentTemplateModal] = useState(false);
  const [showContentPreviewModal, setShowContentPreviewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingContentTemplate, setIsEditingContentTemplate] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [customerForm, setCustomerForm] = useState<CustomerFormData>({
    name: "",
    register_at: new Date().toISOString().split("T")[0],
    details: [],
  });

  const [templateForm, setTemplateForm] = useState({
    title: "",
    key: "",
  });

  const [contentTemplateForm, setContentTemplateForm] = useState({
    name: "",
    content: "",
    description: "",
  });

  const [previewContent, setPreviewContent] = useState("");
  const [selectedContentTemplate, setSelectedContentTemplate] = useState<CustomerContentTemplate | null>(null);


  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Filter customers based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customersData, statsData, templatesData, contentTemplatesData] = await Promise.all([
        CustomerService.getAllCustomers(),
        CustomerService.getCustomerStats(),
        CustomerService.getAllTemplates(),
        CustomerService.getAllContentTemplates(),
      ]);

      setCustomers(customersData);
      setStats(statsData);
      setTemplates(templatesData);
      setContentTemplates(contentTemplatesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = () => {
    setIsEditing(false);
    setCustomerForm({
      name: "",
      register_at: new Date().toISOString().split("T")[0],
      details: [],
    });
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setIsEditing(true);
    setSelectedCustomer(customer);
    
    setCustomerForm({
      name: customer.name,
      register_at: customer.register_at ? customer.register_at.split("T")[0] : new Date().toISOString().split("T")[0],
      details: [],
    });
    setShowCustomerModal(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    router.push(`/admin/customer/${customer.id}`);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete "${customer.name}"?`)) {
      try {
        await CustomerService.deleteCustomer(customer.id);
        toast.success("Customer deleted successfully");
        loadData();
      } catch (error) {
        console.error("Error deleting customer:", error);
        toast.error("Failed to delete customer");
      }
    }
  };

  const handleSubmitCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      const { details, ...customerData } = customerForm;
      
      if (isEditing && selectedCustomer) {
        await CustomerService.updateCustomer(selectedCustomer.id, {
          name: customerData.name,
          register_at: customerData.register_at,
        });

        toast.success("Customer updated successfully");
      } else {
        await CustomerService.createCustomer({
          name: customerData.name,
          register_at: customerData.register_at,
        });

        toast.success("Customer created successfully");
      }

      setShowCustomerModal(false);
      loadData();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error("Failed to save customer");
    } finally {
      setModalLoading(false);
    }
  };



  const handleCreateTemplate = () => {
    setTemplateForm({ title: "", key: "" });
    setShowTemplateModal(true);
  };

  const handleSubmitTemplate = async () => {
    if (!templateForm.title || !templateForm.key) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await CustomerService.createTemplate(templateForm);
      toast.success("Template created successfully");
      setShowTemplateModal(false);
      setTemplateForm({ title: "", key: "" });
      loadData();
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await CustomerService.deleteTemplate(templateId);
        toast.success("Template deleted successfully");
        loadData();
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error("Failed to delete template");
      }
    }
  };

  // Content Template Handlers
  const handleCreateContentTemplate = () => {
    setIsEditingContentTemplate(false);
    setContentTemplateForm({
      name: "",
      content: "",
      description: "",
    });
    setShowContentTemplateModal(true);
  };

  const handleEditContentTemplate = (template: CustomerContentTemplate) => {
    setIsEditingContentTemplate(true);
    setSelectedContentTemplate(template);
    setContentTemplateForm({
      name: template.name,
      content: template.content,
      description: template.description || "",
    });
    setShowContentTemplateModal(true);
  };

  const handleSubmitContentTemplate = async () => {
    if (!contentTemplateForm.name || !contentTemplateForm.content) {
      toast.error("Please fill name and content fields");
      return;
    }

    setModalLoading(true);
    try {
      if (isEditingContentTemplate && selectedContentTemplate) {
        await CustomerService.updateContentTemplate(selectedContentTemplate.id, contentTemplateForm);
        toast.success("Content template updated successfully");
      } else {
        await CustomerService.createContentTemplate(contentTemplateForm);
        toast.success("Content template created successfully");
      }
      setShowContentTemplateModal(false);
      setContentTemplateForm({ name: "", content: "", description: "" });
      loadData();
    } catch (error) {
      console.error("Error saving content template:", error);
      toast.error("Failed to save content template");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteContentTemplate = async (templateId: string) => {
    if (window.confirm("Are you sure you want to delete this content template?")) {
      try {
        await CustomerService.deleteContentTemplate(templateId);
        toast.success("Content template deleted successfully");
        loadData();
      } catch (error) {
        console.error("Error deleting content template:", error);
        toast.error("Failed to delete content template");
      }
    }
  };

  const handlePreviewContent = (template: CustomerContentTemplate, customer: Customer) => {
    const generatedContent = CustomerService.generateContentFromTemplate(template, customer);
    setPreviewContent(generatedContent);
    setSelectedContentTemplate(template);
    setSelectedCustomer(customer);
    setShowContentPreviewModal(true);
  };

  if (loading) {
    return (
      <div className="page-body">
        <Breadcrumbs
          title="Customer Management"
          mainTitle="Customers"
          parent="Admin"
        />
        <Container fluid>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "200px" }}
          >
            <Spinner color="primary" />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-body">
      <Breadcrumbs
        title="Customer Management"
        mainTitle="Customers"
        parent="Admin"
      />
      <Container fluid>
        <Row>
          <Col>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Customer Management</h4>
                <div className="d-flex gap-2">
                  
                  <Button
                    color="info"
                    outline
                    size="sm"
                    onClick={handleCreateTemplate}
                  >
                    <Plus size={16} className="me-1" />
                    Template
                  </Button>
                  <Button
                    color="primary"
                    outline
                    size="sm"
                    onClick={handleCreateCustomer}
                  >
                    <Plus size={16} className="me-1" />
                    Add Customer
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {/* Statistics Cards */}
                {stats && (
                  <Row className="mb-4">
                    <Col md={4}>
                      <Card className="bg-primary text-white">
                        <CardBody className="text-center">
                          <i className="icon-user font-light f-40"></i>
                          <h3 className="mb-0">{stats.total}</h3>
                          <small>Total Customers</small>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="bg-success text-white">
                        <CardBody className="text-center">
                          <i className="icon-file font-light f-40"></i>
                          <h3 className="mb-0">{stats.totalDetails}</h3>
                          <small>Total Details</small>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="bg-info text-white">
                        <CardBody className="text-center">
                          <i className="icon-settings font-light f-40"></i>
                          <h3 className="mb-0">{templates.length}</h3>
                          <small>Data Templates</small>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                )}

                {/* Search */}
                <Row className="mb-3">
                  <Col md={6}>
                    <div className="position-relative">
                      <Search
                        size={16}
                        className="position-absolute"
                        style={{
                          left: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#6c757d",
                        }}
                      />
                      <Input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: "35px" }}
                      />
                    </div>
                  </Col>
                </Row>

                {/* Customers Table */}
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Register Date</th>
                      <th>Details</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <h6 className="mb-0">{customer.name}</h6>
                        </td>
                        <td>
                          {customer.register_at
                            ? new Date(customer.register_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <Badge color="secondary">
                            {customer.details?.length || 0} details
                          </Badge>
                        </td>
                        <td>
                          {new Date(customer.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              color="outline-info"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                              title="View"
                            >
                              <Eye size={14} />
                            </Button>
                            {contentTemplates.length > 0 && (
                              <Button
                                color="outline-success"
                                size="sm"
                                onClick={() => {
                                  // Open modal to select template and preview
                                  if (contentTemplates.length === 1) {
                                    handlePreviewContent(contentTemplates[0], customer);
                                  } else {
                                    // For multiple templates, show first one or create a selection modal
                                    // For now, show first template
                                    handlePreviewContent(contentTemplates[0], customer);
                                  }
                                }}
                                title="Generate Content"
                              >
                                <FileText size={14} />
                              </Button>
                            )}
                            <Button
                              color="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {filteredCustomers.length === 0 && (
                  <Alert color="info" className="text-center">
                    No customers found.{" "}
                    {searchTerm
                      ? "Try adjusting your search."
                      : "Create your first customer to get started."}
                  </Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Content Templates Card */}
        <Row className="mt-4">
          <Col>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Content Templates</h4>
                <Button
                  color="secondary"
                  outline
                  size="sm"
                  onClick={handleCreateContentTemplate}
                >
                  <Plus size={16} className="me-1" />
                  Create Template
                </Button>
              </CardHeader>
              <CardBody>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Content Preview</th>
                      <th>Description</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentTemplates.map((template) => (
                      <tr key={template.id}>
                        <td>
                          <h6 className="mb-0">{template.name}</h6>
                        </td>
                        <td>
                          <small className="text-muted">
                            {template.content.length > 100
                              ? `${template.content.substring(0, 100)}...`
                              : template.content}
                          </small>
                        </td>
                        <td>
                          {template.description ? (
                            <small>{template.description}</small>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {new Date(template.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              color="outline-primary"
                              size="sm"
                              onClick={() => handleEditContentTemplate(template)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              color="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteContentTemplate(template.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {contentTemplates.length === 0 && (
                  <Alert color="info" className="text-center">
                    No content templates found. Create your first template to get started.
                  </Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Customer Form Modal */}
        <Modal
          isOpen={showCustomerModal}
          toggle={() => setShowCustomerModal(false)}
          size="xl"
        >
          <ModalHeader toggle={() => setShowCustomerModal(false)}>
            {isEditing ? "Edit Customer" : "Create Customer"}
          </ModalHeader>
          <Form onSubmit={handleSubmitCustomer}>
            <ModalBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="name">Customer Name *</Label>
                    <Input
                      type="text"
                      id="name"
                      value={customerForm.name}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, name: e.target.value })
                      }
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="register_at">Register Date *</Label>
                    <Input
                      type="date"
                      id="register_at"
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
                </Col>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => setShowCustomerModal(false)}
              >
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={modalLoading}>
                {modalLoading ? (
                  <Spinner size="sm" />
                ) : isEditing ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* Template Modal */}
        <Modal
          isOpen={showTemplateModal}
          toggle={() => setShowTemplateModal(false)}
        >
          <ModalHeader toggle={() => setShowTemplateModal(false)}>
            Create Data Template
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="template-title">Title *</Label>
              <Input
                type="text"
                id="template-title"
                value={templateForm.title}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, title: e.target.value })
                }
                placeholder="e.g., Email, Phone, Address"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="template-key">Key *</Label>
              <Input
                type="text"
                id="template-key"
                value={templateForm.key}
                onChange={(e) =>
                  setTemplateForm({
                    ...templateForm,
                    key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  })
                }
                placeholder="e.g., email, phone, address"
                required
              />
              <small className="text-muted">
                Key will be automatically formatted (lowercase, underscores)
              </small>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => setShowTemplateModal(false)}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={handleSubmitTemplate}>
              Create Template
            </Button>
          </ModalFooter>
        </Modal>

        {/* Content Template Modal - Full Screen */}
        <Modal
          isOpen={showContentTemplateModal}
          toggle={() => setShowContentTemplateModal(false)}
          fullscreen
          style={{ zIndex: 1055 }}
        >
          <ModalHeader toggle={() => setShowContentTemplateModal(false)}>
            {isEditingContentTemplate ? "Edit Content Template" : "Create Content Template"}
          </ModalHeader>
          <ModalBody style={{ padding: "20px", height: "calc(100vh - 120px)", overflowY: "auto" }}>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="content-template-name">Template Name *</Label>
                  <Input
                    type="text"
                    id="content-template-name"
                    value={contentTemplateForm.name}
                    onChange={(e) =>
                      setContentTemplateForm({ ...contentTemplateForm, name: e.target.value })
                    }
                    placeholder="e.g., Contact Template, Welcome Message"
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="content-template-description">Description</Label>
                  <Input
                    type="textarea"
                    id="content-template-description"
                    rows={2}
                    value={contentTemplateForm.description}
                    onChange={(e) =>
                      setContentTemplateForm({ ...contentTemplateForm, description: e.target.value })
                    }
                    placeholder="Optional description for this template"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Label for="content-template-content">Content *</Label>
                    <small className="text-muted">
                      Click the chip below to add a placeholder to the content
                    </small>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <Badge
                      color="primary"
                      style={{ 
                        cursor: "pointer", 
                        fontSize: "0.875rem", 
                        padding: "0.5rem 0.75rem",
                        userSelect: "none"
                      }}
                      onClick={async () => {
                        const placeholder = "{[name]}";
                        try {
                          await navigator.clipboard.writeText(placeholder);
                          toast.info("Placeholder copied to clipboard.");
                        } catch (error) {
                          toast.error("Failed to copy to clipboard.");
                        }
                      }}
                    >
                      {"Name"}
                    </Badge>
                    {/* Group templates by group property */}
                    {Object.entries(
                      templates.reduce((acc, template) => {
                        const group = template.group || "Ungrouped";
                        if (!acc[group]) acc[group] = [];
                        acc[group].push(template);
                        return acc;
                      }, {} as Record<string, typeof templates>)
                    ).map(([group, groupTemplates]) => (
                      <div key={group} style={{ marginRight: "1rem", marginBottom: "0.25rem" }}>
                        <div style={{ fontWeight: 500, fontSize: "0.8rem", color: "#495057", marginBottom: "0.35rem" }}>
                          {group}
                        </div>
                        <div className="d-flex flex-wrap gap-2 mb-1">
                          {groupTemplates.map((template) => (
                            <Badge
                              key={template.id}
                              color="info"
                              style={{ 
                                cursor: "pointer", 
                                fontSize: "0.875rem", 
                                padding: "0.5rem 0.75rem",
                                userSelect: "none",
                                marginLeft: "0px"
                              }}
                              onClick={async () => {
                                const placeholder = `{[${template.key}]}`;
                              
                                  // fallback: copy to clipboard
                                  try {
                                    await navigator.clipboard.writeText(placeholder);
                                    toast.info("Placeholder copied. Paste it (Ctrl+V) at your desired place.");
                                  } catch (err) {
                                    // fallback: add at end if clipboard failed  
                                    const currentContent = contentTemplateForm.content;
                                    const newContent = currentContent 
                                      ? (currentContent.endsWith(" ") ? currentContent : currentContent + " ") + placeholder
                                      : placeholder;
                                    setContentTemplateForm({
                                      ...contentTemplateForm,
                                      content: newContent,
                                    });
                                  }
                                
                              }}
                              title={template.title}
                            >
                              {`${template.title}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ border: "1px solid #dee2e6", borderRadius: "4px" }}>
                    <CustomEditor
                      setEdit={(value: string) =>
                        setContentTemplateForm({ ...contentTemplateForm, content: value })
                      }
                      getEdit={contentTemplateForm.content}
                    />
                  </div>
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter style={{ padding: "15px 20px", borderTop: "1px solid #dee2e6" }}>
            <Button
              color="secondary"
              onClick={() => {
                setShowContentTemplateModal(false);
                setContentTemplateForm({ name: "", content: "", description: "" });
              }}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={handleSubmitContentTemplate} disabled={modalLoading}>
              {modalLoading ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Saving...
                </>
              ) : isEditingContentTemplate ? (
                "Update"
              ) : (
                "Create"
              )}
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
            Content Preview
          </ModalHeader>
          <ModalBody>
            {selectedContentTemplate && selectedCustomer && (
              <>
                <FormGroup>
                  <Label>Template:</Label>
                  <p className="mb-2">
                    <strong>{selectedContentTemplate.name}</strong>
                  </p>
                </FormGroup>
                <FormGroup>
                  <Label>Customer:</Label>
                  <p className="mb-2">
                    <strong>{selectedCustomer.name}</strong>
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
                      minHeight: "100px",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: previewContent || "No content generated"
                    }}
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
                if (previewContent) {
                  navigator.clipboard.writeText(previewContent);
                  toast.success("Content copied to clipboard!");
                }
              }}
            >
              Copy Content
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default CustomerManagement;

