import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePetStore } from '../store/petStore'
import { PixelRenderer, PetAnimation } from '../lib/pixelRenderer'
import { Calendar, Clock, Heart, Trophy, Star, TrendingUp, BarChart3, Users } from 'lucide-react'

function Profile() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<PetAnimation | null>(null)
  const { currentPet, petStats, interactionHistory, gameRecords } = usePetStore()
  
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'history'>('info')
  
  // 如果没有宠物，重定向到孵化页面
  useEffect(() => {
    if (!currentPet) {
      navigate('/hatch')
    }
  }, [currentPet, navigate])
  
  // 初始化Canvas渲染
  useEffect(() => {
    if (!canvasRef.current || !currentPet) return
    
    const canvas = canvasRef.current
    // 确保canvas尺寸正确
    canvas.width = 160
    canvas.height = 120
    
    try {
      const renderer = new PixelRenderer(canvas, 4)
      const animation = new PetAnimation(renderer)
      animationRef.current = animation
      
      // 开始播放待机动画，传入完整的宠物对象
      animation.playIdleAnimation(currentPet)
      
      console.log('Canvas渲染初始化成功:', currentPet.type, currentPet.stage)
    } catch (error) {
      console.error('Canvas渲染初始化失败:', error)
      // 如果canvas渲染失败，清空canvas并显示背景色
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#F5F5DC'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
    
    return () => {
      if (animationRef.current) {
        animationRef.current.stop()
      }
    }
  }, [currentPet, petStats])
  
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
  
  // 计算宠物年龄（使用游戏内时间，1小时=1天）
  const getPetAge = () => {
    const birthTime = typeof currentPet.birth_time === 'string' 
      ? new Date(currentPet.birth_time).getTime() 
      : currentPet.birth_time
    const ageInHours = (Date.now() - birthTime) / (1000 * 60 * 60)
    const ageInDays = Math.floor(ageInHours)
    const remainingHours = Math.floor(ageInHours % 1 * 24)
    
    if (ageInDays === 0) {
      return `${remainingHours}小时`
    }
    return `${ageInDays}天${remainingHours}小时`
  }
  
  // 获取宠物等级
  const getPetLevel = () => {
    return Math.floor(petStats.experience / 100) + 1
  }
  
  // 计算陪伴属性值（基于互动频率和时长）
  const getCompanionshipValue = () => {
    if (!currentPet || !petStats) return 0
    const birthTime = typeof currentPet.birth_time === 'string' 
      ? new Date(currentPet.birth_time).getTime() 
      : currentPet.birth_time
    const hours = Math.floor((Date.now() - birthTime) / (1000 * 60 * 60))
    const interactions = interactionHistory.length
    // 基础陪伴值：每小时+1，每次互动+2，最大100
    const baseValue = Math.min(hours + interactions * 2, 100)
    return Math.max(0, baseValue)
  }
  
  // 获取下一级所需经验
  const getExpToNextLevel = () => {
    return 100 - (petStats.experience % 100)
  }
  
  // 获取稀有度信息
  const getRarityInfo = () => {
    const rarityMap = {
      common: { name: '普通', color: 'text-gray-600', bg: 'bg-gray-100' },
      rare: { name: '稀有', color: 'text-blue-600', bg: 'bg-blue-100' },
      epic: { name: '史诗', color: 'text-purple-600', bg: 'bg-purple-100' },
      legendary: { name: '传说', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    }
    return rarityMap[currentPet.rarity]
  }
  
  // 获取成长阶段信息
  const getStageInfo = () => {
    const stageMap = {
      baby: { name: '幼年期', description: '充满好奇心的小家伙' },
      adult: { name: '成年期', description: '活力充沛的伙伴' },
      elder: { name: '老年期', description: '智慧而温和的长者' }
    }
    return stageMap[currentPet.stage]
  }
  
  // 获取成长阶段用于动画渲染
  const getAnimationStage = () => {
    if (!currentPet) return 'baby'
    const birthTime = typeof currentPet.birth_time === 'string' 
      ? new Date(currentPet.birth_time).getTime() 
      : currentPet.birth_time
    const ageInHours = (Date.now() - birthTime) / (1000 * 60 * 60)
    const ageInDays = Math.floor(ageInHours) // 1小时 = 1天游戏时间
    return ageInDays < 30 ? 'baby' : 'adult'
  }
  
  // 获取宠物类型信息
  const getTypeInfo = () => {
    const typeMap = {
      dog: { name: '小狗', traits: ['忠诚', '活泼', '友好'] },
      cat: { name: '小猫', traits: ['优雅', '独立', '神秘'] },
      rabbit: { name: '兔子', traits: ['温柔', '敏捷', '可爱'] },
      bird: { name: '小鸟', traits: ['自由', '灵动', '聪明'] },
      hamster: { name: '仓鼠', traits: ['勤劳', '机灵', '储藏'] },
      fish: { name: '小鱼', traits: ['宁静', '优雅', '神秘'] }
    }
    return typeMap[currentPet.type] || { name: '未知', traits: ['神秘'] }
  }
  
  // 计算互动统计
  const getInteractionStats = () => {
    const stats = {
      total: interactionHistory.length,
      feed: 0,
      touch: 0,
      clean: 0,
      play: 0,
      gift: 0,
      sing: 0
    }
    
    interactionHistory.forEach(interaction => {
      if (interaction.type in stats) {
        stats[interaction.type as keyof typeof stats]++
      }
    })
    
    return stats
  }
  
  // 计算游戏统计
  const getGameStats = () => {
    const stats = {
      totalGames: gameRecords.length,
      totalScore: gameRecords.reduce((sum, record) => sum + record.score, 0),
      bestScore: Math.max(...gameRecords.map(record => record.score), 0),
      favoriteGame: 'memory' as string
    }
    
    // 计算最喜欢的游戏
    const gameCount: { [key: string]: number } = {}
    gameRecords.forEach(record => {
      gameCount[record.game_type] = (gameCount[record.game_type] || 0) + 1
    })
    
    let maxCount = 0
    Object.entries(gameCount).forEach(([game, count]) => {
      if (count > maxCount) {
        maxCount = count
        stats.favoriteGame = game
      }
    })
    
    return stats
  }
  
  const rarityInfo = getRarityInfo()
  const stageInfo = getStageInfo()
  const typeInfo = getTypeInfo()
  const interactionStats = getInteractionStats()
  const gameStats = getGameStats()
  
  const tabs = [
    { id: 'info' as const, name: '基本信息', icon: <Heart size={16} /> },
    { id: 'stats' as const, name: '数据统计', icon: <BarChart3 size={16} /> },
    { id: 'history' as const, name: '互动记录', icon: <Clock size={16} /> }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)] animate-pulse"></div>
      
      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="font-pixel text-4xl bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3 drop-shadow-lg">
            宠物档案
          </h1>
          <p className="text-white/80 text-lg font-medium">查看你的宠物详细信息</p>
        </div>
      
        {/* 宠物头像和基本信息 */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300">
          <div className="bg-gradient-to-r from-indigo-500/80 to-purple-600/80 backdrop-blur-sm px-6 py-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-lg">🐾</span>
              </div>
              <h3 className="font-pixel text-lg">基本档案</h3>
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* 宠物头像 */}
              <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/10 group hover:scale-105 transition-transform duration-300">
                <canvas 
                  ref={canvasRef}
                  width={160}
                  height={120}
                  className="mx-auto pixel-art"
                  style={{ 
                    imageRendering: 'pixelated'
                  }}
                />
              {/* 状态指示器 */}
              <div className="absolute -top-2 -right-2 flex gap-1">
                {petStats && petStats.health < 20 && (
                  <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse flex items-center justify-center" title="生病">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
                {petStats && petStats.happiness > 80 && (
                  <div className="w-5 h-5 bg-yellow-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center" title="开心">
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                )}
                {getCompanionshipValue() > 90 && (
                  <div className="w-5 h-5 bg-pink-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center" title="深度陪伴">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
            
              {/* 基本信息 */}
              <div className="flex-1 space-y-6">
                <div className="text-center lg:text-left">
                  <h2 className="text-4xl font-pixel mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-lg">{currentPet.name}</h2>
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 flex-wrap">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-blue-100 rounded-full font-medium shadow-lg border border-white/30">{typeInfo.name}</span>
                    <span className="font-pixel px-4 py-2 rounded-full text-sm bg-white/20 backdrop-blur-sm text-yellow-100 shadow-lg border border-white/30">
                      ✨ {rarityInfo.name}
                    </span>
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-pink-100 rounded-full font-medium shadow-lg border border-white/30">
                      陪伴度 {getCompanionshipValue()}
                    </span>
                  </div>
                </div>
            
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30 hover:bg-white/25 transition-all duration-300">
                     <div className="flex items-center gap-3 mb-3">
                       <div className="w-8 h-8 bg-blue-500/80 rounded-full flex items-center justify-center">
                         <span className="text-white text-sm">⭐</span>
                       </div>
                       <div className="text-blue-100 text-sm font-medium">等级</div>
                     </div>
                     <div className="font-pixel text-2xl text-white drop-shadow-md">Lv. {getPetLevel()}</div>
                   </div>
                   
                   <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30 hover:bg-white/25 transition-all duration-300">
                     <div className="flex items-center gap-3 mb-3">
                       <div className="w-8 h-8 bg-green-500/80 rounded-full flex items-center justify-center">
                         <span className="text-white text-sm">🕐</span>
                       </div>
                       <div className="text-green-100 text-sm font-medium">年龄</div>
                     </div>
                     <div className="font-pixel text-lg text-white drop-shadow-md">{getPetAge()}</div>
                   </div>
                   
                   <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30 hover:bg-white/25 transition-all duration-300">
                     <div className="flex items-center gap-3 mb-3">
                       <div className="w-8 h-8 bg-purple-500/80 rounded-full flex items-center justify-center">
                         <span className="text-white text-sm">🌱</span>
                       </div>
                       <div className="text-purple-100 text-sm font-medium">成长阶段</div>
                     </div>
                     <div className="font-pixel text-lg text-white drop-shadow-md">{stageInfo.name}</div>
                   </div>
                   
                   <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30 hover:bg-white/25 transition-all duration-300">
                     <div className="flex items-center gap-3 mb-3">
                       <div className="w-8 h-8 bg-orange-500/80 rounded-full flex items-center justify-center">
                         <span className="text-white text-sm">🎯</span>
                       </div>
                       <div className="text-orange-100 text-sm font-medium">下级还需</div>
                     </div>
                     <div className="font-pixel text-lg text-white drop-shadow-md">{getExpToNextLevel()} 经验</div>
                   </div>
                 </div>
          </div>
            </div>
            </div>
          </div>
      
        {/* 标签页 */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="bg-white/10 backdrop-blur-sm px-6 py-4">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-pixel text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-white/70 hover:bg-white/20 hover:text-white hover:shadow-md'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-white' : 'text-white/60'}>
                  {tab.icon}
                </span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          {/* 基本信息标签页 */}
          {activeTab === 'info' && (
            <div className="space-y-8">
              {/* 性格特征 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <h3 className="font-pixel text-2xl mb-6 flex items-center gap-4 text-white drop-shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                    <Star size={18} className="text-white" />
                  </div>
                  性格特征
                </h3>
                <div className="flex flex-wrap gap-4">
                  {typeInfo.traits.map((trait, index) => (
                    <span 
                      key={index}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-400/80 to-orange-400/80 backdrop-blur-sm text-white text-lg font-pixel rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30 hover:scale-105"
                    >
                      ✨ {trait}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 成长信息 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <h3 className="font-pixel text-2xl mb-6 flex items-center gap-4 text-white drop-shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                    <TrendingUp size={18} className="text-white" />
                  </div>
                  成长信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:bg-white/25 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-green-500/80 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-sm">🌱</span>
                      </div>
                      <div className="text-sm text-green-100 font-medium">当前阶段</div>
                    </div>
                    <div className="font-pixel text-2xl text-white drop-shadow-md">{stageInfo.name}</div>
                    <div className="text-sm text-green-200 mt-2 font-medium">{stageInfo.description}</div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:bg-white/25 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-500/80 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white text-sm">⭐</span>
                      </div>
                      <div className="text-sm text-blue-100 font-medium">总经验值</div>
                    </div>
                    <div className="font-pixel text-2xl text-white drop-shadow-md">{petStats.experience}</div>
                    <div className="text-sm text-blue-200 mt-2 font-medium">距离下一级还需 {getExpToNextLevel()}</div>
                  </div>
                </div>
              </div>
              
              {/* 出生信息 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <h3 className="font-pixel text-2xl mb-6 flex items-center gap-4 text-white drop-shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                    <Calendar size={18} className="text-white" />
                  </div>
                  出生信息
                </h3>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:bg-white/25 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-500/80 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-sm">🥚</span>
                    </div>
                    <div className="text-sm text-purple-100 font-medium">孵化时间</div>
                  </div>
                  <div className="font-pixel text-white text-xl mb-3 drop-shadow-md">
                    {new Date(currentPet.birth_time).toLocaleString('zh-CN')}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-purple-200 font-medium">
                    <span className="text-lg">💝</span>
                    <span>已陪伴你 {getPetAge()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 数据统计标签页 */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              {/* 互动统计 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <h3 className="font-pixel text-2xl mb-6 flex items-center gap-4 text-white drop-shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center shadow-lg">
                    <Heart size={18} className="text-white" />
                  </div>
                  互动统计
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 text-center hover:bg-white/25 transition-all duration-300 group">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl text-white">💖</span>
                    </div>
                    <div className="text-4xl font-pixel text-white mb-2 drop-shadow-md">
                      {interactionStats.total}
                    </div>
                    <div className="text-sm text-pink-200 font-medium">总互动次数</div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'feed', name: '喂食', icon: '🍖', color: 'from-orange-400 to-red-400' },
                      { key: 'touch', name: '抚摸', icon: '❤️', color: 'from-pink-400 to-rose-400' },
                      { key: 'clean', name: '清洁', icon: '✨', color: 'from-blue-400 to-indigo-400' },
                      { key: 'play', name: '玩耍', icon: '🎮', color: 'from-green-400 to-emerald-400' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30 hover:bg-white/25 transition-all duration-300 group">
                        <span className="flex items-center gap-4">
                          <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-lg">{item.icon}</span>
                          </div>
                          <span className="font-medium text-white text-lg drop-shadow-sm">{item.name}</span>
                        </span>
                        <span className="font-pixel text-xl text-white drop-shadow-md">
                          {interactionStats[item.key as keyof typeof interactionStats]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 游戏统计 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <h3 className="font-pixel text-2xl mb-6 flex items-center gap-4 text-white drop-shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center shadow-lg">
                    <Trophy size={18} className="text-white" />
                  </div>
                  游戏统计
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 text-center hover:bg-white/25 transition-all duration-300 group">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl text-white">🎮</span>
                    </div>
                    <div className="text-3xl font-pixel text-white mb-2 drop-shadow-md">
                      {gameStats.totalGames}
                    </div>
                    <div className="text-sm text-green-200 font-medium">游戏场次</div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 text-center hover:bg-white/25 transition-all duration-300 group">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl text-white">🏆</span>
                    </div>
                    <div className="text-3xl font-pixel text-white mb-2 drop-shadow-md">
                      {gameStats.bestScore}
                    </div>
                    <div className="text-sm text-yellow-200 font-medium">最高分数</div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:bg-white/25 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500/80 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    <div className="text-sm text-blue-100 font-medium">总得分</div>
                  </div>
                  <div className="font-pixel text-2xl text-white drop-shadow-md">{gameStats.totalScore}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* 互动记录标签页 */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <h3 className="font-pixel text-2xl mb-6 flex items-center gap-4 text-white drop-shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center shadow-lg">
                    <Clock size={18} className="text-white" />
                  </div>
                  最近互动记录
                </h3>
                
                {interactionHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <span className="text-3xl">📝</span>
                    </div>
                    <p className="text-white font-medium text-lg mb-2 drop-shadow-sm">暂无互动记录</p>
                    <p className="text-white/70 text-sm">快去和你的宠物互动吧！</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {interactionHistory
                      .slice(-20) // 显示最近20条记录
                      .reverse()
                      .map((interaction) => {
                        const typeMap: { [key: string]: { name: string; icon: string } } = {
                          feed: { name: '喂食', icon: '🍖' },
                          touch: { name: '抚摸', icon: '❤️' },
                          clean: { name: '清洁', icon: '✨' },
                          play: { name: '玩耍', icon: '🎮' },
                          gift: { name: '礼物', icon: '🎁' },
                          sing: { name: '唱歌', icon: '🎵' }
                        }
                        
                        const typeInfo = typeMap[interaction.type] || { name: interaction.type, icon: '❓' }
                        
                        return (
                          <div key={interaction.id} className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:bg-white/25 transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                  <span className="text-lg">{typeInfo.icon}</span>
                                </div>
                                <span className="font-medium text-white text-lg drop-shadow-sm">{typeInfo.name}</span>
                              </div>
                              <span className="text-sm text-white/70 font-medium">
                                {new Date(interaction.timestamp).toLocaleString('zh-CN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            <div className="text-sm text-purple-100 bg-purple-500/30 backdrop-blur-sm rounded-xl p-3 border border-purple-300/30">
                              <span className="font-medium">效果:</span> {Object.entries(interaction.effect)
                                .filter(([_, value]) => typeof value === 'number' && value > 0)
                                .map(([key, value]) => `+${value} ${key}`)
                                .join(', ')}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile