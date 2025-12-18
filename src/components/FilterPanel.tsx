import React, { useEffect, useState } from 'react';
import { FilterCriteria } from '../types';
import { fetchProjects, fetchActions } from '../services/apiService';
import { Filter, RefreshCcw, Loader2, Search, Calendar, Settings, Zap } from 'lucide-react';

interface FilterPanelProps {
  filter: FilterCriteria;
  onFilterChange: (newFilter: FilterCriteria) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filter, onFilterChange, onRefresh, isLoading }) => {
  const [apps, setApps] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loadingMeta, setLoadingMeta] = useState<{apps: boolean, actions: boolean}>({ apps: false, actions: false });

  // 1. Fetch Project List on Mount
  useEffect(() => {
    const loadProjects = async () => {
      console.log("FilterPanel: Starting to load projects...");
      setLoadingMeta(prev => ({ ...prev, apps: true }));
      try {
        const data = await fetchProjects();
        console.log("FilterPanel: Projects loaded:", data);
        setApps(data);
      } catch (error) {
        console.error("FilterPanel: Failed to load projects", error);
        console.error("FilterPanel: Error details:", {
          name: error?.name,
          message: error?.message,
          stack: error?.stack
        });
      } finally {
        setLoadingMeta(prev => ({ ...prev, apps: false }));
      }
    };
    loadProjects();
  }, []);

  // 2. Fetch Actions when Project changes
  useEffect(() => {
    const loadActions = async () => {
      if (filter.appId) {
        setLoadingMeta(prev => ({ ...prev, actions: true }));
        try {
          const data = await fetchActions(filter.appId);
          setActions(data);
          
          // Reset action if the currently selected action doesn't exist in the new project
          if (filter.action && !data.includes(filter.action)) {
             onFilterChange({ ...filter, action: '' });
          }
        } catch (error) {
          console.error("Failed to load actions", error);
        } finally {
          setLoadingMeta(prev => ({ ...prev, actions: false }));
        }
      } else {
        setActions([]);
        if (filter.action) onFilterChange({ ...filter, action: '' });
      }
    };
    loadActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.appId]);

  const handleChange = (key: keyof FilterCriteria, value: string) => {
    onFilterChange({ ...filter, [key]: value });
  };

  return (
    <div className="tech-card mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-400/20 border border-blue-500/30">
            <Settings className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="tech-title text-lg">Query Control Panel</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* App Selector */}
        <div className="flex flex-col relative group">
          <label className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Search className="w-3 h-3 text-blue-400" />
              Project
            </span>
            {loadingMeta.apps && <div className="tech-loader w-3 h-3"></div>}
          </label>
          <select
            className="tech-input w-full text-sm hover:border-blue-500/50 transition-all group-focus-within:border-blue-500"
            value={filter.appId}
            onChange={(e) => handleChange('appId', e.target.value)}
            disabled={loadingMeta.apps}
          >
            <option value="">Select Application</option>
            {apps.map(app => (
              <option key={app} value={app}>{app}</option>
            ))}
          </select>
        </div>

        {/* Action Selector */}
        <div className="flex flex-col group">
          <label className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-purple-400" />
              Action
            </span>
            {loadingMeta.actions && <div className="tech-loader w-3 h-3"></div>}
          </label>
          <select
            className="tech-input w-full text-sm hover:border-purple-500/50 transition-all disabled:opacity-50"
            value={filter.action}
            onChange={(e) => handleChange('action', e.target.value)}
            disabled={!filter.appId || loadingMeta.actions}
          >
            <option value="">{filter.appId ? 'Select Operation (Optional)' : 'Select Project First'}</option>
            {actions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        {/* Start Time */}
        <div className="flex flex-col group">
          <label className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-3 h-3 text-green-400" />
            Start Time
          </label>
          <input
            type="datetime-local"
            className="tech-input w-full text-sm hover:border-green-500/50 transition-all"
            value={filter.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
          />
        </div>

        {/* End Time */}
        <div className="flex flex-col group">
          <label className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-3 h-3 text-red-400" />
            End Time
          </label>
          <input
            type="datetime-local"
            className="tech-input w-full text-sm hover:border-red-500/50 transition-all"
            value={filter.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
          />
        </div>

        {/* Execute Button */}
        <div className="flex flex-col justify-end">
          <button
            onClick={onRefresh}
            disabled={isLoading || !filter.appId}
            className={`tech-button relative overflow-hidden group neon-glow ${isLoading || !filter.appId ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!filter.appId ? "Please select a project first" : "Execute Query"}
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''} group-hover:rotate-180 transition-transform duration-500`} />
            {isLoading ? 'Processing...' : 'Execute'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;