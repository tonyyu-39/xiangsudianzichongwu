-- 创建宠物表
CREATE TABLE pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('cat', 'dog', 'rabbit', 'bird', 'hamster', 'fish')),
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  birth_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_alive BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建宠物状态表
CREATE TABLE pet_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  happiness INTEGER DEFAULT 50 CHECK (happiness >= 0 AND happiness <= 100),
  health INTEGER DEFAULT 50 CHECK (health >= 0 AND health <= 100),
  hunger INTEGER DEFAULT 50 CHECK (hunger >= 0 AND hunger <= 100),
  cleanliness INTEGER DEFAULT 50 CHECK (cleanliness >= 0 AND cleanliness <= 100),
  energy INTEGER DEFAULT 50 CHECK (energy >= 0 AND energy <= 100),
  experience INTEGER DEFAULT 0 CHECK (experience >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  age_days INTEGER DEFAULT 0 CHECK (age_days >= 0),
  life_stage VARCHAR(20) DEFAULT 'baby' CHECK (life_stage IN ('baby', 'child', 'adult', 'elder')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建互动记录表
CREATE TABLE interaction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('feed', 'clean', 'play', 'pet', 'medicine')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  happiness_change INTEGER DEFAULT 0,
  health_change INTEGER DEFAULT 0,
  hunger_change INTEGER DEFAULT 0,
  cleanliness_change INTEGER DEFAULT 0,
  energy_change INTEGER DEFAULT 0,
  experience_gained INTEGER DEFAULT 0
);

-- 创建游戏记录表
CREATE TABLE game_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  game_type VARCHAR(20) NOT NULL,
  score INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  result VARCHAR(20) CHECK (result IN ('win', 'lose', 'draw')),
  rewards_earned INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_pet_stats_pet_id ON pet_stats(pet_id);
CREATE INDEX idx_interaction_logs_pet_id ON interaction_logs(pet_id);
CREATE INDEX idx_interaction_logs_timestamp ON interaction_logs(timestamp);
CREATE INDEX idx_game_records_pet_id ON game_records(pet_id);
CREATE INDEX idx_game_records_timestamp ON game_records(timestamp);

-- 启用行级安全策略
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- pets表策略
CREATE POLICY "Users can view their own pets" ON pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets" ON pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets" ON pets
  FOR DELETE USING (auth.uid() = user_id);

-- pet_stats表策略
CREATE POLICY "Users can view their pets stats" ON pet_stats
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = pet_stats.pet_id AND pets.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their pets stats" ON pet_stats
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = pet_stats.pet_id AND pets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their pets stats" ON pet_stats
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = pet_stats.pet_id AND pets.user_id = auth.uid()
  ));

-- interaction_logs表策略
CREATE POLICY "Users can view their pets interactions" ON interaction_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = interaction_logs.pet_id AND pets.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their pets interactions" ON interaction_logs
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = interaction_logs.pet_id AND pets.user_id = auth.uid()
  ));

-- game_records表策略
CREATE POLICY "Users can view their pets game records" ON game_records
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = game_records.pet_id AND pets.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their pets game records" ON game_records
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM pets WHERE pets.id = game_records.pet_id AND pets.user_id = auth.uid()
  ));

-- 授予权限
GRANT SELECT, INSERT, UPDATE, DELETE ON pets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pet_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON interaction_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON game_records TO authenticated;

-- 为匿名用户授予基本权限（如果需要）
GRANT SELECT ON pets TO anon;
GRANT SELECT ON pet_stats TO anon;
GRANT SELECT ON interaction_logs TO anon;
GRANT SELECT ON game_records TO anon;