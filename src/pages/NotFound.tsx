import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

function NotFound() {
  return (
    <div className="min-h-screen bg-pixel-bg flex items-center justify-center p-4">
      <div className="text-center">
        <div className="pixel-screen bg-white p-8 mb-6">
          <div className="text-6xl font-pixel text-pixel-primary mb-4">404</div>
          <h1 className="text-2xl font-pixel mb-2">页面未找到</h1>
          <p className="text-sm text-gray-600 mb-6">
            抱歉，你访问的页面不存在或已被移动。
          </p>
          
          <div className="flex gap-3 justify-center">
            <Link 
              to="/" 
              className="pixel-button px-4 py-2 flex items-center gap-2"
            >
              <Home size={16} />
              回到首页
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-pixel hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              返回上页
            </button>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>如果问题持续存在，请检查网址是否正确</p>
        </div>
      </div>
    </div>
  )
}

export default NotFound