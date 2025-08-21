-- 修改pets表，允许user_id为空
ALTER TABLE pets ALTER COLUMN user_id DROP NOT NULL;

-- 删除现有的RLS策略
DROP POLICY IF EXISTS "Users can view their own pets" ON pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON pets;

DROP POLICY IF EXISTS "Users can view their pets stats" ON pet_stats;
DROP POLICY IF EXISTS "Users can insert their pets stats" ON pet_stats;
DROP POLICY IF EXISTS "Users can update their pets stats" ON pet_stats;

DROP POLICY IF EXISTS "Users can view their pets interactions" ON interaction_logs;
DROP POLICY IF EXISTS "Users can insert their pets interactions" ON interaction_logs;

DROP POLICY IF EXISTS "Users can view their pets game records" ON game_records;
DROP POLICY IF EXISTS "Users can insert their pets game records" ON game_records;

-- 创建新的RLS策略，支持无用户认证的操作
-- pets表策略
CREATE POLICY "Allow all operations on pets" ON pets
  FOR ALL USING (true)
  WITH CHECK (true);

-- pet_stats表策略
CREATE POLICY "Allow all operations on pet_stats" ON pet_stats
  FOR ALL USING (true)
  WITH CHECK (true);

-- interaction_logs表策略
CREATE POLICY "Allow all operations on interaction_logs" ON interaction_logs
  FOR ALL USING (true)
  WITH CHECK (true);

-- game_records表策略
CREATE POLICY "Allow all operations on game_records" ON game_records
  FOR ALL USING (true)
  WITH CHECK (true);

-- 为匿名用户授予完整权限
GRANT SELECT, INSERT, UPDATE, DELETE ON pets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON pet_stats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON interaction_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON game_records TO anon;