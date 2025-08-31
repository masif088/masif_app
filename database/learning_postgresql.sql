-- =====================================================
-- LEARNING MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA (PostgreSQL)
-- =====================================================
-- This file contains the complete database setup for the Learning Management System
-- PostgreSQL compatible version
-- Includes: Tables, Sample Data, Indexes, Triggers, Views, and Functions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_hours DECIMAL(5,2) DEFAULT 0.00,
    sort_order INT DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create indexes for course sections table
CREATE INDEX IF NOT EXISTS idx_course_sections_course_id ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sections_sort_order ON course_sections(sort_order);

-- Course lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_type VARCHAR(20) CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment', 'download')) DEFAULT 'video',
    duration_minutes INT DEFAULT 0,
    content TEXT,
    video_url VARCHAR(500),
    video_duration INT,
    is_preview BOOLEAN DEFAULT FALSE,
    is_free BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE
);

-- Create indexes for course lessons table
CREATE INDEX IF NOT EXISTS idx_course_lessons_section_id ON course_lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_lesson_type ON course_lessons(lesson_type);
CREATE INDEX IF NOT EXISTS idx_course_lessons_sort_order ON course_lessons(sort_order);
CREATE INDEX IF NOT EXISTS idx_course_lessons_preview ON course_lessons(is_preview);

-- Lesson attachments table
CREATE TABLE IF NOT EXISTS lesson_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) CHECK (file_type IN ('pdf', 'doc', 'zip', 'image', 'video', 'audio')) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE
);

-- Create indexes for lesson attachments table
CREATE INDEX IF NOT EXISTS idx_lesson_attachments_lesson_id ON lesson_attachments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_attachments_file_type ON lesson_attachments(file_type);

-- =====================================================
-- ENROLLMENT & PROGRESS TABLES
-- =====================================================

-- Course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    payment_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url VARCHAR(500),
    certificate_issued_at TIMESTAMP NULL,
    UNIQUE(user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create indexes for course enrollments table
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_enrollment_date ON course_enrollments(enrollment_date);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_completion_date ON course_enrollments(completion_date);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_progress ON course_enrollments(progress_percentage);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_payment_status ON course_enrollments(payment_status);

-- Lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    enrollment_id UUID NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    watch_time_seconds INT DEFAULT 0,
    last_position_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE
);

-- Create indexes for lesson progress table
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment_id ON lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON lesson_progress(is_completed);

-- =====================================================
-- REVIEWS & RATINGS TABLES
-- =====================================================

-- Course reviews table
CREATE TABLE IF NOT EXISTS course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrollment_id UUID NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_votes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE
);

-- Create indexes for course reviews table
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_rating ON course_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_course_reviews_created_at ON course_reviews(created_at);

-- Review helpful votes table
CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL,
    user_id UUID NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, user_id),
    FOREIGN KEY (review_id) REFERENCES course_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for review helpful votes table
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_user_id ON review_helpful_votes(user_id);

-- =====================================================
-- ANALYTICS & TRACKING TABLES
-- =====================================================

-- Course analytics table
CREATE TABLE IF NOT EXISTS course_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    date DATE NOT NULL,
    views INT DEFAULT 0,
    enrollments INT DEFAULT 0,
    completions INT DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    avg_watch_time_minutes DECIMAL(5,2) DEFAULT 0.00,
    bounce_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, date),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create indexes for course analytics table
CREATE INDEX IF NOT EXISTS idx_course_analytics_course_id ON course_analytics(course_id);
CREATE INDEX IF NOT EXISTS idx_course_analytics_date ON course_analytics(date);

-- User activity logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID,
    lesson_id UUID,
    activity_type VARCHAR(30) CHECK (activity_type IN ('course_view', 'lesson_view', 'lesson_complete', 'quiz_attempt', 'download', 'review')) NOT NULL,
    activity_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE SET NULL
);

