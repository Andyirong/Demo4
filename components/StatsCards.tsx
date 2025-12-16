import React from 'react';
import { PerformanceStats } from '../types';
import { Activity, Clock, Zap, AlertTriangle, Cpu, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  stats: PerformanceStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="tech-card group hover-lift tech-pulse">
        <div className="scan-line"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Latency</p>
            <h3 className="tech-number text-2xl mt-1">{stats.averageResponseTime.toFixed(2)} <span className="text-xs opacity-60">ms</span></h3>
          </div>
        </div>
        <div className="energy-bar"></div>
      </div>

      <div className="tech-card group hover-lift tech-pulse">
        <div className="scan-line"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-400/20 border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Requests</p>
            <h3 className="tech-number text-2xl mt-1">{stats.totalRequests.toLocaleString()}</h3>
          </div>
        </div>
        <div className="energy-bar"></div>
      </div>

      <div className="tech-card group hover-lift tech-pulse">
        <div className="scan-line"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-400/20 border border-green-500/30 group-hover:scale-110 transition-transform duration-300">
            <Zap className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Peak Performance</p>
            <h3 className="tech-number text-2xl text-green-400 mt-1">{stats.minResponseTime === Infinity ? 0 : stats.minResponseTime} <span className="text-xs opacity-60">ms</span></h3>
          </div>
        </div>
        <div className="energy-bar"></div>
      </div>

      <div className="tech-card group hover-lift tech-pulse">
        <div className="scan-line"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-400/20 border border-red-500/30 group-hover:scale-110 transition-transform duration-300">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Max Latency</p>
            <h3 className="tech-number text-2xl text-red-400 mt-1">{stats.maxResponseTime === -Infinity ? 0 : stats.maxResponseTime} <span className="text-xs opacity-60">ms</span></h3>
          </div>
        </div>
        <div className="energy-bar"></div>
      </div>
    </div>
  );
};

export default StatsCards;
