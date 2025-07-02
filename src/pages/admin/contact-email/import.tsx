import Breadcrumbs from "CommonElements/Breadcrumbs";
import React, { useState } from "react";
import { Col, Container, Row, Card, CardBody, CardHeader, Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import { ActivityService } from "utils/supabase/activityService";
import { CreateContactEmailData } from "Types/ActivityType";
import { toast } from "react-toastify";

const ImportContactsPage = () => {
    const [importData, setImportData] = useState('');
    const [category, setCategory] = useState('General');
    const [isImporting, setIsImporting] = useState(false);
    const [importResults, setImportResults] = useState<{
        success: number;
        failed: number;
        errors: string[];
    }>({ success: 0, failed: 0, errors: [] });

    const handleImport = async () => {
        if (!importData.trim()) {
            toast.error('Please enter contact data to import');
            return;
        }

        setIsImporting(true);
        const lines = importData.trim().split('\n');
        const results = { success: 0, failed: 0, errors: [] as string[] };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            try {
                // Parse CSV format: name,email,notes
                const parts = line.split(',').map(part => part.trim());
                if (parts.length < 2) {
                    results.failed++;
                    results.errors.push(`Line ${i + 1}: Invalid format. Expected: name,email,notes`);
                    continue;
                }

                const [name, email, notes] = parts;
                
                // Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    results.failed++;
                    results.errors.push(`Line ${i + 1}: Invalid email format: ${email}`);
                    continue;
                }

                const contactData: CreateContactEmailData = {
                    name,
                    email,
                    category,
                    notes: notes || '',
                    is_favorite: false
                };

                await ActivityService.createContactEmail(contactData);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Line ${i + 1}: ${error.message}`);
            }
        }

        setImportResults(results);
        setIsImporting(false);

        if (results.success > 0) {
            toast.success(`Successfully imported ${results.success} contacts`);
        }
        if (results.failed > 0) {
            toast.error(`Failed to import ${results.failed} contacts`);
        }
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setImportData(content);
        };
        reader.readAsText(file);
    };

    const categories = ['General', 'Work', 'Personal', 'Family', 'Friends', 'Business'];

    return (
        <div className="page-body">
            <Breadcrumbs
                title="Import Contacts"
                mainTitle="Import Contacts"
                parent="Contact Emails"
            />
            <Container fluid={true}>
                <Row>
                    <Col xl={12}>
                        <Card>
                            <CardHeader>
                                <h5>Import Email Contacts</h5>
                            </CardHeader>
                            <CardBody>
                                <Alert color="info">
                                    <h6>Import Format:</h6>
                                    <p className="mb-0">
                                        Enter contacts in CSV format: <code>name,email,notes</code><br />
                                        Example: <code>John Doe,john@example.com,Project manager</code>
                                    </p>
                                </Alert>

                                <Form>
                                    <FormGroup>
                                        <Label>Category</Label>
                                        <Input
                                            type="select"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </Input>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label>Import from File (CSV)</Label>
                                        <Input
                                            type="file"
                                            accept=".csv,.txt"
                                            onChange={handleFileImport}
                                        />
                                        <small className="text-muted">
                                            Upload a CSV file with name,email,notes columns
                                        </small>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label>Or Paste Contact Data</Label>
                                        <Input
                                            type="textarea"
                                            rows={10}
                                            value={importData}
                                            onChange={(e) => setImportData(e.target.value)}
                                            placeholder="John Doe,john@example.com,Project manager&#10;Jane Smith,jane@example.com,Developer&#10;Bob Wilson,bob@company.com,Manager"
                                        />
                                    </FormGroup>

                                    <Button 
                                        color="primary" 
                                        onClick={handleImport}
                                        disabled={isImporting || !importData.trim()}
                                    >
                                        {isImporting ? 'Importing...' : 'Import Contacts'}
                                    </Button>
                                </Form>

                                {importResults.success > 0 || importResults.failed > 0 ? (
                                    <div className="mt-4">
                                        <h6>Import Results:</h6>
                                        <Alert color={importResults.failed > 0 ? 'warning' : 'success'}>
                                            <strong>Success:</strong> {importResults.success} contacts imported<br />
                                            <strong>Failed:</strong> {importResults.failed} contacts failed
                                        </Alert>
                                        
                                        {importResults.errors.length > 0 && (
                                            <div className="mt-3">
                                                <h6>Errors:</h6>
                                                <div className="border rounded p-3" style={{maxHeight: '200px', overflowY: 'auto'}}>
                                                    {importResults.errors.map((error, index) => (
                                                        <div key={index} className="text-danger small mb-1">
                                                            {error}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ImportContactsPage; 