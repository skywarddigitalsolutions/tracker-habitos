-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  icon TEXT NOT NULL DEFAULT 'Circle',
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select" ON categories FOR SELECT USING (
  user_id IS NULL OR user_id = auth.uid()
);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (
  user_id = auth.uid()
);
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (
  user_id = auth.uid()
);

-- Seed default categories
INSERT INTO categories (id, name, color, icon, user_id) VALUES
  (1, 'Salud', '#22c55e', 'Heart', NULL),
  (2, 'Mindset', '#a855f7', 'Brain', NULL),
  (3, 'Profesional', '#3b82f6', 'Briefcase', NULL),
  (4, 'Familia', '#f97316', 'Home', NULL),
  (5, 'Social', '#ec4899', 'Users', NULL),
  (6, 'Finanzas', '#eab308', 'DollarSign', NULL),
  (7, 'Creatividad', '#06b6d4', 'Palette', NULL),
  (8, 'Otro', '#6b7280', 'Circle', NULL)
ON CONFLICT (id) DO NOTHING;

-- Update serial sequence
SELECT setval('categories_id_seq', 100);

-- ============================================================
-- HABITS
-- ============================================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category_id INT REFERENCES categories(id),
  color TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_category_id ON habits(category_id);
CREATE INDEX idx_habits_is_archived ON habits(is_archived);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits_select_own" ON habits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "habits_select_public" ON habits FOR SELECT USING (is_public = true);
CREATE POLICY "habits_insert_own" ON habits FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "habits_update_own" ON habits FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "habits_delete_own" ON habits FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- HABIT RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS habit_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

CREATE INDEX idx_habit_records_user_date ON habit_records(user_id, date);
CREATE INDEX idx_habit_records_habit_id ON habit_records(habit_id);

ALTER TABLE habit_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habit_records_select_own" ON habit_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "habit_records_insert_own" ON habit_records FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "habit_records_update_own" ON habit_records FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "habit_records_delete_own" ON habit_records FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- DAY RATINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS day_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_day_ratings_user_date ON day_ratings(user_id, date);

ALTER TABLE day_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "day_ratings_select_own" ON day_ratings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "day_ratings_insert_own" ON day_ratings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "day_ratings_update_own" ON day_ratings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "day_ratings_delete_own" ON day_ratings FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- WEEKLY SUMMARIES
-- ============================================================
CREATE TABLE IF NOT EXISTS weekly_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  avg_rating NUMERIC(3,2),
  total_habits INT NOT NULL DEFAULT 0,
  completed_habits INT NOT NULL DEFAULT 0,
  completion_rate NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

CREATE INDEX idx_weekly_summaries_user ON weekly_summaries(user_id, week_start);

ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "weekly_summaries_select_own" ON weekly_summaries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "weekly_summaries_insert" ON weekly_summaries FOR INSERT WITH CHECK (true);
CREATE POLICY "weekly_summaries_update" ON weekly_summaries FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- GOALS
-- ============================================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id INT REFERENCES categories(id),
  type TEXT NOT NULL CHECK (type IN ('mensual', 'trimestral', 'anual')),
  target_value NUMERIC NOT NULL DEFAULT 100,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_type ON goals(type);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goals_select_own" ON goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "goals_select_public" ON goals FOR SELECT USING (is_public = true);
CREATE POLICY "goals_insert_own" ON goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "goals_update_own" ON goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "goals_delete_own" ON goals FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- GOAL PROGRESS ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS goal_progress_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  note TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goal_progress_goal_id ON goal_progress_entries(goal_id);

ALTER TABLE goal_progress_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goal_progress_select_own" ON goal_progress_entries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "goal_progress_insert_own" ON goal_progress_entries FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- FRIENDSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friendships_select" ON friendships FOR SELECT USING (
  requester_id = auth.uid() OR addressee_id = auth.uid()
);
CREATE POLICY "friendships_insert" ON friendships FOR INSERT WITH CHECK (
  requester_id = auth.uid()
);
CREATE POLICY "friendships_update" ON friendships FOR UPDATE USING (
  addressee_id = auth.uid()
);
CREATE POLICY "friendships_delete" ON friendships FOR DELETE USING (
  requester_id = auth.uid() OR addressee_id = auth.uid()
);

-- ============================================================
-- EMAIL REPORT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS email_report_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  error_message TEXT
);

CREATE INDEX idx_email_logs_user ON email_report_logs(user_id);

ALTER TABLE email_report_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_logs_select_own" ON email_report_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "email_logs_insert" ON email_report_logs FOR INSERT WITH CHECK (true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_habit_records_updated_at BEFORE UPDATE ON habit_records
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_day_ratings_updated_at BEFORE UPDATE ON day_ratings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Update goal progress function
CREATE OR REPLACE FUNCTION update_goal_progress(
  p_goal_id UUID,
  p_value NUMERIC,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM goals WHERE id = p_goal_id;

  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO goal_progress_entries (goal_id, user_id, value, note)
  VALUES (p_goal_id, v_user_id, p_value, p_note);

  UPDATE goals
  SET
    current_value = p_value,
    is_completed = (p_value >= target_value),
    updated_at = NOW()
  WHERE id = p_goal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
