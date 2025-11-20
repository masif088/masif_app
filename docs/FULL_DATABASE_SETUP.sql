-- ============================================================================
-- FULL DATABASE SETUP FOR MASIF PROJECT
-- ============================================================================
-- This script creates the complete database schema for the Masif application
-- Run this script in your Supabase SQL editor
-- 
-- Features included:
-- - Users and authentication
-- - Companies and organizations
-- - Activities and activity management
-- - Customers and customer data management
-- - Courses and learning management
-- - Todos and task management
-- - Wallets and transactions
-- - Contact emails
-- - Settings
-- - Kanban tasks
-- ============================================================================

-- ============================================================================
-- SECTION 1: CREATE SEQUENCES
-- ============================================================================

-- Create sequences for tables that use SERIAL
CREATE SEQUENCE IF NOT EXISTS companies_id_seq;
CREATE SEQUENCE IF NOT EXISTS contact_emails_id_seq;
CREATE SEQUENCE IF NOT EXISTS contact_email_categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS activity_emails_id_seq;
CREATE SEQUENCE IF NOT EXISTS activity_notes_id_seq;

-- ============================================================================
-- SECTION 2: BASE TABLES (No dependencies on other custom tables)
-- ============================================================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    username TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    about_me TEXT,
    website TEXT,
    avatar TEXT,
    skills TEXT,
    phone TEXT,
    company_id INTEGER,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id INTEGER NOT NULL DEFAULT nextval('companies_id_seq'),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo VARCHAR(500),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    industry VARCHAR(100),
    founded_date DATE,
    leader_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT companies_pkey PRIMARY KEY (id),
    CONSTRAINT companies_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Add company_id foreign key to users table
ALTER TABLE public.users 
    ADD COLUMN IF NOT EXISTS company_id INTEGER;

-- Add constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_company_id_fkey'
    ) THEN
        ALTER TABLE public.users 
            ADD CONSTRAINT users_company_id_fkey 
            FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT NOT NULL,
    title TEXT,
    value TEXT,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT settings_pkey PRIMARY KEY (key)
);

-- ============================================================================
-- SECTION 3: REFERENCE/LOOKUP TABLES
-- ============================================================================

-- Activity Priorities
CREATE TABLE IF NOT EXISTS public.activity_priorities (
    title TEXT NOT NULL,
    description TEXT,
    sub_title TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    color TEXT,
    level BIGINT DEFAULT 99,
    CONSTRAINT activity_priorities_pkey PRIMARY KEY (title)
);

-- Activity Statuses
CREATE TABLE IF NOT EXISTS public.activity_statuses (
    title TEXT NOT NULL UNIQUE,
    sub_title TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    level BIGINT,
    color VARCHAR DEFAULT 'primary',
    CONSTRAINT activity_statuses_pkey PRIMARY KEY (title)
);

-- Activity Types
CREATE TABLE IF NOT EXISTS public.activity_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    title TEXT,
    sub_title TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT activity_types_pkey PRIMARY KEY (id)
);

-- Course Categories
CREATE TABLE IF NOT EXISTS public.course_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    color VARCHAR(50) DEFAULT '#007bff',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT course_categories_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- SECTION 4: MAIN ENTITY TABLES
-- ============================================================================

-- Activities table
CREATE TABLE IF NOT EXISTS public.activities (
    id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    title TEXT,
    description TEXT,
    activity_start TIMESTAMP WITH TIME ZONE,
    activity_end TIMESTAMP WITH TIME ZONE,
    user_id UUID,
    status TEXT,
    priority TEXT,
    type TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT,
    link TEXT,
    column_index BIGINT DEFAULT 0,
    company_id INTEGER,
    CONSTRAINT activities_pkey PRIMARY KEY (id),
    CONSTRAINT activities_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL,
    CONSTRAINT activities_priority_fkey FOREIGN KEY (priority) REFERENCES public.activity_priorities(title),
    CONSTRAINT activities_status_fkey FOREIGN KEY (status) REFERENCES public.activity_statuses(title),
    CONSTRAINT activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    register_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID,
    CONSTRAINT customers_pkey PRIMARY KEY (id),
    CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Customer Data Templates
CREATE TABLE IF NOT EXISTS public.customer_data_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    key VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "group" TEXT,
    CONSTRAINT customer_data_templates_pkey PRIMARY KEY (id)
);

