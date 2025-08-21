import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TimeManager } from '../lib/timeManager'
import type { Pet, PetStats, InteractionLog, GameRecord } from '../lib/supabase'

// 动画状态类型
export type AnimationState = 'idle' | 'happy' | 'sleeping' | 'eating' | 'playing' | 'sick' | 'cleaning'
export type InteractionAnimation = 'touch' | 'feed' | 'clean' | 'play' | 'gift' | 'sing'

// 宠物状态接口
interface PetState {
  // 当前宠物信息
  currentPet: Pet | null
  petStats: PetStats | null
  
  // 交互历史
  interactionHistory: InteractionLog[]
  gameRecords: GameRecord[]
  
  // UI状态
  isLoading: boolean
  error: string | null
  
  // 时间相关
  lastUpdateTime: number
  offlineTime: number
  timeManager: TimeManager
  
  // 健康状态
  isSick: boolean
  sickStartTime: number | null
  isDead: boolean
  deathTime: number | null
  
  // 动画状态管理
  currentAnimationState: AnimationState
  isPlayingInteraction: boolean
  lastInteractionTime: number
  animationQueue: AnimationState[]
  
  // 离线时间模态框
  showOfflineModal: boolean
  offlineStatusChanges: {
    hunger: number
    happiness: number
    cleanliness: number
    energy: number
  } | null
  
  // Actions
  setPet: (pet: Pet, stats?: PetStats) => void
  loadPetFromDatabase: () => Promise<void>
  updatePetStats: (stats: Partial<PetStats>) => void
  addInteraction: (interaction: InteractionLog) => void
  addGameRecord: (record: GameRecord) => void
  calculateOfflineEffects: () => Promise<void>
  checkHealthStatus: () => void
  revivePet: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetPet: () => void
  setShowOfflineModal: (show: boolean) => void
  setOfflineStatusChanges: (changes: { hunger: number; happiness: number; cleanliness: number; energy: number } | null) => void
  
  // 动画状态管理Actions
  setAnimationState: (state: AnimationState) => void
  playInteractionAnimation: (type: InteractionAnimation) => void
  updateAnimationBasedOnStats: () => void
  queueAnimation: (state: AnimationState) => void
  processAnimationQueue: () => void
}

// 时间计算工具函数
const REAL_HOUR_TO_PET_DAY = 60 * 60 * 1000 // 1小时 = 1天

const calculatePetAge = (birthTime: number): number => {
  const currentTime = Date.now()
  const ageInMs = currentTime - birthTime
  return Math.floor(ageInMs / REAL_HOUR_TO_PET_DAY)
}

const calculateStatDecay = (offlineHours: number): Partial<PetStats> => {
  const hungerDecay = Math.min(offlineHours * 5, 50)
  const happinessDecay = Math.min(offlineHours * 3, 30)
  const cleanlinessDecay = Math.min(offlineHours * 2, 20)
  
  return {
    hunger: -hungerDecay,
    happiness: -happinessDecay,
    cleanliness: -cleanlinessDecay
  }
}

const getLifeStage = (age: number): 'baby' | 'adult' | 'elder' => {
  if (age < 30) return 'baby'     // 0-29天为幼年
  if (age < 90) return 'adult'    // 30-89天为成年
  return 'elder'                  // 90天以上为老年
}

