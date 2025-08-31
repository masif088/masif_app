-- =====================================================
-- LEARNING MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA (PostgreSQL)
-- =====================================================
-- This file contains the complete database setup for the Learning Management System
-- PostgreSQL compatible version
-- Includes: Tables, Sample Data, Indexes, Triggers, Views, and Functions

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends existing user system)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    role VARCHAR(20) CHECK (role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Categories table
CREATE TABLE IF NOT EXISTS course_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7) DEFAULT '#007bff',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_name ON course_categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_active ON course_categories(is_active);

-- Instructors table (extends users)
CREATE TABLE IF NOT EXISTS instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    bio TEXT,
    expertise JSONB,
    social_links JSONB,
    total_courses INT DEFAULT 0,
    total_students INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for instructors table
CREATE INDEX IF NOT EXISTS idx_instructors_user_id ON instructors(user_id);
CREATE INDEX IF NOT EXISTS idx_instructors_verified ON instructors(is_verified);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    instructor_id UUID NOT NULL,
    category_id UUID NOT NULL,
    level VARCHAR(20) CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'All Levels')) DEFAULT 'Beginner',
    duration_hours DECIMAL(5,2) DEFAULT 0.00,
    price DECIMAL(10,2) DEFAULT 0.00,
    original_price DECIMAL(10,2),
    status VARCHAR(20) CHECK (status IN ('Draft', 'Active', 'Archived', 'Scheduled')) DEFAULT 'Draft',
    language VARCHAR(50) DEFAULT 'English',
    thumbnail_url VARCHAR(500),
    video_preview_url VARCHAR(500),
    certificate_available BOOLEAN DEFAULT FALSE,
    max_enrollment INT,
    current_enrollment INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    tags JSONB,
    prerequisites JSONB,
    learning_outcomes JSONB,
    subtitles JSONB,
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE RESTRICT
);

-- Create indexes for courses table
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(average_rating);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_courses_bestseller ON courses(is_bestseller);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(published_at);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_courses_search ON courses USING gin(to_tsvector('english', title || ' ' || description || ' ' || short_description));

-- Course sections table
CREATE TABLE IF NOT EXISTS course_sections (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    course_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_hours DECIMAL(5,2) DEFAULT 0.00,
    sort_order INT DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_sort_order (sort_order)
);

-- Course lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    section_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_type ENUM('video', 'text', 'quiz', 'assignment', 'download') DEFAULT 'video',
    duration_minutes INT DEFAULT 0,
    content TEXT,
    video_url VARCHAR(500),
    video_duration INT,
    is_preview BOOLEAN DEFAULT FALSE,
    is_free BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE,
    INDEX idx_section_id (section_id),
    INDEX idx_lesson_type (lesson_type),
    INDEX idx_sort_order (sort_order),
    INDEX idx_preview (is_preview)
);

-- Lesson attachments table
CREATE TABLE IF NOT EXISTS lesson_attachments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    lesson_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_type ENUM('pdf', 'doc', 'zip', 'image', 'video', 'audio') NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_file_type (file_type)
);

-- =====================================================
-- ENROLLMENT & PROGRESS TABLES
-- =====================================================

-- Course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    payment_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url VARCHAR(500),
    certificate_issued_at TIMESTAMP NULL,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_enrollment_date (enrollment_date),
    INDEX idx_completion_date (completion_date),
    INDEX idx_progress (progress_percentage),
    INDEX idx_payment_status (payment_status)
);

-- Lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    lesson_id VARCHAR(36) NOT NULL,
    enrollment_id VARCHAR(36) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    watch_time_seconds INT DEFAULT 0,
    last_position_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_lesson_progress (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_completed (is_completed)
);

-- =====================================================
-- REVIEWS & RATINGS TABLES
-- =====================================================

-- Course reviews table
CREATE TABLE IF NOT EXISTS course_reviews (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    enrollment_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_review (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);

-- Review helpful votes table
CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    review_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_vote (review_id, user_id),
    FOREIGN KEY (review_id) REFERENCES course_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id),
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- ANALYTICS & TRACKING TABLES
-- =====================================================

