import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Plus, Download, Filter, Search } from 'lucide-react';
import Breadcrumbs from '../../../../../CommonElements/Breadcrumbs/index';
import LearningTable from '@/components/Learning/LearningTable';
import CourseForm from '@/components/Learning/CourseForm';
import { courseService, analyticsService } from '@/services/learningService';
import { LearningCourse, LearningFilters, SortOptions, LearningAnalytics } from '@/types/learning';

const CourseManagementPage = () => {
  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<LearningCourse | null>(null);
  const [filters, setFilters] = useState<LearningFilters>({});
  const [sort, setSort] = useState<SortOptions>({ field: 'created_at', order: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [filters, sort, currentPage]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [coursesRes, analyticsRes] = await Promise.all([
        courseService.getCourses(filters, sort, currentPage, 10),
        analyticsService.getAnalytics()
      ]);

      if (coursesRes.success) {
        setCourses(coursesRes.data);
        setTotalPages(coursesRes.pagination?.totalPages || 1);
      } else {
        setError(coursesRes.message || 'Failed to load courses');
      }

      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }
    } catch (error) {
      setError('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEditCourse = (course: LearningCourse) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleSaveCourse = async (course: LearningCourse) => {
    try {
      await loadData(); // Refresh the data
      setShowForm(false);
      setEditingCourse(null);
    } catch (error) {
      setError('Failed to refresh course data');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const result = await courseService.deleteCourse(courseId);
      if (result.success) {
        await loadData(); // Refresh the data
      } else {
        setError(result.message || 'Failed to delete course');
      }
    } catch (error) {
      setError('An error occurred while deleting the course');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCourses.length === 0) {
      setError('Please select courses to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedCourses.length} courses?`)) return;

    try {
      const result = await courseService.bulkDeleteCourses(selectedCourses);
      if (result.success) {
        setSelectedCourses([]);
        await loadData(); // Refresh the data
      } else {
        setError(result.message || 'Failed to delete courses');
      }
    } catch (error) {
      setError('An error occurred while deleting courses');
    }
  };

  const handleExportCourses = () => {
    // Implementation for exporting courses to CSV/Excel
    const csvContent = generateCSV(courses);
    downloadCSV(csvContent, 'courses-export.csv');
  };

  const generateCSV = (data: LearningCourse[]): string => {
    const headers = [
      'Title',
      'Instructor',
      'Category',
      'Level',
      'Price',
      'Status',
      'Enrollment',
      'Rating',
      'Created At'
    ];

    const rows = data.map(course => [
      course.title,
      course.instructor.name,
      course.category,
      course.level,
      course.price,
      course.status,
      course.enrollment,
      course.rating,
      new Date(course.createdAt).toLocaleDateString()
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFilterChange = (newFilters: LearningFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (newSort: SortOptions) => {
    setSort(newSort);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCourseSelection = (courseId: string, selected: boolean) => {
    if (selected) {
      setSelectedCourses(prev => [...prev, courseId]);
    } else {
      setSelectedCourses(prev => prev.filter(id => id !== courseId));
    }
  };

  const handleBulkSelection = (selected: boolean) => {
    if (selected) {
      setSelectedCourses(courses.map(course => course.id));
    } else {
      setSelectedCourses([]);
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className='page-body'>
        <Breadcrumbs 
          title='Course Management' 
          mainTitle='Course Management' 
          parent='Learning' 
        />
        <Container fluid={true}>
          <div className="text-center py-5">
            <Spinner size="lg" />
            <p className="mt-3">Loading courses...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className='page-body'>
      <Breadcrumbs 
        title='Course Management' 
        mainTitle='Course Management' 
        parent='Learning' 
      />
      
      <Container fluid={true}>
        {error && (
          <Alert color="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Header Actions */}
        <Row className="mb-3">
          <Col md={6}>
            <h4>Course Management</h4>
            {analytics && (
              <small className="text-muted">
                {analytics.totalCourses} total courses • {analytics.activeCourses} active • {analytics.totalEnrollments} enrollments
              </small>
            )}
          </Col>
          <Col md={6} className="text-end">
            <Button 
              color="outline-secondary" 
              size="sm" 
              onClick={handleExportCourses}
              className="me-2"
              disabled={courses.length === 0}
            >
              <Download size={16} className="me-1" />
              Export
            </Button>
            {selectedCourses.length > 0 && (
              <Button 
                color="danger" 
                size="sm" 
                onClick={handleBulkDelete}
                className="me-2"
              >
                Delete Selected ({selectedCourses.length})
              </Button>
            )}
            <Button 
              color="primary" 
              onClick={handleCreateCourse}
            >
              <Plus size={16} className="me-1" />
              Create Course
            </Button>
          </Col>
        </Row>

        {/* Learning Table */}
        <LearningTable />

        {/* Course Form Modal */}
        <Modal isOpen={showForm} toggle={handleCancelForm} size="xl">
          <ModalHeader toggle={handleCancelForm}>
            {editingCourse ? 'Edit Course' : 'Create New Course'}
          </ModalHeader>
          <ModalBody>
            <CourseForm
              course={editingCourse || undefined}
              onSave={handleSaveCourse}
              onCancel={handleCancelForm}
              isEdit={!!editingCourse}
            />
          </ModalBody>
        </Modal>
      </Container>
    </div>
  );
};

export default CourseManagementPage;
