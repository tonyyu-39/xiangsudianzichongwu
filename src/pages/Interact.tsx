import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePetStore } from '../store/petStore'
import { PixelRenderer, PetAnimation } from '../lib/pixelRenderer'
import PetStatusBar from '../components/PetStatusBar'
import { Heart, Utensils, Sparkles, Gamepad2, Gift, Music, Activity, Lightbulb } from 'lucide-react'

type InteractionType = 'feed' | 'touch' | 'clean' | 'play' | 'gift' | 'sing'

interface InteractionOption {
  type: InteractionType
  name: string
  icon: React.ReactNode
  description: string
  effects: { [key: string]: number }
  cooldown: number // 冷却时间（秒）
  cost?: number // 消耗的经验值或金币
}

function Interact() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<PetAnimation | null>(null)
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const { currentPet, petStats, updatePetStats, addInteraction } = usePetStore()
  
  const [lastInteractions, setLastInteractions] = useState<{ [key: string]: number }>({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentAnimation, setCurrentAnimation] = useState<InteractionType | null>(null)
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})

  // 创建受管理的定时器
  const createManagedTimeout = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer)
      callback()
    }, delay)
    timersRef.current.add(timer)
    return timer
  }, [])

  // 组件卸载时清理所有定时器
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  // 初始化Canvas渲染
  useEffect(() => {
    if (canvasRef.current && currentPet) {
      const renderer = new PixelRenderer(canvasRef.current, 6)
      animationRef.current = new PetAnimation(renderer)
      animationRef.current.playIdleAnimation(currentPet)
    }
    
    return () => {
      if (animationRef.current) {
        animationRef.current.stop()
      }
    }
  }, [currentPet])

  // 添加canvas点击交互
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !currentPet || !petStats) return

    const handleCanvasClick = () => {
      // 执行触摸互动
      const touchOption = interactionOptions.find(opt => opt.type === 'touch')
      if (touchOption && !isAnimating) {
        handleInteraction(touchOption)
      }
    }

    canvas.addEventListener('click', handleCanvasClick)
    return () => {
      canvas.removeEventListener('click', handleCanvasClick)
    }
  }, [currentPet, petStats, isAnimating])
  
  // 如果没有宠物，重定向到孵化页面
  useEffect(() => {
    if (!currentPet) {
      navigate('/hatch')
    }
  }, [currentPet, navigate])
  
  // 互动选项
  const interactionOptions: InteractionOption[] = [
    {
      type: 'feed',
      name: '喂食',
      icon: <Utensils size={24} />,
      description: '给宠物喂食，恢复饥饿度',
      effects: { hunger: 25, happiness: 5, experience: 2 },
      cooldown: 30
    },
    {
      type: 'touch',
      name: '抚摸',
      icon: <Heart size={24} />,
      description: '轻抚宠物，增加快乐度和亲密度',
      effects: { happiness: 15, experience: 1 },
      cooldown: 10
    },
    {
      type: 'clean',
      name: '清洁',
      icon: <Sparkles size={24} />,
      description: '给宠物洗澡，提高清洁度',
      effects: { cleanliness: 30, happiness: 8, health: 5, experience: 3 },
      cooldown: 60
    },
    {
      type: 'play',
      name: '玩耍',
      icon: <Gamepad2 size={24} />,
      description: '和宠物一起玩耍，大幅提升快乐度',
      effects: { happiness: 20, hunger: -10, experience: 4 },
      cooldown: 45
    },
    {
      type: 'gift',
      name: '礼物',
      icon: <Gift size={24} />,
      description: '给宠物小礼物，获得大量经验',
      effects: { happiness: 25, experience: 10 },
      cooldown: 120,
      cost: 50
    },
    {
      type: 'sing',
      name: '唱歌',
      icon: <Music size={24} />,
      description: '为宠物唱歌，舒缓心情',
      effects: { happiness: 12, health: 3, experience: 2 },
      cooldown: 20
    }
  ]
  
  // 检查互动是否在冷却中
  const isOnCooldown = (type: InteractionType, cooldown: number): boolean => {
    const lastTime = lastInteractions[type] || 0
    const now = Date.now()
    return (now - lastTime) < (cooldown * 1000)
  }
  
  // 获取冷却剩余时间
  const getCooldownRemaining = (type: InteractionType, cooldown: number): number => {
    const lastTime = lastInteractions[type] || 0
    const now = Date.now()
    const remaining = (cooldown * 1000) - (now - lastTime)
    return Math.max(0, Math.ceil(remaining / 1000))
  }
  
  // 执行互动
  const handleInteraction = async (option: InteractionOption) => {
    if (!currentPet || !petStats || isAnimating) return
    
    // 检查冷却时间
    if (isOnCooldown(option.type, option.cooldown)) {
      return
    }
    
    // 检查消耗（如果有）
    if (option.cost && petStats.experience < option.cost) {
      return
    }
    
    setIsAnimating(true)
    setCurrentAnimation(option.type)
    
    // 播放互动动画
    if (animationRef.current) {
      animationRef.current.playInteractionAnimation(currentPet, option.type)
    }
    
    // 更新状态
    const effects = { ...option.effects }
    if (option.cost) {
      effects.experience = (effects.experience || 0) - option.cost
    }
    
    updatePetStats(effects)
    
    // 记录互动
    const interaction = {
      id: Date.now().toString(),
      pet_id: currentPet.id,
      type: option.type,
      timestamp: Date.now(),
      effect: effects
    }
    
    addInteraction(interaction)
    
    // 更新冷却时间
    setLastInteractions(prev => ({
      ...prev,
      [option.type]: Date.now()
    }))
    
    // 动画结束后恢复待机状态
    createManagedTimeout(() => {
      if (animationRef.current) {
        animationRef.current.playIdleAnimation(currentPet)
      }
      setIsAnimating(false)
      setCurrentAnimation(null)
    }, 2000)
  }
  
  // 获取按钮状态
  const getButtonStatus = (option: InteractionOption) => {
    if (!petStats) return { disabled: true, reason: '数据加载中' }
    
    if (isAnimating && currentAnimation !== option.type) {
      return { disabled: true, reason: '互动中...' }
    }
    
    if (isOnCooldown(option.type, option.cooldown)) {
      const remaining = getCooldownRemaining(option.type, option.cooldown)
      return { disabled: true, reason: `冷却中 ${remaining}s` }
    }
    
    if (option.cost && petStats.experience < option.cost) {
      return { disabled: true, reason: `需要 ${option.cost} 经验` }
    }
    
    // 检查状态上限
    if (option.type === 'feed' && petStats.hunger >= 95) {
      return { disabled: true, reason: '不饿' }
    }
    
    if (option.type === 'clean' && petStats.cleanliness >= 95) {
      return { disabled: true, reason: '很干净' }
    }
    
    return { disabled: false, reason: '' }
  }
  
  if (!currentPet || !petStats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-pixel-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Heart size={32} className="text-pink-200" />
            <h1 className="text-3xl font-pixel font-bold">宠物互动中心</h1>
            <Heart size={32} className="text-pink-200" />
          </div>
          <p className="text-lg text-purple-100">和 {currentPet.name} 一起度过美好时光！</p>
        </div>
      </div>
      
      {/* 宠物显示区域 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xl">🐾</span>
              </div>
              <div>
                <h2 className="font-pixel text-xl font-bold">{currentPet.name}</h2>
                <p className="text-sm text-blue-100">
                  {currentPet.type === 'cat' && '🐱 小猫'}
                  {currentPet.type === 'dog' && '🐶 小狗'}
                  {currentPet.type === 'rabbit' && '🐰 兔子'}
                  {currentPet.type === 'bird' && '🐦 小鸟'}
                  {currentPet.type === 'hamster' && '🐹 仓鼠'}
                  {currentPet.type === 'fish' && '🐠 金鱼'}
                  {' • '}
                  {currentPet.stage === 'baby' && '🍼 幼体'}
                  {currentPet.stage === 'adult' && '👨 成年'}
                  {currentPet.stage === 'elder' && '👴 老年'}
                </p>
              </div>
            </div>
            
            {/* 当前动画提示 */}
            {isAnimating && currentAnimation && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-medium animate-pulse shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-900 rounded-full animate-bounce"></div>
                  <span>{interactionOptions.find(opt => opt.type === currentAnimation)?.name}中...</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6">
          <div className="bg-black bg-opacity-30 rounded-xl p-4">
            <canvas 
              ref={canvasRef}
              width={320}
              height={240}
              className="mx-auto rounded-lg shadow-inner"
            />
          </div>
        </div>
      </div>
      
      {/* 状态条 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4">
          <div className="flex items-center justify-center gap-3">
            <Activity size={24} className="text-green-200" />
            <h3 className="font-pixel text-xl font-bold">宠物状态监控</h3>
            <Activity size={24} className="text-green-200" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">❤️</span>
                  </div>
                  <span className="font-medium text-red-700">健康值</span>
                </div>
                <span className="text-sm font-bold text-red-600 bg-red-200 px-2 py-1 rounded-full">{petStats.health}/100</span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-red-400 to-red-500 h-3 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${petStats.health}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🍖</span>
                  </div>
                  <span className="font-medium text-orange-700">饥饿值</span>
                </div>
                <span className="text-sm font-bold text-orange-600 bg-orange-200 px-2 py-1 rounded-full">{petStats.hunger}/100</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${petStats.hunger}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">😊</span>
                  </div>
                  <span className="font-medium text-yellow-700">快乐值</span>
                </div>
                <span className="text-sm font-bold text-yellow-600 bg-yellow-200 px-2 py-1 rounded-full">{petStats.happiness}/100</span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${petStats.happiness}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🧼</span>
                  </div>
                  <span className="font-medium text-blue-700">清洁值</span>
                </div>
                <span className="text-sm font-bold text-blue-600 bg-blue-200 px-2 py-1 rounded-full">{petStats.cleanliness}/100</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${petStats.cleanliness}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 互动选项 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4">
          <div className="flex items-center justify-center gap-3">
            <Gamepad2 size={24} className="text-indigo-200" />
            <h3 className="font-pixel text-xl font-bold">互动选择</h3>
            <Gamepad2 size={24} className="text-indigo-200" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {interactionOptions.map((option) => {
              const buttonStatus = getButtonStatus(option);
              return (
                <button
                  key={option.type}
                  onClick={() => handleInteraction(option)}
                  disabled={buttonStatus.disabled}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-300 font-medium group overflow-hidden
                    ${buttonStatus.disabled 
                      ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 text-gray-700 hover:border-indigo-300 hover:shadow-lg hover:scale-105 active:scale-95'
                    }
                  `}
                >
                  {!buttonStatus.disabled && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  )}
                  <div className="relative z-10">
                    <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform duration-200">{option.icon}</div>
                    <div className="text-sm font-medium">{option.name}</div>
                    {buttonStatus.disabled && buttonStatus.reason && (
                      <div className="text-xs text-red-500 mt-2 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                        {buttonStatus.reason}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* 互动提示 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">💡</span>
            <h3 className="font-pixel text-xl font-bold">互动小贴士</h3>
            <span className="text-2xl">💡</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🍖</span>
                </div>
                <span className="text-green-700 font-medium">定期喂食可以保持宠物的健康和快乐</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🤗</span>
                </div>
                <span className="text-pink-700 font-medium">抚摸和玩耍能增加宠物的快乐值</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🧼</span>
                </div>
                <span className="text-blue-700 font-medium">保持清洁对宠物的健康很重要</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">⏰</span>
                </div>
                <span className="text-purple-700 font-medium">每种互动都有冷却时间，请耐心等待</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Interact