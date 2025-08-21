import { supabase } from './supabase'
import type { Pet, PetStats } from './supabase'

// 时间管理器类
export class TimeManager {
  private static instance: TimeManager
  private timeSpeed: number = 1
  private offlineCalculationEnabled: boolean = true
  private lastUpdateTime: number = Date.now()
  
  private constructor() {
    this.loadSettings()
  }
  
  static getInstance(): TimeManager {
    if (!TimeManager.instance) {
      TimeManager.instance = new TimeManager()
    }
    return TimeManager.instance
  }
  
  // 加载设置
  private loadSettings() {
    this.timeSpeed = parseFloat(localStorage.getItem('timeSpeed') || '1')
    this.offlineCalculationEnabled = localStorage.getItem('offlineCalculation') !== 'false'
    this.lastUpdateTime = parseInt(localStorage.getItem('lastUpdateTime') || Date.now().toString())
  }
  
  // 保存最后更新时间
  saveLastUpdateTime() {
    this.lastUpdateTime = Date.now()
    localStorage.setItem('lastUpdateTime', this.lastUpdateTime.toString())
  }
  
  // 计算离线时间（分钟）
  getOfflineMinutes(): number {
    if (!this.offlineCalculationEnabled) return 0
    
    const now = Date.now()
    const offlineMs = now - this.lastUpdateTime
    const offlineMinutes = Math.floor(offlineMs / (1000 * 60))
    
    // 最多计算24小时的离线时间
    return Math.min(offlineMinutes, 24 * 60)
  }
  
  // 计算状态衰减
  calculateStatusDecay(currentStats: PetStats, offlineMinutes: number): Partial<PetStats> {
    if (offlineMinutes <= 0) return {}
    
    // 基础衰减率（每小时）
    const baseDecayRates = {
      health: 2,    // 健康每小时减少2点
      happiness: 3, // 快乐每小时减少3点
      hunger: 5,    // 饱食度每小时减少5点（饥饿增加）
      cleanliness: 4 // 清洁每小时减少4点
    }
    
    // 应用时间速度
    const effectiveMinutes = offlineMinutes * this.timeSpeed
    const hours = effectiveMinutes / 60
    
    const newStats: Partial<PetStats> = {
      health: Math.max(0, currentStats.health - Math.floor(baseDecayRates.health * hours)),
      happiness: Math.max(0, currentStats.happiness - Math.floor(baseDecayRates.happiness * hours)),
      hunger: Math.max(0, currentStats.hunger - Math.floor(baseDecayRates.hunger * hours)), // 修复：饱食度应该减少
      cleanliness: Math.max(0, currentStats.cleanliness - Math.floor(baseDecayRates.cleanliness * hours))
    }
    
    return newStats
  }
  
  // 计算成长进度
  calculateGrowthProgress(pet: Pet, offlineMinutes: number): { newStage?: string; experienceGain: number } {
    if (offlineMinutes <= 0) return { experienceGain: 0 }
    
    const effectiveMinutes = offlineMinutes * this.timeSpeed
    const hours = effectiveMinutes / 60
    
    // 基础经验获得（每小时1点）
    const experienceGain = Math.floor(hours * 1)
    
    // 计算游戏内年龄（天）- 1小时真实时间 = 1天游戏时间
    const realHoursAlive = (Date.now() - new Date(pet.birth_time).getTime()) / (1000 * 60 * 60)
    const gameAgeInDays = Math.floor(realHoursAlive * this.timeSpeed)
    
    let newStage = pet.stage
    
    // 成长阶段判断（基于游戏内时间）
    if (gameAgeInDays >= 30 && pet.stage === 'baby') {
      newStage = 'adult'
    } else if (gameAgeInDays >= 90 && pet.stage === 'adult') {
      newStage = 'elder'
    }
    
    return {
      newStage: newStage !== pet.stage ? newStage : undefined,
      experienceGain
    }
  }
  
