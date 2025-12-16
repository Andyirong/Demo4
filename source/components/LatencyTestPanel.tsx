import React from 'react';
import { Globe, Clock, TrendingUp, AlertCircle } from 'lucide-react';

const LatencyTestPanel: React.FC = () => {
  return (
    <div className="tech-card text-center py-20">
      <div className="neon-glow p-8 rounded-full mb-6 bg-gradient-to-br from-blue-500/20 to-cyan-400/20 mx-auto w-fit">
        <Globe className="w-16 h-16 text-blue-400" />
      </div>
      <h2 className="tech-title text-2xl mb-4">延时测试</h2>
      <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
        网络延时测试功能正在开发中...
      </p>
      <div className="mt-8 flex gap-4 justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span>实时监控</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span>性能分析</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AlertCircle className="w-4 h-4 text-orange-400" />
          <span>智能告警</span>
        </div>
      </div>
    </div>
  );
};

export default LatencyTestPanel;