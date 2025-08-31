-- Learning Management System Database Schema
-- Created for comprehensive learning platform

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends existing user system)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- Categories table
CREATE TABLE IF NOT EXISTS course_categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7) DEFAULT '#007bff',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);

-- Instructors table (extends users)
CREATE TABLE IF NOT EXISTS instructors (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    bio TEXT,
    expertise JSON, -- Array of expertise areas
    social_links JSON, -- LinkedIn, Twitter, etc.
    total_courses INT DEFAULT 0,
    total_students INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_verified (is_verified)
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    instructor_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    level ENUM('Beginner', 'Intermediate', 'Advanced', 'All Levels') DEFAULT 'Beginner',
    duration_hours DECIMAL(5,2) DEFAULT 0.00,
    price DECIMAL(10,2) DEFAULT 0.00,
    original_price DECIMAL(10,2),
    status ENUM('Draft', 'Active', 'Archived', 'Scheduled') DEFAULT 'Draft',
    language VARCHAR(50) DEFAULT 'English',
    thumbnail_url VARCHAR(500),
    video_preview_url VARCHAR(500),
    certificate_available BOOLEAN DEFAULT FALSE,
    max_enrollment INT,
    current_enrollment INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    tags JSON, -- Array of tags
    prerequisites JSON, -- Array of prerequisites
    learning_outcomes JSON, -- Array of learning outcomes
    subtitles JSON, -- Array of available subtitles
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE RESTRICT,
    INDEX idx_slug (slug),
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_level (level),
    INDEX idx_price (price),
    INDEX idx_rating (average_rating),
    INDEX idx_featured (is_featured),
    INDEX idx_bestseller (is_bestseller),
    INDEX idx_published (published_at),
    FULLTEXT idx_search (title, description, short_description)
);

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
    content TEXT, -- For text lessons
    video_url VARCHAR(500),
    video_duration INT, -- in seconds
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
    file_size BIGINT, -- in bytes
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
    watch_time_seconds INT DEFAULT 0, -- For video lessons
    last_position_seconds INT DEFAULT 0, -- For video lessons
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
('cat-005', 'Marketing', 'Digital marketing and advertising courses', 'megaphone', '#6f42c1', 5);

-- Insert sample instructor
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role) VALUES
('user-001', 'dr_angela', 'angela@example.com', 'hashed_password', 'Angela', 'Yu', 'instructor');

INSERT INTO instructors (id, user_id, bio, expertise, is_verified) VALUES
('inst-001', 'user-001', 'Full-stack developer and instructor with 10+ years of experience', '["Python", "JavaScript", "React", "Node.js"]', TRUE);

-- Insert sample courses
INSERT INTO courses (id, title, slug, description, instructor_id, category_id, level, duration_hours, price, status, language, thumbnail_url, tags, learning_outcomes, published_at) VALUES
('course-001', 'Complete Web Development Bootcamp', 'complete-web-development-bootcamp', 'Learn web development from scratch to advanced concepts', 'inst-001', 'cat-001', 'Beginner', 44.5, 89.99, 'Active', 'English', '/images/courses/web-dev.jpg', '["HTML", "CSS", "JavaScript", "React"]', '["Build responsive websites", "Create web applications", "Deploy to production"]', NOW()),
('course-002', 'Python for Data Science', 'python-data-science', 'Master Python for data analysis and machine learning', 'inst-001', 'cat-003', 'Intermediate', 22.0, 69.99, 'Active', 'English', '/images/courses/python-ds.jpg', '["Python", "Pandas", "NumPy", "Matplotlib"]', '["Analyze data with Python", "Create visualizations", "Build ML models"]', NOW()),
('course-003', 'UI/UX Design Fundamentals', 'ui-ux-design-fundamentals', 'Learn the fundamentals of user interface and experience design', 'inst-001', 'cat-002', 'Beginner', 18.5, 49.99, 'Draft', 'English', '/images/courses/ui-ux.jpg', '["Figma", "Adobe XD", "Prototyping"]', '["Design user interfaces", "Create prototypes", "Conduct user research"]', NULL);

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