-- Customer Details
CREATE TABLE IF NOT EXISTS public.customer_details (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    customer_data_template_id UUID NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT customer_details_pkey PRIMARY KEY (id),
    CONSTRAINT customer_details_customer_data_template_id_fkey FOREIGN KEY (customer_data_template_id) REFERENCES public.customer_data_templates(id) ON DELETE CASCADE,
    CONSTRAINT customer_details_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE,
    UNIQUE(customer_id, customer_data_template_id)
);

-- Customer Content Templates
CREATE TABLE IF NOT EXISTS public.customer_content_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT customer_content_templates_pkey PRIMARY KEY (id)
);

-- Instructors table
CREATE TABLE IF NOT EXISTS public.instructors (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    bio TEXT,
    expertise JSONB,
    social_links JSONB,
    total_courses INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    average_rating NUMERIC(5,2) DEFAULT 0.00,
    total_earnings NUMERIC(15,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT instructors_pkey PRIMARY KEY (id),
    CONSTRAINT instructors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    instructor_id UUID NOT NULL,
    category_id UUID NOT NULL,
    level VARCHAR(50) DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
    duration_hours NUMERIC(10,2) DEFAULT 0.00,
    price NUMERIC(10,2) DEFAULT 0.00,
    original_price NUMERIC(10,2),
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Archived', 'Scheduled')),
    language VARCHAR(50) DEFAULT 'English',
    thumbnail_url VARCHAR(500),
    video_preview_url VARCHAR(500),
    certificate_available BOOLEAN DEFAULT false,
    max_enrollment INTEGER,
    current_enrollment INTEGER DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    completion_rate NUMERIC(5,2) DEFAULT 0.00,
    tags JSONB,
    prerequisites JSONB,
    learning_outcomes JSONB,
    subtitles JSONB,
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT courses_pkey PRIMARY KEY (id),
    CONSTRAINT courses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.course_categories(id),
    CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(id)
);

-- Course Sections
CREATE TABLE IF NOT EXISTS public.course_sections (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_hours NUMERIC(10,2) DEFAULT 0.00,
    sort_order INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT course_sections_pkey PRIMARY KEY (id),
    CONSTRAINT course_sections_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE
);

-- Course Lessons
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_type VARCHAR(50) DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment', 'download')),
    duration_minutes INTEGER DEFAULT 0,
    content TEXT,
    video_url VARCHAR(500),
    video_duration INTEGER,
    is_preview BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT course_lessons_pkey PRIMARY KEY (id),
    CONSTRAINT course_lessons_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.course_sections(id) ON DELETE CASCADE
);

-- Course Enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrollment_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP WITHOUT TIME ZONE,
    progress_percentage NUMERIC(5,2) DEFAULT 0.00,
    last_accessed TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    payment_amount NUMERIC(10,2) DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url VARCHAR(500),
    certificate_issued_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT course_enrollments_pkey PRIMARY KEY (id),
    CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE,
    CONSTRAINT course_enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Course Reviews
CREATE TABLE IF NOT EXISTS public.course_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrollment_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT course_reviews_pkey PRIMARY KEY (id),
    CONSTRAINT course_reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE,
    CONSTRAINT course_reviews_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
    CONSTRAINT course_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Review Helpful Votes
CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL,
    user_id UUID NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT review_helpful_votes_pkey PRIMARY KEY (id),
    CONSTRAINT review_helpful_votes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.course_reviews(id) ON DELETE CASCADE,
    CONSTRAINT review_helpful_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Course Analytics
CREATE TABLE IF NOT EXISTS public.course_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    enrollments INTEGER DEFAULT 0,
    completions INTEGER DEFAULT 0,
    revenue NUMERIC(10,2) DEFAULT 0.00,
    avg_watch_time_minutes NUMERIC(10,2) DEFAULT 0.00,
    bounce_rate NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT course_analytics_pkey PRIMARY KEY (id),
    CONSTRAINT course_analytics_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE
);

-- Lesson Attachments
CREATE TABLE IF NOT EXISTS public.lesson_attachments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('pdf', 'doc', 'zip', 'image', 'video', 'audio')),
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT lesson_attachments_pkey PRIMARY KEY (id),
    CONSTRAINT lesson_attachments_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.course_lessons(id) ON DELETE CASCADE
);

