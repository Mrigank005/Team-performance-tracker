-- =====================================================
-- SUPABASE DATABASE SCHEMA
-- Performance Tracker Application
-- =====================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Members Table
-- Stores information about team members
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  contact TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks Table
-- Stores task information
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not-started', 'in-progress', 'review', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Assignments Table
-- Many-to-Many relationship between tasks and members
CREATE TABLE task_assignments (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, member_id)
);

-- Subtasks Table
-- Stores subtasks for each task
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Attachments Table
-- Stores file attachments for tasks
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  base64_data TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings Table
-- Stores performance ratings for members on tasks
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  quality INTEGER CHECK (quality BETWEEN 1 AND 5),
  timeliness INTEGER CHECK (timeliness BETWEEN 1 AND 5),
  communication INTEGER CHECK (communication BETWEEN 1 AND 5),
  initiative INTEGER CHECK (initiative BETWEEN 1 AND 5),
  comments TEXT,
  mode TEXT CHECK (mode IN ('daily', 'final')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_member ON task_assignments(member_id);
CREATE INDEX idx_subtasks_task ON subtasks(task_id);
CREATE INDEX idx_attachments_task ON task_attachments(task_id);
CREATE INDEX idx_ratings_task ON ratings(task_id);
CREATE INDEX idx_ratings_member ON ratings(member_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECURITY POLICIES
-- =====================================================
-- These policies allow all operations for public access
-- Modify these later if you add authentication

-- Members Policies
CREATE POLICY "Enable read access for all users" ON members FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON members FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON members FOR DELETE USING (true);

-- Tasks Policies
CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON tasks FOR DELETE USING (true);

-- Task Assignments Policies
CREATE POLICY "Enable read access for all users" ON task_assignments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON task_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON task_assignments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON task_assignments FOR DELETE USING (true);

-- Subtasks Policies
CREATE POLICY "Enable read access for all users" ON subtasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON subtasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON subtasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON subtasks FOR DELETE USING (true);

-- Attachments Policies
CREATE POLICY "Enable read access for all users" ON task_attachments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON task_attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON task_attachments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON task_attachments FOR DELETE USING (true);

-- Ratings Policies
CREATE POLICY "Enable read access for all users" ON ratings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON ratings FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON ratings FOR DELETE USING (true);

-- =====================================================
-- COMPLETED!
-- =====================================================
-- Your database schema is now ready!
-- Next steps:
-- 1. Verify tables in Table Editor
-- 2. Configure your app with environment variables
-- 3. Start building!
