import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'

function GamePlay() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    // 验证游戏ID是否有效
    const validGameIds = ['memory', 'reaction', 'puzzle']
    if (!gameId || !validGameIds.includes(gameId)) {
      navigate('/games', { replace: true })
    }
  }, [gameId, navigate])

  const getGameTitle = (id: string) => {
    switch (id) {
      case 'memory': return '记忆游戏'
      case 'reaction': return '反应游戏'
      case 'puzzle': return '拼图游戏'
      default: return '未知游戏'
    }
  }

  if (!gameId) {
    return null
  }

  return (
    <div className="min-h-screen bg-pixel-bg p-4">
      <div className="max-w-md mx-auto">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/games')}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft size={18} />
                <span className="font-pixel text-sm">返回游戏</span>
              </button>
              <div className="text-center">
                <h1 className="text-2xl font-pixel font-bold">{getGameTitle(gameId)}</h1>
                <p className="text-sm text-purple-100 mt-1">挑战你的技能极限</p>
              </div>
              <div className="w-20"></div>
            </div>
          </div>
        </div>

        {/* 游戏区域 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4">
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🎮</span>
              <h2 className="font-pixel text-xl font-bold">游戏中心</h2>
              <span className="text-2xl">🎮</span>
            </div>
          </div>
          
          <div className="p-8 text-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 mb-6">
              <div className="text-6xl mb-4 animate-bounce">🚧</div>
              <h3 className="text-xl font-pixel text-gray-700 mb-2">{getGameTitle(gameId)}</h3>
              <p className="text-gray-600 mb-4">
                游戏功能正在紧张开发中...
              </p>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-xl">⚡</span>
                  <span className="font-medium text-yellow-700">即将上线</span>
                </div>
                <p className="text-sm text-yellow-600">
                  这个游戏将在后续版本中实现完整功能，敬请期待！
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/games')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-pixel px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
            >
              返回游戏列表
            </button>
          </div>
        </div>

        {/* 游戏说明 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">📋</span>
              <h3 className="font-pixel text-xl font-bold">游戏规则</h3>
              <span className="text-xl">📋</span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {gameId === 'memory' && (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🧠</span>
                    </div>
                    <span className="text-blue-700 font-medium">记住卡片的位置和图案</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🎯</span>
                    </div>
                    <span className="text-green-700 font-medium">翻开相同的卡片配对</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">⚡</span>
                    </div>
                    <span className="text-purple-700 font-medium">用最少的步数完成挑战</span>
                  </div>
                </>
              )}
              {gameId === 'reaction' && (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🟢</span>
                    </div>
                    <span className="text-green-700 font-medium">等待绿色信号出现</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">👆</span>
                    </div>
                    <span className="text-red-700 font-medium">尽快点击屏幕</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">⚡</span>
                    </div>
                    <span className="text-yellow-700 font-medium">测试你的反应速度</span>
                  </div>
                </>
              )}
              {gameId === 'puzzle' && (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🧩</span>
                    </div>
                    <span className="text-blue-700 font-medium">移动拼图块到正确位置</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🖼️</span>
                    </div>
                    <span className="text-green-700 font-medium">还原完整的图片</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🧠</span>
                    </div>
                    <span className="text-purple-700 font-medium">挑战你的逻辑思维</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GamePlay