-- Lesson Progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    enrollment_id UUID NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    watch_time_seconds INTEGER DEFAULT 0,
    last_position_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT lesson_progress_pkey PRIMARY KEY (id),
    CONSTRAINT lesson_progress_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
    CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    CONSTRAINT lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrollment_id UUID NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('credit_card', 'paypal', 'stripe', 'bank_transfer')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    transaction_id VARCHAR(255),
    gateway_response JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE,
    CONSTRAINT payments_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
    CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- User Activity Logs
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID,
    lesson_id UUID,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('course_view', 'lesson_view', 'lesson_complete', 'quiz_attempt', 'download', 'review')),
    activity_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id),
    CONSTRAINT user_activity_logs_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE,
    CONSTRAINT user_activity_logs_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    CONSTRAINT user_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Todos table
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT false,
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    tags TEXT[],
    parent_id UUID,
    order_index INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT todos_pkey PRIMARY KEY (id),
    CONSTRAINT todos_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.todos(id) ON DELETE CASCADE,
    CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Checklist Items
CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    todo_id UUID NOT NULL,
    text VARCHAR(500) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    note TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT checklist_items_pkey PRIMARY KEY (id),
    CONSTRAINT checklist_items_todo_id_fkey FOREIGN KEY (todo_id) REFERENCES public.todos(id) ON DELETE CASCADE
);

-- Wallets
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL,
    balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT wallets_pkey PRIMARY KEY (id),
    CONSTRAINT wallets_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Wallet Transactions (Note: using bigint id as per schema)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
    wallet_id UUID NOT NULL,
    user_id UUID NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
    amount NUMERIC(15,2) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    reference_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE CASCADE
);

-- Contact Email Categories
CREATE TABLE IF NOT EXISTS public.contact_email_categories (
    id INTEGER NOT NULL DEFAULT nextval('contact_email_categories_id_seq'),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) DEFAULT 'primary',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT contact_email_categories_pkey PRIMARY KEY (id),
    CONSTRAINT contact_email_categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Contact Emails