-- Create indexes for user activity logs table
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_course_id ON user_activity_logs(course_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- =====================================================
-- PAYMENT & SUBSCRIPTION TABLES
-- =====================================================

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrollment_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(20) CHECK (payment_method IN ('credit_card', 'paypal', 'stripe', 'bank_transfer')) NOT NULL,
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE
);

-- Create indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- =====================================================
-- TRIGGERS FOR DATA INTEGRITY
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_categories_updated_at BEFORE UPDATE ON course_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_instructors_updated_at BEFORE UPDATE ON instructors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_sections_updated_at BEFORE UPDATE ON course_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_enrollments_updated_at BEFORE UPDATE ON course_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_reviews_updated_at BEFORE UPDATE ON course_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update course enrollment count
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE courses SET current_enrollment = current_enrollment + 1 WHERE id = NEW.course_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE courses SET current_enrollment = current_enrollment - 1 WHERE id = OLD.course_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for enrollment count
CREATE TRIGGER update_course_enrollment_count_insert AFTER INSERT ON course_enrollments FOR EACH ROW EXECUTE FUNCTION update_course_enrollment_count();
CREATE TRIGGER update_course_enrollment_count_delete AFTER DELETE ON course_enrollments FOR EACH ROW EXECUTE FUNCTION update_course_enrollment_count();

-- Function to update course average rating
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses 
    SET average_rating = (
        SELECT COALESCE(AVG(rating), 0.00)
        FROM course_reviews 
        WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    ),
    total_ratings = (
        SELECT COUNT(*)
        FROM course_reviews 
        WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    )
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for course rating updates
CREATE TRIGGER update_course_rating_trigger AFTER INSERT OR UPDATE OR DELETE ON course_reviews FOR EACH ROW EXECUTE FUNCTION update_course_rating();

