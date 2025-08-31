import React, { useState } from 'react';
import Breadcrumbs from '../../../../CommonElements/Breadcrumbs/index';
import LearningTable from '@/components/Learning/LearningTable';
import { Container, Alert } from 'reactstrap';
import { LearningCourse } from '@/types/learning';

const LearningTablePage = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCourseSaved = (course: LearningCourse) => {
    setMessage({
      type: 'success',
      text: `Course "${course.title}" has been ${course.id ? 'updated' : 'created'} successfully!`
    });
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
    
    // In a real application, you would refresh the courses data here
    // For example: refreshCourses();
  };

  const handleCourseDeleted = (courseId: string) => {
    setMessage({
      type: 'success',
      text: 'Course has been deleted successfully!'
    });
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
    
    // In a real application, you would refresh the courses data here
    // For example: refreshCourses();
  };

  return (
    <div className='page-body'>
      <Breadcrumbs 
        title='Learning Management' 
        mainTitle='Learning Management' 
        parent='Learning' 
      />
      <Container fluid={true}>
        {message && (
          <Alert 
            color={message.type === 'success' ? 'success' : 'danger'} 
            className="mb-3"
            toggle={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}
        
        <LearningTable 
          onCourseSaved={handleCourseSaved}
          onCourseDeleted={handleCourseDeleted}
        />
      </Container>
    </div>
  );
};

export default LearningTablePage;
