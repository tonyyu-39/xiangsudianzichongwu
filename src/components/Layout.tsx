import { Outlet, useLocation, Link } from 'react-router-dom'
import { Home, Heart, Gamepad2, User, Settings, Egg } from 'lucide-react'
import { usePetStore } from '../store/petStore'
import { useEffect } from 'react'

const Layout = () => {
  const location = useLocation()
  const { currentPet, calculateOfflineEffects } = usePetStore()
  
  // 应用启动时计算离线时间影响
  useEffect(() => {
    calculateOfflineEffects()
  }, [])
  
  const navItems = [
    { path: '/', icon: Home, label: '主页', show: true },
    { path: '/hatch', icon: Egg, label: '孵化', show: !currentPet },
    { path: '/interact', icon: Heart, label: '互动', show: !!currentPet },
    { path: '/games', icon: Gamepad2, label: '游戏', show: !!currentPet },
    { path: '/profile', icon: User, label: '档案', show: !!currentPet },
    { path: '/settings', icon: Settings, label: '设置', show: true }
  ]
  
  const visibleNavItems = navItems.filter(item => item.show)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pixel-bg via-green-50 to-blue-50 flex flex-col">
      {/* 头部标题栏 */}
      <header className="bg-gradient-to-r from-pixel-dark to-gray-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pixel-primary rounded-lg flex items-center justify-center">
                <span className="text-pixel-dark font-bold text-lg">🐾</span>
              </div>
              <h1 className="text-xl font-bold font-pixel">
                像素电子宠物
              </h1>
            </div>
            
            {currentPet && (
              <div className="flex items-center gap-2 bg-white bg-opacity-10 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-pixel-primary rounded-full animate-pulse"></div>
                <span className="text-pixel-primary font-pixel text-sm">{currentPet.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* 主要内容区域 */}
      <main className="flex-1 w-full overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="min-h-[calc(100vh-200px)] pb-20">
            <Outlet />
          </div>
        </div>
      </main>
      
      {/* 底部导航栏 */}
      <nav className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex gap-1 bg-gray-50 rounded-full p-1 my-2">
              {visibleNavItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex flex-col items-center px-4 py-2 rounded-full transition-all duration-200 min-w-[70px] ${
                      isActive 
                        ? 'bg-pixel-primary text-pixel-dark shadow-md transform scale-105' 
                        : 'text-gray-600 hover:text-pixel-dark hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'animate-pixel-bounce' : ''} />
                    <span className="text-xs mt-1 font-pixel">{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Layout