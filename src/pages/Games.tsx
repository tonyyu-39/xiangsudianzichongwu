import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePetStore } from '../store/petStore'
import { PixelRenderer } from '../lib/pixelRenderer'
import { Gamepad2, Trophy, Star, ArrowLeft, RotateCcw } from 'lucide-react'

type GameType = 'memory' | 'reaction' | 'puzzle'

interface Game {
  id: GameType
  name: string
  description: string
  icon: React.ReactNode
  minLevel: number
  rewards: {
    experience: number
    happiness: number
  }
}

interface GameState {
  isPlaying: boolean
  score: number
  level: number
  timeLeft: number
  gameData: any
}

function Games() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { currentPet, petStats, updatePetStats, addGameRecord } = usePetStore()
  
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    level: 1,
    timeLeft: 0,
    gameData: null
  })
  
  // 如果没有宠物，重定向到孵化页面
  useEffect(() => {
    if (!currentPet) {
      navigate('/hatch')
    }
  }, [currentPet, navigate])
  
  // 游戏列表
  const games: Game[] = [
    {
      id: 'memory',
      name: '记忆游戏',
      description: '记住闪烁的方块顺序',
      icon: <Star size={24} />,
      minLevel: 1,
      rewards: { experience: 5, happiness: 10 }
    },
    {
      id: 'reaction',
      name: '反应游戏',
      description: '在正确的时机点击按钮',
      icon: <Gamepad2 size={24} />,
      minLevel: 1,
      rewards: { experience: 3, happiness: 8 }
    },
    {
      id: 'puzzle',
      name: '拼图游戏',
      description: '移动方块完成拼图',
      icon: <Trophy size={24} />,
      minLevel: 5,
      rewards: { experience: 8, happiness: 15 }
    }
  ]
  
  // 获取宠物等级
  const getPetLevel = () => {
    if (!petStats) return 1
    return Math.floor(petStats.experience / 100) + 1
  }
  
  // 记忆游戏逻辑
  const MemoryGame = () => {
    const [sequence, setSequence] = useState<number[]>([])
    const [playerSequence, setPlayerSequence] = useState<number[]>([])
    const [showingSequence, setShowingSequence] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [gamePhase, setGamePhase] = useState<'waiting' | 'showing' | 'input' | 'feedback'>('waiting')
    const [timeLeft, setTimeLeft] = useState(10)
    const [clickedBlock, setClickedBlock] = useState<number | null>(null)
    const [isCorrectClick, setIsCorrectClick] = useState<boolean | null>(null)
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)
    const [gameInitialized, setGameInitialized] = useState(false)
    const animationRef = useRef<boolean>(false)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)
    const timersRef = useRef<Set<NodeJS.Timeout>>(new Set())
    
    // 定时器管理辅助函数
    const createManagedTimeout = useCallback((callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timersRef.current.delete(timer)
        callback()
      }, delay)
      timersRef.current.add(timer)
      return timer
    }, [])
    
    // 组件卸载时清理所有定时器和动画
    useEffect(() => {
      return () => {
        // 清理防抖定时器
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }
        // 清理所有定时器
        timersRef.current.forEach(timer => clearTimeout(timer))
        timersRef.current.clear()
        // 重置动画状态
        animationRef.current = false
      }
    }, [])
    
    // 统一的颜色系统 - 使用useMemo优化性能
    const colorSystem = useMemo(() => {
      const baseColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
      const highlightColors = ['#FF8E8E', '#6EDDD6', '#67C3D3', '#A8D5C4', '#FFE4B5', '#E6B3E6']
      const darkColors = ['#FF4757', '#2ED573', '#3742FA', '#70A1FF', '#FFA502', '#5F27CD']
      const glowColors = ['#FFB3B3', '#8EEEE8', '#89D0E3', '#B8E0C8', '#FFF0C7', '#EBC3EB']
      
      return {
        colors: baseColors,
        activeColors: highlightColors,
        normalColors: darkColors,
        glowColors
      }
    }, [])
    
    const { colors, activeColors, normalColors, glowColors } = colorSystem
    
    // 统一的游戏状态重置函数
    const resetGameState = useCallback(() => {
      setSequence([])
      setPlayerSequence([])
      setCurrentStep(0)
      setGameOver(false)
      setShowingSequence(false)
      setGamePhase('waiting')
      setClickedBlock(null)
      setIsCorrectClick(null)
      setTimeLeft(10)
      setIsButtonDisabled(false)
      setGameInitialized(false)
      // 清理所有定时器
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current.clear()
      animationRef.current = false
      // 清理防抖定时器
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }, [])

    // 如果游戏未开始，显示开始界面
    if (!gameState.isPlaying) {
      return (
        <div className="p-8 text-center space-y-6" style={{ minHeight: '400px' }}>
          <div className="space-y-3">
            <div className="text-3xl">🧠</div>
            <h2 className="text-2xl font-pixel text-gray-800">记忆挑战</h2>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              记住方块闪烁的顺序，然后按相同顺序点击它们！考验你的记忆力和专注力。
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-center gap-4 text-sm">
              <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-800">
                💎 +10 经验
              </span>
              <span className="bg-green-100 px-3 py-1 rounded-full text-green-800">
                😊 +5 快乐
              </span>
            </div>
            
            <button 
              onClick={() => {
                if (isButtonDisabled) return
                setIsButtonDisabled(true)
                resetGameState()
                setGameState(prev => ({ ...prev, isPlaying: true, score: 0 }))
                setGameInitialized(true)
                createManagedTimeout(() => {
                  setIsButtonDisabled(false)
                }, 100)
              }}
              disabled={isButtonDisabled}
              className="pixel-button px-8 py-4 text-lg font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎯 开始挑战
            </button>
          </div>
        </div>
      )
    }
    
    // 简化游戏启动逻辑
    useEffect(() => {
      if (gameState.isPlaying && gameInitialized && sequence.length === 0 && !showingSequence && !gameOver) {
        startNewRound()
      }
    }, [gameState.isPlaying, gameInitialized, sequence.length, showingSequence, gameOver])
    
    const startNewRound = useCallback(() => {
      if (animationRef.current) return // 防止动画期间重复调用
      
      const newSequence = [...sequence, Math.floor(Math.random() * 6)]
      
      // 批量更新状态，减少重渲染
      setSequence(newSequence)
      setPlayerSequence([])
      setCurrentStep(0)
      setGameOver(false)
      setShowingSequence(true)
      setGamePhase('showing')
      setClickedBlock(null)
      setIsCorrectClick(null)
      
      // 给玩家更充足的时间，基于序列长度
      const baseTime = 8
      const timePerBlock = 3
      const bonusTime = Math.min(newSequence.length * 2, 10) // 最多额外10秒
      setTimeLeft(baseTime + newSequence.length * timePerBlock + bonusTime)
      
      // 立即显示序列，减少延迟
      createManagedTimeout(() => {
        showSequence(newSequence)
      }, 100)
    }, [sequence, createManagedTimeout])
    
    const drawGameBoard = useCallback(() => {
      if (!canvasRef.current) return
      
      const renderer = new PixelRenderer(canvasRef.current, 1)
      renderer.clear('#0f0f23')
      
      // 使用与showSequence相同的布局参数，确保一致性
      const blockWidth = 28
      const blockHeight = 22
      const gapX = 6
      const gapY = 6
      const totalWidth = 3 * blockWidth + 2 * gapX
      const totalHeight = 2 * blockHeight + gapY
      const startX = Math.floor((240 - totalWidth) / 2)
      const startY = Math.floor((160 - totalHeight) / 2)
        
      for (let i = 0; i < 6; i++) {
          const col = i % 3
          const row = Math.floor(i / 3)
          const x = startX + col * (blockWidth + gapX)
          const y = startY + row * (blockHeight + gapY)
          
          // 使用统一的颜色系统 - 修复颜色显示异常
          renderer.drawRect(x, y, blockWidth, blockHeight, colors[i])
          
          // 添加简单的边框效果，提升视觉效果
          renderer.drawRect(x + 1, y + 1, blockWidth - 2, 1, 'rgba(255, 255, 255, 0.3)')
          renderer.drawRect(x + 1, y + 1, 1, blockHeight - 2, 'rgba(255, 255, 255, 0.3)')
          renderer.drawRect(x + blockWidth - 2, y + blockHeight - 2, 1, 1, 'rgba(0, 0, 0, 0.3)')
          renderer.drawRect(x + 1, y + blockHeight - 2, blockWidth - 2, 1, 'rgba(0, 0, 0, 0.3)')
        }
    }, [colors])
    
    const showSequence = useCallback(async (seq: number[]) => {
      if (animationRef.current) return // 防止动画重复执行
      
      animationRef.current = true
      setShowingSequence(true)
      setGamePhase('showing')
      
      // 显示序列前的准备阶段，确保canvas已准备就绪
      if (canvasRef.current) {
        drawGameBoard()
        await new Promise(resolve => createManagedTimeout(() => resolve(undefined), 800))
      } else {
        animationRef.current = false
        return
      }
      
      // 优化布局参数，确保完全适配240x160的canvas
      const blockWidth = 28
      const blockHeight = 22
      const gapX = 6
      const gapY = 6
      const totalWidth = 3 * blockWidth + 2 * gapX
      const totalHeight = 2 * blockHeight + gapY
      const startX = Math.floor((240 - totalWidth) / 2)
      const startY = Math.floor((160 - totalHeight) / 2)
      
      const drawAllBlocks = (highlightIndex = -1) => {
        if (!canvasRef.current || !animationRef.current) return
        
        const renderer = new PixelRenderer(canvasRef.current, 1)
        renderer.clear('#0f0f23')
        
        for (let j = 0; j < 6; j++) {
          const col = j % 3
          const row = Math.floor(j / 3)
          const x = startX + col * (blockWidth + gapX)
          const y = startY + row * (blockHeight + gapY)
          
          const isHighlighted = j === highlightIndex
          
          if (isHighlighted) {
            // 高亮显示当前序列方块 - 使用更明显的高亮效果
            renderer.drawRect(x, y, blockWidth, blockHeight, '#FFFFFF')
            renderer.drawRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4, glowColors[j])
            
            // 添加闪烁边框效果
            renderer.drawRect(x - 1, y - 1, blockWidth + 2, 1, '#FFFF00')
            renderer.drawRect(x - 1, y + blockHeight, blockWidth + 2, 1, '#FFFF00')
            renderer.drawRect(x - 1, y - 1, 1, blockHeight + 2, '#FFFF00')
            renderer.drawRect(x + blockWidth, y - 1, 1, blockHeight + 2, '#FFFF00')
          } else {
            // 普通方块使用正常颜色
            renderer.drawRect(x, y, blockWidth, blockHeight, colors[j])
            // 添加简单的边框
            renderer.drawRect(x + 1, y + 1, blockWidth - 2, 1, 'rgba(255, 255, 255, 0.3)')
            renderer.drawRect(x + 1, y + 1, 1, blockHeight - 2, 'rgba(255, 255, 255, 0.3)')
          }
        }
      }
      
      // 显示序列 - 优化动画流畅性
      for (let i = 0; i < seq.length && animationRef.current; i++) {
        const colorIndex = seq[i]
        
        // 显示高亮方块
        drawAllBlocks(colorIndex)
        
        // 高亮持续时间根据序列长度调整，确保足够的视觉反馈
        const highlightDuration = Math.max(600, 1000 - seq.length * 40)
        await new Promise(resolve => createManagedTimeout(() => resolve(undefined), highlightDuration))
        
        // 检查动画是否被中断
        if (!animationRef.current) break
        
        // 恢复正常显示
        drawAllBlocks()
        
        // 间隔时间也根据序列长度调整，但保证最小间隔
        const intervalDuration = Math.max(400, 600 - seq.length * 30)
        await new Promise(resolve => createManagedTimeout(() => resolve(undefined), intervalDuration))
      }
      
      // 序列显示完毕，给玩家一点准备时间
      await new Promise(resolve => createManagedTimeout(() => resolve(undefined), 500))
      
      // 开始玩家输入阶段
      setShowingSequence(false)
      setGamePhase('input')
      setTimeLeft(Math.max(8, 18 - seq.length)) // 动态时间限制
      
      animationRef.current = false // 动画完成，重置标志
    }, [createManagedTimeout, drawGameBoard])
    
    const showClickFeedback = useCallback((colorIndex: number, isCorrect: boolean) => {
      if (!canvasRef.current) return
      
      const renderer = new PixelRenderer(canvasRef.current, 1)
      renderer.clear('#0f0f23')
      
      // 使用统一的布局参数
      const blockWidth = 28
      const blockHeight = 22
      const gapX = 6
      const gapY = 6
      const totalWidth = 3 * blockWidth + 2 * gapX
      const totalHeight = 2 * blockHeight + gapY
      const startX = Math.floor((240 - totalWidth) / 2)
      const startY = Math.floor((160 - totalHeight) / 2)
        
      for (let i = 0; i < 6; i++) {
          const col = i % 3
          const row = Math.floor(i / 3)
          const x = startX + col * (blockWidth + gapX)
          const y = startY + row * (blockHeight + gapY)
          
          if (i === colorIndex) {
              // 优化点击反馈效果
              const feedbackColor = isCorrect ? '#00FF88' : '#FF4444'
              const borderColor = isCorrect ? '#00FFAA' : '#FF6666'
              
              // 主方块
              renderer.drawRect(x, y, blockWidth, blockHeight, feedbackColor)
              
              // 添加边框
              renderer.drawRect(x - 1, y - 1, blockWidth + 2, 1, borderColor)
              renderer.drawRect(x - 1, y + blockHeight, blockWidth + 2, 1, borderColor)
              renderer.drawRect(x - 1, y - 1, 1, blockHeight + 2, borderColor)
              renderer.drawRect(x + blockWidth, y - 1, 1, blockHeight + 2, borderColor)
              
              // 添加内部高亮效果
              renderer.drawRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4, 'rgba(255, 255, 255, 0.3)')
            
            // 优化反馈图标
            if (isCorrect) {
              // 更清晰的勾号
              const centerX = x + blockWidth / 2
              const centerY = y + blockHeight / 2
              renderer.drawRect(centerX - 6, centerY, 4, 2, '#FFFFFF')
              renderer.drawRect(centerX - 2, centerY + 2, 2, 2, '#FFFFFF')
              renderer.drawRect(centerX, centerY, 2, 2, '#FFFFFF')
              renderer.drawRect(centerX + 2, centerY - 2, 2, 2, '#FFFFFF')
              renderer.drawRect(centerX + 4, centerY - 4, 2, 2, '#FFFFFF')
            } else {
              // 更清晰的叉号
              const centerX = x + blockWidth / 2
              const centerY = y + blockHeight / 2
              for (let offset = -4; offset <= 4; offset += 2) {
                renderer.drawRect(centerX + offset, centerY + offset, 2, 2, '#FFFFFF')
                renderer.drawRect(centerX + offset, centerY - offset, 2, 2, '#FFFFFF')
              }
            }
          } else {
            // 普通方块使用正常颜色，但稍微暗一些以突出反馈方块
            renderer.drawRect(x, y, blockWidth, blockHeight, normalColors[i])
            // 添加简单边框
            renderer.drawRect(x + 1, y + 1, blockWidth - 2, 1, 'rgba(255, 255, 255, 0.2)')
            renderer.drawRect(x + 1, y + 1, 1, blockHeight - 2, 'rgba(255, 255, 255, 0.2)')
          }
        }
    }, [normalColors])
    
    const endGame = useCallback((finalScore: number) => {
      setGameState(prev => ({ ...prev, isPlaying: false, score: finalScore }))
      
      if (currentPet && petStats) {
        const rewards = games.find(g => g.id === 'memory')!.rewards
        const bonusMultiplier = Math.max(1, finalScore / 3)
        const finalRewards = {
          experience: Math.floor(rewards.experience * bonusMultiplier),
          happiness: Math.floor(rewards.happiness * bonusMultiplier)
        }
        
        updatePetStats(finalRewards)
        addGameRecord({
          id: Date.now().toString(),
          pet_id: currentPet.id,
          game_type: 'memory',
          score: finalScore,
          timestamp: Date.now(),
          reward: finalRewards
        })
      }
      
      // 显示完成界面
        createManagedTimeout(() => {
          // Game complete logic can be added here
        }, 1000)
    }, [currentPet, petStats, updatePetStats, addGameRecord, createManagedTimeout])
    
    const handleColorClick = useCallback((colorIndex: number) => {
      if (showingSequence || gameOver || gamePhase !== 'input' || animationRef.current || isButtonDisabled) return
      
      setClickedBlock(colorIndex)
      setGamePhase('feedback')
      
      const newPlayerSequence = [...playerSequence, colorIndex]
      setPlayerSequence(newPlayerSequence)
      
      const isCorrect = newPlayerSequence[currentStep] === sequence[currentStep]
      setIsCorrectClick(isCorrect)
      
      // 显示点击反馈效果
      showClickFeedback(colorIndex, isCorrect)
      
      createManagedTimeout(() => {
        if (!isCorrect) {
          // 游戏结束
          setGameOver(true)
          setGamePhase('waiting')
          setIsButtonDisabled(false)
          endGame(sequence.length - 1)
        } else if (newPlayerSequence.length === sequence.length) {
          // 完成当前轮次
          setGameState(prev => ({ ...prev, score: prev.score + 1 }))
          createManagedTimeout(() => {
            setPlayerSequence([])
            setGamePhase('waiting')
            setClickedBlock(null)
            setTimeLeft(8 + sequence.length * 2)
            setIsButtonDisabled(false)
            startNewRound()
          }, 500)
        } else {
          setCurrentStep(currentStep + 1)
          setGamePhase('input')
          setClickedBlock(null)
          setIsCorrectClick(null)
          setTimeLeft(8 + sequence.length * 2)
          setIsButtonDisabled(false)
        }
      }, 600)
    }, [showingSequence, gameOver, gamePhase, playerSequence, currentStep, sequence, isButtonDisabled, showClickFeedback, endGame, startNewRound, createManagedTimeout])
    

    
    // 时间限制系统 - 修复React渲染警告
    useEffect(() => {
      let timer: NodeJS.Timeout
      if (gamePhase === 'input' && timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft(prev => {
            const newTime = prev - 1
            if (newTime <= 0) {
              // 使用setTimeout避免在渲染期间更新状态
              createManagedTimeout(() => {
                setGameOver(true)
                setGamePhase('waiting')
                setIsButtonDisabled(false) // 重置按钮状态
                endGame(sequence.length - 1)
              }, 0)
              return 0
            }
            return newTime
          })
        }, 1000)
      }
      return () => clearTimeout(timer)
    }, [gamePhase, timeLeft, sequence.length, endGame, createManagedTimeout])
    
    // 优化canvas绘制，减少不必要的重绘
    useEffect(() => {
      if (canvasRef.current) {
        drawGameBoard()
      }
    }, [gamePhase, clickedBlock, drawGameBoard])
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-lg font-pixel mb-2">记忆游戏</div>
          <div className="text-sm text-gray-600 mb-4">
            记住方块闪烁的顺序，然后按相同顺序点击
          </div>
          <div className="text-sm font-pixel mb-2">
            当前轮次: {sequence.length} | 得分: {gameState.score}
          </div>
          
          {/* 游戏状态提示 - 固定高度容器防止跳动 */}
          <div className="mb-4 h-24 flex flex-col justify-center items-center">
            {gamePhase === 'waiting' && (
              <div className="text-blue-600 font-pixel animate-pulse">
                🎯 准备开始新轮次...
              </div>
            )}
            {gamePhase === 'showing' && (
              <div className="text-yellow-600 font-pixel animate-pulse">
                👀 仔细观察序列！
              </div>
            )}
            {gamePhase === 'input' && (
              <div className="space-y-2">
                <div className="text-green-600 font-pixel">
                  🎮 轮到你了！按顺序点击方块
                </div>
                <div className={`text-sm font-pixel ${
                  timeLeft <= 3 ? 'text-red-500 animate-bounce' : 'text-gray-600'
                }`}>
                  ⏰ 剩余时间: {timeLeft}秒
                </div>
                <div className="text-xs text-gray-500">
                  进度: {playerSequence.length}/{sequence.length}
                </div>
              </div>
            )}
            {gamePhase === 'feedback' && (
              <div className={`font-pixel ${
                isCorrectClick ? 'text-green-600' : 'text-red-600'
              }`}>
                {isCorrectClick ? '✅ 正确！' : '❌ 错误！'}
              </div>
            )}
          </div>
        </div>
        
        {/* 固定尺寸的游戏容器，防止布局跳动 */}
        <div className="pixel-screen bg-gradient-to-b from-gray-800 to-gray-900 p-4 max-w-md mx-auto shadow-2xl" style={{ width: '400px', height: '280px', minHeight: '280px' }}>
          <div className="relative mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-slate-600 overflow-hidden shadow-inner" style={{ width: '320px', height: '213px' }}>
            <canvas 
              ref={canvasRef}
              width={240}
              height={160}
              className={`absolute inset-0 m-auto transition-all duration-200 block ${
                (showingSequence || gameOver || gamePhase !== 'input' || isButtonDisabled) 
                  ? 'cursor-not-allowed opacity-75' 
                  : 'cursor-pointer hover:brightness-125'
              }`}
              style={{ 
                width: '300px',
                height: '200px',
                imageRendering: 'pixelated',
                objectFit: 'contain',
                filter: 'contrast(1.2) saturate(1.4) brightness(1.1)'
              }}
              onClick={(e) => {
                // 防止误触和重复点击
                if (showingSequence || gameOver || gamePhase !== 'input' || isButtonDisabled) {
                  e.preventDefault()
                  return
                }
                
                // 防抖处理
                if (debounceRef.current) {
                  clearTimeout(debounceRef.current)
                }
                
                debounceRef.current = createManagedTimeout(() => {
                  if (!canvasRef.current) return
                  
                  setIsButtonDisabled(true)
                  
                  const rect = canvasRef.current.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const clickY = e.clientY - rect.top
                  
                  // 获取canvas的实际显示尺寸和原始尺寸的比例
                  const scaleX = 240 / rect.width
                  const scaleY = 160 / rect.height
                  
                  // 转换为canvas坐标系统
                  const canvasX = clickX * scaleX
                  const canvasY = clickY * scaleY
                  
                  // 使用与绘制函数相同的布局参数，确保点击检测准确
                  const blockWidth = 28
                  const blockHeight = 22
                  const gapX = 6
                  const gapY = 6
                  const totalWidth = 3 * blockWidth + 2 * gapX
                  const totalHeight = 2 * blockHeight + gapY
                  const startX = Math.floor((240 - totalWidth) / 2)
                  const startY = Math.floor((160 - totalHeight) / 2)
                  
                  let clickHandled = false
                  
                  // 计算点击的方块索引
                  for (let i = 0; i < 6; i++) {
                    const row = Math.floor(i / 3)
                    const col = i % 3
                    const blockX = startX + col * (blockWidth + gapX)
                    const blockY = startY + row * (blockHeight + gapY)
                    
                    // 添加一些容错范围，提高点击准确性
                    const tolerance = 2
                    if (canvasX >= blockX - tolerance && canvasX < blockX + blockWidth + tolerance && 
                        canvasY >= blockY - tolerance && canvasY < blockY + blockHeight + tolerance) {
                      handleColorClick(i)
                      clickHandled = true
                      break
                    }
                  }
                  
                  // 如果没有点击到有效方块，重新启用交互
                  if (!clickHandled) {
                    createManagedTimeout(() => {
                      setIsButtonDisabled(false)
                    }, 100)
                  }
                }, 150) // 150ms防抖延迟
              }}
            />
          </div>
        </div>
        
        {/* 额外的交互提示 */}
        {gamePhase === 'input' && (
          <div className="text-center space-y-2">
            <div className="text-xs text-gray-500">
              💡 提示：按照刚才闪烁的顺序点击方块
            </div>
            {timeLeft <= 5 && (
              <div className="text-xs text-orange-500 animate-pulse">
                ⚠️ 时间不多了，快点击！
              </div>
            )}
          </div>
        )}
        
        {gameOver && (
          <div className="text-center space-y-6 bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-200">
            <div className="space-y-3">
              <div className="text-4xl animate-bounce">💥</div>
              <div className="text-2xl font-pixel text-red-600">游戏结束！</div>
              <div className="text-lg font-pixel text-gray-700">最终得分: {gameState.score} 轮</div>
              <div className="text-sm text-gray-600">
                {gameState.score >= 5 ? '🎉 表现出色！' : 
                 gameState.score >= 3 ? '👍 不错的成绩！' : 
                 '💪 继续努力！'}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-4">
                选择你的下一步行动：
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button 
                  onClick={() => {
                    if (animationRef.current || isButtonDisabled) return
                    setIsButtonDisabled(true)
                    createManagedTimeout(() => {
                      resetGameState()
                      setGameState(prev => ({ ...prev, isPlaying: false, score: 0 }))
                      setIsButtonDisabled(false)
                    }, 150)
                  }}
                  disabled={animationRef.current || isButtonDisabled}
                  className="pixel-button px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-pixel transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                >
                  🔄 重新开始
                </button>
                
                <button 
                  onClick={() => {
                    if (animationRef.current || isButtonDisabled) return
                    setIsButtonDisabled(true)
                    createManagedTimeout(() => {
                      resetGameState()
                      setGameState(prev => ({ ...prev, isPlaying: true, score: 0 }))
                      createManagedTimeout(() => {
                        setGameInitialized(true)
                        setIsButtonDisabled(false)
                      }, 300)
                    }, 150)
                  }}
                  disabled={animationRef.current || isButtonDisabled}
                  className="pixel-button px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-pixel transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                >
                  🎯 继续挑战
                </button>
                
                <button 
                  onClick={() => {
                    if (isButtonDisabled) return
                    setIsButtonDisabled(true)
                    createManagedTimeout(() => {
                      backToGameList()
                      setIsButtonDisabled(false)
                    }, 150)
                  }}
                  disabled={isButtonDisabled}
                  className="pixel-button px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-pixel transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                >
                  📋 返回游戏列表
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // 反应游戏逻辑
  const ReactionGame = () => {
    const [isWaiting, setIsWaiting] = useState(false)
    const [showTarget, setShowTarget] = useState(false)
    const [reactionTime, setReactionTime] = useState<number | null>(null)
    const [startTime, setStartTime] = useState(0)
    const [round, setRound] = useState(1)
    const [totalScore, setTotalScore] = useState(0)
    const reactionTimersRef = useRef<Set<NodeJS.Timeout>>(new Set())
    
    // 创建受管理的定时器
    const createManagedTimeout = useCallback((callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        reactionTimersRef.current.delete(timer)
        callback()
      }, delay)
      reactionTimersRef.current.add(timer)
      return timer
    }, [])
    
    // 组件卸载时清理定时器
    useEffect(() => {
      return () => {
        reactionTimersRef.current.forEach(timer => clearTimeout(timer))
        reactionTimersRef.current.clear()
      }
    }, [])
    
    // 如果游戏未开始，显示开始界面
    if (!gameState.isPlaying) {
      return (
        <div className="p-8 text-center space-y-6">
          <div className="space-y-3">
            <div className="text-3xl">⚡</div>
            <h2 className="text-2xl font-pixel text-gray-800">反应挑战</h2>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              测试你的反应速度！等待绿色信号出现时立即点击，但不要太早哦！
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-center gap-4 text-sm">
              <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-800">
                💎 +8 经验
              </span>
              <span className="bg-green-100 px-3 py-1 rounded-full text-green-800">
                😊 +3 快乐
              </span>
            </div>
            
            <button 
              onClick={() => setGameState(prev => ({ ...prev, isPlaying: true }))}
              className="pixel-button px-8 py-4 text-lg font-medium hover:scale-105 transition-transform"
            >
              ⚡ 开始挑战
            </button>
          </div>
        </div>
      )
    }
    
    const startRound = () => {
      setIsWaiting(true)
      setShowTarget(false)
      setReactionTime(null)
      
      // 随机延迟1-4秒后显示目标
      const delay = Math.random() * 3000 + 1000
      createManagedTimeout(() => {
        setShowTarget(true)
        setStartTime(Date.now())
        setIsWaiting(false)
      }, delay)
    }
    
    const handleClick = () => {
      if (isWaiting) {
        // 太早点击
        setReactionTime(-1)
        setIsWaiting(false)
      } else if (showTarget) {
        // 正确反应
        const time = Date.now() - startTime
        setReactionTime(time)
        setShowTarget(false)
        
        // 计算得分（反应时间越短得分越高）
        const score = Math.max(0, 1000 - time)
        setTotalScore(prev => prev + score)
        
        if (round < 5) {
          createManagedTimeout(() => {
            setRound(prev => prev + 1)
            startRound()
          }, 1500)
        } else {
          // 游戏结束
          createManagedTimeout(() => {
            endReactionGame(totalScore + score)
          }, 1500)
        }
      }
    }
    
    const endReactionGame = (finalScore: number) => {
      setGameState(prev => ({ ...prev, isPlaying: false, score: finalScore }))
      
      if (currentPet && petStats) {
        const rewards = games.find(g => g.id === 'reaction')!.rewards
        const bonusMultiplier = Math.max(1, finalScore / 2000)
        const finalRewards = {
          experience: Math.floor(rewards.experience * bonusMultiplier),
          happiness: Math.floor(rewards.happiness * bonusMultiplier)
        }
        
        updatePetStats(finalRewards)
        addGameRecord({
          id: Date.now().toString(),
          pet_id: currentPet.id,
          game_type: 'reaction',
          score: finalScore,
          timestamp: Date.now(),
          reward: finalRewards
        })
      }
    }
    
    useEffect(() => {
      if (gameState.isPlaying && round === 1 && !isWaiting && !showTarget) {
        startRound()
      }
    }, [gameState.isPlaying])
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-lg font-pixel mb-2">反应游戏</div>
          <div className="text-sm text-gray-600 mb-4">
            等待绿色出现时立即点击，不要太早！
          </div>
          <div className="text-sm font-pixel">
            轮次: {round}/5 | 总分: {totalScore}
          </div>
        </div>
        
        <div 
          className={`pixel-screen min-h-48 max-w-md mx-auto flex items-center justify-center cursor-pointer transition-colors p-6 rounded-lg ${
            isWaiting ? 'bg-red-500' : showTarget ? 'bg-green-500' : 'bg-gray-400'
          }`}
          onClick={handleClick}
        >
          <div className="text-white text-center">
            {isWaiting && <div className="text-xl font-pixel">等待...</div>}
            {showTarget && <div className="text-xl font-pixel animate-pixel-pulse">点击！</div>}
            {!isWaiting && !showTarget && reactionTime === null && (
              <div className="text-xl font-pixel">准备好了吗？</div>
            )}
            {reactionTime !== null && (
              <div className="text-lg font-pixel">
                {reactionTime === -1 ? '太早了！' : `${reactionTime}ms`}
              </div>
            )}
          </div>
        </div>
        
        {round > 5 && (
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-2xl">🎉</div>
              <div className="text-xl font-pixel text-green-600">挑战完成！</div>
              <div className="text-sm text-gray-600">最终得分: {totalScore}</div>
            </div>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => {
                  setRound(1)
                  setTotalScore(0)
                  setReactionTime(null)
                  setGameState(prev => ({ ...prev, isPlaying: true, score: 0 }))
                }}
                className="pixel-button px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                🔄 再玩一次
              </button>
              
              <button 
                onClick={backToGameList}
                className="pixel-button px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white"
              >
                📋 返回游戏列表
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // 拼图游戏逻辑
  const PuzzleGame = () => {
    const [puzzle, setPuzzle] = useState<number[]>([])
    const [moves, setMoves] = useState(0)
    const [isComplete, setIsComplete] = useState(false)
    const [startTime, setStartTime] = useState(0)
    
    // 如果游戏未开始，显示开始界面
    if (!gameState.isPlaying) {
      return (
        <div className="p-8 text-center space-y-6">
          <div className="space-y-3">
            <div className="text-3xl">🧩</div>
            <h2 className="text-2xl font-pixel text-gray-800">数字拼图</h2>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              将数字按顺序排列！点击数字方块移动到空白位置，挑战你的逻辑思维。
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-center gap-4 text-sm">
              <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-800">
                💎 +12 经验
              </span>
              <span className="bg-green-100 px-3 py-1 rounded-full text-green-800">
                😊 +4 快乐
              </span>
            </div>
            
            <button 
              onClick={() => setGameState(prev => ({ ...prev, isPlaying: true }))}
              className="pixel-button px-8 py-4 text-lg font-medium hover:scale-105 transition-transform"
            >
              🧩 开始挑战
            </button>
          </div>
        </div>
      )
    }
    
    // 初始化拼图
    const initPuzzle = () => {
      const numbers = Array.from({ length: 8 }, (_, i) => i + 1).concat([0]) // 0表示空格
      // 随机打乱
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[numbers[i], numbers[j]] = [numbers[j], numbers[i]]
      }
      setPuzzle(numbers)
      setMoves(0)
      setIsComplete(false)
      setStartTime(Date.now())
    }
    
    // 检查是否完成
    const checkComplete = (newPuzzle: number[]) => {
      const target = [1, 2, 3, 4, 5, 6, 7, 8, 0]
      return newPuzzle.every((num, index) => num === target[index])
    }
    
    // 移动方块
    const moveTile = (index: number) => {
      if (isComplete) return
      
      const emptyIndex = puzzle.findIndex(num => num === 0)
      const row = Math.floor(index / 3)
      const col = index % 3
      const emptyRow = Math.floor(emptyIndex / 3)
      const emptyCol = emptyIndex % 3
      
      // 检查是否可以移动（相邻）
      const canMove = 
        (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow)
      
      if (canMove) {
        const newPuzzle = [...puzzle]
        ;[newPuzzle[index], newPuzzle[emptyIndex]] = [newPuzzle[emptyIndex], newPuzzle[index]]
        setPuzzle(newPuzzle)
        setMoves(prev => prev + 1)
        
        if (checkComplete(newPuzzle)) {
          setIsComplete(true)
          const timeUsed = Date.now() - startTime
          const score = Math.max(0, 10000 - moves * 100 - Math.floor(timeUsed / 1000) * 10)
          endPuzzleGame(score)
        }
      }
    }
    
    const endPuzzleGame = (finalScore: number) => {
      setGameState(prev => ({ ...prev, isPlaying: false, score: finalScore }))
      
      if (currentPet && petStats) {
        const rewards = games.find(g => g.id === 'puzzle')!.rewards
        const bonusMultiplier = Math.max(1, finalScore / 5000)
        const finalRewards = {
          experience: Math.floor(rewards.experience * bonusMultiplier),
          happiness: Math.floor(rewards.happiness * bonusMultiplier)
        }
        
        updatePetStats(finalRewards)
        addGameRecord({
          id: Date.now().toString(),
          pet_id: currentPet.id,
          game_type: 'puzzle',
          score: finalScore,
          timestamp: Date.now(),
          reward: finalRewards
        })
      }
    }
    
    useEffect(() => {
      if (gameState.isPlaying && puzzle.length === 0) {
        initPuzzle()
      }
    }, [gameState.isPlaying])
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-lg font-pixel mb-2">数字拼图</div>
          <div className="text-sm text-gray-600 mb-4">
            将数字按顺序排列，空格在右下角
          </div>
          <div className="text-sm font-pixel">
            移动次数: {moves} | 时间: {Math.floor((Date.now() - startTime) / 1000)}s
          </div>
        </div>
        
        <div className="pixel-screen bg-gray-800 p-6 max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-3 w-fit mx-auto">
            {puzzle.map((num, index) => (
              <div
                key={index}
                className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-lg sm:text-xl font-pixel cursor-pointer transition-colors rounded ${
                  num === 0 
                    ? 'bg-gray-700 border-2 border-gray-600' 
                    : 'bg-blue-500 hover:bg-blue-400 text-white border-2 border-blue-400 shadow-lg'
                }`}
                onClick={() => moveTile(index)}
              >
                {num === 0 ? '' : num}
              </div>
            ))}
          </div>
        </div>
        
        {isComplete && (
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-2xl">🎉</div>
              <div className="text-xl font-pixel text-green-600">拼图完成！</div>
              <div className="text-sm text-gray-600">
                得分: {gameState.score} | 移动: {moves}次
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => {
                  initPuzzle()
                  setGameState(prev => ({ ...prev, isPlaying: true, score: 0 }))
                }}
                className="pixel-button px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                🔄 再玩一次
              </button>
              
              <button 
                onClick={backToGameList}
                className="pixel-button px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white"
              >
                📋 返回游戏列表
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // 开始游戏
  const startGame = (gameType: GameType) => {
    setSelectedGame(gameType)
    setGameState({
      isPlaying: true,
      score: 0,
      level: 1,
      timeLeft: 0,
      gameData: null
    })
  }
  
  // 返回游戏列表
  const backToGameList = () => {
    setSelectedGame(null)
    setGameState({
      isPlaying: false,
      score: 0,
      level: 1,
      timeLeft: 0,
      gameData: null
    })
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
  
  const petLevel = getPetLevel()
  
  // 如果选择了游戏，显示游戏界面
  if (selectedGame) {
    const currentGame = games.find(g => g.id === selectedGame)
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* 游戏头部 */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <button 
                onClick={backToGameList}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft size={16} />
                返回游戏列表
              </button>
              
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    {currentGame?.icon}
                  </div>
                  <h1 className="text-2xl font-pixel">
                    {currentGame?.name}
                  </h1>
                </div>
                <p className="text-purple-100">
                  和 {currentPet.name} 一起挑战游戏！
                </p>
              </div>
              
              <div className="text-right">
                <div className="bg-white/20 px-4 py-2 rounded-xl">
                  <span className="font-medium">等级 {getPetLevel()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 游戏内容 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {selectedGame === 'memory' && <MemoryGame />}
            {selectedGame === 'reaction' && <ReactionGame />}
            {selectedGame === 'puzzle' && <PuzzleGame />}
          </div>
        </div>
      </div>
    )
  }
  
  // 游戏列表界面
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Gamepad2 size={32} className="text-yellow-300" />
              <h1 className="text-3xl font-pixel">宠物游戏中心</h1>
              <Gamepad2 size={32} className="text-yellow-300" />
            </div>
            <p className="text-purple-100">和 {currentPet.name} 一起玩游戏赚取经验！</p>
          </div>
        </div>
        
        {/* 宠物等级信息 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
            <div className="flex items-center justify-center gap-2">
              <Trophy size={20} className="text-yellow-300" />
              <h2 className="text-lg font-pixel font-bold">
                {currentPet.name} 的游戏档案
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="flex justify-center items-center gap-6 text-sm">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-md">
                <span className="font-medium">等级 {petLevel}</span>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-md">
                <span className="font-medium">经验值: {petStats.experience % 100}/100</span>
              </div>
            </div>
          </div>
        </div>
      
        {/* 游戏列表 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4">
            <div className="flex items-center justify-center gap-2">
              <Star size={20} className="text-yellow-300" />
              <h2 className="text-lg font-pixel font-bold">可用游戏</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {games.map((game) => {
                const isLocked = petLevel < game.minLevel
                
                return (
                  <div 
                    key={game.id}
                    className={`bg-gray-50 rounded-2xl border-2 transition-all duration-300 ${
                      isLocked 
                        ? 'border-gray-200 opacity-60' 
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-xl hover:bg-white cursor-pointer transform hover:-translate-y-1'
                    }`}
                    onClick={() => !isLocked && startGame(game.id)}
                  >
                    <div className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        isLocked 
                          ? 'bg-gray-300 text-gray-500' 
                          : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg'
                      }`}>
                        {game.icon}
                      </div>
                      
                      <div className="mb-3">
                        <h3 className="font-pixel font-bold text-lg text-gray-800 mb-1">{game.name}</h3>
                        {isLocked && (
                          <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                            🔒 需要 Lv.{game.minLevel}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{game.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-center gap-2">
                          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                            ⭐ +{game.rewards.experience} 经验
                          </span>
                          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                            😊 +{game.rewards.happiness} 快乐
                          </span>
                        </div>
                        
                        {!isLocked && (
                          <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105">
                            🎯 开始游戏
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      
        {/* 游戏提示 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4">
            <div className="flex items-center justify-center gap-2">
              <Star size={20} className="text-yellow-200" />
              <h2 className="text-lg font-pixel font-bold">游戏小贴士</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-blue-800 font-medium">通过游戏可以快速获得经验值和快乐度</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🔓</div>
                <p className="text-purple-800 font-medium">宠物等级越高，解锁更多游戏</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🔄</div>
                <p className="text-green-800 font-medium">可以重复游玩，每次都能获得奖励</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Games)