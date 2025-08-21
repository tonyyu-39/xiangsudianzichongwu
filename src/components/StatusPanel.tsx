import React from 'react';
import { Heart, Smile, Utensils, Droplets, Star, Calendar } from 'lucide-react';
import { PetStats } from '../lib/supabase';

interface StatusPanelProps {
  stats: PetStats;
  petName: string;
  petType: string;
  age: number;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ stats, petName, petType, age }) => {
  const getStatusText = (type: string, value: number) => {
    if (type === 'hunger') {
      if (value === 0) return '极度饥饿';
      if (value < 20) return '非常饥饿';
      if (value < 40) return '有点饿';
      if (value < 60) return '还好';
      if (value < 80) return '饱腹';
      return '非常饱';
    }
    if (type === 'health') {
      if (value === 0) return '危险';
      if (value < 20) return '虚弱';
      if (value < 40) return '不佳';
      if (value < 60) return '一般';
      if (value < 80) return '良好';
      return '优秀';
    }
    if (type === 'happiness') {
      if (value === 0) return '沮丧';
      if (value < 20) return '难过';
      if (value < 40) return '低落';
      if (value < 60) return '平静';
      if (value < 80) return '开心';
      return '非常开心';
    }
    if (type === 'cleanliness') {
      if (value === 0) return '非常脏';
      if (value < 20) return '很脏';
      if (value < 40) return '有点脏';
      if (value < 60) return '还行';
      if (value < 80) return '干净';
      return '非常干净';
    }
    return '';
  };
  const getStatusColor = (value: number) => {
    if (value === 0) return 'text-red-700 animate-pulse';
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    if (value >= 40) return 'text-orange-600';
    if (value >= 20) return 'text-red-600';
    return 'text-red-700';
  };

  const getStatusBarColor = (value: number) => {
    if (value === 0) return 'bg-gradient-to-r from-red-600 to-red-700';
    if (value >= 80) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (value >= 60) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (value >= 40) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    if (value >= 20) return 'bg-gradient-to-r from-red-400 to-red-500';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  const formatAge = (ageInHours: number) => {
    const days = Math.floor(ageInHours / 24);
    const hours = ageInHours % 24;
    if (days > 0) {
      return `${days}天 ${hours}小时`;
    }
    return `${hours}小时`;
  };

  const getLifeStage = (ageInHours: number) => {
    if (ageInHours < 72) return '幼体';
    if (ageInHours < 168) return '少年';
    return '成年';
  };

  const StatusBar = ({ value, max = 100 }: { value: number; max?: number }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const isZero = value === 0;
    return (
      <div className={`w-full bg-white/20 backdrop-blur-sm rounded-full h-4 shadow-inner border border-white/30 ${isZero ? 'ring-2 ring-red-300/50' : ''}`}>
        <div
          className={`h-4 rounded-full transition-all duration-500 ${getStatusBarColor(value)} shadow-lg ${isZero ? 'animate-pulse' : ''}`}
          style={{ width: `${Math.max(percentage, isZero ? 100 : 0)}%` }}
        />
      </div>
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
      {/* 宠物基本信息 */}
      <div className="bg-gradient-to-br from-purple-600/90 via-indigo-600/90 to-blue-600/90 backdrop-blur-sm px-6 py-5">
        <div className="text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-pixel text-white drop-shadow-lg">{petName}</h2>
          </div>
          <div className="flex justify-center items-center space-x-6 text-sm text-white/90">
            <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="text-lg">{petType === 'cat' ? '🐱' : petType === 'dog' ? '🐶' : petType === 'rabbit' ? '🐰' : petType === 'bird' ? '🐦' : petType === 'hamster' ? '🐹' : '🐠'}</span>
              <span className="font-medium">{petType}</span>
            </span>
            <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{getLifeStage(age)}</span>
            </span>
          </div>
          <p className="text-sm text-white/80 mt-2 font-medium">年龄: {formatAge(age)}</p>
        </div>
      </div>
      
      <div className="p-6 space-y-5">

        {/* 状态指标 */}
        <div className="space-y-4">
          {/* 健康值 */}
          <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ${stats.health === 0 ? 'ring-2 ring-red-300/50 bg-red-100/20' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${stats.health >= 80 ? 'bg-green-500/20 border border-green-400/30' : stats.health >= 60 ? 'bg-yellow-500/20 border border-yellow-400/30' : stats.health >= 40 ? 'bg-orange-500/20 border border-orange-400/30' : 'bg-red-500/20 border border-red-400/30'} ${stats.health === 0 ? 'animate-pulse' : ''}`}>
                  <Heart className={`w-6 h-6 ${getStatusColor(stats.health)}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-lg">健康</span>
                  <span className={`text-sm ${getStatusColor(stats.health)} font-medium`}>
                    {getStatusText('health', stats.health)}
                  </span>
                </div>
              </div>
              <span className={`text-2xl font-bold ${getStatusColor(stats.health)} drop-shadow-sm`}>
                {stats.health}
              </span>
            </div>
            <StatusBar value={stats.health} />
            {stats.health === 0 && (
              <div className="mt-3 text-sm text-red-100 bg-red-500/30 backdrop-blur-sm px-4 py-2 rounded-xl animate-pulse border border-red-400/30">
                💔 宠物健康状况危险，需要立即照顾！
              </div>
            )}
          </div>

          {/* 快乐值 */}
          <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ${stats.happiness === 0 ? 'ring-2 ring-red-300/50 bg-red-100/20' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${stats.happiness >= 80 ? 'bg-green-500/20 border border-green-400/30' : stats.happiness >= 60 ? 'bg-yellow-500/20 border border-yellow-400/30' : stats.happiness >= 40 ? 'bg-orange-500/20 border border-orange-400/30' : 'bg-red-500/20 border border-red-400/30'} ${stats.happiness === 0 ? 'animate-pulse' : ''}`}>
                  <Smile className={`w-6 h-6 ${getStatusColor(stats.happiness)}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-lg">快乐</span>
                  <span className={`text-sm ${getStatusColor(stats.happiness)} font-medium`}>
                    {getStatusText('happiness', stats.happiness)}
                  </span>
                </div>
              </div>
              <span className={`text-2xl font-bold ${getStatusColor(stats.happiness)} drop-shadow-sm`}>
                {stats.happiness}
              </span>
            </div>
            <StatusBar value={stats.happiness} />
            {stats.happiness === 0 && (
              <div className="mt-3 text-sm text-red-100 bg-red-500/30 backdrop-blur-sm px-4 py-2 rounded-xl animate-pulse border border-red-400/30">
                😢 宠物情绪低落，需要陪伴和互动！
              </div>
            )}
          </div>

          {/* 饥饿值 */}
          <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ${stats.hunger === 0 ? 'ring-2 ring-red-300/50 bg-red-100/20' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${stats.hunger >= 80 ? 'bg-green-500/20 border border-green-400/30' : stats.hunger >= 60 ? 'bg-yellow-500/20 border border-yellow-400/30' : stats.hunger >= 40 ? 'bg-orange-500/20 border border-orange-400/30' : 'bg-red-500/20 border border-red-400/30'} ${stats.hunger === 0 ? 'animate-pulse' : ''}`}>
                  <Utensils className={`w-6 h-6 ${getStatusColor(stats.hunger)}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-lg">饱食</span>
                  <span className={`text-sm ${getStatusColor(stats.hunger)} font-medium`}>
                    {getStatusText('hunger', stats.hunger)}
                  </span>
                </div>
              </div>
              <span className={`text-2xl font-bold ${getStatusColor(stats.hunger)} drop-shadow-sm`}>
                {stats.hunger}
              </span>
            </div>
            <StatusBar value={stats.hunger} />
            {stats.hunger === 0 && (
              <div className="mt-3 text-sm text-red-100 bg-red-500/30 backdrop-blur-sm px-4 py-2 rounded-xl animate-pulse border border-red-400/30">
                ⚠️ 宠物非常饥饿，请立即喂食！
              </div>
            )}
          </div>

          {/* 清洁值 */}
          <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ${stats.cleanliness === 0 ? 'ring-2 ring-red-300/50 bg-red-100/20' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${stats.cleanliness >= 80 ? 'bg-green-500/20 border border-green-400/30' : stats.cleanliness >= 60 ? 'bg-yellow-500/20 border border-yellow-400/30' : stats.cleanliness >= 40 ? 'bg-orange-500/20 border border-orange-400/30' : 'bg-red-500/20 border border-red-400/30'} ${stats.cleanliness === 0 ? 'animate-pulse' : ''}`}>
                  <Droplets className={`w-6 h-6 ${getStatusColor(stats.cleanliness)}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-lg">清洁</span>
                  <span className={`text-sm ${getStatusColor(stats.cleanliness)} font-medium`}>
                    {getStatusText('cleanliness', stats.cleanliness)}
                  </span>
                </div>
              </div>
              <span className={`text-2xl font-bold ${getStatusColor(stats.cleanliness)} drop-shadow-sm`}>
                {stats.cleanliness}
              </span>
            </div>
            <StatusBar value={stats.cleanliness} />
            {stats.cleanliness === 0 && (
              <div className="mt-3 text-sm text-red-100 bg-red-500/30 backdrop-blur-sm px-4 py-2 rounded-xl animate-pulse border border-red-400/30">
                🧼 宠物非常脏，需要立即清洁！
              </div>
            )}
          </div>
        </div>

        {/* 经验值和等级 */}
        <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 backdrop-blur-sm rounded-2xl p-5 border border-blue-400/30 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-pixel text-xl drop-shadow-sm">等级 {stats.level}</span>
            </div>
            <span className="text-sm text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 font-medium">
              {stats.experience}/{stats.level * 100} EXP
            </span>
          </div>
          <StatusBar value={stats.experience} max={stats.level * 100} />
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;