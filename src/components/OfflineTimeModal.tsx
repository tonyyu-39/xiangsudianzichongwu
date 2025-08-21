import React from 'react'
import { Clock, Heart, Utensils, Sparkles, Zap } from 'lucide-react'
import { usePetStore } from '../store/petStore'

interface OfflineTimeModalProps {
  isOpen: boolean
  onClose: () => void
  offlineMinutes: number
  statusChanges: {
    hunger: number
    happiness: number
    cleanliness: number
    energy: number
  }
}

export const OfflineTimeModal: React.FC<OfflineTimeModalProps> = ({
  isOpen,
  onClose,
  offlineMinutes,
  statusChanges
}) => {
  const { timeManager } = usePetStore()
  
  if (!isOpen) return null
  
  const formatTime = (minutes: number): string => {
    return timeManager.formatOfflineTime(minutes)
  }
  
  const getChangeColor = (value: number): string => {
    if (value > 0) return 'text-green-400'
    if (value < 0) return 'text-red-400'
    return 'text-gray-400'
  }
  
  const getChangeIcon = (value: number): string => {
    if (value > 0) return '+'
    if (value < 0) return ''
    return ''
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">欢迎回来！</h2>
          <p className="text-gray-600">
            你离开了 <span className="font-semibold text-blue-600">{formatTime(offlineMinutes)}</span>
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">宠物状态变化</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Utensils className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-sm text-gray-600">饥饿度</div>
                <div className={`font-semibold ${getChangeColor(statusChanges.hunger)}`}>
                  {getChangeIcon(statusChanges.hunger)}{Math.abs(statusChanges.hunger)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Heart className="w-5 h-5 text-pink-500" />
              <div>
                <div className="text-sm text-gray-600">快乐度</div>
                <div className={`font-semibold ${getChangeColor(statusChanges.happiness)}`}>
                  {getChangeIcon(statusChanges.happiness)}{Math.abs(statusChanges.happiness)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-gray-600">清洁度</div>
                <div className={`font-semibold ${getChangeColor(statusChanges.cleanliness)}`}>
                  {getChangeIcon(statusChanges.cleanliness)}{Math.abs(statusChanges.cleanliness)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-sm text-gray-600">精力值</div>
                <div className={`font-semibold ${getChangeColor(statusChanges.energy)}`}>
                  {getChangeIcon(statusChanges.energy)}{Math.abs(statusChanges.energy)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            继续照顾宠物
          </button>
        </div>
      </div>
    </div>
  )
}