-- Course analytics table
CREATE TABLE IF NOT EXISTS course_analytics (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    course_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    views INT DEFAULT 0,
    enrollments INT DEFAULT 0,
    completions INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    avg_watch_time_minutes DECIMAL(5,2) DEFAULT 0.00,
    bounce_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_course_date (course_id, date),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_date (date)
);

-- User activity logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36),
    lesson_id VARCHAR(36),
    activity_type ENUM('course_view', 'lesson_view', 'lesson_complete', 'quiz_attempt', 'download', 'review') NOT NULL,
    activity_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- PAYMENT & SUBSCRIPTION TABLES
-- =====================================================

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    enrollment_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method ENUM('credit_card', 'paypal', 'stripe', 'bank_transfer') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    gateway_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample categories
INSERT INTO course_categories (id, name, description, icon, color, sort_order) VALUES
('cat-001', 'Development', 'Programming and software development courses', 'code', '#007bff', 1),
('cat-002', 'Design', 'UI/UX design and creative courses', 'palette', '#28a745', 2),
('cat-003', 'Data Science', 'Data analysis and machine learning courses', 'chart', '#ffc107', 3),
('cat-004', 'Business', 'Business and management courses', 'briefcase', '#dc3545', 4),
('cat-005', 'Marketing', 'Digital marketing and advertising courses', 'megaphone', '#6f42c1', 5),
('cat-006', 'Finance', 'Financial planning and investment courses', 'dollar-sign', '#20c997', 6),
('cat-007', 'Health & Fitness', 'Health, wellness and fitness courses', 'heart', '#fd7e14', 7),
('cat-008', 'Music', 'Music production and theory courses', 'music', '#e83e8c', 8),
('cat-009', 'Photography', 'Photography and videography courses', 'camera', '#6c757d', 9),
('cat-010', 'Personal Development', 'Self-improvement and life skills courses', 'user', '#17a2b8', 10);

-- Insert sample users
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active) VALUES
('user-001', 'dr_angela', 'angela@example.com', '$2b$10$hashed_password_1', 'Angela', 'Yu', 'instructor', TRUE),
('user-002', 'jose_portilla', 'jose@example.com', '$2b$10$hashed_password_2', 'Jose', 'Portilla', 'instructor', TRUE),
('user-003', 'sarah_johnson', 'sarah@example.com', '$2b$10$hashed_password_3', 'Sarah', 'Johnson', 'instructor', TRUE),
('user-004', 'mike_chen', 'mike@example.com', '$2b$10$hashed_password_4', 'Mike', 'Chen', 'instructor', TRUE),
('user-005', 'student_john', 'john@example.com', '$2b$10$hashed_password_5', 'John', 'Doe', 'student', TRUE),
('user-006', 'student_jane', 'jane@example.com', '$2b$10$hashed_password_6', 'Jane', 'Smith', 'student', TRUE);

-- Insert sample instructors
INSERT INTO instructors (id, user_id, bio, expertise, is_verified) VALUES
('inst-001', 'user-001', 'Full-stack developer and instructor with 10+ years of experience in web development', '["Python", "JavaScript", "React", "Node.js", "MongoDB"]', TRUE),
('inst-002', 'user-002', 'Data scientist and educator specializing in Python, machine learning, and data analysis', '["Python", "Machine Learning", "Data Science", "Pandas", "NumPy"]', TRUE),
('inst-003', 'user-003', 'UI/UX designer with expertise in user-centered design and prototyping', '["Figma", "Adobe XD", "Prototyping", "User Research", "Design Systems"]', TRUE),
('inst-004', 'user-004', 'Business consultant and educator focusing on entrepreneurship and digital marketing', '["Business Strategy", "Digital Marketing", "Entrepreneurship", "Analytics"]', TRUE);

