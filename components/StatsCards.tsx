import React from 'react';
import { PerformanceStats } from '../types';
import { Activity, Clock, Zap, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: PerformanceStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.averageResponseTime.toFixed(2)} <span className="text-sm font-normal text-gray-400">ms</span></h3>
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Total Requests</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalRequests.toLocaleString()}</h3>
        </div>
        <div className="p-3 bg-indigo-50 rounded-full">
          <Activity className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Fastest Request</p>
          <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.minResponseTime === Infinity ? 0 : stats.minResponseTime} <span className="text-sm font-normal text-gray-400">ms</span></h3>
        </div>
        <div className="p-3 bg-green-50 rounded-full">
          <Zap className="w-6 h-6 text-green-600" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Slowest Request</p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.maxResponseTime === -Infinity ? 0 : stats.maxResponseTime} <span className="text-sm font-normal text-gray-400">ms</span></h3>
        </div>
        <div className="p-3 bg-red-50 rounded-full">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
