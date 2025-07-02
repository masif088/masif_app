import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, { useState, useEffect } from "react";
import { Col, Container, Row, Card, CardBody, CardHeader, Button, Form, FormGroup, Label, Input, Badge } from "reactstrap";
import { ActivityService } from "utils/supabase/activityService";
import { ContactEmail } from "Types/ActivityType";
import { toast } from "react-toastify";

const ExportContactsPage = () => {
    const [contacts, setContacts] = useState<ContactEmail[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [exportFormat, setExportFormat] = useState('csv');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const data = await ActivityService.getContactEmails();
            setContacts(data);
            
            // Extract unique categories
            const uniqueCategories = Array.from(new Set(data.map(contact => contact.category)));
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = contacts.filter(contact => 
        selectedCategory === 'all' || contact.category === selectedCategory
    );

    const handleSelectAll = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(filteredContacts.map(contact => contact.id!));
        }
    };

    const handleSelectContact = (contactId: number) => {
        setSelectedContacts(prev => 
            prev.includes(contactId) 
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const exportToCSV = () => {
        const selectedData = contacts.filter(contact => selectedContacts.includes(contact.id!));
        const headers = ['Name', 'Email', 'Category', 'Notes', 'Favorite', 'Created At'];
        const csvContent = [
            headers.join(','),
            ...selectedData.map(contact => [
                `"${contact.name}"`,
                `"${contact.email}"`,
                `"${contact.category}"`,
                `"${contact.notes || ''}"`,
                contact.is_favorite ? 'Yes' : 'No',
                contact.created_at || ''
            ].join(','))
        ].join('\n');

        downloadFile(csvContent, 'contacts.csv', 'text/csv');
    };

    const exportToJSON = () => {
        const selectedData = contacts.filter(contact => selectedContacts.includes(contact.id!));
        const jsonContent = JSON.stringify(selectedData, null, 2);
        downloadFile(jsonContent, 'contacts.json', 'application/json');
    };

    const exportToVCF = () => {
        const selectedData = contacts.filter(contact => selectedContacts.includes(contact.id!));
        const vcfContent = selectedData.map(contact => 
            `BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
EMAIL:${contact.email}
NOTE:${contact.notes || ''}
CATEGORIES:${contact.category}
END:VCARD`
        ).join('\n\n');

        downloadFile(vcfContent, 'contacts.vcf', 'text/vcard');
    };

    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success(`Exported ${selectedContacts.length} contacts to ${filename}`);
    };

    const handleExport = () => {
        if (selectedContacts.length === 0) {
            toast.error('Please select contacts to export');
            return;
        }

        switch (exportFormat) {
            case 'csv':
                exportToCSV();
                break;
            case 'json':
                exportToJSON();
                break;
            case 'vcf':
                exportToVCF();
                break;
            default:
                toast.error('Invalid export format');
        }
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
                title="Export Contacts"
                mainTitle="Export Contacts"
                parent="Contact Emails"
            />
            <Container fluid={true}>
                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5>Export Email Contacts</h5>
                                    <div className="d-flex gap-2">
                                        <Button 
                                            color="outline-primary" 
                                            size="sm"
                                            onClick={handleSelectAll}
                                        >
                                            {selectedContacts.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
                                        </Button>
                                        <Button 
                                            color="primary" 
                                            size="sm"
                                            onClick={handleExport}
                                            disabled={selectedContacts.length === 0}
                                        >
                                            Export Selected ({selectedContacts.length})
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <Row className="mb-4">
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label>Filter by Category</Label>
                                            <Input
                                                type="select"
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            >
                                                <option value="all">All Categories</option>
                                                {categories.map(category => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label>Export Format</Label>
                                            <Input
                                                type="select"
                                                value={exportFormat}
                                                onChange={(e) => setExportFormat(e.target.value)}
                                            >
                                                <option value="csv">CSV</option>
                                                <option value="json">JSON</option>
                                                <option value="vcf">VCF (vCard)</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <Input
                                                        type="checkbox"
                                                        checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                                                        onChange={handleSelectAll}
                                                    />
                                                </th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Category</th>
                                                <th>Notes</th>
                                                <th>Favorite</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredContacts.map(contact => (
                                                <tr key={contact.id}>
                                                    <td>
                                                        <Input
                                                            type="checkbox"
                                                            checked={selectedContacts.includes(contact.id!)}
                                                            onChange={() => handleSelectContact(contact.id!)}
                                                        />
                                                    </td>
                                                    <td>{contact.name}</td>
                                                    <td>{contact.email}</td>
                                                    <td>
                                                        <Badge color="info">{contact.category}</Badge>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted">
                                                            {contact.notes ? (contact.notes.length > 50 ? contact.notes.substring(0, 50) + '...' : contact.notes) : '-'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {contact.is_favorite ? (
                                                            <i className="icon-star text-warning"></i>
                                                        ) : (
                                                            <i className="icon-star-o text-muted"></i>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {filteredContacts.length === 0 && (
                                    <div className="text-center text-muted py-4">
                                        No contacts found in the selected category.
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ExportContactsPage; 