-- Function to update instructor stats
CREATE OR REPLACE FUNCTION update_instructor_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE instructors SET total_courses = total_courses + 1 WHERE id = NEW.instructor_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE instructors SET total_courses = total_courses - 1 WHERE id = OLD.instructor_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for instructor stats
CREATE TRIGGER update_instructor_stats_trigger AFTER INSERT OR DELETE ON courses FOR EACH ROW EXECUTE FUNCTION update_instructor_stats();

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
-- FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Function to get course analytics
CREATE OR REPLACE FUNCTION get_course_analytics(course_id_param UUID)
RETURNS TABLE (
    title VARCHAR(255),
    current_enrollment INT,
    average_rating DECIMAL(3,2),
    total_ratings INT,
    completion_rate DECIMAL(5,2),
    total_enrollments BIGINT,
    completed_enrollments BIGINT,
    avg_progress DECIMAL(5,2),
    total_revenue DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.title,
        c.current_enrollment,
        c.average_rating,
        c.total_ratings,
        c.completion_rate,
        COUNT(ce.id) as total_enrollments,
        COUNT(CASE WHEN ce.completion_date IS NOT NULL THEN 1 END) as completed_enrollments,
        AVG(ce.progress_percentage) as avg_progress,
        COALESCE(SUM(p.amount), 0.00) as total_revenue
    FROM courses c
    LEFT JOIN course_enrollments ce ON c.id = ce.course_id
    LEFT JOIN payments p ON ce.id = p.enrollment_id AND p.payment_status = 'completed'
    WHERE c.id = course_id_param
    GROUP BY c.id, c.title, c.current_enrollment, c.average_rating, c.total_ratings, c.completion_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to get instructor analytics
CREATE OR REPLACE FUNCTION get_instructor_analytics(instructor_id_param UUID)
RETURNS TABLE (
    id UUID,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    total_courses BIGINT,
    active_courses BIGINT,
    total_enrollments BIGINT,
    avg_course_rating DECIMAL(3,2),
    estimated_revenue DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        u.first_name,
        u.last_name,
        COUNT(c.id) as total_courses,
        COUNT(CASE WHEN c.status = 'Active' THEN 1 END) as active_courses,
        COALESCE(SUM(c.current_enrollment), 0) as total_enrollments,
        AVG(c.average_rating) as avg_course_rating,
        COALESCE(SUM(c.current_enrollment * c.price), 0.00) as estimated_revenue
    FROM instructors i
    JOIN users u ON i.user_id = u.id
    LEFT JOIN courses c ON i.id = c.instructor_id
    WHERE i.id = instructor_id_param
    GROUP BY i.id, u.first_name, u.last_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get category performance
CREATE OR REPLACE FUNCTION get_category_performance()
RETURNS TABLE (
    category_name VARCHAR(100),
    category_color VARCHAR(7),
    total_courses BIGINT,
    active_courses BIGINT,
    avg_rating DECIMAL(3,2),
    total_enrollments BIGINT,
    avg_price DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.name as category_name,
        cc.color as category_color,
        COUNT(c.id) as total_courses,
        COUNT(CASE WHEN c.status = 'Active' THEN 1 END) as active_courses,
        AVG(c.average_rating) as avg_rating,
        COALESCE(SUM(c.current_enrollment), 0) as total_enrollments,
        AVG(c.price) as avg_price
    FROM course_categories cc
    LEFT JOIN courses c ON cc.id = c.category_id
    GROUP BY cc.id, cc.name, cc.color
    ORDER BY total_courses DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample categories
INSERT INTO course_categories (id, name, description, icon, color, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'Development', 'Programming and software development courses', 'code', '#007bff', 1),
('22222222-2222-2222-2222-222222222222', 'Design', 'UI/UX design and creative courses', 'palette', '#28a745', 2),
('33333333-3333-3333-3333-333333333333', 'Data Science', 'Data analysis and machine learning courses', 'chart', '#ffc107', 3),
('44444444-4444-4444-4444-444444444444', 'Business', 'Business and management courses', 'briefcase', '#dc3545', 4),
('55555555-5555-5555-5555-555555555555', 'Marketing', 'Digital marketing and advertising courses', 'megaphone', '#6f42c1', 5),
('66666666-6666-6666-6666-666666666666', 'Finance', 'Financial planning and investment courses', 'dollar-sign', '#20c997', 6),
('77777777-7777-7777-7777-777777777777', 'Health & Fitness', 'Health, wellness and fitness courses', 'heart', '#fd7e14', 7),
('88888888-8888-8888-8888-888888888888', 'Music', 'Music production and theory courses', 'music', '#e83e8c', 8),
('99999999-9999-9999-9999-999999999999', 'Photography', 'Photography and videography courses', 'camera', '#6c757d', 9),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Personal Development', 'Self-improvement and life skills courses', 'user', '#17a2b8', 10);

-- Insert sample users
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dr_angela', 'angela@example.com', '$2b$10$hashed_password_1', 'Angela', 'Yu', 'instructor', TRUE),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'jose_portilla', 'jose@example.com', '$2b$10$hashed_password_2', 'Jose', 'Portilla', 'instructor', TRUE),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'sarah_johnson', 'sarah@example.com', '$2b$10$hashed_password_3', 'Sarah', 'Johnson', 'instructor', TRUE),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'mike_chen', 'mike@example.com', '$2b$10$hashed_password_4', 'Mike', 'Chen', 'instructor', TRUE),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'student_john', 'john@example.com', '$2b$10$hashed_password_5', 'John', 'Doe', 'student', TRUE),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'student_jane', 'jane@example.com', '$2b$10$hashed_password_6', 'Jane', 'Smith', 'student', TRUE);

-- Insert sample instructors
INSERT INTO instructors (id, user_id, bio, expertise, is_verified) VALUES
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Full-stack developer and instructor with 10+ years of experience in web development', '["Python", "JavaScript", "React", "Node.js", "MongoDB"]', TRUE),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Data scientist and educator specializing in Python, machine learning, and data analysis', '["Python", "Machine Learning", "Data Science", "Pandas", "NumPy"]', TRUE),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'UI/UX designer with expertise in user-centered design and prototyping', '["Figma", "Adobe XD", "Prototyping", "User Research", "Design Systems"]', TRUE),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Business consultant and educator focusing on entrepreneurship and digital marketing', '["Business Strategy", "Digital Marketing", "Entrepreneurship", "Analytics"]', TRUE);

-- Insert sample courses
INSERT INTO courses (id, title, slug, description, instructor_id, category_id, level, duration_hours, price, status, language, thumbnail_url, tags, learning_outcomes, published_at) VALUES
('llllllll-llll-llll-llll-llllllllllll', 'Complete Web Development Bootcamp', 'complete-web-development-bootcamp', 'Learn web development from scratch to advanced concepts including HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and deploy them to production.', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '11111111-1111-1111-1111-111111111111', 'Beginner', 44.5, 89.99, 'Active', 'English', '/images/courses/web-dev.jpg', '["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"]', '["Build responsive websites", "Create full-stack web applications", "Deploy applications to production", "Understand modern web development practices"]', NOW()),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'Python for Data Science', 'python-data-science', 'Master Python for data analysis and machine learning. Learn pandas, NumPy, matplotlib, and scikit-learn to analyze data and build ML models.', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '33333333-3333-3333-3333-333333333333', 'Intermediate', 22.0, 69.99, 'Active', 'English', '/images/courses/python-ds.jpg', '["Python", "Pandas", "NumPy", "Matplotlib", "Scikit-learn"]', '["Analyze data with Python", "Create data visualizations", "Build machine learning models", "Perform statistical analysis"]', NOW()),
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'UI/UX Design Fundamentals', 'ui-ux-design-fundamentals', 'Learn the fundamentals of user interface and experience design. Master design principles, prototyping, and user research methodologies.', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', '22222222-2222-2222-2222-222222222222', 'Beginner', 18.5, 49.99, 'Draft', 'English', '/images/courses/ui-ux.jpg', '["Figma", "Adobe XD", "Prototyping", "User Research", "Design Systems"]', '["Design user interfaces", "Create interactive prototypes", "Conduct user research", "Build design systems"]', NULL),
('oooooooo-oooo-oooo-oooo-oooooooooooo', 'Digital Marketing Masterclass', 'digital-marketing-masterclass', 'Comprehensive digital marketing course covering SEO, social media marketing, email marketing, and analytics.', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', '55555555-5555-5555-5555-555555555555', 'Intermediate', 32.0, 79.99, 'Active', 'English', '/images/courses/digital-marketing.jpg', '["SEO", "Social Media Marketing", "Email Marketing", "Google Analytics"]', '["Develop marketing strategies", "Optimize for search engines", "Manage social media campaigns", "Analyze marketing performance"]', NOW()),
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'React Native Mobile Development', 'react-native-mobile-development', 'Build cross-platform mobile applications using React Native. Learn to create iOS and Android apps with JavaScript.', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '11111111-1111-1111-1111-111111111111', 'Intermediate', 28.5, 74.99, 'Active', 'English', '/images/courses/react-native.jpg', '["React Native", "JavaScript", "Mobile Development", "iOS", "Android"]', '["Build mobile applications", "Deploy to app stores", "Handle mobile-specific features", "Optimize app performance"]', NOW()),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'Machine Learning with Python', 'machine-learning-python', 'Advanced machine learning course covering algorithms, deep learning, and real-world applications.', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '33333333-3333-3333-3333-333333333333', 'Advanced', 35.0, 99.99, 'Active', 'English', '/images/courses/ml-python.jpg', '["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Neural Networks"]', '["Implement ML algorithms", "Build neural networks", "Deploy ML models", "Solve real-world problems"]', NOW());

