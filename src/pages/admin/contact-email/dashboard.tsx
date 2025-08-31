import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, { useState, useEffect } from "react";
import { 
    Col, 
    Container, 
    Row, 
    Card, 
    CardBody, 
    CardHeader, 
    Button, 
    Badge, 
    Progress,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Label,
    Input,
    FormText,
    Table
} from "reactstrap";
import { ActivityService } from "utils/supabase/activityService";
import { ContactEmail, ContactEmailCategory, CreateContactEmailData, CreateContactEmailCategoryData } from "Types/ActivityType";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const ContactEmailDashboard = () => {
    const router = useRouter();
    const [contacts, setContacts] = useState<ContactEmail[]>([]);
    const [categories, setCategories] = useState<ContactEmailCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [addFormData, setAddFormData] = useState<CreateContactEmailData>({
        name: '',
        email: '',
        category: '',
        notes: '',
        is_favorite: false
    });
    const [categoryFormData, setCategoryFormData] = useState<CreateContactEmailCategoryData>({
        name: '',
        color: 'primary',
        is_default: false
    });
    const [submitting, setSubmitting] = useState(false);
    const [categorySubmitting, setCategorySubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    const [stats, setStats] = useState({
        total: 0,
        favorites: 0,
        categories: {} as Record<string, number>,
        recentAdded: 0
    });

    // Available colors for categories
    const categoryColors = [
        { value: 'primary', label: 'Primary (Blue)', class: 'bg-primary' },
        { value: 'secondary', label: 'Secondary (Gray)', class: 'bg-secondary' },
        { value: 'success', label: 'Success (Green)', class: 'bg-success' },
        { value: 'info', label: 'Info (Cyan)', class: 'bg-info' },
        { value: 'warning', label: 'Warning (Yellow)', class: 'bg-warning' },
        { value: 'danger', label: 'Danger (Red)', class: 'bg-danger' },
        { value: 'light', label: 'Light (Light Gray)', class: 'bg-light' },
        { value: 'dark', label: 'Dark (Dark Gray)', class: 'bg-dark' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch contacts and categories in parallel
            const [contactsData, categoriesData] = await Promise.all([
                ActivityService.getContactEmails(),
                ActivityService.getContactEmailCategories()
            ]);
            
            setContacts(contactsData);
            setCategories(categoriesData);
            
            // Initialize default categories if none exist
            if (categoriesData.length === 0) {
                await ActivityService.initializeDefaultCategories();
                const updatedCategories = await ActivityService.getContactEmailCategories();
                setCategories(updatedCategories);
            }
            
            // Calculate statistics
            const favorites = contactsData.filter(contact => contact.is_favorite).length;
            const categories: Record<string, number> = {};
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            contactsData.forEach(contact => {
                categories[contact.category] = (categories[contact.category] || 0) + 1;
            });

            const recentAdded = contactsData.filter(contact => 
                contact.created_at && new Date(contact.created_at) > oneWeekAgo
            ).length;

            setStats({
                total: contactsData.length,
                favorites,
                categories,
                recentAdded
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'add':
                setShowAddModal(true);
                break;
            case 'import':
                router.push('/admin/contact-email/import');
                break;
            case 'export':
                router.push('/admin/contact-email/export');
                break;
            case 'favorites':
                setSelectedCategory('favorites');
                break;
            case 'manage-categories':
                setShowCategoryModal(true);
                break;
        }
    };

    const handleAddContact = async () => {
        if (!addFormData.name || !addFormData.email || !addFormData.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            await ActivityService.createContactEmail(addFormData);
            toast.success('Contact added successfully');
            setShowAddModal(false);
            setAddFormData({
                name: '',
                email: '',
                category: '',
                notes: '',
                is_favorite: false
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error adding contact:', error);
            toast.error('Failed to add contact');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddCategory = async () => {
        if (!categoryFormData.name) {
            toast.error('Please enter a category name');
            return;
        }

        // Check if category name already exists
        const existingCategory = categories.find(cat => 
            cat.name.toLowerCase() === categoryFormData.name.toLowerCase()
        );
        
        if (existingCategory) {
            toast.error('A category with this name already exists');
            return;
        }

        try {
            setCategorySubmitting(true);
            await ActivityService.createContactEmailCategory(categoryFormData);
            toast.success('Category created successfully');
            setShowCategoryModal(false);
            setCategoryFormData({
                name: '',
                color: 'primary',
                is_default: false
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error('Failed to create category');
        } finally {
            setCategorySubmitting(false);
        }
    };

    const getTopCategories = () => {
        return Object.entries(stats.categories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
    };

    const getFilteredContacts = () => {
        if (selectedCategory === 'all') {
            return contacts;
        } else if (selectedCategory === 'favorites') {
            return contacts.filter(contact => contact.is_favorite);
        } else {
            return contacts.filter(contact => contact.category === selectedCategory);
        }
    };

    const getCategoryColor = (categoryName: string) => {
        const category = categories.find(cat => cat.name === categoryName);
        return category?.color || 'primary';
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

    return (
        <div className="page-body">
            <Breadcrumbs
                title="Contact Dashboard"
                mainTitle="Contact Dashboard"
                parent="Contact Emails"
            />
            <Container fluid={true}>
                {/* Statistics Cards */}
                <Row className="mb-4">
                    <Col xl={3} md={6}>
                        <Card className="bg-primary text-white">
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h4 className="mb-0">{stats.total}</h4>
                                        <p className="mb-0">Total Contacts</p>
                                    </div>
                                    <div className="align-self-center">
                                        <i className="icon-users" style={{fontSize: '2rem'}}></i>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl={3} md={6}>
                        <Card className="bg-warning text-white">
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h4 className="mb-0">{stats.favorites}</h4>
                                        <p className="mb-0">Favorites</p>
                                    </div>
                                    <div className="align-self-center">
                                        <i className="icon-star" style={{fontSize: '2rem'}}></i>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl={3} md={6}>
                        <Card className="bg-success text-white">
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h4 className="mb-0">{categories.length}</h4>
                                        <p className="mb-0">Categories</p>
                                    </div>
                                    <div className="align-self-center">
                                        <i className="icon-tag" style={{fontSize: '2rem'}}></i>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xl={3} md={6}>
                        <Card className="bg-info text-white">
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h4 className="mb-0">{stats.recentAdded}</h4>
                                        <p className="mb-0">Added This Week</p>
                                    </div>
                                    <div className="align-self-center">
                                        <i className="icon-plus" style={{fontSize: '2rem'}}></i>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Row className="mb-4">
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <h5>Quick Actions</h5>
                            </CardHeader>
                            <CardBody>
                                <div className="d-flex gap-2 flex-wrap">
                                    <Button 
                                        color="primary" 
                                        onClick={() => handleQuickAction('add')}
                                    >
                                        <i className="icon-plus"></i> Add New Contact
                                    </Button>
                                    <Button 
                                        color="success" 
                                        onClick={() => handleQuickAction('manage-categories')}
                                    >
                                        <i className="icon-tag"></i> Manage Categories
                                    </Button>
                                    <Button 
                                        color="outline-primary" 
                                        onClick={() => handleQuickAction('import')}
                                    >
                                        <i className="icon-download"></i> Import Contacts
                                    </Button>
                                    <Button 
                                        color="outline-success" 
                                        onClick={() => handleQuickAction('export')}
                                    >
                                        <i className="icon-upload"></i> Export Contacts
                                    </Button>
                                    <Button 
                                        color="outline-warning" 
                                        onClick={() => handleQuickAction('favorites')}
                                    >
                                        <i className="icon-star"></i> View Favorites
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Category Filter */}
                <Row className="mb-4">
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <h5>Filter by Category</h5>
                            </CardHeader>
                            <CardBody>
                                <div className="d-flex gap-2 flex-wrap">
                                    <Button 
                                        color={selectedCategory === 'all' ? 'primary' : 'outline-primary'}
                                        onClick={() => setSelectedCategory('all')}
                                    >
                                        All ({contacts.length})
                                    </Button>
                                    <Button 
                                        color={selectedCategory === 'favorites' ? 'warning' : 'outline-warning'}
                                        onClick={() => setSelectedCategory('favorites')}
                                    >
                                        Favorites ({stats.favorites})
                                    </Button>
                                    {categories.map(category => (
                                        <Button 
                                            key={category.id}
                                            color={selectedCategory === category.name ? category.color : `outline-${category.color}`}
                                            onClick={() => setSelectedCategory(category.name)}
                                        >
                                            {category.name} ({stats.categories[category.name] || 0})
                                        </Button>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    {/* Category Distribution */}
                    <Col xl={6}>
                        <Card>
                            <CardHeader>
                                <h5>Category Distribution</h5>
                            </CardHeader>
                            <CardBody>
                                {getTopCategories().map(([category, count]) => (
                                    <div key={category} className="mb-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>{category}</span>
                                            <span className="text-muted">{count}</span>
                                        </div>
                                        <Progress 
                                            value={(count / stats.total) * 100} 
                                            color={getCategoryColor(category)}
                                            className="mb-0"
                                        />
                                    </div>
                                ))}
                                {Object.keys(stats.categories).length === 0 && (
                                    <div className="text-center text-muted py-3">
                                        No contacts found
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Contacts by Category */}
                    <Col xl={6}>
                        <Card>
                            <CardHeader>
                                <h5>
                                    {selectedCategory === 'all' ? 'All Contacts' : 
                                     selectedCategory === 'favorites' ? 'Favorite Contacts' : 
                                     `Contacts in ${selectedCategory}`}
                                    <span className="text-muted ms-2">({getFilteredContacts().length})</span>
                                </h5>
                            </CardHeader>
                            <CardBody>
                                <div className="contacts-list">
                                    {getFilteredContacts()
                                        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
                                        .slice(0, 10)
                                        .map(contact => (
                                            <div key={contact.id} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                                                <div>
                                                    <div className="fw-bold">{contact.name}</div>
                                                    <small className="text-muted">{contact.email}</small>
                                                    {contact.notes && (
                                                        <div className="text-muted small mt-1">{contact.notes}</div>
                                                    )}
                                                </div>
                                                <div className="text-end">
                                                    <Badge color={getCategoryColor(contact.category)} className="mb-1">
                                                        {contact.category}
                                                    </Badge>
                                                    {contact.is_favorite && (
                                                        <i className="icon-star text-warning ms-1"></i>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    {getFilteredContacts().length === 0 && (
                                        <div className="text-center text-muted py-3">
                                            {selectedCategory === 'all' ? 'No contacts found' : 
                                             selectedCategory === 'favorites' ? 'No favorite contacts' : 
                                             `No contacts in ${selectedCategory}`}
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Add Contact Modal */}
            <Modal isOpen={showAddModal} toggle={() => setShowAddModal(false)} size="lg">
                <ModalHeader toggle={() => setShowAddModal(false)}>
                    Add New Contact
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="name">Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={addFormData.name}
                                        onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
                                        placeholder="Enter contact name"
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={addFormData.email}
                                        onChange={(e) => setAddFormData({...addFormData, email: e.target.value})}
                                        placeholder="Enter email address"
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="category">Category *</Label>
                                    <Input
                                        id="category"
                                        type="select"
                                        value={addFormData.category}
                                        onChange={(e) => setAddFormData({...addFormData, category: e.target.value})}
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.name}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="is_favorite">Favorite</Label>
                                    <div className="mt-2">
                                        <Input
                                            id="is_favorite"
                                            type="checkbox"
                                            checked={addFormData.is_favorite}
                                            onChange={(e) => setAddFormData({...addFormData, is_favorite: e.target.checked})}
                                        />
                                        <Label for="is_favorite" className="ms-2">Mark as favorite</Label>
                                    </div>
                                </FormGroup>
                            </Col>
                        </Row>
                        <FormGroup>
                            <Label for="notes">Notes</Label>
                            <Input
                                id="notes"
                                type="textarea"
                                rows={3}
                                value={addFormData.notes}
                                onChange={(e) => setAddFormData({...addFormData, notes: e.target.value})}
                                placeholder="Enter any additional notes"
                            />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowAddModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        color="primary" 
                        onClick={handleAddContact}
                        disabled={submitting}
                    >
                        {submitting ? 'Adding...' : 'Add Contact'}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Manage Categories Modal */}
            <Modal isOpen={showCategoryModal} toggle={() => setShowCategoryModal(false)} size="lg">
                <ModalHeader toggle={() => setShowCategoryModal(false)}>
                    Manage Categories
                </ModalHeader>
                <ModalBody>
                    <Row>
                        {/* Add New Category Form */}
                        <Col md={6}>
                            <Card>
                                <CardHeader>
                                    <h6>Add New Category</h6>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <FormGroup>
                                            <Label for="categoryName">Category Name *</Label>
                                            <Input
                                                id="categoryName"
                                                type="text"
                                                value={categoryFormData.name}
                                                onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                                                placeholder="Enter category name"
                                                required
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="categoryColor">Color</Label>
                                            <Input
                                                id="categoryColor"
                                                type="select"
                                                value={categoryFormData.color}
                                                onChange={(e) => setCategoryFormData({...categoryFormData, color: e.target.value})}
                                            >
                                                {categoryColors.map(color => (
                                                    <option key={color.value} value={color.value}>
                                                        {color.label}
                                                    </option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                        <FormGroup>
                                            <div className="d-flex align-items-center">
                                                <Input
                                                    id="isDefault"
                                                    type="checkbox"
                                                    checked={categoryFormData.is_default}
                                                    onChange={(e) => setCategoryFormData({...categoryFormData, is_default: e.target.checked})}
                                                />
                                                <Label for="isDefault" className="ms-2 mb-0">
                                                    Set as default category
                                                </Label>
                                            </div>
                                            <FormText>
                                                Default categories are shown first in the category list
                                            </FormText>
                                        </FormGroup>
                                        <Button 
                                            color="success" 
                                            onClick={handleAddCategory}
                                            disabled={categorySubmitting}
                                            className="w-100"
                                        >
                                            {categorySubmitting ? 'Creating...' : 'Create Category'}
                                        </Button>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>

                        {/* Existing Categories List */}
                        <Col md={6}>
                            <Card>
                                <CardHeader>
                                    <h6>Existing Categories</h6>
                                </CardHeader>
                                <CardBody>
                                    <div className="categories-list">
                                        {categories.map(category => (
                                            <div key={category.id} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                                                <div className="d-flex align-items-center">
                                                    <div 
                                                        className={`badge bg-${category.color} me-2`}
                                                        style={{width: '20px', height: '20px'}}
                                                    ></div>
                                                    <div>
                                                        <div className="fw-bold">{category.name}</div>
                                                        <small className="text-muted">
                                                            {stats.categories[category.name] || 0} contacts
                                                        </small>
                                                    </div>
                                                </div>
                                                <div>
                                                    {category.is_default && (
                                                        <Badge color="info" size="sm">Default</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {categories.length === 0 && (
                                            <div className="text-center text-muted py-3">
                                                No categories found
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowCategoryModal(false)}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default ContactEmailDashboard; 