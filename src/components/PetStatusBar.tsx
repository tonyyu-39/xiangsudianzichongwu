import { PetStats } from '../lib/supabase'

interface PetStatusBarProps {
  stats: PetStats
}

function PetStatusBar({ stats }: PetStatusBarProps) {
  const getStatusColor = (value: number) => {
    if (value >= 70) return 'bg-green-500'
    if (value >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  const getStatusText = (value: number) => {
    if (value >= 80) return '很好'
    if (value >= 60) return '良好'
    if (value >= 40) return '一般'
    if (value >= 20) return '较差'
    return '很差'
  }
  
  const statusItems = [
    { label: '饥饿度', value: stats.hunger, icon: '🍖' },
    { label: '快乐度', value: stats.happiness, icon: '😊' },
    { label: '清洁度', value: stats.cleanliness, icon: '✨' },
    { label: '健康度', value: stats.health, icon: '❤️' }
  ]
  
  return (
    <div className="pixel-screen bg-white p-4">
      <h3 className="font-pixel text-sm mb-3 text-center">宠物状态</h3>
      
      <div className="space-y-3">
        {statusItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-sm w-2">{item.icon}</span>
            <span className="text-xs font-pixel w-12">{item.label}</span>
            
            <div className="flex-1 relative">
              <div className="pixel-progress">
                <div 
                  className={`pixel-progress-fill ${getStatusColor(item.value)}`}
                  style={{ width: `${Math.max(0, Math.min(100, item.value))}%` }}
                />
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-pixel text-white drop-shadow-sm">
                  {Math.round(item.value)}
                </span>
              </div>
            </div>
            
            <span className="text-xs text-gray-600 w-8">
              {getStatusText(item.value)}
            </span>
          </div>
        ))}
      </div>
      
      {/* 经验值显示 */}
      <div className="mt-4 pt-3 border-t border-gray-300">
        <div className="flex items-center gap-3">
          <span className="text-sm">⭐</span>
          <span className="text-xs font-pixel w-12">经验值</span>
          
          <div className="flex-1 relative">
            <div className="pixel-progress">
              <div 
                className="pixel-progress-fill bg-blue-500"
                style={{ width: `${(stats.experience % 100)}%` }}
              />
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-pixel text-white drop-shadow-sm">
                {stats.experience % 100}/100
              </span>
            </div>
          </div>
          
          <span className="text-xs text-gray-600 w-8">
            Lv.{Math.floor(stats.experience / 100) + 1}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PetStatusBar