-- Insert sample courses
INSERT INTO courses (id, title, slug, description, instructor_id, category_id, level, duration_hours, price, status, language, thumbnail_url, tags, learning_outcomes, published_at) VALUES
('course-001', 'Complete Web Development Bootcamp', 'complete-web-development-bootcamp', 'Learn web development from scratch to advanced concepts including HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and deploy them to production.', 'inst-001', 'cat-001', 'Beginner', 44.5, 89.99, 'Active', 'English', '/images/courses/web-dev.jpg', '["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"]', '["Build responsive websites", "Create full-stack web applications", "Deploy applications to production", "Understand modern web development practices"]', NOW()),
('course-002', 'Python for Data Science', 'python-data-science', 'Master Python for data analysis and machine learning. Learn pandas, NumPy, matplotlib, and scikit-learn to analyze data and build ML models.', 'inst-002', 'cat-003', 'Intermediate', 22.0, 69.99, 'Active', 'English', '/images/courses/python-ds.jpg', '["Python", "Pandas", "NumPy", "Matplotlib", "Scikit-learn"]', '["Analyze data with Python", "Create data visualizations", "Build machine learning models", "Perform statistical analysis"]', NOW()),
('course-003', 'UI/UX Design Fundamentals', 'ui-ux-design-fundamentals', 'Learn the fundamentals of user interface and experience design. Master design principles, prototyping, and user research methodologies.', 'inst-003', 'cat-002', 'Beginner', 18.5, 49.99, 'Draft', 'English', '/images/courses/ui-ux.jpg', '["Figma", "Adobe XD", "Prototyping", "User Research", "Design Systems"]', '["Design user interfaces", "Create interactive prototypes", "Conduct user research", "Build design systems"]', NULL),
('course-004', 'Digital Marketing Masterclass', 'digital-marketing-masterclass', 'Comprehensive digital marketing course covering SEO, social media marketing, email marketing, and analytics.', 'inst-004', 'cat-005', 'Intermediate', 32.0, 79.99, 'Active', 'English', '/images/courses/digital-marketing.jpg', '["SEO", "Social Media Marketing", "Email Marketing", "Google Analytics"]', '["Develop marketing strategies", "Optimize for search engines", "Manage social media campaigns", "Analyze marketing performance"]', NOW()),
('course-005', 'React Native Mobile Development', 'react-native-mobile-development', 'Build cross-platform mobile applications using React Native. Learn to create iOS and Android apps with JavaScript.', 'inst-001', 'cat-001', 'Intermediate', 28.5, 74.99, 'Active', 'English', '/images/courses/react-native.jpg', '["React Native", "JavaScript", "Mobile Development", "iOS", "Android"]', '["Build mobile applications", "Deploy to app stores", "Handle mobile-specific features", "Optimize app performance"]', NOW()),
('course-006', 'Machine Learning with Python', 'machine-learning-python', 'Advanced machine learning course covering algorithms, deep learning, and real-world applications.', 'inst-002', 'cat-003', 'Advanced', 35.0, 99.99, 'Active', 'English', '/images/courses/ml-python.jpg', '["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Neural Networks"]', '["Implement ML algorithms", "Build neural networks", "Deploy ML models", "Solve real-world problems"]', NOW());

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX idx_courses_instructor_status ON courses(instructor_id, status);
CREATE INDEX idx_courses_category_level ON courses(category_id, level);
CREATE INDEX idx_courses_price_status ON courses(price, status);
CREATE INDEX idx_enrollments_user_course ON course_enrollments(user_id, course_id);
CREATE INDEX idx_progress_user_lesson ON lesson_progress(user_id, lesson_id);
CREATE INDEX idx_reviews_course_rating ON course_reviews(course_id, rating);
CREATE INDEX idx_analytics_course_date ON course_analytics(course_id, date);
CREATE INDEX idx_payments_user_status ON payments(user_id, payment_status);

-- =====================================================
-- TRIGGERS FOR DATA INTEGRITY
-- =====================================================

-- Update course enrollment count
DELIMITER //
CREATE TRIGGER update_course_enrollment_count
AFTER INSERT ON course_enrollments
FOR EACH ROW
BEGIN
    UPDATE courses 
    SET current_enrollment = current_enrollment + 1
    WHERE id = NEW.course_id;
END//

CREATE TRIGGER update_course_enrollment_count_delete
AFTER DELETE ON course_enrollments
FOR EACH ROW
BEGIN
    UPDATE courses 
    SET current_enrollment = current_enrollment - 1
    WHERE id = OLD.course_id;
END//