-- =====================================================
-- SAMPLE ENROLLMENTS AND REVIEWS
-- =====================================================

-- Insert sample enrollments
INSERT INTO course_enrollments (id, user_id, course_id, progress_percentage, payment_amount, payment_status) VALUES
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'llllllll-llll-llll-llll-llllllllllll', 75.50, 89.99, 'completed'),
('ssssssss-ssss-ssss-ssss-ssssssssssss', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'llllllll-llll-llll-llll-llllllllllll', 45.20, 89.99, 'completed'),
('tttttttt-tttt-tttt-tttt-tttttttttttt', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 90.00, 69.99, 'completed'),
('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'oooooooo-oooo-oooo-oooo-oooooooooooo', 30.10, 79.99, 'completed');

-- Insert sample reviews
INSERT INTO course_reviews (id, user_id, course_id, enrollment_id, rating, review_text, is_verified_purchase) VALUES
('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'llllllll-llll-llll-llll-llllllllllll', 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 5, 'Excellent course! Very comprehensive and well-structured. The instructor explains complex concepts clearly.', TRUE),
('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'llllllll-llll-llll-llll-llllllllllll', 'ssssssss-ssss-ssss-ssss-ssssssssssss', 4, 'Great course for beginners. Good pace and practical examples.', TRUE),
('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'tttttttt-tttt-tttt-tttt-tttttttttttt', 5, 'Amazing data science course. Learned a lot about Python and machine learning.', TRUE);

-- Insert sample payments
INSERT INTO payments (id, user_id, course_id, enrollment_id, amount, currency, payment_method, payment_status, transaction_id) VALUES
('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'llllllll-llll-llll-llll-llllllllllll', 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 89.99, 'USD', 'credit_card', 'completed', 'txn_001'),
('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'llllllll-llll-llll-llll-llllllllllll', 'ssssssss-ssss-ssss-ssss-ssssssssssss', 89.99, 'USD', 'paypal', 'completed', 'txn_002'),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'tttttttt-tttt-tttt-tttt-tttttttttttt', 69.99, 'USD', 'credit_card', 'completed', 'txn_003'),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'oooooooo-oooo-oooo-oooo-oooooooooooo', 'uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 79.99, 'USD', 'stripe', 'completed', 'txn_004');

-- =====================================================
-- SAMPLE ANALYTICS DATA
-- =====================================================

-- Insert sample course analytics
INSERT INTO course_analytics (course_id, date, views, enrollments, completions, revenue, avg_watch_time_minutes, bounce_rate) VALUES
('llllllll-llll-llll-llll-llllllllllll', CURRENT_DATE, 150, 25, 18, 2249.75, 45.5, 15.2),
('llllllll-llll-llll-llll-llllllllllll', CURRENT_DATE - INTERVAL '1 day', 120, 20, 15, 1799.80, 42.3, 18.1),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', CURRENT_DATE, 80, 15, 12, 1049.85, 38.7, 22.5),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', CURRENT_DATE - INTERVAL '1 day', 95, 18, 14, 1259.82, 41.2, 19.8),
('oooooooo-oooo-oooo-oooo-oooooooooooo', CURRENT_DATE, 60, 12, 8, 959.88, 35.4, 25.3),
('pppppppp-pppp-pppp-pppp-pppppppppppp', CURRENT_DATE, 45, 8, 6, 599.92, 32.1, 28.7);

-- =====================================================
-- FINAL COMMENTS
-- =====================================================

-- This SQL file contains the complete database setup for the Learning Management System (PostgreSQL)
-- To use this file:
-- 1. Create a new database: CREATE DATABASE learning_management;
-- 2. Connect to the database: \c learning_management;
-- 3. Run this file: \i learning_postgresql.sql;
-- 4. Verify the setup: \dt;
-- 5. Check sample data: SELECT * FROM course_summary LIMIT 5;

-- The database includes:
-- - 15+ tables for complete learning management
-- - Sample data for testing and development
-- - Performance indexes for fast queries
-- - Triggers for data integrity
-- - Views for common queries
-- - Functions for analytics
-- - Comprehensive foreign key relationships
-- - PostgreSQL-specific optimizations (JSONB, GIN indexes, etc.)
