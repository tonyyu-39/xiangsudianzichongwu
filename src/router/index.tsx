import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '../components/Layout'
import Home from '../pages/Home'
import Hatch from '../pages/Hatch'
import Interact from '../pages/Interact'
import Games from '../pages/Games'
import GamePlay from '../pages/GamePlay'
import Profile from '../pages/Profile'
import Settings from '../pages/Settings'
import NotFound from '../pages/NotFound'

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'hatch',
        element: <Hatch />
      },
      {
        path: 'interact',
        element: <Interact />
      },
      {
        path: 'games',
        element: <Games />
      },
      {
        path: 'games/:gameId',
        element: <GamePlay />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  }
])

// 导出路由配置
export { router }

// 路由提供者组件
export default function AppRouter() {
  return <RouterProvider router={router} />
}