  // 应用离线计算
  async applyOfflineCalculation(pet: Pet, currentStats: PetStats): Promise<{
    updatedStats: PetStats;
    updatedPet?: Pet;
    offlineMinutes: number;
    changes: string[];
  }> {
    const offlineMinutes = this.getOfflineMinutes()
    const changes: string[] = []
    
    if (offlineMinutes <= 0) {
      return {
        updatedStats: currentStats,
        offlineMinutes: 0,
        changes: []
      }
    }
    
    // 如果离线时间少于30分钟，不应用衰减
    if (offlineMinutes < 30) {
      return {
        updatedStats: currentStats,
        offlineMinutes,
        changes: ['离线时间太短，状态未发生变化']
      }
    }
    
    // 计算状态衰减
    const statusDecay = this.calculateStatusDecay(currentStats, offlineMinutes)
    const updatedStats: PetStats = {
      ...currentStats,
      ...statusDecay
    }
    
    // 记录状态变化
    if (statusDecay.health !== undefined && statusDecay.health < currentStats.health) {
      changes.push(`健康下降了 ${currentStats.health - statusDecay.health} 点`)
    }
    if (statusDecay.happiness !== undefined && statusDecay.happiness < currentStats.happiness) {
      changes.push(`快乐下降了 ${currentStats.happiness - statusDecay.happiness} 点`)
    }
    if (statusDecay.hunger !== undefined && statusDecay.hunger < currentStats.hunger) {
      changes.push(`饱食度下降了 ${currentStats.hunger - statusDecay.hunger} 点`)
    }
    if (statusDecay.cleanliness !== undefined && statusDecay.cleanliness < currentStats.cleanliness) {
      changes.push(`清洁下降了 ${currentStats.cleanliness - statusDecay.cleanliness} 点`)
    }
    
    // 计算成长进度
    const growthResult = this.calculateGrowthProgress(pet, offlineMinutes)
    let updatedPet = pet
    
    if (growthResult.experienceGain > 0) {
      updatedStats.experience = (updatedStats.experience || 0) + growthResult.experienceGain
      updatedStats.level = Math.floor(updatedStats.experience / 100) + 1
      changes.push(`获得了 ${growthResult.experienceGain} 点经验`)
    }
    
    if (growthResult.newStage) {
      updatedPet = { ...pet, stage: growthResult.newStage as any }
      const stageNames = { baby: '幼年', adult: '成年', elder: '老年' }
      changes.push(`成长到了 ${stageNames[growthResult.newStage as keyof typeof stageNames]} 阶段`)
    }
    
    // 更新数据库
    try {
      // 更新宠物状态
      await supabase
        .from('pet_stats')
        .update({
          health: updatedStats.health,
          happiness: updatedStats.happiness,
          hunger: updatedStats.hunger,
          cleanliness: updatedStats.cleanliness,
          experience: updatedStats.experience,
          level: updatedStats.level,
          updated_at: new Date().toISOString()
        })
        .eq('pet_id', pet.id)
      
      // 如果宠物成长了，更新宠物信息
      if (updatedPet !== pet) {
        await supabase
          .from('pets')
          .update({
            stage: updatedPet.stage,
            updated_at: new Date().toISOString()
          })
          .eq('id', pet.id)
      }
    } catch (error) {
      console.error('更新离线计算结果失败:', error)
    }
    
    // 保存当前时间
    this.saveLastUpdateTime()
    
    return {
      updatedStats,
      updatedPet: updatedPet !== pet ? updatedPet : undefined,
      offlineMinutes,
      changes
    }
  }
  
  // 格式化离线时间显示
  formatOfflineTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} 分钟`
    } else if (minutes < 24 * 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours} 小时 ${remainingMinutes} 分钟` : `${hours} 小时`
    } else {
      const days = Math.floor(minutes / (24 * 60))
      const remainingHours = Math.floor((minutes % (24 * 60)) / 60)
      return remainingHours > 0 ? `${days} 天 ${remainingHours} 小时` : `${days} 天`
    }
  }
}

// 导出单例实例
export const timeManager = TimeManager.getInstance()