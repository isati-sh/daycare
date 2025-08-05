-- Migration: 002_update_existing_tables.sql
-- Description: Update existing tables to match current database.ts schema
-- Created: 2025-08-04

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================
-- Create all enum types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('parent', 'teacher', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE child_age_group AS ENUM ('infant', 'toddler', 'preschool');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE child_status AS ENUM ('active', 'inactive', 'waitlist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mood_type AS ENUM ('happy', 'sad', 'tired', 'energetic', 'neutral', 'fussy', 'excited');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE behavior_type AS ENUM ('excellent', 'good', 'fair', 'needs_attention');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE activity_category AS ENUM ('art', 'music', 'outdoor', 'learning', 'sensory', 'physical', 'dramatic_play', 'science');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_type AS ENUM ('injury', 'behavioral', 'medical', 'accident', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'check', 'card', 'bank_transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE announcement_type AS ENUM ('general', 'event', 'reminder', 'emergency');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE target_audience AS ENUM ('all', 'parents', 'teachers', 'specific_age_group');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'waitlisted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contact_status AS ENUM ('new', 'read', 'replied', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE portfolio_category AS ENUM ('art', 'learning', 'physical', 'social', 'milestone');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE milestone_category AS ENUM ('physical', 'cognitive', 'social', 'language', 'emotional');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'early_pickup');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  site_role user_role DEFAULT 'parent',
  phone TEXT,
  address TEXT,
  emergency_contact TEXT,
  active_status BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age_group child_age_group,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id),
  status child_status DEFAULT 'active',
  enrollment_date DATE DEFAULT CURRENT_DATE,
  allergies TEXT[],
  medical_notes TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_logs table
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meals JSONB DEFAULT '[]',
  drinks JSONB DEFAULT '[]',
  naps JSONB DEFAULT '{"morning_start": null, "morning_end": null, "afternoon_start": null, "afternoon_end": null}',
  activities TEXT[] DEFAULT '{}',
  notes TEXT,
  mood mood_type DEFAULT 'neutral',
  behavior behavior_type,
  sickness TEXT,
  medications TEXT,
  bathroom_visits INTEGER DEFAULT 0,
  diaper_changes INTEGER,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, date, teacher_id)
);

-- Create teacher_assignments table
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(teacher_id, child_id)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status attendance_status NOT NULL,
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(child_id, date)
);

-- Create portfolio_entries table
CREATE TABLE IF NOT EXISTS portfolio_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category portfolio_category NOT NULL,
    date DATE NOT NULL,
    photos TEXT[],
    teacher_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create development_milestones table
CREATE TABLE IF NOT EXISTS development_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    category milestone_category NOT NULL,
    milestone TEXT NOT NULL,
    achieved_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create incident_reports table
CREATE TABLE IF NOT EXISTS incident_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    type incident_type NOT NULL,
    description TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    parent_notified BOOLEAN DEFAULT false,
    parent_notification_time TIMESTAMPTZ,
    reported_by UUID NOT NULL REFERENCES profiles(id),
    severity severity_level NOT NULL,
    follow_up_required BOOLEAN DEFAULT false,
    photos TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create planned_activities table
CREATE TABLE IF NOT EXISTS planned_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category activity_category NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    age_groups TEXT[] NOT NULL,
    max_participants INTEGER,
    materials_needed TEXT[] DEFAULT '{}',
    learning_objectives TEXT[] DEFAULT '{}',
    teacher_notes TEXT,
    date DATE NOT NULL,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    weather_dependent BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_schedules table
CREATE TABLE IF NOT EXISTS daily_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    age_group TEXT NOT NULL,
    meals JSONB NOT NULL DEFAULT '{"breakfast_time": "08:00", "lunch_time": "12:00", "snack_time": "15:00"}',
    naps JSONB NOT NULL DEFAULT '{"morning_start": "09:30", "morning_end": "10:30", "afternoon_start": "13:00", "afternoon_end": "15:00"}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, age_group)
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category activity_category NOT NULL,
    age_groups TEXT[] NOT NULL,
    materials_needed TEXT[] DEFAULT '{}',
    learning_objectives TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type announcement_type NOT NULL,
    target_audience target_audience NOT NULL,
    age_group TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status contact_status DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enrollment_applications table
CREATE TABLE IF NOT EXISTS enrollment_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    child_first_name TEXT NOT NULL,
    child_last_name TEXT NOT NULL,
    child_date_of_birth DATE NOT NULL,
    preferred_start_date DATE NOT NULL,
    age_group child_age_group NOT NULL,
    status application_status DEFAULT 'pending',
    application_date DATE DEFAULT CURRENT_DATE,
    reviewed_by UUID REFERENCES profiles(id),
    review_date DATE,
    review_notes TEXT,
    priority_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create billing table