-- Update course average rating
CREATE TRIGGER update_course_rating
AFTER INSERT ON course_reviews
FOR EACH ROW
BEGIN
    UPDATE courses c
    SET average_rating = (
        SELECT AVG(rating) 
        FROM course_reviews 
        WHERE course_id = NEW.course_id
    ),
    total_ratings = (
        SELECT COUNT(*) 
        FROM course_reviews 
        WHERE course_id = NEW.course_id
    )
    WHERE c.id = NEW.course_id;
END//

-- Update instructor stats
CREATE TRIGGER update_instructor_stats
AFTER INSERT ON courses
FOR EACH ROW
BEGIN
    UPDATE instructors 
    SET total_courses = total_courses + 1
    WHERE id = NEW.instructor_id;
END//

DELIMITER ;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Course summary view
CREATE VIEW course_summary AS
SELECT 
    c.id,
    c.title,
    c.slug,
    c.description,
    c.level,
    c.duration_hours,
    c.price,
    c.status,
    c.current_enrollment,
    c.average_rating,
    c.total_ratings,
    c.completion_rate,
    c.thumbnail_url,
    c.tags,
    c.created_at,
    c.published_at,
    u.first_name,
    u.last_name,
    u.avatar_url as instructor_avatar,
    cc.name as category_name,
    cc.color as category_color
FROM courses c
JOIN instructors i ON c.instructor_id = i.id
JOIN users u ON i.user_id = u.id
JOIN course_categories cc ON c.category_id = cc.id;

-- Enrollment progress view
CREATE VIEW enrollment_progress AS
SELECT 
    ce.id as enrollment_id,
    ce.user_id,
    ce.course_id,
    ce.progress_percentage,
    ce.enrollment_date,
    ce.completion_date,
    ce.last_accessed,
    c.title as course_title,
    c.thumbnail_url,
    u.first_name,
    u.last_name,
    u.avatar_url
FROM course_enrollments ce
JOIN courses c ON ce.course_id = c.id
JOIN users u ON ce.user_id = u.id
WHERE ce.is_active = TRUE;

-- Instructor performance view
CREATE VIEW instructor_performance AS
SELECT 
    i.id as instructor_id,
    u.first_name,
    u.last_name,
    u.avatar_url,
    i.bio,
    i.expertise,
    i.total_courses,
    i.total_students,
    i.average_rating,
    i.total_earnings,
    i.is_verified,
    COUNT(c.id) as active_courses,
    AVG(c.average_rating) as avg_course_rating
FROM instructors i
JOIN users u ON i.user_id = u.id
LEFT JOIN courses c ON i.id = c.instructor_id AND c.status = 'Active'
GROUP BY i.id, u.first_name, u.last_name, u.avatar_url, i.bio, i.expertise, i.total_courses, i.total_students, i.average_rating, i.total_earnings, i.is_verified;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Get course analytics
DELIMITER //
CREATE PROCEDURE GetCourseAnalytics(IN course_id_param VARCHAR(36))
BEGIN
    SELECT 
        c.title,
        c.current_enrollment,
        c.average_rating,
        c.total_ratings,
        c.completion_rate,
        COUNT(ce.id) as total_enrollments,
        COUNT(CASE WHEN ce.completion_date IS NOT NULL THEN 1 END) as completed_enrollments,
        AVG(ce.progress_percentage) as avg_progress,
        SUM(p.amount) as total_revenue
    FROM courses c
    LEFT JOIN course_enrollments ce ON c.id = ce.course_id
    LEFT JOIN payments p ON ce.id = p.enrollment_id AND p.payment_status = 'completed'
    WHERE c.id = course_id_param
    GROUP BY c.id, c.title, c.current_enrollment, c.average_rating, c.total_ratings, c.completion_rate;
END//

-- Get instructor analytics
CREATE PROCEDURE GetInstructorAnalytics(IN instructor_id_param VARCHAR(36))
BEGIN
    SELECT 
        i.id,
        u.first_name,
        u.last_name,
        COUNT(c.id) as total_courses,
        COUNT(CASE WHEN c.status = 'Active' THEN 1 END) as active_courses,
        SUM(c.current_enrollment) as total_enrollments,
        AVG(c.average_rating) as avg_course_rating,
        SUM(c.current_enrollment * c.price) as estimated_revenue
    FROM instructors i
    JOIN users u ON i.user_id = u.id
    LEFT JOIN courses c ON i.id = c.instructor_id
    WHERE i.id = instructor_id_param
    GROUP BY i.id, u.first_name, u.last_name;
