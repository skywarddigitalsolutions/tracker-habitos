-- ============================================================
-- GAMIFICACIÓN + SOCIAL: Migration
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Agregar XP y nivel a profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1;

-- 2. Badges ganados por usuario
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Friends see badges" ON user_badges FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
      AND (requester_id = auth.uid() AND addressee_id = user_id)
       OR (addressee_id = auth.uid() AND requester_id = user_id)
  )
);
CREATE POLICY "System inserts badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Animaciones entre amigos
CREATE TABLE IF NOT EXISTS encouragements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE encouragements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own encouragements" ON encouragements
  FOR ALL USING (auth.uid() = from_id OR auth.uid() = to_id);

-- 4. Desafíos entre amigos
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_user UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 21,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','completed','cancelled')),
  started_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenge participants" ON challenges
  FOR ALL USING (auth.uid() = created_by OR auth.uid() = invited_user);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_encouragements_to ON encouragements(to_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_users ON challenges(created_by, invited_user);