CREATE TABLE IF NOT EXISTS billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status billing_status DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_method payment_method,
    late_fees DECIMAL(10,2) DEFAULT 0,
    discounts DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

-- First, drop ALL existing policies to prevent conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Create SERVICE ROLE bypass policies FIRST (these work without user context)
CREATE POLICY "service_role_bypass" ON profiles FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON children FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON daily_logs FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON teacher_assignments FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON attendance FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON portfolio_entries FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON development_milestones FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON incident_reports FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON planned_activities FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON daily_schedules FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON activities FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON announcements FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON messages FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON contact_submissions FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON enrollment_applications FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_bypass" ON billing FOR ALL TO service_role USING (true);

-- PROFILES policies (CRITICAL: No role-based checks to avoid recursion)
CREATE POLICY "profiles_own_access" ON profiles 
  FOR ALL USING (auth.uid() = id);

-- CHILDREN policies (Direct ownership checks only)
CREATE POLICY "children_parent_access" ON children 
  FOR ALL USING (parent_id = auth.uid());

CREATE POLICY "children_teacher_access" ON children 
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "children_teacher_update" ON children 
  FOR UPDATE USING (teacher_id = auth.uid());

-- DAILY_LOGS policies
CREATE POLICY "daily_logs_parent_view" ON daily_logs 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM children WHERE id = child_id AND parent_id = auth.uid())
  );

CREATE POLICY "daily_logs_teacher_access" ON daily_logs 
  FOR ALL USING (
    teacher_id = auth.uid() OR
    EXISTS (SELECT 1 FROM children WHERE id = child_id AND teacher_id = auth.uid())
  );

-- TEACHER_ASSIGNMENTS policies
CREATE POLICY "teacher_assignments_access" ON teacher_assignments 
  FOR ALL USING (teacher_id = auth.uid());

-- ATTENDANCE policies
CREATE POLICY "attendance_parent_view" ON attendance 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM children WHERE id = child_id AND parent_id = auth.uid())
  );

CREATE POLICY "attendance_teacher_access" ON attendance 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM children WHERE id = child_id AND teacher_id = auth.uid())
  );

-- PORTFOLIO_ENTRIES policies
CREATE POLICY "portfolio_parent_view" ON portfolio_entries 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM children WHERE id = child_id AND parent_id = auth.uid())
  );

CREATE POLICY "portfolio_teacher_access" ON portfolio_entries 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM children WHERE id = child_id AND teacher_id = auth.uid())
  );

-- DEVELOPMENT_MILESTONES policies
CREATE POLICY "milestones_parent_view" ON development_milestones 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM children WHERE id = child_id AND parent_id = auth.uid())
  );

CREATE POLICY "milestones_teacher_access" ON development_milestones 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM children WHERE id = child_id AND teacher_id = auth.uid())
  );

-- INCIDENT_REPORTS policies
CREATE POLICY "incidents_parent_view" ON incident_reports 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM children WHERE id = child_id AND parent_id = auth.uid())
  );

CREATE POLICY "incidents_teacher_access" ON incident_reports 
  FOR ALL USING (
    reported_by = auth.uid() OR
    EXISTS (SELECT 1 FROM children WHERE id = child_id AND teacher_id = auth.uid())
  );

-- PLANNED_ACTIVITIES policies (open access for now)
CREATE POLICY "activities_creator_access" ON planned_activities 
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "activities_public_view" ON planned_activities 
  FOR SELECT USING (true);

-- DAILY_SCHEDULES policies (open view access)
CREATE POLICY "schedules_public_view" ON daily_schedules 
  FOR SELECT USING (true);

-- ACTIVITIES policies (open view access)
CREATE POLICY "activity_templates_view" ON activities 
  FOR SELECT USING (true);

-- ANNOUNCEMENTS policies
CREATE POLICY "announcements_creator_access" ON announcements 
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "announcements_public_view" ON announcements 
  FOR SELECT USING (true);

-- MESSAGES policies
CREATE POLICY "messages_participant_access" ON messages 
  FOR ALL USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid()
  );

-- CONTACT_SUBMISSIONS policies (open for everyone)
CREATE POLICY "contact_public_submit" ON contact_submissions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_public_view" ON contact_submissions 
  FOR SELECT USING (true);

