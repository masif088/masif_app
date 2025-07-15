import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Badge, Row, Col } from 'reactstrap';
import { ActivityService } from 'utils/supabase/activityService';
import { ContactEmail, CreateContactEmailData } from 'Types/ActivityType';
import { toast } from 'react-toastify';

interface ContactEmailManagerProps {
    onSelectContact: (email: string) => void;
    selectedEmails?: string[];
}

const ContactEmailManager: React.FC<ContactEmailManagerProps> = ({ onSelectContact, selectedEmails = [] }) => {
    const [contacts, setContacts] = useState<ContactEmail[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingContact, setEditingContact] = useState<ContactEmail | null>(null);
    const [newContact, setNewContact] = useState<CreateContactEmailData>({
        name: '',
        email: '',
        category: 'General',
        notes: '',
        is_favorite: false
    });

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const data = await ActivityService.getContactEmails();
            setContacts(data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contacts');
        }
    };

    const handleAddContact = async () => {
        try {
            await ActivityService.createContactEmail(newContact);
            setShowAddModal(false);
            setNewContact({
                name: '',
                email: '',
                category: 'General',
                notes: '',
                is_favorite: false
            });
            fetchContacts();
            toast.success('Contact added successfully');
        } catch (error) {
            console.error('Error adding contact:', error);
            toast.error('Failed to add contact');
        }
    };

    const handleEditContact = async () => {
        if (!editingContact) return;
        
        try {
            await ActivityService.updateContactEmail(editingContact.id!, {
                name: editingContact.name,
                email: editingContact.email,
                category: editingContact.category,
                notes: editingContact.notes,
                is_favorite: editingContact.is_favorite
            });
            setShowEditModal(false);
            setEditingContact(null);
            fetchContacts();
            toast.success('Contact updated successfully');
        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('Failed to update contact');
        }
    };

    const handleDeleteContact = async (id: number) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        
        try {
            await ActivityService.deleteContactEmail(id);
            fetchContacts();
            toast.success('Contact deleted successfully');
        } catch (error) {
            console.error('Error deleting contact:', error);
            toast.error('Failed to delete contact');
        }
    };

    const handleToggleFavorite = async (contact: ContactEmail) => {
        try {
            await ActivityService.toggleFavorite(contact.id!, !contact.is_favorite);
            fetchContacts();
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error('Failed to update favorite status');
        }
    };

    const handleSelectContact = (email: string) => {
        onSelectContact(email);
    };

    const isEmailSelected = (email: string) => selectedEmails.includes(email);

    const categories = ['General', 'Work', 'Personal', 'Family', 'Friends', 'Business'];

    return (
        <div>
            <Card>
                <CardHeader className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Email Contacts</h5>
                    <Button color="primary" size="sm" onClick={() => setShowAddModal(true)}>
                        <i className="icon-plus"></i> Add Contact
                    </Button>
                </CardHeader>
                <CardBody>
                    <div className="contact-list">
                        {contacts.length === 0 ? (
                            <div className="text-center text-muted py-3">
                                No contacts yet. Add your first contact above.
                            </div>
                        ) : (
                            contacts.map((contact) => (
                                <div key={contact.id} className="contact-item border-bottom py-2">
                                    <Row className="align-items-center">
                                        <Col md={4}>
                                            <div className="d-flex align-items-center">
                                                <Button
                                                    color="link"
                                                    className="p-0 me-2"
                                                    onClick={() => handleToggleFavorite(contact)}
                                                >
                                                    <i className={`icon-star ${contact.is_favorite ? 'text-warning' : 'text-muted'}`}></i>
                                                </Button>
                                                <div>
                                                    <strong>{contact.name}</strong>
                                                    <br />
                                                    <small className="text-muted">{contact.email}</small>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={3}>
                                            <Badge color="info">{contact.category}</Badge>
                                        </Col>
                                       
                                        <Col md={2}>
                                            <div className="d-flex gap-1">
                                                <Button
                                                    color={isEmailSelected(contact.email) ? 'success' : 'outline-primary'}
                                                    size="sm"
                                                    onClick={() => handleSelectContact(contact.email)}
                                                >
                                                    <i className="icon-check"></i>
                                                </Button>
                                                <Button
                                                    color="outline-warning"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingContact(contact);
                                                        setShowEditModal(true);
                                                    }}
                                                >
                                                    <i className="icon-pencil"></i>
                                                </Button>
                                                <Button
                                                    color="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteContact(contact.id!)}
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

            {/* Add Contact Modal */}
            <Modal isOpen={showAddModal} toggle={() => setShowAddModal(false)}>
                <ModalHeader toggle={() => setShowAddModal(false)}>Add New Contact</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label>Name</Label>
                            <Input
                                type="text"
                                value={newContact.name}
                                onChange={(e) => setNewContact(prev => ({...prev, name: e.target.value}))}
                                placeholder="Contact name"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={newContact.email}
                                onChange={(e) => setNewContact(prev => ({...prev, email: e.target.value}))}
                                placeholder="contact@example.com"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Category</Label>
                            <Input
                                type="select"
                                value={newContact.category}
                                onChange={(e) => setNewContact(prev => ({...prev, category: e.target.value}))}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label>Notes</Label>
                            <Input
                                type="textarea"
                                value={newContact.notes}
                                onChange={(e) => setNewContact(prev => ({...prev, notes: e.target.value}))}
                                placeholder="Optional notes"
                            />
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input
                                    type="checkbox"
                                    checked={newContact.is_favorite}
                                    onChange={(e) => setNewContact(prev => ({...prev, is_favorite: e.target.checked}))}
                                />
                                Mark as favorite
                            </Label>
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button color="primary" onClick={handleAddContact}>Add Contact</Button>
                </ModalFooter>
            </Modal>

            {/* Edit Contact Modal */}
            <Modal isOpen={showEditModal} toggle={() => setShowEditModal(false)}>
                <ModalHeader toggle={() => setShowEditModal(false)}>Edit Contact</ModalHeader>
                <ModalBody>
                    {editingContact && (
                        <Form>
                            <FormGroup>
                                <Label>Name</Label>
                                <Input
                                    type="text"
                                    value={editingContact.name}
                                    onChange={(e) => setEditingContact(prev => prev ? {...prev, name: e.target.value} : null)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={editingContact.email}
                                    onChange={(e) => setEditingContact(prev => prev ? {...prev, email: e.target.value} : null)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Category</Label>
                                <Input
                                    type="select"
                                    value={editingContact.category}
                                    onChange={(e) => setEditingContact(prev => prev ? {...prev, category: e.target.value} : null)}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label>Notes</Label>
                                <Input
                                    type="textarea"
                                    value={editingContact.notes || ''}
                                    onChange={(e) => setEditingContact(prev => prev ? {...prev, notes: e.target.value} : null)}
                                />
                            </FormGroup>
                            <FormGroup check>
                                <Label check>
                                    <Input
                                        type="checkbox"
                                        checked={editingContact.is_favorite}
                                        onChange={(e) => setEditingContact(prev => prev ? {...prev, is_favorite: e.target.checked} : null)}
                                    />
                                    Mark as favorite
                                </Label>
                            </FormGroup>
                        </Form>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button color="primary" onClick={handleEditContact}>Save Changes</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default ContactEmailManager; 