CREATE TABLE IF NOT EXISTS public.contact_emails (
    id INTEGER NOT NULL DEFAULT nextval('contact_emails_id_seq'),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    notes TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT contact_emails_pkey PRIMARY KEY (id),
    CONSTRAINT contact_emails_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Activity Emails
CREATE TABLE IF NOT EXISTS public.activity_emails (
    id INTEGER NOT NULL DEFAULT nextval('activity_emails_id_seq'),
    activity_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    to_emails TEXT[] NOT NULL,
    cc_emails TEXT[] DEFAULT '{}',
    bcc_emails TEXT[] DEFAULT '{}',
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'sent',
    CONSTRAINT activity_emails_pkey PRIMARY KEY (id),
    CONSTRAINT activity_emails_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE,
    CONSTRAINT activity_emails_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Activity Notes
CREATE TABLE IF NOT EXISTS public.activity_notes (
    id INTEGER NOT NULL DEFAULT nextval('activity_notes_id_seq'),
    activity_id BIGINT NOT NULL,
    user_id UUID,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT,
    email_uid TEXT,
    CONSTRAINT activity_notes_pkey PRIMARY KEY (id),
    CONSTRAINT activity_notes_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE,
    CONSTRAINT activity_notes_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Kanban Tasks
CREATE TABLE IF NOT EXISTS public.kanban_tasks (
    id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status TEXT,
    summary TEXT,
    type TEXT,
    priority TEXT,
    tags TEXT,
    estimate TEXT,
    assignee TEXT,
    rank_id TEXT,
    CONSTRAINT kanban_tasks_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- SECTION 5: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Companies indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON public.companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_leader_id ON public.companies(leader_id);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON public.activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_priority ON public.activities(priority);
CREATE INDEX IF NOT EXISTS idx_activities_activity_start ON public.activities(activity_start);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_register_at ON public.customers(register_at DESC);

-- Customer Data Templates indexes
CREATE INDEX IF NOT EXISTS idx_customer_data_templates_key ON public.customer_data_templates(key);
CREATE INDEX IF NOT EXISTS idx_customer_data_templates_group ON public.customer_data_templates("group");

-- Customer Details indexes
CREATE INDEX IF NOT EXISTS idx_customer_details_customer_id ON public.customer_details(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_details_template_id ON public.customer_details(customer_data_template_id);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON public.courses(is_featured);

-- Course Sections indexes
CREATE INDEX IF NOT EXISTS idx_course_sections_course_id ON public.course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sections_sort_order ON public.course_sections(sort_order);

-- Course Lessons indexes
CREATE INDEX IF NOT EXISTS idx_course_lessons_section_id ON public.course_lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_sort_order ON public.course_lessons(sort_order);

-- Course Enrollments indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_payment_status ON public.course_enrollments(payment_status);

-- Course Reviews indexes
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON public.course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON public.course_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_rating ON public.course_reviews(rating);

-- Lesson Progress indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment_id ON public.lesson_progress(enrollment_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON public.payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON public.payments(payment_status);

-- Todos indexes
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_parent_id ON public.todos(parent_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON public.todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON public.todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(due_date);

-- Checklist Items indexes
CREATE INDEX IF NOT EXISTS idx_checklist_items_todo_id ON public.checklist_items(todo_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_completed ON public.checklist_items(completed);

-- Wallets indexes
CREATE INDEX IF NOT EXISTS idx_wallets_owner_id ON public.wallets(owner_id);
CREATE INDEX IF NOT EXISTS idx_wallets_currency ON public.wallets(currency);
CREATE INDEX IF NOT EXISTS idx_wallets_is_active ON public.wallets(is_active);

-- Wallet Transactions indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON public.wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

-- Contact Emails indexes
CREATE INDEX IF NOT EXISTS idx_contact_emails_user_id ON public.contact_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_emails_email ON public.contact_emails(email);
CREATE INDEX IF NOT EXISTS idx_contact_emails_category ON public.contact_emails(category);

-- Contact Email Categories indexes
CREATE INDEX IF NOT EXISTS idx_contact_email_categories_user_id ON public.contact_email_categories(user_id);

-- Activity Emails indexes
CREATE INDEX IF NOT EXISTS idx_activity_emails_activity_id ON public.activity_emails(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_emails_user_id ON public.activity_emails(user_id);

-- Activity Notes indexes
CREATE INDEX IF NOT EXISTS idx_activity_notes_activity_id ON public.activity_notes(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_notes_user_id ON public.activity_notes(user_id);

-- ============================================================================
-- SECTION 6: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_data_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_email_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 7: CREATE RLS POLICIES
-- ============================================================================

-- Users policies
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
CREATE POLICY "Users can view all users" ON public.users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Companies policies
DROP POLICY IF EXISTS "Users can view companies they belong to or lead" ON public.companies;
CREATE POLICY "Users can view companies they belong to or lead" ON public.companies
    FOR SELECT USING (
        id IN (SELECT company_id FROM public.users WHERE id = auth.uid())
        OR leader_id = auth.uid()
    );

DROP POLICY IF EXISTS "Company leaders can insert companies" ON public.companies;
CREATE POLICY "Company leaders can insert companies" ON public.companies
    FOR INSERT WITH CHECK (leader_id = auth.uid());

DROP POLICY IF EXISTS "Company leaders can update their companies" ON public.companies;
CREATE POLICY "Company leaders can update their companies" ON public.companies
    FOR UPDATE USING (leader_id = auth.uid());

-- Activities policies
DROP POLICY IF EXISTS "Users can view all activities" ON public.activities;
CREATE POLICY "Users can view all activities" ON public.activities
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert activities" ON public.activities;
CREATE POLICY "Users can insert activities" ON public.activities
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update activities" ON public.activities;
CREATE POLICY "Users can update activities" ON public.activities
    FOR UPDATE USING (true);

-- Customers policies
DROP POLICY IF EXISTS "Users can view all customers" ON public.customers;
CREATE POLICY "Users can view all customers" ON public.customers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert customers" ON public.customers;
CREATE POLICY "Users can insert customers" ON public.customers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update customers" ON public.customers;
CREATE POLICY "Users can update customers" ON public.customers
    FOR UPDATE USING (true);

-- Customer Data Templates policies
DROP POLICY IF EXISTS "Users can view all customer data templates" ON public.customer_data_templates;
CREATE POLICY "Users can view all customer data templates" ON public.customer_data_templates
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert customer data templates" ON public.customer_data_templates;
CREATE POLICY "Users can insert customer data templates" ON public.customer_data_templates
    FOR INSERT WITH CHECK (true);

-- Customer Details policies
DROP POLICY IF EXISTS "Users can view all customer details" ON public.customer_details;
CREATE POLICY "Users can view all customer details" ON public.customer_details
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert customer details" ON public.customer_details;
CREATE POLICY "Users can insert customer details" ON public.customer_details
    FOR INSERT WITH CHECK (true);

-- Todos policies
DROP POLICY IF EXISTS "Users can view their own todos" ON public.todos;
CREATE POLICY "Users can view their own todos" ON public.todos
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own todos" ON public.todos;
CREATE POLICY "Users can insert their own todos" ON public.todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own todos" ON public.todos;
CREATE POLICY "Users can update their own todos" ON public.todos
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own todos" ON public.todos;
CREATE POLICY "Users can delete their own todos" ON public.todos
    FOR DELETE USING (auth.uid() = user_id);

-- Checklist Items policies
DROP POLICY IF EXISTS "Users can view checklist items from their todos" ON public.checklist_items;
CREATE POLICY "Users can view checklist items from their todos" ON public.checklist_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.todos 
            WHERE todos.id = checklist_items.todo_id 
            AND todos.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert checklist items to their todos" ON public.checklist_items;
CREATE POLICY "Users can insert checklist items to their todos" ON public.checklist_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.todos 
            WHERE todos.id = checklist_items.todo_id 
            AND todos.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update checklist items from their todos" ON public.checklist_items;
CREATE POLICY "Users can update checklist items from their todos" ON public.checklist_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.todos 
            WHERE todos.id = checklist_items.todo_id 
            AND todos.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete checklist items from their todos" ON public.checklist_items;
CREATE POLICY "Users can delete checklist items from their todos" ON public.checklist_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.todos 
            WHERE todos.id = checklist_items.todo_id 
            AND todos.user_id = auth.uid()
        )
    );

-- Wallets policies
DROP POLICY IF EXISTS "Users can view their own wallets" ON public.wallets;
CREATE POLICY "Users can view their own wallets" ON public.wallets
    FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own wallets" ON public.wallets;
CREATE POLICY "Users can insert their own wallets" ON public.wallets
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own wallets" ON public.wallets;
CREATE POLICY "Users can update their own wallets" ON public.wallets
    FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own wallets" ON public.wallets;
CREATE POLICY "Users can delete their own wallets" ON public.wallets
    FOR DELETE USING (auth.uid() = owner_id);

-- Wallet Transactions policies
DROP POLICY IF EXISTS "Users can view transactions from their wallets" ON public.wallet_transactions;
CREATE POLICY "Users can view transactions from their wallets" ON public.wallet_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.wallets 
            WHERE wallets.id = wallet_transactions.wallet_id 
            AND wallets.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert transactions to their wallets" ON public.wallet_transactions;
CREATE POLICY "Users can insert transactions to their wallets" ON public.wallet_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.wallets 
            WHERE wallets.id = wallet_transactions.wallet_id 
            AND wallets.owner_id = auth.uid()
        )
    );

-- Contact Emails policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contact_emails;
CREATE POLICY "Users can view their own contacts" ON public.contact_emails
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contact_emails;
CREATE POLICY "Users can insert their own contacts" ON public.contact_emails
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contact_emails;
CREATE POLICY "Users can update their own contacts" ON public.contact_emails
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contact_emails;
CREATE POLICY "Users can delete their own contacts" ON public.contact_emails
    FOR DELETE USING (user_id = auth.uid());

-- Contact Email Categories policies
DROP POLICY IF EXISTS "Users can view their own categories" ON public.contact_email_categories;
CREATE POLICY "Users can view their own categories" ON public.contact_email_categories
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own categories" ON public.contact_email_categories;
CREATE POLICY "Users can insert their own categories" ON public.contact_email_categories
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Course policies (basic - adjust as needed)
DROP POLICY IF EXISTS "Users can view active courses" ON public.courses;
CREATE POLICY "Users can view active courses" ON public.courses
    FOR SELECT USING (status = 'Active' OR instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

-- Add more course-related policies as needed based on your requirements

-- ============================================================================
-- SECTION 8: CREATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp (generic)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update companies updated_at
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update wallet balance on transaction
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'credit' THEN
            UPDATE public.wallets 
            SET balance = balance + NEW.amount, updated_at = NOW()
            WHERE id = NEW.wallet_id;
        ELSE
            UPDATE public.wallets 
            SET balance = balance - NEW.amount, updated_at = NOW()
            WHERE id = NEW.wallet_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.type = 'credit' AND NEW.type = 'credit' THEN
            UPDATE public.wallets 
            SET balance = balance - OLD.amount + NEW.amount, updated_at = NOW()
            WHERE id = NEW.wallet_id;
        ELSIF OLD.type = 'debit' AND NEW.type = 'debit' THEN
            UPDATE public.wallets 
            SET balance = balance + OLD.amount - NEW.amount, updated_at = NOW()
            WHERE id = NEW.wallet_id;
        ELSIF OLD.type = 'credit' AND NEW.type = 'debit' THEN
            UPDATE public.wallets 
            SET balance = balance - OLD.amount - NEW.amount, updated_at = NOW()
            WHERE id = NEW.wallet_id;
        ELSIF OLD.type = 'debit' AND NEW.type = 'credit' THEN
            UPDATE public.wallets 
            SET balance = balance + OLD.amount + NEW.amount, updated_at = NOW()
            WHERE id = NEW.wallet_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.type = 'credit' THEN
            UPDATE public.wallets 
            SET balance = balance - OLD.amount, updated_at = NOW()
            WHERE id = OLD.wallet_id;
        ELSE
            UPDATE public.wallets 
            SET balance = balance + OLD.amount, updated_at = NOW()
            WHERE id = OLD.wallet_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to validate transaction amount
CREATE OR REPLACE FUNCTION validate_transaction_amount()
RETURNS TRIGGER AS $$
DECLARE
    current_balance NUMERIC(15,2);
BEGIN
    IF NEW.amount <= 0 THEN
        RAISE EXCEPTION 'Transaction amount must be greater than 0';
    END IF;
    
    IF NEW.type = 'debit' THEN
        SELECT balance INTO current_balance FROM public.wallets WHERE id = NEW.wallet_id;
        IF current_balance - NEW.amount < 0 THEN
            RAISE EXCEPTION 'Insufficient funds in wallet';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get todo with subtasks recursively
CREATE OR REPLACE FUNCTION get_todo_with_subtasks(todo_uuid UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title VARCHAR,
    description TEXT,
    completed BOOLEAN,
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR,
    tags TEXT[],
    parent_id UUID,
    order_index INTEGER,
    color VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE todo_tree AS (
        SELECT 
            t.id, t.user_id, t.title, t.description, t.completed, t.due_date,
            t.priority, t.tags, t.parent_id, t.order_index, t.color,
            t.created_at, t.updated_at, 0 AS level
        FROM public.todos t
        WHERE t.id = todo_uuid
        
        UNION ALL
        
        SELECT 
            t.id, t.user_id, t.title, t.description, t.completed, t.due_date,
            t.priority, t.tags, t.parent_id, t.order_index, t.color,
            t.created_at, t.updated_at, tt.level + 1 AS level
        FROM public.todos t
        INNER JOIN todo_tree tt ON t.parent_id = tt.id
    )
    SELECT * FROM todo_tree ORDER BY level, order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at columns
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION update_companies_updated_at();

CREATE TRIGGER trigger_update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_customer_data_templates_updated_at
    BEFORE UPDATE ON public.customer_data_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_customer_details_updated_at
    BEFORE UPDATE ON public.customer_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_todos_updated_at
    BEFORE UPDATE ON public.todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_checklist_items_updated_at
    BEFORE UPDATE ON public.checklist_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_wallets_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_wallet_transactions_updated_at
    BEFORE UPDATE ON public.wallet_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_contact_emails_updated_at
    BEFORE UPDATE ON public.contact_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_contact_email_categories_updated_at
    BEFORE UPDATE ON public.contact_email_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_activity_notes_updated_at
    BEFORE UPDATE ON public.activity_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Wallet transaction triggers
CREATE TRIGGER trigger_update_wallet_balance
    AFTER INSERT OR UPDATE OR DELETE ON public.wallet_transactions
    FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

CREATE TRIGGER trigger_validate_transaction_amount
    BEFORE INSERT OR UPDATE ON public.wallet_transactions
    FOR EACH ROW EXECUTE FUNCTION validate_transaction_amount();

-- ============================================================================
-- SECTION 9: CREATE VIEWS
-- ============================================================================

-- View: Companies with leaders
CREATE OR REPLACE VIEW companies_with_leaders AS
SELECT 
    c.*,
    u.first_name as leader_first_name,
    u.last_name as leader_last_name,
    u.email as leader_email,
    u.avatar as leader_avatar
FROM public.companies c
LEFT JOIN public.users u ON c.leader_id = u.id;

-- View: Customers with details
CREATE OR REPLACE VIEW customers_with_details AS
SELECT 
    c.id as customer_id,
    c.name as customer_name,
    c.register_at,
    c.created_at as customer_created_at,
    c.updated_at as customer_updated_at,
    json_agg(
        json_build_object(
            'detail_id', cd.id,
            'template_id', cdt.id,
            'template_title', cdt.title,
            'template_key', cdt.key,
            'value', cd.value,
            'created_at', cd.created_at,
            'updated_at', cd.updated_at
        )
    ) FILTER (WHERE cd.id IS NOT NULL) as details
FROM public.customers c
LEFT JOIN public.customer_details cd ON c.id = cd.customer_id
LEFT JOIN public.customer_data_templates cdt ON cd.customer_data_template_id = cdt.id
GROUP BY c.id, c.name, c.register_at, c.created_at, c.updated_at;

-- View: Todos with checklist count
CREATE OR REPLACE VIEW todos_with_checklist_count AS
SELECT 
    t.*,
    COUNT(ci.id) FILTER (WHERE ci.completed = false) AS incomplete_checklist_count,
    COUNT(ci.id) FILTER (WHERE ci.completed = true) AS complete_checklist_count,
    COUNT(ci.id) AS total_checklist_count
FROM public.todos t
LEFT JOIN public.checklist_items ci ON t.id = ci.todo_id
GROUP BY t.id;

-- View: Todos with subtask count
CREATE OR REPLACE VIEW todos_with_subtask_count AS
SELECT 
    t.*,
    COUNT(st.id) FILTER (WHERE st.completed = false) AS incomplete_subtask_count,
    COUNT(st.id) FILTER (WHERE st.completed = true) AS complete_subtask_count,
    COUNT(st.id) AS total_subtask_count
FROM public.todos t
LEFT JOIN public.todos st ON st.parent_id = t.id
GROUP BY t.id;

-- ============================================================================
-- SECTION 10: GRANT PERMISSIONS
-- ============================================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Grant view permissions
GRANT SELECT ON companies_with_leaders TO authenticated;
GRANT SELECT ON customers_with_details TO authenticated;
GRANT SELECT ON todos_with_checklist_count TO authenticated;
GRANT SELECT ON todos_with_subtask_count TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION get_todo_with_subtasks(UUID) TO authenticated;

-- ============================================================================
-- SECTION 11: INSERT DEFAULT DATA (OPTIONAL)
-- ============================================================================

-- Insert default activity priorities
INSERT INTO public.activity_priorities (title, description, level, color) VALUES
    ('Low', 'Low priority activity', 1, '#6c757d'),
    ('Medium', 'Medium priority activity', 2, '#ffc107'),
    ('High', 'High priority activity', 3, '#dc3545'),
    ('Urgent', 'Urgent priority activity', 4, '#721c24')
ON CONFLICT (title) DO NOTHING;

-- Insert default activity statuses
INSERT INTO public.activity_statuses (title, description, is_active, level, color) VALUES
    ('Not Started', 'Activity has not been started', true, 1, 'secondary'),
    ('In Progress', 'Activity is currently in progress', true, 2, 'primary'),
    ('Completed', 'Activity has been completed', true, 3, 'success'),
    ('On Hold', 'Activity is on hold', true, 4, 'warning'),
    ('Cancelled', 'Activity has been cancelled', true, 5, 'danger')
ON CONFLICT (title) DO NOTHING;

-- Insert default customer data templates
INSERT INTO public.customer_data_templates (title, key, "group") VALUES
    ('Email', 'email', 'Contact'),
    ('Phone', 'phone', 'Contact'),
    ('Address', 'address', 'Contact'),
    ('Company', 'company', 'Business'),
    ('Notes', 'notes', 'General')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- END OF SETUP SCRIPT
-- ============================================================================
-- 
-- Next steps:
-- 1. Verify all tables were created successfully
-- 2. Adjust RLS policies based on your security requirements
-- 3. Add any additional indexes based on your query patterns
-- 4. Insert initial data as needed
-- 5. Set up any additional triggers or functions specific to your use case
--
-- ============================================================================

