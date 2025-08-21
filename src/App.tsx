import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router/index'
import { usePetStore } from './store/petStore'

function App() {
  const { calculateOfflineEffects } = usePetStore()
  
  useEffect(() => {
    // 应用启动时计算离线时间影响
    calculateOfflineEffects()
  }, [])
  
  return (
    <div className="min-h-screen bg-pixel-bg font-pixel">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
