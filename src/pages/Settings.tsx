import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePetStore } from '../store/petStore'
import { TimeManager } from '../lib/timeManager'
import { getVersion, getFormattedBuildTime } from '../lib/version'
import { Settings as SettingsIcon, Trash2, Download, Upload, RefreshCw, AlertTriangle, Info, Clock, Zap } from 'lucide-react'

function Settings() {
  const navigate = useNavigate()
  const { currentPet, resetPet, petStats } = usePetStore()
  
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showExportData, setShowExportData] = useState(false)
  const [importData, setImportData] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showVersionInfo, setShowVersionInfo] = useState(false)
  const [showAboutInfo, setShowAboutInfo] = useState(false)
  
  // 时间管理设置
  const [timeSpeed, setTimeSpeed] = useState(() => {
    return parseFloat(localStorage.getItem('timeSpeed') || '1')
  })
  const [offlineCalculation, setOfflineCalculation] = useState(() => {
    return localStorage.getItem('offlineCalculation') !== 'false'
  })
  
  // 导出宠物数据
  const exportPetData = () => {
    if (!currentPet || !petStats) return
    
    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      pet: currentPet,
      stats: petStats,
      // 可以添加更多数据
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentPet.name}_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setShowExportData(false)
  }
  
  // 导入宠物数据
  const importPetData = () => {
    try {
      const data = JSON.parse(importData)
      
      // 验证数据格式
      if (!data.pet || !data.stats) {
        throw new Error('数据格式不正确')
      }
      
      // 这里可以添加更多验证逻辑
      
      // 导入数据（这里简化处理，实际应该更谨慎）
      console.log('导入数据:', data)
      alert('数据导入功能正在开发中...')
      
      setShowImportDialog(false)
      setImportData('')
    } catch (error) {
      alert('导入失败：数据格式不正确')
    }
  }
  
  // 重置宠物数据
  const handleResetPet = () => {
    resetPet()
    setShowResetConfirm(false)
    navigate('/hatch')
  }
  
  // 更新时间速度
  const updateTimeSpeed = (speed: number) => {
    setTimeSpeed(speed)
    localStorage.setItem('timeSpeed', speed.toString())
  }
  
  // 切换离线计算
  const toggleOfflineCalculation = () => {
    const newValue = !offlineCalculation
    setOfflineCalculation(newValue)
    localStorage.setItem('offlineCalculation', newValue.toString())
  }
  
  // 设置项配置
  const settingsSections = [
    {
      title: '时间管理',
      items: [
        {
          id: 'timeSpeed',
          name: '时间速度',
          description: `当前速度: ${timeSpeed}x (影响宠物状态变化速度)`,
          icon: <Clock size={20} />,
          action: () => {},
          custom: true
        },
        {
          id: 'offlineCalculation',
          name: '离线时间计算',
          description: offlineCalculation ? '开启 - 离线时宠物状态会继续变化' : '关闭 - 离线时宠物状态暂停',
          icon: <Zap size={20} />,
          action: toggleOfflineCalculation,
          toggle: true,
          enabled: offlineCalculation
        }
      ]
    },
    {
      title: '宠物管理',
      items: [
        {
          id: 'export',
          name: '导出宠物数据',
          description: '备份当前宠物的所有数据',
          icon: <Download size={20} />,
          action: () => setShowExportData(true),
          disabled: !currentPet
        },
        {
          id: 'import',
          name: '导入宠物数据',
          description: '从备份文件恢复宠物数据',
          icon: <Upload size={20} />,
          action: () => setShowImportDialog(true)
        },
        {
          id: 'reset',
          name: '重置宠物',
          description: '删除当前宠物，重新开始',
          icon: <RefreshCw size={20} />,
          action: () => setShowResetConfirm(true),
          disabled: !currentPet,
          danger: true
        }
      ]
    },
    {
      title: '应用信息',
      items: [
        {
          id: 'version',
          name: '版本信息',
          description: '像素宠物 v1.0.0',
          icon: <Info size={20} />,
          action: () => setShowVersionInfo(true)
        },
        {
          id: 'about',
          name: '关于应用',
          description: '一个可爱的像素风格电子宠物应用',
          icon: <SettingsIcon size={20} />,
          action: () => setShowAboutInfo(true)
        }
      ]
    }
  ]
  
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-gray-600 to-slate-600 text-white p-6 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <SettingsIcon size={32} className="text-gray-200" />
            <h1 className="text-3xl font-pixel">设置中心</h1>
            <SettingsIcon size={32} className="text-gray-200" />
          </div>
          <p className="text-gray-200">管理你的宠物和应用设置</p>
        </div>
      </div>
      
      {/* 当前宠物信息 */}
      {currentPet && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
            <div className="flex items-center justify-center gap-2">
              <Info size={20} className="text-blue-200" />
              <h3 className="text-lg font-pixel font-bold">当前宠物档案</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">
                  {currentPet.type === 'dog' ? '🐕' : 
                   currentPet.type === 'cat' ? '🐱' : 
                   currentPet.type === 'rabbit' ? '🐰' : 
                   currentPet.type === 'bird' ? '🐦' : 
                   currentPet.type === 'hamster' ? '🐹' : 
                   currentPet.type === 'fish' ? '🐠' : '❓'}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="font-pixel text-xl text-gray-800 mb-2">{currentPet.name}</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {currentPet.type === 'dog' ? '小狗' : 
                     currentPet.type === 'cat' ? '小猫' : 
                     currentPet.type === 'rabbit' ? '兔子' : 
                     currentPet.type === 'bird' ? '小鸟' : 
                     currentPet.type === 'hamster' ? '仓鼠' : 
                     currentPet.type === 'fish' ? '小鱼' : '未知'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    Lv.{Math.floor((petStats?.experience || 0) / 100) + 1}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {currentPet.stage === 'baby' ? '幼年' : currentPet.stage === 'adult' ? '成年' : '老年'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  🎂 孵化于 {new Date(currentPet.birth_time).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 设置选项 */}
      <div className="space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4">
              <div className="flex items-center justify-center gap-2">
                <SettingsIcon size={20} className="text-indigo-200" />
                <h3 className="text-lg font-pixel font-bold">{section.title}</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    {item.custom && item.id === 'timeSpeed' ? (
                      // 时间速度自定义组件
                      <div className="flex items-center gap-4">
                        <div className="text-gray-600">
                          {item.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </div>
                          
                          <div className="mt-3">
                            <input
                              type="range"
                              min="0.5"
                              max="3"
                              step="0.5"
                              value={timeSpeed}
                              onChange={(e) => updateTimeSpeed(parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              <span>0.5x</span>
                              <span>1x</span>
                              <span>1.5x</span>
                              <span>2x</span>
                              <span>2.5x</span>
                              <span>3x</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : item.toggle ? (
                      // 开关组件
                      <button
                        onClick={item.action}
                        className="w-full flex items-center gap-4 text-left transition-colors hover:bg-gray-100"
                      >
                        <div className="text-gray-600">
                          {item.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </div>
                        </div>
                        
                        <div className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner ${
                          item.enabled ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'
                        }`}>
                          <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                            item.enabled ? 'translate-x-7' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </button>
                    ) : (
                      // 普通按钮组件
                      <button
                        onClick={item.action}
                        disabled={item.disabled}
                        className={`w-full flex items-center gap-4 text-left transition-colors ${
                          item.disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : item.danger
                            ? 'hover:bg-red-50'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className={`${item.danger ? 'text-red-500' : 'text-gray-600'}`}>
                          {item.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className={`font-semibold ${
                            item.danger ? 'text-red-600' : 'text-gray-800'
                          }`}>
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </div>
                        </div>
                        
                        {item.action && typeof item.action === 'function' && (
                          <div className="ml-6">
                            <button
                              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 ${
                                item.danger
                                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-red-200'
                                  : item.id === 'export'
                                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-green-200'
                                  : item.id === 'import'
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-200'
                                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-200'
                              } ${
                                item.disabled ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : ''
                              }`}
                              disabled={item.disabled}
                            >
                              {item.id === 'export' ? '📥 导出数据' : 
                               item.id === 'import' ? '📤 导入数据' : 
                               item.id === 'reset' ? '🗑️ 重置宠物' : 
                               item.danger ? '重置' : '查看详情'}
                            </button>
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 导出数据对话框 */}
      {showExportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="pixel-screen bg-white p-6 max-w-md mx-4">
            <h3 className="font-pixel text-lg mb-4">导出宠物数据</h3>
            
            <p className="text-sm text-gray-600 mb-6">
              将会导出 {currentPet?.name} 的所有数据，包括基本信息、状态、互动记录等。
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowExportData(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-pixel hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              
              <button 
                onClick={exportPetData}
                className="flex-1 pixel-button p-2 font-pixel"
              >
                导出
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 导入数据对话框 */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="pixel-screen bg-white p-6 max-w-md mx-4">
            <h3 className="font-pixel text-lg mb-4">导入宠物数据</h3>
            
            <p className="text-sm text-gray-600 mb-4">
              粘贴备份文件的内容到下方文本框：
            </p>
            
            <textarea 
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="粘贴JSON格式的备份数据..."
              className="w-full h-32 p-3 border-2 border-gray-300 text-sm font-mono resize-none focus:border-pixel-primary focus:outline-none"
            />
            
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => {
                  setShowImportDialog(false)
                  setImportData('')
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-pixel hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              
              <button 
                onClick={importPetData}
                disabled={!importData.trim()}
                className="flex-1 pixel-button p-2 font-pixel disabled:opacity-50 disabled:cursor-not-allowed"
              >
                导入
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 重置确认对话框 */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="pixel-screen bg-white p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-red-500" />
              <h3 className="font-pixel text-lg text-red-600">确认重置</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              你确定要重置宠物数据吗？这将会：
            </p>
            
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• 删除当前宠物 {currentPet?.name}</li>
              <li>• 清除所有互动记录</li>
              <li>• 清除所有游戏记录</li>
              <li>• 此操作无法撤销</li>
            </ul>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-pixel hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              
              <button 
                onClick={handleResetPet}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-pixel hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 版本信息对话框 */}
      {showVersionInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="pixel-screen bg-white p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Info size={24} className="text-blue-500" />
              <h3 className="font-pixel text-lg text-blue-600">版本信息</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">当前版本</span>
                  <span className="font-mono font-semibold text-blue-700">{getVersion()}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">构建时间</span>
                  <span className="font-mono text-sm text-blue-600">{getFormattedBuildTime()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">平台</span>
                  <span className="text-sm text-blue-600">Web Application</span>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">更新日志</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• 🎮 新增互动游戏系统</li>
                  <li>• 🎨 优化像素风格界面</li>
                  <li>• 📊 完善宠物状态管理</li>
                  <li>• 🔧 修复已知问题</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => setShowVersionInfo(false)}
                className="px-6 py-2 pixel-button font-pixel"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 关于应用对话框 */}
      {showAboutInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="pixel-screen bg-white p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🐾</span>
              </div>
              <h3 className="font-pixel text-lg text-purple-600">关于像素宠物</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  像素宠物是一款充满怀旧情怀的虚拟宠物养成游戏。在这里，你可以孵化、喂养、陪伴你的数字伙伴，体验养宠的乐趣。
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  每只宠物都有独特的个性和需求，通过细心的照料和互动，看着它们从幼年成长到成年，建立深厚的情感纽带。
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2">✨ 核心特色</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>🥚 多样化的宠物孵化体验</li>
                  <li>🎮 丰富的互动游戏内容</li>
                  <li>📈 完整的成长养成系统</li>
                  <li>🎨 精美的像素艺术风格</li>
                  <li>💾 便捷的数据备份功能</li>
                </ul>
              </div>
              
              <div className="text-center text-xs text-gray-500">
                <p>Made with ❤️ by Virtual Pet Team</p>
                <p className="mt-1">© 2024 像素宠物. All rights reserved.</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => setShowAboutInfo(false)}
                className="px-6 py-2 pixel-button font-pixel"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 应用信息 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4">
          <div className="flex items-center justify-center gap-2">
            <Info size={20} className="text-green-200" />
            <h3 className="text-lg font-pixel font-bold">应用信息</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">V</span>
                </div>
                <div>
                  <div className="text-sm text-gray-600">版本号</div>
                  <div className="font-mono font-semibold text-blue-700">{getVersion()}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📅</span>
                </div>
                <div>
                  <div className="text-sm text-gray-600">构建时间</div>
                  <div className="font-mono font-semibold text-purple-700">{getFormattedBuildTime()}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 md:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">👥</span>
                </div>
                <div>
                  <div className="text-sm text-gray-600">开发团队</div>
                  <div className="font-semibold text-green-700">Virtual Pet Team</div>
                  <div className="text-xs text-gray-500 mt-1">致力于打造最有趣的虚拟宠物体验</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>像素宠物 - 你的数字伙伴</p>
        <p className="text-xs mt-1">Made with ❤️ for pet lovers</p>
      </div>
    </div>
  )
}

export default Settings