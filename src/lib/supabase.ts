import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface Pet {
  id: string
  user_id?: string
  name: string
  type: 'dog' | 'cat' | 'panda' | 'dinosaur' | 'rabbit' | 'capybara' | 'bird' | 'hamster' | 'fish'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  birth_time: number
  last_update_time: number
  stage: 'baby' | 'adult' | 'elder'
  intimacy: number
  created_at?: string
  updated_at?: string
}

export interface PetStats {
  pet_id: string
  hunger: number
  happiness: number
  cleanliness: number
  health: number
  energy: number
  experience?: number
  level?: number
  life_stage?: string
  updated_at?: string
}

export interface InteractionLog {
  id: string
  pet_id: string
  device_id?: string
  type: 'feed' | 'touch' | 'hug' | 'clean' | 'play' | 'gift' | 'sing'
  timestamp: number
  effect: Partial<PetStats>
  sensor_data?: any
  created_at?: string
}

export interface GameRecord {
  id: string
  pet_id: string
  device_id?: string
  game_type: string
  score: number
  reward: {
    food?: number
    happiness?: number
    intimacy?: number
  }
  timestamp: number
  created_at?: string
}