-- ENROLLMENT_APPLICATIONS policies
CREATE POLICY "enrollment_parent_access" ON enrollment_applications 
  FOR ALL USING (parent_id = auth.uid());

CREATE POLICY "enrollment_public_view" ON enrollment_applications 
  FOR SELECT USING (true);

-- BILLING policies
CREATE POLICY "billing_parent_access" ON billing 
  FOR ALL USING (parent_id = auth.uid());

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon users for contact forms
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON contact_submissions TO anon;

-- Grant permissions to service_role for admin operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_children_teacher_id ON children(teacher_id);
CREATE INDEX IF NOT EXISTS idx_children_age_group ON children(age_group);
CREATE INDEX IF NOT EXISTS idx_children_status ON children(status);
CREATE INDEX IF NOT EXISTS idx_daily_logs_child_id ON daily_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_teacher_id ON daily_logs(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_child_id ON attendance(child_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_portfolio_entries_child_id ON portfolio_entries(child_id);
CREATE INDEX IF NOT EXISTS idx_development_milestones_child_id ON development_milestones(child_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher_id ON teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_child_id ON teacher_assignments(child_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_child_id ON incident_reports(child_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_date ON incident_reports(date);
CREATE INDEX IF NOT EXISTS idx_planned_activities_date ON planned_activities(date);
CREATE INDEX IF NOT EXISTS idx_planned_activities_created_by ON planned_activities(created_by);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_billing_parent_id ON billing(parent_id);
CREATE INDEX IF NOT EXISTS idx_billing_child_id ON billing(child_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_applications_parent_id ON enrollment_applications(parent_id);

-- Create or replace views
DROP VIEW IF EXISTS children_with_parents;
CREATE VIEW children_with_parents AS
SELECT 
    c.id as child_id,
    c.first_name,
    c.last_name,
    c.date_of_birth,
    c.age_group,
    c.status,
    c.enrollment_date,
    c.parent_id,
    p.full_name as parent_name,
    p.email as parent_email,
    p.phone as parent_phone,
    c.teacher_id,
    t.full_name as teacher_name,
    c.allergies,
    c.medical_notes
FROM children c
LEFT JOIN profiles p ON c.parent_id = p.id
LEFT JOIN profiles t ON c.teacher_id = t.id;

DROP VIEW IF EXISTS teacher_assignments_view;
CREATE VIEW teacher_assignments_view AS
SELECT 
    p.id as teacher_id,
    p.full_name as teacher_name,
    p.email as teacher_email,
    p.active_status as teacher_active,
    COUNT(ta.child_id) as assigned_children,
    ARRAY_AGG(DISTINCT (c.first_name || ' ' || c.last_name)) FILTER (WHERE c.id IS NOT NULL) as child_names,
    ARRAY_AGG(DISTINCT c.age_group::text) FILTER (WHERE c.age_group IS NOT NULL) as age_groups
FROM profiles p
LEFT JOIN teacher_assignments ta ON p.id = ta.teacher_id AND ta.status = 'active'
LEFT JOIN children c ON ta.child_id = c.id
WHERE p.site_role = 'teacher'
GROUP BY p.id, p.full_name, p.email, p.active_status;

DROP VIEW IF EXISTS daily_attendance_summary;
CREATE VIEW daily_attendance_summary AS
SELECT 
    a.date,
    COUNT(DISTINCT c.id) as total_enrolled,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
    COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
    ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END)::numeric / 
         NULLIF(COUNT(DISTINCT c.id), 0)) * 100, 2
    ) as attendance_rate
FROM attendance a
RIGHT JOIN children c ON a.child_id = c.id AND c.status = 'active'
GROUP BY a.date
ORDER BY a.date DESC;

DROP VIEW IF EXISTS billing_summary;
CREATE VIEW billing_summary AS
SELECT 
    p.id as parent_id,
    p.full_name as parent_name,
    p.email as parent_email,
    COALESCE(SUM(CASE WHEN b.status IN ('pending', 'overdue') THEN b.amount + b.late_fees - b.discounts END), 0) as total_outstanding,
    COALESCE(SUM(CASE WHEN b.status = 'overdue' THEN b.amount + b.late_fees - b.discounts END), 0) as overdue_amount,
    COUNT(DISTINCT c.id) as children_count,
    MAX(b.paid_date) as last_payment_date
FROM profiles p
LEFT JOIN children c ON p.id = c.parent_id
LEFT JOIN billing b ON p.id = b.parent_id
WHERE p.site_role = 'parent'
GROUP BY p.id, p.full_name, p.email;

-- Create or replace functions
CREATE OR REPLACE FUNCTION get_child_age_in_months(date_of_birth DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) * 12 + 
           EXTRACT(MONTH FROM AGE(CURRENT_DATE, date_of_birth));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_teacher_workload(input_teacher_id UUID)
RETURNS TABLE(
    teacher_id UUID,
    assigned_children INTEGER,
    age_groups TEXT[],
    workload_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ta.teacher_id,
        COUNT(ta.child_id)::INTEGER as assigned_children,
        ARRAY_AGG(DISTINCT c.age_group::text) as age_groups,
        SUM(CASE 
            WHEN c.age_group = 'infant' THEN 3
            WHEN c.age_group = 'toddler' THEN 2
            WHEN c.age_group = 'preschool' THEN 1
            ELSE 0
        END)::INTEGER as workload_score
    FROM teacher_assignments ta
    JOIN children c ON ta.child_id = c.id
    WHERE ta.teacher_id = input_teacher_id
    AND ta.status = 'active'
    AND c.status = 'active'
    GROUP BY ta.teacher_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_attendance_rate(
    child_id UUID,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE(
    total_days INTEGER,
    present_days INTEGER,
    attendance_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_days,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END)::INTEGER as present_days,
        ROUND(
            (COUNT(CASE WHEN a.status = 'present' THEN 1 END)::numeric / 
             NULLIF(COUNT(*), 0)) * 100, 2
        ) as attendance_rate
    FROM attendance a
    WHERE a.child_id = calculate_attendance_rate.child_id
    AND a.date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_billing_summary(parent_id UUID, year INTEGER)
RETURNS TABLE(
    total_billed DECIMAL,
    total_paid DECIMAL,
    outstanding DECIMAL,
    overdue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(b.amount + b.late_fees - b.discounts), 0) as total_billed,
        COALESCE(SUM(CASE WHEN b.status = 'paid' THEN b.amount + b.late_fees - b.discounts END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN b.status IN ('pending', 'overdue') THEN b.amount + b.late_fees - b.discounts END), 0) as outstanding,
        COALESCE(SUM(CASE WHEN b.status = 'overdue' THEN b.amount + b.late_fees - b.discounts END), 0) as overdue
    FROM billing b
    WHERE b.parent_id = get_billing_summary.parent_id
    AND EXTRACT(YEAR FROM b.billing_period_start) = year;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_children(search_term TEXT)
RETURNS TABLE(
    id UUID,
    first_name TEXT,
    last_name TEXT,
    parent_name TEXT,
    parent_email TEXT,
    age_group TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.first_name,
        c.last_name,
        p.full_name as parent_name,
        p.email as parent_email,
        c.age_group::text,
        c.status::text
    FROM children c
    LEFT JOIN profiles p ON c.parent_id = p.id
    WHERE 
        c.first_name ILIKE '%' || search_term || '%'
        OR c.last_name ILIKE '%' || search_term || '%'
        OR p.full_name ILIKE '%' || search_term || '%'
        OR p.email ILIKE '%' || search_term || '%'
    ORDER BY c.first_name, c.last_name;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps (only if they don't exist)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_children_updated_at ON children;
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_logs_updated_at ON daily_logs;
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teacher_assignments_updated_at ON teacher_assignments;
CREATE TRIGGER update_teacher_assignments_updated_at BEFORE UPDATE ON teacher_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance;
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolio_entries_updated_at ON portfolio_entries;
CREATE TRIGGER update_portfolio_entries_updated_at BEFORE UPDATE ON portfolio_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_development_milestones_updated_at ON development_milestones;
CREATE TRIGGER update_development_milestones_updated_at BEFORE UPDATE ON development_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_incident_reports_updated_at ON incident_reports;
CREATE TRIGGER update_incident_reports_updated_at BEFORE UPDATE ON incident_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_planned_activities_updated_at ON planned_activities;
CREATE TRIGGER update_planned_activities_updated_at BEFORE UPDATE ON planned_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_schedules_updated_at ON daily_schedules;
CREATE TRIGGER update_daily_schedules_updated_at BEFORE UPDATE ON daily_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollment_applications_updated_at ON enrollment_applications;
CREATE TRIGGER update_enrollment_applications_updated_at BEFORE UPDATE ON enrollment_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_billing_updated_at ON billing;
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON billing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to initialize user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Migration completed successfully
SELECT 'Migration 002_update_existing_tables.sql completed successfully' as status;