import React, { useState } from 'react';
import { Table, Card, CardHeader, CardBody, Button, Badge, Input, Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { MoreVertical, Edit, Trash2, Eye, Download, Play, Pause, CheckCircle, Clock, Users, Star } from 'lucide-react';
import Image from 'next/image';
import { ImgPath } from 'utils/Constant';
import CourseForm from '../CourseForm';
import { LearningCourse, CourseCategory, CourseLevel, CourseStatus } from '@/types/learning';

interface LearningTableProps {
  onCourseSaved?: (course: LearningCourse) => void;
  onCourseDeleted?: (courseId: string) => void;
}

const LearningTable: React.FC<LearningTableProps> = ({ onCourseSaved, onCourseDeleted }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<LearningCourse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API call
  const courses: LearningCourse[] = [
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      description: 'Learn web development from scratch with this comprehensive bootcamp',
      instructor: {
        id: '1',
        name: 'Dr. Angela Yu',
        expertise: ['Web Development', 'React', 'Node.js']
      },
      category: 'Development',
      level: 'Beginner',
      duration: '44 hours',
      price: 89.99,
      status: 'Active',
      enrollment: 1250,
      maxEnrollment: 2000,
      rating: 4.8,
      totalRatings: 1250,
      completionRate: 78,
      lastUpdated: '2024-01-15',
      createdAt: '2024-01-01',
      thumbnail: `${ImgPath}/faq/1.jpg`,
      tags: ['HTML', 'CSS', 'JavaScript', 'React'],
      learningOutcomes: ['Build responsive websites', 'Master React framework'],
      language: 'English',
      sections: []
    },
    {
      id: '2',
      title: 'Python for Data Science',
      description: 'Master Python programming for data analysis and machine learning',
      instructor: {
        id: '2',
        name: 'Jose Portilla',
        expertise: ['Python', 'Data Science', 'Machine Learning']
      },
      category: 'Data Science',
      level: 'Intermediate',
      duration: '22 hours',
      price: 69.99,
      status: 'Active',
      enrollment: 890,
      maxEnrollment: 1500,
      rating: 4.6,
      totalRatings: 890,
      completionRate: 82,
      lastUpdated: '2024-01-10',
      createdAt: '2024-01-05',
      thumbnail: `${ImgPath}/faq/2.jpg`,
      tags: ['Python', 'Pandas', 'NumPy', 'Matplotlib'],
      learningOutcomes: ['Data manipulation with Pandas', 'Statistical analysis'],
      language: 'English',
      sections: []
    },
    {
      id: '3',
      title: 'UI/UX Design Fundamentals',
      description: 'Learn the principles of user interface and user experience design',
      instructor: {
        id: '3',
        name: 'Sarah Johnson',
        expertise: ['UI/UX Design', 'Figma', 'Prototyping']
      },
      category: 'Design',
      level: 'Beginner',
      duration: '18 hours',
      price: 49.99,
      status: 'Draft',
      enrollment: 0,
      maxEnrollment: 1000,
      rating: 0,
      totalRatings: 0,
      completionRate: 0,
      lastUpdated: '2024-01-12',
      createdAt: '2024-01-08',
      thumbnail: `${ImgPath}/faq/3.jpg`,
      tags: ['Figma', 'Adobe XD', 'Prototyping'],
      learningOutcomes: ['Design user interfaces', 'Create interactive prototypes'],
      language: 'English',
      sections: []
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Active: { color: 'success', icon: <CheckCircle size={14} /> },
      Draft: { color: 'warning', icon: <Clock size={14} /> },
      Archived: { color: 'secondary', icon: <Pause size={14} /> }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge color={config.color} className="d-flex align-items-center gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      Beginner: 'success',
      Intermediate: 'warning',
      Advanced: 'danger'
    };
    return <Badge color={levelConfig[level as keyof typeof levelConfig]}>{level}</Badge>;
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || course.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const aValue = a[sortBy as keyof LearningCourse];
    const bValue = b[sortBy as keyof LearningCourse];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowAddModal(true);
  };

  const handleEditCourse = (course: LearningCourse) => {
    setEditingCourse(course);
    setShowAddModal(true);
  };

  const handleSaveCourse = async (course: LearningCourse) => {
    try {
      setIsLoading(true);
      
      // Here you would typically call your API to save the course
      console.log('Saving course:', course);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close the modal
      setShowAddModal(false);
      setEditingCourse(null);
      
      // Call the callback to refresh the parent component
      if (onCourseSaved) {
        onCourseSaved(course);
      }
    } catch (error) {
      console.error('Error saving course:', error);
      // You could add error handling here (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowAddModal(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      setIsLoading(true);
      
      // Here you would typically call your API to delete the course
      console.log('Deleting course:', courseId);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call the callback to refresh the parent component
      if (onCourseDeleted) {
        onCourseDeleted(courseId);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      // You could add error handling here (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Learning Courses Management</h5>
          <Button color="primary" size="sm" onClick={handleAddCourse}>
            <Play size={16} className="me-2" />
            Add New Course
          </Button>
        </CardHeader>
        <CardBody>
          {/* Filters */}
          <Row className="mb-3">
            <Col md={4}>
              <Input
                type="text"
                placeholder="Search courses or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Input
                type="select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Data Science">Data Science</option>
                <option value="Business">Business</option>
              </Input>
            </Col>
            <Col md={2}>
              <Input
                type="select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </Input>
            </Col>
            <Col md={2}>
              <Input
                type="select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="title">Sort by Title</option>
                <option value="instructor">Sort by Instructor</option>
                <option value="enrollment">Sort by Enrollment</option>
                <option value="rating">Sort by Rating</option>
                <option value="lastUpdated">Sort by Date</option>
              </Input>
            </Col>
            <Col md={2}>
              <Button
                color="outline-secondary"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'} Order
              </Button>
            </Col>
          </Row>

          {/* Table */}
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Enrollment</th>
                  <th>Rating</th>
                  <th>Completion</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCourses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          width={50}
                          height={50}
                          className="rounded me-3"
                        />
                        <div>
                          <h6 className="mb-1">{course.title}</h6>
                          <div className="d-flex flex-wrap gap-1">
                            {course.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} color="light" className="text-dark">
                                {tag}
                              </Badge>
                            ))}
                            {course.tags.length > 2 && (
                              <Badge color="light" className="text-dark">
                                +{course.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar avatar-sm me-2">
                          <div className="avatar-title bg-primary rounded-circle">
                            {course.instructor.name.charAt(0)}
                          </div>
                        </div>
                        {course.instructor.name}
                      </div>
                    </td>
                    <td>{course.category}</td>
                    <td>{getLevelBadge(course.level)}</td>
                    <td>{course.duration}</td>
                    <td>
                      {course.price > 0 ? `$${course.price}` : 'Free'}
                    </td>
                    <td>{getStatusBadge(course.status)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Users size={14} className="me-1" />
                        {course.enrollment.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Star size={14} className="me-1 text-warning" />
                        {course.rating.toFixed(1)}
                      </div>
                    </td>
                    <td>
                      <div className="progress" style={{ width: '60px', height: '6px' }}>
                        <div
                          className="progress-bar"
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                      <small className="text-muted">{course.completionRate}%</small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(course.lastUpdated).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <Dropdown>
                        <DropdownToggle color="light" size="sm">
                          <MoreVertical size={16} />
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem>
                            <Eye size={14} className="me-2" />
                            View
                          </DropdownItem>
                          <DropdownItem onClick={() => handleEditCourse(course)}>
                            <Edit size={14} className="me-2" />
                            Edit
                          </DropdownItem>
                          <DropdownItem>
                            <Download size={14} className="me-2" />
                            Export
                          </DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem 
                            className="text-danger"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 size={14} className="me-2" />
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Summary Stats */}
          <Row className="mt-3">
            <Col md={3}>
              <div className="text-center p-3 bg-light rounded">
                <h4 className="mb-1">{courses.length}</h4>
                <small className="text-muted">Total Courses</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center p-3 bg-light rounded">
                <h4 className="mb-1">{courses.filter(c => c.status === 'Active').length}</h4>
                <small className="text-muted">Active Courses</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center p-3 bg-light rounded">
                <h4 className="mb-1">
                  {courses.reduce((sum, course) => sum + course.enrollment, 0).toLocaleString()}
                </h4>
                <small className="text-muted">Total Enrollments</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center p-3 bg-light rounded">
                <h4 className="mb-1">
                  {(courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)}
                </h4>
                <small className="text-muted">Avg Rating</small>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Add/Edit Course Modal */}
      <Modal isOpen={showAddModal} toggle={handleCancelForm} size="xl">
        <ModalHeader toggle={handleCancelForm}>
          {editingCourse ? 'Edit Course' : 'Create New Course'}
        </ModalHeader>
        <ModalBody>
          {isLoading && (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Saving course...</p>
            </div>
          )}
          {!isLoading && (
            <CourseForm
              course={editingCourse || undefined}
              onSave={handleSaveCourse}
              onCancel={handleCancelForm}
              isEdit={!!editingCourse}
            />
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

export default LearningTable;
