-- ChoreShare Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Households with personalisation and holiday mode
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE DEFAULT upper(substring(md5(random()::text) from 1 for 6)),
  member_count INT DEFAULT 1,
  pets JSONB DEFAULT '[]',
  holiday_mode BOOLEAN DEFAULT false,
  holiday_until TIMESTAMPTZ,
  streak_paused_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users linked to Clerk
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  total_points INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏠',
  color TEXT DEFAULT '#6366f1'
);

-- Tasks with customisable scheduling
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cleaning_level TEXT DEFAULT 'surface' CHECK (cleaning_level IN ('surface', 'deep')),
  effort_points INT DEFAULT 2 CHECK (effort_points BETWEEN 1 AND 5),
  suggested_frequency TEXT,
  suggested_level TEXT,
  recurrence_type TEXT CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'custom')),
  recurrence_days INT[],
  recurrence_interval INT DEFAULT 1,
  last_completed TIMESTAMPTZ,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  is_from_library BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Completion history
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  points_earned INT DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (true);

-- Households - members can read/update their household
CREATE POLICY "Members can read household" ON households
  FOR SELECT USING (true);

CREATE POLICY "Members can update household" ON households
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can create household" ON households
  FOR INSERT WITH CHECK (true);

-- Rooms - household members can CRUD
CREATE POLICY "Members can manage rooms" ON rooms
  FOR ALL USING (true);

-- Tasks - household members can CRUD
CREATE POLICY "Members can manage tasks" ON tasks
  FOR ALL USING (true);

-- Completions - household members can CRUD
CREATE POLICY "Members can manage completions" ON completions
  FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_household_id ON users(household_id);
CREATE INDEX idx_rooms_household_id ON rooms(household_id);
CREATE INDEX idx_tasks_room_id ON tasks(room_id);
CREATE INDEX idx_completions_task_id ON completions(task_id);
CREATE INDEX idx_completions_completed_by ON completions(completed_by);
