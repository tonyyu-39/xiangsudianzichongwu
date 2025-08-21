import { useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { usePetStore, type AnimationState } from '../store/petStore'
import { PixelRenderer, PetAnimation } from '../lib/pixelRenderer'
import StatusPanel from '../components/StatusPanel'
import { OfflineTimeModal } from '../components/OfflineTimeModal'
import { Heart, Utensils, Sparkles, Gamepad2 } from 'lucide-react'

function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<PetAnimation | null>(null)
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const { 
    currentPet, 
    petStats, 
    updatePetStats, 
    addInteraction, 
    loadPetFromDatabase,
    calculateOfflineEffects,
    isLoading,
    showOfflineModal,
    offlineStatusChanges,
    offlineTime,
    setShowOfflineModal,
    isDead,
    revivePet,
    currentAnimationState,
    playInteractionAnimation,
    updateAnimationBasedOnStats
  } = usePetStore()
  
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
  
  // 播放动画
  const playAnimation = (animationType: string) => {
    if (animationRef.current && currentPet) {
      animationRef.current.playInteractionAnimation(currentPet, animationType)
      // 同时更新store中的动画状态
      playInteractionAnimation(animationType as any)
    }
  }
  
  // 更新宠物动画状态
  const updatePetAnimation = (animationState: AnimationState) => {
    if (animationRef.current && currentPet) {
      animationRef.current.setAnimationState(animationState)
    }
  }
  
  // 同步动画状态
  useEffect(() => {
    updatePetAnimation(currentAnimationState)
  }, [currentAnimationState])
  
  // 定期更新动画状态
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPet && petStats) {
        updateAnimationBasedOnStats()
      }
    }, 5000) // 每5秒检查一次动画状态
    
    return () => clearInterval(interval)
  }, [currentPet, petStats, updateAnimationBasedOnStats])
  
  // 初始化数据加载
  useEffect(() => {
    const initializeApp = async () => {
      // 先尝试从数据库加载宠物数据
      await loadPetFromDatabase()
      // 计算离线时间影响
      calculateOfflineEffects()
    }
    
    initializeApp()
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
  
  // 快捷互动函数
  const handleQuickFeed = () => {
    if (!currentPet || !petStats) return
    
    const interaction = {
      id: Date.now().toString(),
      pet_id: currentPet.id,
      type: 'feed' as const,
      timestamp: Date.now(),
      effect: { hunger: 15, happiness: 5 }
    }
    
    updatePetStats({ hunger: 15, happiness: 5 })
    addInteraction(interaction)
    
    // 播放喂食动画
    playAnimation('feed')
  }
  
  const handleQuickTouch = () => {
    if (!currentPet || !petStats) return
    
    const interaction = {
      id: Date.now().toString(),
      pet_id: currentPet.id,
      type: 'touch' as const,
      timestamp: Date.now(),
      effect: { happiness: 10, health: 2 }
    }
    
    updatePetStats({ happiness: 10, health: 2 })
    addInteraction(interaction)
    
    // 播放触摸动画
    playAnimation('touch')
  }
  
  const handleQuickClean = () => {
    if (!currentPet || !petStats) return
    
    const interaction = {
      id: Date.now().toString(),
      pet_id: currentPet.id,
      type: 'clean' as const,
      timestamp: Date.now(),
      effect: { cleanliness: 20, health: 5 }
    }
    
    updatePetStats({ cleanliness: 20, health: 5 })
    addInteraction(interaction)
    
    // 播放清洁动画
    playAnimation('clean')
  }
  
  const handleQuickInteract = () => {
    if (!currentPet || !petStats) return
    
    const interaction = {
      id: Date.now().toString(),
      pet_id: currentPet.id,
      type: 'play' as const,
      timestamp: Date.now(),
      effect: { happiness: 8, health: 3 }
    }
    
    updatePetStats({ happiness: 8, health: 3 })
    addInteraction(interaction)
    
    // 播放互动动画
    playAnimation('play')
  }
  
  // 加载状态
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="pixel-screen bg-gray-800 text-white p-8 mb-6">
          <h2 className="text-xl mb-4 font-pixel">加载中...</h2>
          <div className="animate-pulse">正在获取宠物数据</div>
        </div>
      </div>
    )
  }
  
  // 如果没有宠物，显示孵化提示
  if (!currentPet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="pixel-screen bg-gray-800 text-white p-8 mb-6">
          <h2 className="text-xl mb-4 font-pixel">欢迎来到像素宠物世界！</h2>
          <p className="mb-6 text-sm">你还没有宠物，快去孵化一只吧！</p>
          <Link to="/hatch" className="pixel-button inline-block">
            开始孵化
          </Link>
        </div>
      </div>
    )
  }
  
  // 计算宠物年龄（数字，用于StatusPanel）
  const getPetAge = () => {
    if (!currentPet) return 0
    const now = new Date().getTime()
    const birthTime = new Date(currentPet.birth_time).getTime()
    const ageInHours = (now - birthTime) / (1000 * 60 * 60)
    return Math.floor(ageInHours) // 返回小时数
  }

  // 计算宠物年龄显示文本
  const getPetAgeText = () => {
    if (!currentPet) return '0天'
    const now = new Date().getTime()
    const birthTime = new Date(currentPet.birth_time).getTime()
    const ageInHours = (now - birthTime) / (1000 * 60 * 60)
    const ageInDays = Math.floor(ageInHours)
    const remainingHours = Math.floor(ageInHours % 1 * 24)
    
    if (ageInDays === 0) {
      return `${remainingHours}小时`
    }
    return `${ageInDays}天${remainingHours}小时`
  }

  // 计算宠物等级
  const getPetLevel = () => {
    if (!petStats) return 1
    return Math.floor((petStats.experience || 0) / 100) + 1
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-6xl">
        {/* 欢迎标题 - 移动端优化 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 sm:gap-4 bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl px-4 sm:px-8 py-4 sm:py-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-lg">
              👋
            </div>
            <div className="text-left">
              <h1 className="text-xl sm:text-3xl font-pixel bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 sm:mb-2">欢迎回来！</h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">和 <span className="text-blue-600 font-bold">{currentPet.name}</span> 一起度过美好时光</p>
            </div>
          </div>
        </div>
      
        {/* 宠物显示区域 - 响应式优化 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-white/40 hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-4 sm:px-8 py-4 sm:py-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-4 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border border-white/30 flex-shrink-0">
                  <span className="text-xl sm:text-2xl">🐾</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-pixel text-lg sm:text-2xl mb-1 truncate">{currentPet.name}</h2>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
                    <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
                      {currentPet.stage === 'baby' ? '🐣 幼年' : currentPet.stage === 'adult' ? '🦋 成年' : '👑 老年'}
                    </span>
                    <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
                      ⭐ Lv.{getPetLevel()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border border-white/20 w-full sm:w-auto">
                <div className="text-xs sm:text-sm opacity-90 mb-1 text-center sm:text-right">🕐 年龄</div>
                <div className="font-pixel text-sm sm:text-lg text-center sm:text-right">{getPetAgeText()}</div>
              </div>
            </div>
          </div>
        
          {/* Canvas区域 - 响应式适配优化 */}
          <div className="relative mx-4 sm:mx-8 my-4 sm:my-8">
            <div className="pixel-screen bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden rounded-xl sm:rounded-2xl shadow-inner border-2 sm:border-4 border-gray-700">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="flex items-center justify-center p-2 sm:p-4">
                <canvas 
                  ref={canvasRef}
                  width={320}
                  height={240}
                  className="max-w-full h-auto relative z-10 rounded-lg"
                  style={{
                    imageRendering: 'pixelated',
                    width: 'min(100%, 320px)',
                    height: 'auto',
                    aspectRatio: '4/3'
                  }}
                />
              </div>
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 backdrop-blur-sm rounded-md sm:rounded-lg px-2 sm:px-3 py-1 text-white text-xs font-pixel">
                LIVE
              </div>
            </div>
          </div>
        
          {/* 快捷操作按钮 - 重新设计配色和响应式布局 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-8 pb-6 sm:pb-8">
            <button 
              onClick={handleQuickFeed}
              className="group bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-500 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-3 hover:from-orange-500 hover:via-amber-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[70px] sm:min-h-[80px] border border-white/30 active:scale-95"
              disabled={!petStats || petStats.hunger >= 95}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/25 rounded-full flex items-center justify-center group-hover:bg-white/35 transition-colors shadow-sm">
                <Utensils size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
              </div>
              <span className="font-bold text-xs sm:text-sm leading-tight">🍎 喂食</span>
            </button>
            
            <button 
              onClick={handleQuickClean}
              className="group bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-500 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-3 hover:from-sky-500 hover:via-cyan-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[70px] sm:min-h-[80px] border border-white/30 active:scale-95"
              disabled={!petStats || petStats.cleanliness >= 95}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/25 rounded-full flex items-center justify-center group-hover:bg-white/35 transition-colors shadow-sm">
                <Sparkles size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
              </div>
              <span className="font-bold text-xs sm:text-sm leading-tight">🧼 清洁</span>
            </button>
            
            <button 
              onClick={handleQuickInteract}
              className="group bg-gradient-to-br from-rose-400 via-pink-400 to-red-500 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-3 hover:from-rose-500 hover:via-pink-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[70px] sm:min-h-[80px] border border-white/30 active:scale-95"
              disabled={!petStats || petStats.happiness >= 95}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/25 rounded-full flex items-center justify-center group-hover:bg-white/35 transition-colors shadow-sm">
                <Heart size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
              </div>
              <span className="font-bold text-xs sm:text-sm leading-tight">💕 互动</span>
            </button>
            
            <Link 
              to="/games" 
              className="group bg-gradient-to-br from-violet-400 via-purple-400 to-indigo-500 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-3 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 no-underline min-h-[70px] sm:min-h-[80px] border border-white/30 active:scale-95"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/25 rounded-full flex items-center justify-center group-hover:bg-white/35 transition-colors shadow-sm">
                <Gamepad2 size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
              </div>
              <span className="font-bold text-xs sm:text-sm leading-tight">🎮 游戏</span>
            </Link>
          </div>
        </div>
      
        {/* 状态面板 - 移动端优化 */}
        {petStats && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/40 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <StatusPanel 
              stats={petStats}
              petName={currentPet.name}
              petType={currentPet.type}
              age={getPetAge()}
            />
          </div>
        )}
        
        {/* 提示信息 - 移动端优化 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-300">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-2xl sm:text-3xl mx-auto shadow-lg">💡</div>
            <h3 className="font-pixel text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">游戏提示</h3>
            <div className="space-y-2 sm:space-y-3 text-gray-600">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-100">
                <p className="flex items-center gap-2 justify-center text-sm sm:text-base">
                  <span className="text-base sm:text-lg">👆</span>
                  点击宠物进行抚摸互动
                </p>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-indigo-100">
                <p className="flex items-center gap-2 justify-center text-sm sm:text-base">
                  <span className="text-base sm:text-lg">⏰</span>
                  现实1小时 = 宠物世界1天
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 离线时间模态框 */}
         {showOfflineModal && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full mx-4 shadow-3xl border border-white/30 animate-in fade-in-0 zoom-in-95 duration-300">
               <div className="text-center">
                 <div className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto shadow-lg">
                   ⏰
                 </div>
                 <h3 className="text-2xl font-pixel bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">欢迎回来！</h3>
                 <p className="text-gray-600 mb-6 leading-relaxed">
                   你离开了一段时间，<span className="font-bold text-purple-600">{currentPet.name}</span> 很想念你！
                 </p>
                 <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-100">
                   <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <span className="text-lg">📊</span>
                     离线期间的变化：
                   </h4>
                   <div className="space-y-2 text-sm">
                     <div className="flex items-center gap-2 text-gray-700 bg-white/50 rounded-lg px-3 py-2">
                       <span className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0"></span>
                       宠物状态已自动更新
                     </div>
                   </div>
                 </div>
                 <button
                   onClick={() => setShowOfflineModal(false)}
                   className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-white/20"
                 >
                   🎮 继续游戏
                 </button>
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  )
}

export default Home