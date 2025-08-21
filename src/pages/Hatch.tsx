import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePetStore } from '../store/petStore'
import { PixelRenderer } from '../lib/pixelRenderer'
import { Sparkles } from 'lucide-react'

type PetType = 'cat' | 'dog' | 'rabbit' | 'bird' | 'hamster' | 'fish'
type PetRarity = 'common' | 'rare' | 'epic' | 'legendary'

interface HatchResult {
  type: PetType
  rarity: PetRarity
  name: string
}

function Hatch() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const { setPet, currentPet } = usePetStore()
  
  const [isHatching, setIsHatching] = useState(false)
  const [hatchResult, setHatchResult] = useState<HatchResult | null>(null)
  const [hatchPhase, setHatchPhase] = useState<'idle' | 'shaking' | 'cracking' | 'hatching'>('idle')
  const [animationFrame, setAnimationFrame] = useState(0)

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
  
  // 如果已有宠物，重定向到主页
  useEffect(() => {
    if (currentPet) {
      navigate('/')
    }
  }, [currentPet, navigate])
  
  // 简单的像素渲染器
  class PixelRenderer {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    
    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')!
      this.ctx.imageSmoothingEnabled = false
    }
    
    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    
    drawPixel(x: number, y: number, color: string, size: number = 1) {
      this.ctx.fillStyle = color
      this.ctx.fillRect(x, y, size, size)
    }
    
    drawEgg(phase: string) {
      this.clear()
      
      const centerX = this.canvas.width / 2
      const centerY = this.canvas.height / 2
      
      // 根据不同阶段绘制蛋的状态
      if (phase === 'idle') {
        // 绘制完整的像素风格蛋
        this.drawPixelEgg(centerX, centerY)
      } else if (phase === 'shaking') {
        // 绘制摇摆的蛋
        const offset = Math.sin(Date.now() / 100) * 2
        this.drawPixelEgg(centerX + offset, centerY)
      } else if (phase === 'cracking') {
        // 绘制有裂纹的蛋
        this.drawPixelEgg(centerX, centerY)
        this.drawPixelCracks(centerX, centerY)
      } else if (phase === 'hatching') {
        // 绘制孵化中的蛋
        this.drawPixelEgg(centerX, centerY)
        this.drawPixelCracks(centerX, centerY)
        this.drawPixelSparkles(centerX, centerY)
      }
    }
    
    private drawPixelEgg(centerX: number, centerY: number) {
      const pixelSize = 4
      
      // 蛋的像素图案
      const eggPattern = [
        '      ████████      ',
        '    ████████████    ',
        '   ██████████████   ',
        '  ████████████████  ',
        ' ██████████████████ ',
        ' ██████████████████ ',
        '████████████████████',
        '████████████████████',
        '████████████████████',
        '████████████████████',
        '████████████████████',
        '████████████████████',
        '████████████████████',
        '████████████████████',
        '████████████████████',
        '████████████████████',
        '████████████████████',
        '████████████████████',
        ' ██████████████████ ',
        ' ██████████████████ ',
        '  ████████████████  ',
        '   ██████████████   ',
        '    ████████████    ',
        '     ██████████     ',
        '      ████████      ',
        '       ██████       ',
        '        ████        ',
        '         ██         '
      ]
      
      // 绘制蛋的主体（白色）
      eggPattern.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
          if (row[x] === '█') {
            const pixelX = centerX - (row.length * pixelSize) / 2 + x * pixelSize
            const pixelY = centerY - (eggPattern.length * pixelSize) / 2 + y * pixelSize
            this.drawPixel(pixelX, pixelY, '#f8f9fa', pixelSize)
          }
        }
      })
      
      // 绘制阴影（右下角）
      eggPattern.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
          if (row[x] === '█' && x > row.length * 0.6 && y > eggPattern.length * 0.3) {
            const pixelX = centerX - (row.length * pixelSize) / 2 + x * pixelSize
            const pixelY = centerY - (eggPattern.length * pixelSize) / 2 + y * pixelSize
            this.drawPixel(pixelX, pixelY, '#e9ecef', pixelSize)
          }
        }
      })
      
      // 绘制高光（左上角）
      eggPattern.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
          if (row[x] === '█' && x < row.length * 0.4 && y < eggPattern.length * 0.3) {
            const pixelX = centerX - (row.length * pixelSize) / 2 + x * pixelSize
            const pixelY = centerY - (eggPattern.length * pixelSize) / 2 + y * pixelSize
            this.drawPixel(pixelX, pixelY, '#ffffff', pixelSize)
          }
        }
      })
    }
    
    private drawPixelCracks(centerX: number, centerY: number) {
      const pixelSize = 4
      
      // 裂纹图案
      const crackPixels = [
        { x: -8, y: -12, color: '#8b4513' },
        { x: -4, y: -8, color: '#8b4513' },
        { x: 0, y: -4, color: '#8b4513' },
        { x: 4, y: 0, color: '#8b4513' },
        { x: 8, y: 4, color: '#8b4513' },
        { x: 12, y: 8, color: '#8b4513' },
        { x: -12, y: 8, color: '#8b4513' },
        { x: -8, y: 12, color: '#8b4513' },
        { x: -4, y: 16, color: '#8b4513' },
        { x: 8, y: -16, color: '#8b4513' },
        { x: 4, y: -12, color: '#8b4513' },
        { x: 0, y: -8, color: '#8b4513' }
      ]
      
      crackPixels.forEach(crack => {
        this.drawPixel(
          centerX + crack.x * pixelSize,
          centerY + crack.y * pixelSize,
          crack.color,
          pixelSize
        )
      })
    }
    
    private drawPixelSparkles(centerX: number, centerY: number) {
      const pixelSize = 4
      const time = Date.now() / 200
      
      // 闪烁的星星图案
      const sparklePositions = [
        { x: -40, y: -30 },
        { x: 45, y: -25 },
        { x: -35, y: 40 },
        { x: 40, y: 35 },
        { x: -20, y: -45 },
        { x: 25, y: 45 }
      ]
      
      sparklePositions.forEach((pos, index) => {
        const opacity = (Math.sin(time + index) + 1) / 2
        const color = `rgba(255, 215, 0, ${opacity})`
        
        // 绘制十字星形状
        this.ctx.fillStyle = color
        this.ctx.fillRect(centerX + pos.x - pixelSize, centerY + pos.y, pixelSize * 3, pixelSize)
        this.ctx.fillRect(centerX + pos.x, centerY + pos.y - pixelSize, pixelSize, pixelSize * 3)
      })
    }
  }

  // 渲染蛋的像素动画
  useEffect(() => {
    if (canvasRef.current) {
      const renderer = new PixelRenderer(canvasRef.current)
      
      const drawEgg = () => {
        renderer.drawEgg(hatchPhase)
      }
      
      drawEgg()
      
      // 动画循环
      if (isHatching) {
        const interval = setInterval(() => {
          setAnimationFrame(prev => prev + 1)
          drawEgg()
        }, 100)
        
        return () => clearInterval(interval)
      }
    }
  }, [isHatching, hatchPhase, animationFrame])
  
  // 宠物类型选项
  const petTypes: { type: PetType; name: string; description: string }[] = [
    { type: 'cat', name: '小猫', description: '优雅独立，神秘可爱' },
    { type: 'dog', name: '小狗', description: '忠诚友好，喜欢玩耍' },
    { type: 'rabbit', name: '兔子', description: '温顺可爱，活泼好动' },
    { type: 'bird', name: '小鸟', description: '聪明伶俐，善于歌唱' },
    { type: 'hamster', name: '仓鼠', description: '小巧精致，储存专家' },
    { type: 'fish', name: '金鱼', description: '安静优雅，水中精灵' }
  ]
  
  // 稀有度权重
  const rarityWeights = {
    common: 60,    // 60%
    rare: 25,      // 25%
    epic: 12,      // 12%
    legendary: 3   // 3%
  }
  
  // 随机选择稀有度
  const getRandomRarity = (): PetRarity => {
    const random = Math.random() * 100
    let cumulative = 0
    
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      cumulative += weight
      if (random <= cumulative) {
        return rarity as PetRarity
      }
    }
    
    return 'common'
  }
  
  // 生成随机名字
  const generateRandomName = (type: PetType): string => {
    const names = {
      cat: ['咪咪', '小花', '雪球', '橘子', '布丁', '奶茶', '糖糖', '月月'],
      dog: ['小白', '旺财', '豆豆', '球球', '毛毛', '乐乐', '贝贝', '妞妞'],
      rabbit: ['小白', '跳跳', '胡萝卜', '毛球', '雪花', '棉花', '软软', '蹦蹦'],
      bird: ['小黄', '啾啾', '彩虹', '音符', '翅膀', '天空', '自由', '歌声'],
      hamster: ['花生', '坚果', '圆球', '仓仓', '小米', '豆豆', '胖胖', '储储'],
      fish: ['泡泡', '游游', '金金', '水水', '珍珠', '海海', '蓝蓝', '波波']
    }
    
    const typeNames = names[type]
    return typeNames[Math.floor(Math.random() * typeNames.length)]
  }
  
  // 随机选择宠物类型
  const getRandomPetType = (): PetType => {
    const types: PetType[] = ['cat', 'dog', 'rabbit', 'bird', 'hamster', 'fish']
    return types[Math.floor(Math.random() * types.length)]
  }
  
  // 开始孵化（完全随机）
  const startHatching = () => {
    setIsHatching(true)
    setHatchPhase('shaking')
    setAnimationFrame(0)
    
    // 孵化动画序列
    createManagedTimeout(() => {
      setHatchPhase('cracking')
    }, 1000)
    
    createManagedTimeout(() => {
      setHatchPhase('hatching')
    }, 2000)
    
    createManagedTimeout(() => {
      const randomType = getRandomPetType()
      const rarity = getRandomRarity()
      const name = generateRandomName(randomType)
      
      const result: HatchResult = {
        type: randomType,
        rarity,
        name
      }
      
      setHatchResult(result)
      setIsHatching(false)
      setHatchPhase('idle')
    }, 3500)
  }
  
  // 确认孵化结果（仅使用本地存储）
  const confirmHatch = () => {
    if (!hatchResult) return
    
    try {
      // 生成本地宠物ID
      const petId = `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const currentTime = Date.now()
      
      // 创建本地宠物数据
      const newPet = {
        id: petId,
        name: hatchResult.name,
        type: hatchResult.type,
        stage: 'baby' as const,
        rarity: hatchResult.rarity,
        birth_time: currentTime,
        last_interaction: currentTime,
        last_update_time: currentTime,
        intimacy: 0
      }
      
      const initialStats = {
        pet_id: petId,
        hunger: 80,
        happiness: 90,
        cleanliness: 100,
        health: 100,
        energy: 100,
        experience: 0,
        level: 1
      }
      
      // 仅使用本地存储，不依赖任何外部服务
      setPet(newPet, initialStats)
      navigate('/')
    } catch (error) {
      console.error('孵化过程出错:', error)
    }
  }
  
  // 重新孵化
  const resetHatch = () => {
    setHatchResult(null)
    setHatchPhase('idle')
    setAnimationFrame(0)
  }
  
  // 稀有度颜色
  const getRarityColor = (rarity: PetRarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-600'
      case 'rare': return 'text-blue-500'
      case 'epic': return 'text-purple-500'
      case 'legendary': return 'text-yellow-500'
    }
  }
  
  // 稀有度名称
  const getRarityName = (rarity: PetRarity) => {
    switch (rarity) {
      case 'common': return '普通'
      case 'rare': return '稀有'
      case 'epic': return '史诗'
      case 'legendary': return '传说'
    }
  }
  
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles size={32} className="text-pink-200" />
            <h1 className="text-3xl font-pixel">神秘宠物孵化</h1>
            <Sparkles size={32} className="text-pink-200" />
          </div>
          <p className="text-pink-100">点击开始孵化，随机获得一只可爱的宠物！</p>
        </div>
      </div>
      
      {!hatchResult ? (
        <>
          {/* 蛋显示区域 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🥚</span>
                <h3 className="text-lg font-pixel font-bold">神秘宠物蛋</h3>
                <span className="text-2xl">🥚</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-center">
              <canvas 
                ref={canvasRef}
                width={320}
                height={240}
                className="mx-auto rounded-lg shadow-inner"
              />
              
              {isHatching && (
                <div className="text-white text-sm mt-4 p-3 bg-black bg-opacity-50 rounded-lg animate-pulse">
                  {hatchPhase === 'shaking' && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-bounce">🥚</span>
                      <span>蛋在轻轻摇摆...</span>
                    </div>
                  )}
                  {hatchPhase === 'cracking' && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-ping">💥</span>
                      <span>裂纹正在扩散...</span>
                    </div>
                  )}
                  {hatchPhase === 'hatching' && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-spin">✨</span>
                      <span>光芒四射！即将诞生...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* 孵化提示 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4">
              <div className="flex items-center justify-center gap-2">
                <Sparkles size={20} className="text-blue-200" />
                <h3 className="text-lg font-pixel font-bold">可能的宠物</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600 mb-4">
                这颗神秘的蛋里藏着什么样的宠物呢？
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-3 border border-pink-100 text-center">
                  <div className="text-2xl mb-1">🐱</div>
                  <div className="text-sm font-medium text-pink-700">优雅小猫</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100 text-center">
                  <div className="text-2xl mb-1">🐶</div>
                  <div className="text-sm font-medium text-blue-700">忠诚小狗</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100 text-center">
                  <div className="text-2xl mb-1">🐰</div>
                  <div className="text-sm font-medium text-green-700">可爱兔子</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-3 border border-yellow-100 text-center">
                  <div className="text-2xl mb-1">🐦</div>
                  <div className="text-sm font-medium text-yellow-700">聪明小鸟</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 border border-purple-100 text-center">
                  <div className="text-2xl mb-1">🐹</div>
                  <div className="text-sm font-medium text-purple-700">精致仓鼠</div>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-3 border border-teal-100 text-center">
                  <div className="text-2xl mb-1">🐠</div>
                  <div className="text-sm font-medium text-teal-700">优雅金鱼</div>
                </div>
              </div>
              
              {hatchPhase !== 'idle' && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-200">
                  <div className="text-center font-pixel text-purple-800">
                    {hatchPhase === 'shaking' && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="animate-bounce text-xl">🥚</span>
                        <span>蛋开始摇摆...</span>
                      </div>
                    )}
                    {hatchPhase === 'cracking' && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="animate-ping text-xl">💥</span>
                        <span>蛋壳出现裂纹！</span>
                      </div>
                    )}
                    {hatchPhase === 'hatching' && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="animate-spin text-xl">✨</span>
                        <span>即将孵化成功！</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 孵化按钮 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 text-center">
              <button
                onClick={startHatching}
                disabled={isHatching}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-pixel text-lg px-8 py-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
              >
                <div className="flex items-center justify-center gap-3">
                  {isHatching ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>孵化中...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🥚</span>
                      <span>开始孵化</span>
                      <span className="text-xl">✨</span>
                    </>
                  )}
                </div>
              </button>
              
              <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="text-sm text-yellow-800 font-medium">
                  💡 点击按钮开始孵化你的专属宠物！
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 孵化结果 */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🎉</span>
                <h2 className="text-xl font-pixel font-bold">孵化成功</h2>
                <span className="text-2xl">🎉</span>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-8xl mb-6 animate-bounce">
                {hatchResult.type === 'cat' && '🐱'}
                {hatchResult.type === 'dog' && '🐶'}
                {hatchResult.type === 'rabbit' && '🐰'}
                {hatchResult.type === 'bird' && '🐦'}
                {hatchResult.type === 'hamster' && '🐹'}
                {hatchResult.type === 'fish' && '🐠'}
              </div>
              
              <h3 className="text-2xl font-pixel mb-2 text-gray-800">{hatchResult.name}</h3>
              <div className="text-lg text-gray-600 mb-6">
                恭喜你获得了一只可爱的宠物！
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                  <div className="text-sm font-medium text-blue-600 mb-1">类型</div>
                  <div className="font-bold text-blue-800">
                    {hatchResult.type === 'cat' && '🐱 小猫'}
                    {hatchResult.type === 'dog' && '🐶 小狗'}
                    {hatchResult.type === 'rabbit' && '🐰 兔子'}
                    {hatchResult.type === 'bird' && '🐦 小鸟'}
                    {hatchResult.type === 'hamster' && '🐹 仓鼠'}
                    {hatchResult.type === 'fish' && '🐠 金鱼'}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                  <div className="text-sm font-medium text-purple-600 mb-1">稀有度</div>
                  <div className={`font-bold ${getRarityColor(hatchResult.rarity)}`}>
                    {getRarityName(hatchResult.rarity)}
                  </div>
                </div>
              </div>
              
              {hatchResult.rarity === 'legendary' && (
                <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border border-yellow-200">
                  <div className="text-yellow-800 font-pixel animate-pulse">
                    ✨ 恭喜获得传说级宠物！ ✨
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={confirmHatch}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-pixel text-lg px-6 py-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <span className="text-xl">✅</span>
              <span>确认收养</span>
            </button>
            
            <button
              onClick={resetHatch}
              className="bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white font-pixel text-lg px-6 py-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
            >
              <span className="text-xl">🔄</span>
              <span>重新孵化</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hatch