// 创建宠物状态store
export const usePetStore = create<PetState>()(persist(
  (set, get) => ({
    // 初始状态
    currentPet: null,
    petStats: null,
    interactionHistory: [],
    gameRecords: [],
    isLoading: false,
    error: null,
    lastUpdateTime: Date.now(),
    offlineTime: 0,
    timeManager: TimeManager.getInstance(),
    isSick: false,
    sickStartTime: null,
    isDead: false,
    deathTime: null,
    
    // 动画状态初始化
    currentAnimationState: 'idle',
    isPlayingInteraction: false,
    lastInteractionTime: 0,
    animationQueue: [],
    
    showOfflineModal: false,
    offlineStatusChanges: null,
    
    // 设置当前宠物
    setPet: (pet: Pet, stats?: PetStats) => {
      set({ 
        currentPet: pet, 
        petStats: stats || null,
        lastUpdateTime: Date.now() 
      })
      
      // 保存到本地存储
      localStorage.setItem('currentPetData', JSON.stringify(pet))
      if (stats) {
        localStorage.setItem('currentPetStats', JSON.stringify(stats))
      }
    },
    
    // 从本地存储加载宠物数据
    loadPetFromDatabase: async () => {
      try {
        set({ isLoading: true, error: null })
        
        // 从本地存储加载宠物数据
        const localPetData = localStorage.getItem('currentPetData')
        const localStatsData = localStorage.getItem('currentPetStats')
        const historyData = localStorage.getItem('interactionHistory')
        const recordsData = localStorage.getItem('gameRecords')
        
        if (localPetData && localStatsData) {
          const petData: Pet = JSON.parse(localPetData)
          const statsData: PetStats = JSON.parse(localStatsData)
          const history = historyData ? JSON.parse(historyData) : []
          const records = recordsData ? JSON.parse(recordsData) : []
          
          set({ 
            currentPet: petData, 
            petStats: statsData,
            interactionHistory: history,
            gameRecords: records,
            isLoading: false 
          })
          
          // 只有当宠物存在超过10分钟时才应用离线时间计算
          const petAge = Date.now() - new Date(petData.birth_time).getTime()
          if (petAge > 10 * 60 * 1000) { // 10分钟
            get().calculateOfflineEffects()
          }
        } else {
          set({ isLoading: false })
        }
      } catch (error) {
        console.error('加载宠物数据失败:', error)
        set({ 
          error: error instanceof Error ? error.message : '加载失败',
          isLoading: false 
        })
      }
    },
    
    // 更新宠物状态
    updatePetStats: (updates: Partial<PetStats>) => {
      const { currentPet } = get()
      if (!currentPet) return
      
      set((state) => {
        if (!state.petStats) return state
        
        const newStats = { ...state.petStats }
        
        // 应用更新，确保数值在合理范围内
        Object.entries(updates).forEach(([key, value]) => {
          if (typeof value === 'number') {
            const currentValue = newStats[key as keyof PetStats] as number
            const newValue = Math.max(0, Math.min(100, currentValue + value))
            ;(newStats as any)[key] = newValue
          }
        })
        
        // 检查经验值升级
        if (updates.experience && newStats.experience >= newStats.level * 100) {
          newStats.level += 1
          newStats.experience = newStats.experience - (newStats.level - 1) * 100
        }
        
        // 更新时间戳
        newStats.updated_at = new Date().toISOString()
        
        // 保存到本地存储
        localStorage.setItem('currentPetStats', JSON.stringify(newStats))
        
        return { petStats: newStats }
      })
      
      // 检查健康状态
      get().checkHealthStatus()
      
      // 更新动画状态
      get().updateAnimationBasedOnStats()
    },
    
    // 添加交互记录
    addInteraction: (interaction: InteractionLog) => {
      // 添加到本地状态
      const { interactionHistory } = get()
      const newHistory = [interaction, ...interactionHistory].slice(0, 100) // 保留最近100条记录
      
      set({ interactionHistory: newHistory })
      
      // 保存到本地存储
      localStorage.setItem('interactionHistory', JSON.stringify(newHistory))
    },
    
    // 添加游戏记录
    addGameRecord: (record: GameRecord) => {
      // 添加到本地状态
      const { gameRecords } = get()
      const newRecords = [record, ...gameRecords].slice(0, 50) // 保留最近50条记录
      
      set({ gameRecords: newRecords })
      
      // 保存到本地存储
      localStorage.setItem('gameRecords', JSON.stringify(newRecords))
    },
    
    // 计算离线时间影响
    calculateOfflineEffects: async () => {
      const { timeManager, currentPet, petStats } = get()
      if (!currentPet || !petStats) return
      
      try {
        const result = await timeManager.applyOfflineCalculation(currentPet, petStats)
        
        if (result) {
          // 计算状态变化
          const statusChanges = {
          hunger: result.updatedStats.hunger - petStats.hunger,
          happiness: result.updatedStats.happiness - petStats.happiness,
          cleanliness: result.updatedStats.cleanliness - petStats.cleanliness,
          energy: (result.updatedStats.energy || 0) - (petStats.energy || 0)
        }
          
          set({
          currentPet: result.updatedPet || currentPet,
          petStats: result.updatedStats,
          offlineStatusChanges: statusChanges,
          showOfflineModal: result.offlineMinutes > 30, // 提高阈值到30分钟
          offlineTime: result.offlineMinutes
        })
        }
      } catch (error) {
        console.error('计算离线时间影响失败:', error)
        set({ error: '离线时间计算失败' })
      }
    },
    
    // 设置加载状态
    setLoading: (loading: boolean) => {
      set({ isLoading: loading })
    },
    
    // 设置错误信息
    setError: (error: string | null) => {
      set({ error })
    },
    
    // 重置宠物数据
    resetPet: () => {
      set({
        currentPet: null,
        petStats: null,
        interactionHistory: [],
        gameRecords: [],
        error: null,
        offlineTime: 0,
        isSick: false,
        sickStartTime: null,
        isDead: false,
        deathTime: null,
        showOfflineModal: false,
        offlineStatusChanges: null
      })
      
      // 清除本地存储
      localStorage.removeItem('currentPetData')
      localStorage.removeItem('currentPetStats')
      localStorage.removeItem('interactionHistory')
      localStorage.removeItem('gameRecords')
    },
    
    // 设置离线模态框显示状态
    setShowOfflineModal: (show: boolean) => {
      set({ showOfflineModal: show })
    },
    
    // 设置离线状态变化
    setOfflineStatusChanges: (changes) => {
      set({ offlineStatusChanges: changes })
    },
    
    // 检查健康状态
    checkHealthStatus: () => {
      const { petStats, isSick, sickStartTime, isDead } = get()
      if (!petStats || isDead) return
      
      const currentTime = Date.now()
      
      // 检查是否生病（健康值 < 20）
      if (petStats.health < 20 && !isSick) {
        set({ 
          isSick: true, 
          sickStartTime: currentTime 
        })
        console.log('宠物生病了！健康值过低')
      } else if (petStats.health >= 50 && isSick) {
        // 健康值恢复到50以上时康复
        set({ 
          isSick: false, 
          sickStartTime: null 
        })
        console.log('宠物康复了！')
      }
      
      // 检查死亡条件（健康值为0且持续24小时）
      if (petStats.health === 0) {
        if (sickStartTime && currentTime - sickStartTime >= 24 * 60 * 60 * 1000) {
          set({ 
            isDead: true, 
            deathTime: currentTime 
          })
          console.log('宠物死亡了...')
        }
      }
    },
    
    // 复活宠物
    revivePet: () => {
      const { petStats } = get()
      if (!petStats) return
      
      // 恢复基础状态
      const revivedStats = {
        ...petStats,
        health: 50,
        happiness: 30,
        hunger: 30,
        cleanliness: 30
      }
      
      set({
        isDead: false,
        deathTime: null,
        isSick: false,
        sickStartTime: null,
        petStats: revivedStats
      })
      
      // 保存到本地存储
      localStorage.setItem('currentPetStats', JSON.stringify(revivedStats))
      
      console.log('宠物复活了！')
    },
    
    // 设置动画状态
    setAnimationState: (state: AnimationState) => {
      set({ currentAnimationState: state })
    },
    
    // 播放互动动画
    playInteractionAnimation: (type: InteractionAnimation) => {
      set({ 
        isPlayingInteraction: true,
        lastInteractionTime: Date.now()
      })
      
      // 4秒后恢复到基于状态的动画
      setTimeout(() => {
        const { updateAnimationBasedOnStats } = get()
        set({ isPlayingInteraction: false })
        updateAnimationBasedOnStats()
      }, 4000)
    },
    
    // 根据宠物状态更新动画
    updateAnimationBasedOnStats: () => {
      const { petStats, isDead, isSick, isPlayingInteraction } = get()
      if (!petStats || isPlayingInteraction) return
      
      let newAnimationState: AnimationState = 'idle'
      
      // 死亡状态优先级最高
      if (isDead) {
        newAnimationState = 'sleeping' // 使用睡眠动画表示死亡
      }
      // 生病状态
      else if (isSick) {
        newAnimationState = 'sick'
      }
      // 根据属性值决定动画状态
      else {
        // 饥饿度很低时进食
        if (petStats.hunger < 30) {
          newAnimationState = 'eating'
        }
        // 清洁度很低时清洁
        else if (petStats.cleanliness < 30) {
          newAnimationState = 'cleaning'
        }
        // 快乐度很高时开心
        else if (petStats.happiness > 80) {
          newAnimationState = 'happy'
        }
        // 能量很低时睡觉
        else if ((petStats.energy || 50) < 30) {
          newAnimationState = 'sleeping'
        }
        // 快乐度中等且健康时玩耍
        else if (petStats.happiness > 60 && petStats.health > 60) {
          newAnimationState = 'playing'
        }
        // 默认待机
        else {
          newAnimationState = 'idle'
        }
      }
      
      set({ currentAnimationState: newAnimationState })
    },
    
    // 添加动画到队列
    queueAnimation: (state: AnimationState) => {
      const { animationQueue } = get()
      const newQueue = [...animationQueue, state]
      set({ animationQueue: newQueue })
    },
    
    // 处理动画队列
    processAnimationQueue: () => {
      const { animationQueue, isPlayingInteraction } = get()
      if (animationQueue.length === 0 || isPlayingInteraction) return
      
      const nextAnimation = animationQueue[0]
      const remainingQueue = animationQueue.slice(1)
      
      set({ 
        currentAnimationState: nextAnimation,
        animationQueue: remainingQueue
      })
      
      // 3秒后处理下一个动画
      setTimeout(() => {
        const { processAnimationQueue } = get()
        processAnimationQueue()
      }, 3000)
    }
  }),
  {
    name: 'pet-storage', // localStorage key
    partialize: (state) => ({
      currentPet: state.currentPet,
      petStats: state.petStats,
      interactionHistory: state.interactionHistory,
      gameRecords: state.gameRecords,
      lastUpdateTime: state.lastUpdateTime,
      isSick: state.isSick,
      sickStartTime: state.sickStartTime,
      isDead: state.isDead,
      deathTime: state.deathTime
    })
  }
))