import { useState, useEffect } from "react";
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
} from "react-feather";
import { toast } from "react-toastify";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import {
  Company,
  CompanyStats,
  CompanyFormData,
  CompanyMember,
} from "../../../../Types/CompanyType";
import { CompanyService } from "../../../../utils/supabase/companyService";
import { UserService } from "../../../../utils/supabase/userService";
import { User } from "../../../../Types/ActivityType";

const CompanyManagement = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Modal states
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [companyForm, setCompanyForm] = useState<CompanyFormData>({
    name: "",
    description: "",
    website: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
    phone: "",
    email: "",
    industry: "",
    founded_date: "",
    leader_id: "",
    logo: null,
    is_active: true,
  });

  const [selectedUserId, setSelectedUserId] = useState("");

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Filter companies based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = companies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchTerm, companies]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [companiesData, statsData, usersData] = await Promise.all([
        CompanyService.getAllCompanies(),
        CompanyService.getCompanyStats(),
        UserService.getAllUsers(),
      ]);

      setCompanies(companiesData);
      setStats(statsData);
      setAllUsers(usersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = () => {
    setIsEditing(false);
    setCompanyForm({
      name: "",
      description: "",
      website: "",
      address: "",
      city: "",
      postal_code: "",
      country: "",
      phone: "",
      email: "",
      industry: "",
      founded_date: "",
      leader_id: "",
      logo: null,
      is_active: true,
    });
    setShowCompanyModal(true);
  };

  const handleEditCompany = (company: Company) => {
    setIsEditing(true);
    setSelectedCompany(company);
    setCompanyForm({
      name: company.name,
      description: company.description || "",
      website: company.website || "",
      address: company.address || "",
      city: company.city || "",
      postal_code: company.postal_code || "",
      country: company.country || "",
      phone: company.phone || "",
      email: company.email || "",
      industry: company.industry || "",
      founded_date: company.founded_date || "",
      leader_id: company.leader_id || "",
      logo: null,
      is_active: company.is_active,
    });
    setShowCompanyModal(true);
  };

  const handleViewCompany = async (company: Company) => {
    setSelectedCompany(company);
    setShowDetailModal(true);
  };

  const handleDeleteCompany = async (company: Company) => {
    if (window.confirm(`Are you sure you want to delete "${company.name}"?`)) {
      try {
        await CompanyService.deleteCompany(company.id);
        toast.success("Company deleted successfully");
        loadData();
      } catch (error) {
        console.error("Error deleting company:", error);
        toast.error("Failed to delete company");
      }
    }
  };

  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      const { logo, ...formData } = companyForm;
      if (isEditing && selectedCompany) {
        await CompanyService.updateCompany(selectedCompany.id, formData);
        toast.success("Company updated successfully");
      } else {
        await CompanyService.createCompany(formData);
        toast.success("Company created successfully");
      }

      setShowCompanyModal(false);
      loadData();
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error("Failed to save company");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateLeader = async () => {
    if (!selectedCompany || !selectedUserId) return;

    try {
      await CompanyService.updateCompanyLeader(
        selectedCompany.id,
        selectedUserId
      );
      toast.success("Leader updated successfully");
      setSelectedUserId("");
      setShowLeaderModal(false);
      loadData();
    } catch (error) {
      console.error("Error updating leader:", error);
      toast.error("Failed to update leader");
    }
  };

  const handleRemoveLeader = async (companyId: number) => {
    if (window.confirm("Are you sure you want to remove this leader?")) {
      try {
        await CompanyService.removeCompanyLeader(companyId);
        toast.success("Leader removed successfully");
        loadData();
      } catch (error) {
        console.error("Error removing leader:", error);
        toast.error("Failed to remove leader");
      }
    }
  };

  const handleAssignMember = async () => {
    if (!selectedCompany || !selectedUserId) return;

    try {
      await CompanyService.assignUserToCompany(
        selectedUserId,
        selectedCompany.id
      );
      toast.success("Member assigned successfully");
      setSelectedUserId("");
      setShowMemberModal(false);
      loadData();
    } catch (error) {
      console.error("Error assigning member:", error);
      toast.error("Failed to assign member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this member from the company?"
      )
    ) {
      try {
        await CompanyService.removeUserFromCompany(userId);
        toast.success("Member removed successfully");
        loadData();
      } catch (error) {
        console.error("Error removing member:", error);
        toast.error("Failed to remove member");
      }
    }
  };

  const availableUsers = allUsers.filter(
    (user) =>
      user.id !== selectedCompany?.leader_id &&
      !selectedCompany?.members?.some((member) => member.id === user.id)
  );

  const availableLeaders = allUsers.filter(
    (user) => !selectedCompany?.members?.some((member) => member.id === user.id)
  );

  if (loading) {
    return (
      <div className="page-body">
        <Breadcrumbs
          title="Company Management"
          mainTitle="Companies"
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
        title="Company Management"
        mainTitle="Companies"
        parent="Admin"
      />
      <Container fluid>
        <Row>
          <Col>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Company Management</h4>
                <Button
                  color="primary"
                  outline
                  size="sm"
                  onClick={handleCreateCompany}
                >
                  <i className="icon-plus"></i> Add Company
                </Button>
              </CardHeader>
              <CardBody>
                {/* Statistics Cards */}
                {stats && (
                  <Row className="mb-4">
                    <Col md={3}>
                      <Card className="bg-primary text-white">
                        <CardBody className="text-center">
                          <i className="icon-home font-light f-40"></i>
                          <h3 className="mb-0">{stats.total}</h3>
                          <small>Total Companies</small>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="bg-success text-white">
                        <CardBody className="text-center">
                          <i className="icon-home font-light f-40"></i>
                          <h3 className="mb-0">{stats.active}</h3>
                          <small>Active Companies</small>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="bg-info text-white">
                        <CardBody className="text-center">
                          <i className="icon-user font-light f-40"></i>
                          <h3 className="mb-0">{stats.totalMembers}</h3>
                          <small>Total Members</small>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="bg-warning text-white">
                        <CardBody className="text-center">
                          <i className="icon-user font-light f-40"></i>
                          <h3 className="mb-0">{stats.totalLeaders}</h3>
                          <small>Total Leaders</small>
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
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: "35px" }}
                      />
                    </div>
                  </Col>
                </Row>

                {/* Companies Table */}
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Industry</th>
                      <th>Leader</th>
                      <th>Members</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company) => (
                      <tr key={company.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {company.logo && (
                              <img
                                src={company.logo}
                                alt={company.name}
                                className="me-2 rounded"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  objectFit: "cover",
                                }}
                              />
                            )}
                            <div>
                              <h6 className="mb-0">{company.name}</h6>
                              <small className="text-muted">
                                {company.description}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge color="secondary">
                            {company.industry || "N/A"}
                          </Badge>
                        </td>
                        <td>
                          {company.leader ? (
                            <div className="d-flex align-items-center">
                              {company.leader.avatar && (
                                <img
                                  src={company.leader.avatar}
                                  alt={company.leader.first_name}
                                  className="me-2 rounded-circle"
                                  style={{ width: "24px", height: "24px" }}
                                />
                              )}
                              <span className="small">
                                {company.leader.first_name}{" "}
                                {company.leader.last_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted">No leader</span>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {company.members?.length || 0}
                          </span>
                        </td>
                        <td>
                          <Badge
                            color={company.is_active ? "success" : "danger"}
                          >
                            {company.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              color="outline-info"
                              size="sm"
                              onClick={() => handleViewCompany(company)}
                            >
                              <i className="icon-eye"></i>
                            </Button>
                            <Button
                              color="outline-warning"
                              size="sm"
                              onClick={() => handleEditCompany(company)}
                            >
                              <i className="icon-pencil"></i>
                            </Button>
                            <Button
                              color="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteCompany(company)}
                            >
                              <i className="icon-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {filteredCompanies.length === 0 && (
                  <Alert color="info" className="text-center">
                    No companies found.{" "}
                    {searchTerm
                      ? "Try adjusting your search."
                      : "Create your first company to get started."}
                  </Alert>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Company Form Modal */}
        <Modal
          isOpen={showCompanyModal}
          toggle={() => setShowCompanyModal(false)}
          size="lg"
        >
          <ModalHeader toggle={() => setShowCompanyModal(false)}>
            {isEditing ? "Edit Company" : "Create Company"}
          </ModalHeader>
          <Form onSubmit={handleSubmitCompany}>
            <ModalBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="name">Company Name *</Label>
                    <Input
                      type="text"
                      id="name"
                      value={companyForm.name}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, name: e.target.value })
                      }
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="industry">Industry</Label>
                    <Input
                      type="select"
                      id="industry"
                      value={companyForm.industry}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          industry: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Other">Other</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="leader_id">Company Leader</Label>
                    <Input
                      type="select"
                      id="leader_id"
                      value={companyForm.leader_id}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          leader_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Leader (Optional)</option>
                      {allUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="founded_date">Founded Date</Label>
                    <Input
                      type="date"
                      id="founded_date"
                      value={companyForm.founded_date}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          founded_date: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Label for="description">Description</Label>
                    <Input
                      type="textarea"
                      id="description"
                      value={companyForm.description}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      value={companyForm.email}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="phone">Phone</Label>
                    <Input
                      type="tel"
                      id="phone"
                      value={companyForm.phone}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="website">Website</Label>
                    <Input
                      type="url"
                      id="website"
                      value={companyForm.website}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          website: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="address">Address</Label>
                    <Input
                      type="text"
                      id="address"
                      value={companyForm.address}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          address: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="city">City</Label>
                    <Input
                      type="text"
                      id="city"
                      value={companyForm.city}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, city: e.target.value })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="postal_code">Postal Code</Label>
                    <Input
                      type="text"
                      id="postal_code"
                      value={companyForm.postal_code}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          postal_code: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                </Col>
              
                <Col md={6}>
                  <FormGroup>
                    <Label for="country">Country</Label>
                    <Input
                      type="text"
                      id="country"
                      value={companyForm.country}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          country: e.target.value,
                        })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    
                    <FormGroup>
                    <Label for="is_active">Status</Label>
                    <Input
                      type="select"
                      id="is_active"
                      value={companyForm.is_active ? "1" : "0"}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          is_active: e.target.value === "1",
                        })
                      }
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                      
                    </Input>
                  </FormGroup>
                  </FormGroup>
                </Col>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => setShowCompanyModal(false)}
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

        {/* Company Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          toggle={() => setShowDetailModal(false)}
          size="xl"
        >
          <ModalHeader toggle={() => setShowDetailModal(false)}>
            Company Details
          </ModalHeader>
          <ModalBody>
            {selectedCompany && (
              <Row>
                <Col md={8}>
                  <Card>
                    <CardBody>
                      <div className="d-flex align-items-center mb-3">
                        {selectedCompany.logo && (
                          <img
                            src={selectedCompany.logo}
                            alt={selectedCompany.name}
                            className="me-3 rounded"
                            style={{
                              width: "64px",
                              height: "64px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <div>
                          <h3 className="mb-0">{selectedCompany.name}</h3>
                          <p className="text-muted mb-0">
                            {selectedCompany.description}
                          </p>
                        </div>
                      </div>

                      <Row>
                        <Col md={6}>
                          <p>
                            <strong>Industry:</strong>{" "}
                            {selectedCompany.industry || "N/A"}
                          </p>
                          <p>
                            <strong>Email:</strong>{" "}
                            {selectedCompany.email || "N/A"}
                          </p>
                          <p>
                            <strong>Phone:</strong>{" "}
                            {selectedCompany.phone || "N/A"}
                          </p>
                          <p>
                            <strong>Website:</strong>{" "}
                            {selectedCompany.website || "N/A"}
                          </p>
                        </Col>
                        <Col md={6}>
                          <p>
                            <strong>Founded:</strong>{" "}
                            {selectedCompany.founded_date || "N/A"}
                          </p>
                          <p>
                            <strong>Address:</strong>{" "}
                            {selectedCompany.address || "N/A"}
                          </p>
                          <p>
                            <strong>City:</strong>{" "}
                            {selectedCompany.city || "N/A"}
                          </p>
                          <p>
                            <strong>Country:</strong>{" "}
                            {selectedCompany.country || "N/A"}
                          </p>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card>
                    <CardHeader className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Leader</h5>
                      <Button
                        color="outline-primary"
                        size="sm"
                        onClick={() => setShowLeaderModal(true)}
                      >
                        <i className="icon-plus"></i>
                      </Button>
                    </CardHeader>
                    <CardBody>
                      {selectedCompany.leader ? (
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center">
                            {selectedCompany.leader.avatar && (
                              <img
                                src={selectedCompany.leader.avatar}
                                alt={selectedCompany.leader.first_name}
                                className="me-2 rounded-circle"
                                style={{ width: "24px", height: "24px" }}
                              />
                            )}
                            <div>
                              <small className="fw-bold">
                                {selectedCompany.leader.first_name}{" "}
                                {selectedCompany.leader.last_name}
                              </small>
                              <br />
                              <small className="text-muted">
                                {selectedCompany.leader.email}
                              </small>
                            </div>
                          </div>
                          <Button
                            color="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleRemoveLeader(selectedCompany.id)
                            }
                          >
                            <i className="icon-trash"></i>
                          </Button>
                        </div>
                      ) : (
                        <p className="text-muted">No leader assigned</p>
                      )}
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Members</h5>
                      <Button
                        color="outline-primary"
                        size="sm"
                        onClick={() => setShowMemberModal(true)}
                      >
                        <i className="icon-plus"></i>
                      </Button>
                    </CardHeader>
                    <CardBody>
                      {selectedCompany.members?.map((member) => (
                        <div
                          key={member.id}
                          className="d-flex align-items-center justify-content-between mb-2"
                        >
                          <div className="d-flex align-items-center">
                            {member.avatar && (
                              <img
                                src={member.avatar}
                                alt={member.first_name}
                                className="me-2 rounded-circle"
                                style={{ width: "24px", height: "24px" }}
                              />
                            )}
                            <div>
                              <small className="fw-bold">
                                {member.first_name} {member.last_name}
                              </small>
                              <br />
                              <small className="text-muted">
                                {member.role || "Member"}
                              </small>
                            </div>
                          </div>
                          <Button
                            color="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <i className="icon-trash"></i>
                          </Button>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            )}
          </ModalBody>
        </Modal>

        {/* Update Leader Modal */}
        <Modal
          isOpen={showLeaderModal}
          toggle={() => setShowLeaderModal(false)}
        >
          <ModalHeader toggle={() => setShowLeaderModal(false)}>
            Update Company Leader
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="leader-user">Select User</Label>
              <Input
                type="select"
                id="leader-user"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select a user</option>
                {availableLeaders.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </Input>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowLeaderModal(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleUpdateLeader}
              disabled={!selectedUserId}
            >
              Update Leader
            </Button>
          </ModalFooter>
        </Modal>

        {/* Add Member Modal */}
        <Modal
          isOpen={showMemberModal}
          toggle={() => setShowMemberModal(false)}
        >
          <ModalHeader toggle={() => setShowMemberModal(false)}>
            Assign Company Member
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="member-user">Select User</Label>
              <Input
                type="select"
                id="member-user"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select a user</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </Input>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowMemberModal(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleAssignMember}
              disabled={!selectedUserId}
            >
              Assign Member
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default CompanyManagement;