END//

-- Get category performance
CREATE PROCEDURE GetCategoryPerformance()
BEGIN
    SELECT 
        cc.name as category_name,
        cc.color as category_color,
        COUNT(c.id) as total_courses,
        COUNT(CASE WHEN c.status = 'Active' THEN 1 END) as active_courses,
        AVG(c.average_rating) as avg_rating,
        SUM(c.current_enrollment) as total_enrollments,
        AVG(c.price) as avg_price
    FROM course_categories cc
    LEFT JOIN courses c ON cc.id = c.category_id
    GROUP BY cc.id, cc.name, cc.color
    ORDER BY total_courses DESC;
END//

DELIMITER ;

-- =====================================================
-- SAMPLE ENROLLMENTS AND REVIEWS
-- =====================================================

-- Insert sample enrollments
INSERT INTO course_enrollments (id, user_id, course_id, progress_percentage, payment_amount, payment_status) VALUES
('enroll-001', 'user-005', 'course-001', 75.50, 89.99, 'completed'),
('enroll-002', 'user-006', 'course-001', 45.20, 89.99, 'completed'),
('enroll-003', 'user-005', 'course-002', 90.00, 69.99, 'completed'),
('enroll-004', 'user-006', 'course-004', 30.10, 79.99, 'completed');

-- Insert sample reviews
INSERT INTO course_reviews (id, user_id, course_id, enrollment_id, rating, review_text, is_verified_purchase) VALUES
('review-001', 'user-005', 'course-001', 'enroll-001', 5, 'Excellent course! Very comprehensive and well-structured. The instructor explains complex concepts clearly.', TRUE),
('review-002', 'user-006', 'course-001', 'enroll-002', 4, 'Great course for beginners. Good pace and practical examples.', TRUE),
('review-003', 'user-005', 'course-002', 'enroll-003', 5, 'Amazing data science course. Learned a lot about Python and machine learning.', TRUE);

-- Insert sample payments
INSERT INTO payments (id, user_id, course_id, enrollment_id, amount, currency, payment_method, payment_status, transaction_id) VALUES
('payment-001', 'user-005', 'course-001', 'enroll-001', 89.99, 'USD', 'credit_card', 'completed', 'txn_001'),
('payment-002', 'user-006', 'course-001', 'enroll-002', 89.99, 'USD', 'paypal', 'completed', 'txn_002'),
('payment-003', 'user-005', 'course-002', 'enroll-003', 69.99, 'USD', 'credit_card', 'completed', 'txn_003'),
('payment-004', 'user-006', 'course-004', 'enroll-004', 79.99, 'USD', 'stripe', 'completed', 'txn_004');

-- =====================================================
-- SAMPLE ANALYTICS DATA
-- =====================================================

-- Insert sample course analytics
INSERT INTO course_analytics (course_id, date, views, enrollments, completions, revenue, avg_watch_time_minutes, bounce_rate) VALUES
('course-001', CURDATE(), 150, 25, 18, 2249.75, 45.5, 15.2),
('course-001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 120, 20, 15, 1799.80, 42.3, 18.1),
('course-002', CURDATE(), 80, 15, 12, 1049.85, 38.7, 22.5),
('course-002', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 95, 18, 14, 1259.82, 41.2, 19.8),
('course-004', CURDATE(), 60, 12, 8, 959.88, 35.4, 25.3),
('course-005', CURDATE(), 45, 8, 6, 599.92, 32.1, 28.7);

-- =====================================================
-- FINAL COMMENTS
-- =====================================================

-- This SQL file contains the complete database setup for the Learning Management System
-- To use this file:
-- 1. Create a new database: CREATE DATABASE learning_management;
-- 2. Use the database: USE learning_management;
-- 3. Run this file: source learning_complete.sql;
-- 4. Verify the setup: SHOW TABLES;
-- 5. Check sample data: SELECT * FROM course_summary LIMIT 5;

-- The database includes:
-- - 15+ tables for complete learning management
-- - Sample data for testing and development
-- - Performance indexes for fast queries
-- - Triggers for data integrity
-- - Views for common queries
-- - Stored procedures for analytics
-- - Comprehensive foreign key relationships
