import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Card, 
    CardBody, 
    CardHeader, 
    Button, 
    Form, 
    FormGroup, 
    Label, 
    Input, 
    Badge, 
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Alert,
    InputGroup,
    InputGroupText
} from 'reactstrap';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import Breadcrumbs from 'CommonElements/Breadcrumbs';
import { SettingsService } from 'utils/supabase/settingsService';
import { Setting, CreateSettingData, UpdateSettingData } from 'Types/SettingsType';

const Settings = () => {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState(false);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateSettingData>({
        key: '',
        title: '',
        value: '',
        type: 'string'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const settingTypes = [
        { value: 'string', label: 'String', icon: 'material-symbols:text-fields' },
        { value: 'number', label: 'Number', icon: 'material-symbols:123' },
        { value: 'boolean', label: 'Boolean', icon: 'material-symbols:toggle-on' },
        { value: 'date', label: 'Date', icon: 'material-symbols:calendar-today' },
        { value: 'timestampz', label: 'Timestamp', icon: 'material-symbols:schedule' },
        { value: 'json', label: 'JSON', icon: 'material-symbols:code' },
        { value: 'image', label: 'Image URL', icon: 'material-symbols:image' },
        { value: 'email', label: 'Email', icon: 'material-symbols:email' },
        { value: 'url', label: 'URL', icon: 'material-symbols:link' },
        { value: 'textarea', label: 'Text Area', icon: 'material-symbols:text-snippet' }
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await SettingsService.getSettings();
            setSettings(data);
        } catch (error) {
            toast.error('Failed to fetch settings');
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingKey) {
                // Update existing setting
                const updates: UpdateSettingData = {
                    title: formData.title,
                    value: formData.value,
                    type: formData.type
                };
                await SettingsService.updateSetting(editingKey, updates);
                toast.success('Setting updated successfully');
            } else {
                // Create new setting
                await SettingsService.createSetting(formData);
                toast.success('Setting created successfully');
            }
            
            setModal(false);
            resetForm();
            fetchSettings();
        } catch (error) {
            toast.error(editingKey ? 'Failed to update setting' : 'Failed to create setting');
            console.error('Error saving setting:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (setting: Setting) => {
        setEditingKey(setting.key);
        setFormData({
            key: setting.key,
            title: setting.title,
            value: setting.value,
            type: setting.type
        });
        setModal(true);
    };

    const handleDelete = async (key: string) => {
        if (window.confirm('Are you sure you want to delete this setting?')) {
            try {
                await SettingsService.deleteSetting(key);
                toast.success('Setting deleted successfully');
                fetchSettings();
            } catch (error) {
                toast.error('Failed to delete setting');
                console.error('Error deleting setting:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            key: '',
            title: '',
            value: '',
            type: 'string'
        });
        setEditingKey(null);
    };

    const toggleModal = () => {
        setModal(!modal);
        if (!modal) {
            resetForm();
        }
    };

    const renderValue = (setting: Setting) => {
        switch (setting.type) {
            case 'boolean':
                return (
                    <Badge color={setting.value === 'true' ? 'success' : 'danger'}>
                        {setting.value === 'true' ? 'True' : 'False'}
                    </Badge>
                );
            case 'timestampz':
                return setting.value ? (
                    <div className="d-flex align-items-center">
                        <Icon icon="material-symbols:schedule" className="me-2 text-primary" />
                        <div>
                            <div>{new Date(setting.value).toLocaleString()}</div>
                            <small className="text-muted">
                                {new Date(setting.value).toISOString()}
                            </small>
                        </div>
                    </div>
                ) : <span className="text-muted">No timestamp</span>;
            case 'json':
                return (
                    <code className="text-muted">
                        {setting.value.length > 50 ? setting.value.substring(0, 50) + '...' : setting.value}
                    </code>
                );
            case 'image':
                return setting.value ? (
                    <div className="d-flex align-items-center">
                        <img 
                            src={setting.value} 
                            alt="Setting" 
                            className="me-2" 
                            style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <span className="text-muted">{setting.value}</span>
                    </div>
                ) : <span className="text-muted">No image</span>;
            case 'url':
                return setting.value ? (
                    <a href={setting.value} target="_blank" rel="noopener noreferrer" className="text-primary">
                        {setting.value.length > 50 ? setting.value.substring(0, 50) + '...' : setting.value}
                    </a>
                ) : <span className="text-muted">No URL</span>;
            case 'email':
                return setting.value ? (
                    <a href={`mailto:${setting.value}`} className="text-primary">
                        {setting.value}
                    </a>
                ) : <span className="text-muted">No email</span>;
            case 'textarea':
                return (
                    <div className="text-muted">
                        {setting.value.length > 100 ? setting.value.substring(0, 100) + '...' : setting.value}
                    </div>
                );
            default:
                return setting.value || <span className="text-muted">No value</span>;
        }
    };

    const renderFormInput = () => {
        switch (formData.type) {
            case 'number':
                return (
                    <Input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="Enter number value"
                        required
                    />
                );
            case 'boolean':
                return (
                    <Input
                        type="select"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        required
                    >
                        <option value="">Select boolean value</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </Input>
                );
            case 'date':
                return (
                    <Input
                        type="date"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        required
                    />
                );
            case 'timestampz':
                return (
                    <div>
                        <Input
                            type="datetime-local"
                            value={formData.value ? new Date(formData.value).toISOString().slice(0, 16) : ''}
                            onChange={(e) => {
                                const isoString = e.target.value ? new Date(e.target.value).toISOString() : '';
                                setFormData({ ...formData, value: isoString });
                            }}
                            required
                        />
                        <small className="text-muted">
                            Will be stored as UTC timestamp
                        </small>
                    </div>
                );
            case 'json':
                return (
                    <Input
                        type="textarea"
                        rows={4}
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="Enter valid JSON"
                        required
                    />
                );
            case 'textarea':
                return (
                    <Input
                        type="textarea"
                        rows={4}
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="Enter text"
                        required
                    />
                );
            case 'email':
                return (
                    <Input
                        type="email"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="Enter email address"
                        required
                    />
                );
            case 'url':
                return (
                    <Input
                        type="url"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="Enter URL"
                        required
                    />
                );
            default:
                return (
                    <Input
                        type="text"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="Enter value"
                        required
                    />
                );
        }
    };

    const filteredSettings = settings.filter(setting => {
        const matchesSearch = setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             setting.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || setting.type === filterType;
        return matchesSearch && matchesType;
    });

    const getTypeIcon = (type: string) => {
        const typeObj = settingTypes.find(t => t.value === type);
        return typeObj ? typeObj.icon : 'material-symbols:settings';
    };

    const getTypeLabel = (type: string) => {
        const typeObj = settingTypes.find(t => t.value === type);
        return typeObj ? typeObj.label : type;
    };

    return (
        <div className="page-body">
            <Breadcrumbs 
                mainTitle="Settings" 
                parent="Admin" 
                title="Settings"
            />
            <Container fluid={true}>
                <Row>
                    <Col sm="12">
                        <Card>
                            <CardHeader className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Application Settings</h5>
                                <Button 
                                    color="primary" 
                                    onClick={toggleModal}
                                    className="d-flex align-items-center"
                                >
                                    <Icon icon="material-symbols:add" className="me-2" />
                                    Add Setting
                                </Button>
                            </CardHeader>
                            <CardBody>
                                {/* Search and Filter */}
                                <Row className="mb-3">
                                    <Col md="6">
                                        <InputGroup>
                                            <InputGroupText>
                                                <Icon icon="material-symbols:search" />
                                            </InputGroupText>
                                            <Input
                                                type="text"
                                                placeholder="Search settings..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col md="6">
                                        <Input
                                            type="select"
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                        >
                                            <option value="all">All Types</option>
                                            {settingTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </Input>
                                    </Col>
                                </Row>

                                {loading ? (
                                    <div className="text-center p-4">
                                        <Icon icon="material-symbols:loading" className="fs-2 text-primary" />
                                        <p className="mt-2">Loading settings...</p>
                                    </div>
                                ) : filteredSettings.length === 0 ? (
                                    <Alert color="info">
                                        <Icon icon="material-symbols:info" className="me-2" />
                                        No settings found. {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter.' : 'Click "Add Setting" to create your first setting.'}
                                    </Alert>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover>
                                            <thead>
                                                <tr>
                                                    <th>Key</th>
                                                    <th>Title</th>
                                                    <th>Type</th>
                                                    <th>Value</th>
                                                    <th>Updated</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredSettings.map((setting) => (
                                                    <tr key={setting.key}>
                                                        <td>
                                                            <code className="text-primary">{setting.key}</code>
                                                        </td>
                                                        <td>{setting.title}</td>
                                                        <td>
                                                            <Badge color="secondary" className="d-flex align-items-center w-fit">
                                                                <Icon icon={getTypeIcon(setting.type)} className="me-1" />
                                                                {getTypeLabel(setting.type)}
                                                            </Badge>
                                                        </td>
                                                        <td className="max-width-200">
                                                            {renderValue(setting)}
                                                        </td>
                                                        <td>
                                                            {new Date(setting.updated_at).toLocaleDateString()}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <Button
                                                                    color="warning"
                                                                    size="sm"
                                                                    onClick={() => handleEdit(setting)}
                                                                    className="d-flex align-items-center"
                                                                >
                                                                    <Icon icon="material-symbols:edit" />
                                                                </Button>
                                                                <Button
                                                                    color="danger"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(setting.key)}
                                                                    className="d-flex align-items-center"
                                                                >
                                                                    <Icon icon="material-symbols:delete" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Add/Edit Setting Modal */}
                <Modal isOpen={modal} toggle={toggleModal} size="lg">
                    <Form onSubmit={handleSubmit}>
                        <ModalHeader toggle={toggleModal}>
                            <Icon icon="material-symbols:settings" className="me-2" />
                            {editingKey ? 'Edit Setting' : 'Add New Setting'}
                        </ModalHeader>
                        <ModalBody>
                            <Row>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="key">Key *</Label>
                                        <Input
                                            id="key"
                                            type="text"
                                            value={formData.key}
                                            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                            placeholder="e.g., app_title, last_fetch_inbox"
                                            required
                                            disabled={!!editingKey}
                                        />
                                        <small className="text-muted">
                                            Unique identifier for this setting. Cannot be changed after creation.
                                        </small>
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="title">Title *</Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Human-readable title"
                                            required
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="type">Type *</Label>
                                        <Input
                                            id="type"
                                            type="select"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                            required
                                        >
                                            {settingTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <FormGroup>
                                        <Label for="value">Value *</Label>
                                        {renderFormInput()}
                                    </FormGroup>
                                </Col>
                            </Row>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={toggleModal}>
                                Cancel
                            </Button>
                            <Button 
                                color="primary" 
                                type="submit" 
                                disabled={saving}
                                className="d-flex align-items-center"
                            >
                                {saving && <Icon icon="material-symbols:loading" className="me-2" />}
                                {editingKey ? 'Update Setting' : 'Create Setting'}
                            </Button>
                        </ModalFooter>
                    </Form>
                </Modal>
            </Container>

            <style jsx>{`
                .max-width-200 {
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .w-fit {
                    width: fit-content;
                }
            `}</style>
        </div>
    );
};

export default Settings;
