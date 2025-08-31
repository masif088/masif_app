import React, { useState, useEffect } from 'react';
import { 
  Form, 
  FormGroup, 
  Label, 
  Input, 
  Button, 
  Card, 
  CardHeader, 
  CardBody, 
  Row, 
  Col, 
  Badge,
  Alert,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import { X, Plus, Upload, Save, Eye, Edit } from 'lucide-react';
import { courseService, categoryService, instructorService } from '@/services/learningService';
import { 
  LearningCourse, 
  CreateCourseForm, 
  UpdateCourseForm, 
  CourseCategory,
  CourseLevel,
  CourseStatus 
} from '@/types/learning';

interface CourseFormProps {
  course?: LearningCourse;
  onSave: (course: LearningCourse) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({ 
  course, 
  onSave, 
  onCancel, 
  isEdit = false 
}) => {
  const [formData, setFormData] = useState<CreateCourseForm>({
    title: '',
    description: '',
    category: 'Development' as CourseCategory,
    level: 'Beginner' as CourseLevel,
    price: 0,
    language: 'English',
    tags: [],
    prerequisites: [],
    learningOutcomes: [],
    certificate: false,
    thumbnail: null
  });

  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newOutcome, setNewOutcome] = useState('');

  // Load initial data
  useEffect(() => {
    loadInitialData();
    if (course && isEdit) {
      setFormData({
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        price: course.price,
        language: course.language,
        tags: course.tags || [],
        prerequisites: course.prerequisites || [],
        learningOutcomes: course.learningOutcomes || [],
        certificate: course.certificate || false,
        thumbnail: null
      });
    }
  }, [course, isEdit]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, instructorsRes] = await Promise.all([
        categoryService.getCategories(),
        instructorService.getInstructors()
      ]);
      
      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
      
      if (instructorsRes.success) {
        setInstructors(instructorsRes.data);
      }
    } catch (error) {
      console.log(error);
      setError('Failed to load initial data');
    }
  };

  const handleInputChange = (field: keyof CreateCourseForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleInputChange('thumbnail', file);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.prerequisites.includes(newPrerequisite.trim())) {
      handleInputChange('prerequisites', [...formData.prerequisites, newPrerequisite.trim()]);
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (prerequisiteToRemove: string) => {
    handleInputChange('prerequisites', formData.prerequisites.filter(prereq => prereq !== prerequisiteToRemove));
  };

  const addOutcome = () => {
    if (newOutcome.trim() && !formData.learningOutcomes.includes(newOutcome.trim())) {
      handleInputChange('learningOutcomes', [...formData.learningOutcomes, newOutcome.trim()]);
      setNewOutcome('');
    }
  };

  const removeOutcome = (outcomeToRemove: string) => {
    handleInputChange('learningOutcomes', formData.learningOutcomes.filter(outcome => outcome !== outcomeToRemove));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Course title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Course description is required');
      return false;
    }
    if (formData.price < 0) {
      setError('Price cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let result;
      
      if (isEdit && course) {
        const updateData: UpdateCourseForm = {
          id: course.id,
          ...formData
        };
        result = await courseService.updateCourse(course.id, updateData);
      } else {
        result = await courseService.createCourse(formData);
      }

      if (result.success) {
        setSuccess(isEdit ? 'Course updated successfully!' : 'Course created successfully!');
        onSave(result.data);
      } else {
        setError(result.message || 'Operation failed');
      }
    } catch (error) {
      setError('An error occurred while saving the course');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {isEdit ? 'Edit Course' : 'Create New Course'}
          </h5>
          <div>
            <Button 
              color="outline-secondary" 
              size="sm" 
              onClick={handlePreview}
              className="me-2"
            >
              <Eye size={16} className="me-1" />
              Preview
            </Button>
            <Button 
              color="outline-danger" 
              size="sm" 
              onClick={onCancel}
            >
              <X size={16} className="me-1" />
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {error && <Alert color="danger">{error}</Alert>}
          {success && <Alert color="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Basic Information */}
              <Col md={8}>
                <FormGroup>
                  <Label for="title">Course Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter course title"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="description">Course Description *</Label>
                  <Input
                    id="description"
                    type="textarea"
                    rows={6}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what students will learn in this course"
                    required
                  />
                </FormGroup>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="category">Category *</Label>
                      <Input
                        id="category"
                        type="select"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        required
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="level">Level *</Label>
                      <Input
                        id="level"
                        type="select"
                        value={formData.level}
                        onChange={(e) => handleInputChange('level', e.target.value)}
                        required
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="All Levels">All Levels</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="price">Price (USD) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="language">Language *</Label>
                      <Input
                        id="language"
                        type="text"
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        placeholder="English"
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Col>

              {/* Sidebar */}
              <Col md={4}>
                {/* Thumbnail Upload */}
                <FormGroup>
                  <Label for="thumbnail">Course Thumbnail</Label>
                  <div className="border rounded p-3 text-center">
                    {formData.thumbnail ? (
                      <div>
                        <img 
                          src={URL.createObjectURL(formData.thumbnail)} 
                          alt="Preview" 
                          className="img-fluid mb-2"
                          style={{ maxHeight: '150px' }}
                        />
                        <Button 
                          color="danger" 
                          size="sm" 
                          onClick={() => handleInputChange('thumbnail', null)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={48} className="text-muted mb-2" />
                        <Input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        <small className="text-muted">
                          Recommended: 1280x720px, max 2MB
                        </small>
                      </div>
                    )}
                  </div>
                </FormGroup>

                {/* Certificate Option */}
                <FormGroup check>
                  <Input
                    id="certificate"
                    type="checkbox"
                    checked={formData.certificate}
                    onChange={(e) => handleInputChange('certificate', e.target.checked)}
                  />
                  <Label for="certificate" check>
                    Certificate Available
                  </Label>
                </FormGroup>
              </Col>
            </Row>

            {/* Tags */}
            <FormGroup>
              <Label>Course Tags</Label>
              <div className="d-flex gap-2 mb-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button color="primary" size="sm" onClick={addTag}>
                  <Plus size={16} />
                </Button>
              </div>
              <div className="d-flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} color="primary" className="d-flex align-items-center gap-1">
                    {tag}
                    <X 
                      size={12} 
                      className="cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </FormGroup>

            {/* Prerequisites */}
            <FormGroup>
              <Label>Prerequisites</Label>
              <div className="d-flex gap-2 mb-2">
                <Input
                  type="text"
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="Add a prerequisite"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                />
                <Button color="primary" size="sm" onClick={addPrerequisite}>
                  <Plus size={16} />
                </Button>
              </div>
              <ul className="list-unstyled">
                {formData.prerequisites.map((prereq, index) => (
                  <li key={index} className="d-flex align-items-center gap-2 mb-1">
                    <span>• {prereq}</span>
                    <X 
                      size={14} 
                      className="text-danger cursor-pointer" 
                      onClick={() => removePrerequisite(prereq)}
                    />
                  </li>
                ))}
              </ul>
            </FormGroup>

            {/* Learning Outcomes */}
            <FormGroup>
              <Label>Learning Outcomes</Label>
              <div className="d-flex gap-2 mb-2">
                <Input
                  type="text"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  placeholder="Add a learning outcome"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                />
                <Button color="primary" size="sm" onClick={addOutcome}>
                  <Plus size={16} />
                </Button>
              </div>
              <ul className="list-unstyled">
                {formData.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="d-flex align-items-center gap-2 mb-1">
                    <span>• {outcome}</span>
                    <X 
                      size={14} 
                      className="text-danger cursor-pointer" 
                      onClick={() => removeOutcome(outcome)}
                    />
                  </li>
                ))}
              </ul>
            </FormGroup>

            {/* Submit Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <Button 
                color="secondary" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                color="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-2" />
                    {isEdit ? 'Update Course' : 'Create Course'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} toggle={() => setShowPreview(false)} size="lg">
        <ModalHeader toggle={() => setShowPreview(false)}>
          Course Preview
        </ModalHeader>
        <ModalBody>
          <div className="course-preview">
            <h3>{formData.title || 'Course Title'}</h3>
            <div className="mb-3">
              <Badge color="primary" className="me-2">{formData.category}</Badge>
              <Badge color="secondary" className="me-2">{formData.level}</Badge>
              <Badge color="info">${formData.price}</Badge>
            </div>
            <p>{formData.description || 'Course description will appear here.'}</p>
            
            {formData.tags.length > 0 && (
              <div className="mb-3">
                <strong>Tags:</strong>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} color="light" className="text-dark">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.prerequisites.length > 0 && (
              <div className="mb-3">
                <strong>Prerequisites:</strong>
                <ul className="mt-1">
                  {formData.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            {formData.learningOutcomes.length > 0 && (
              <div className="mb-3">
                <strong>Learning Outcomes:</strong>
                <ul className="mt-1">
                  {formData.learningOutcomes.map((outcome, index) => (
                    <li key={index}>{outcome}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CourseForm;
