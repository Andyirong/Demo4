import React, { useEffect, useState } from 'react';
import { FilterCriteria } from '../types';
import { fetchProjects, fetchActions } from '../services/apiService';
import { Filter, RefreshCcw, Loader2 } from 'lucide-react';

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
      setLoadingMeta(prev => ({ ...prev, apps: true }));
      try {
        const data = await fetchProjects();
        setApps(data);
      } catch (error) {
        console.error("Failed to load projects", error);
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
        <Filter className="w-5 h-5 text-indigo-600" />
        <h2>Query Parameters</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* App Selector */}
        <div className="flex flex-col relative">
          <label className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider flex justify-between">
            Project (App ID)
            {loadingMeta.apps && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
          </label>
          <select
            className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors hover:bg-gray-100"
            value={filter.appId}
            onChange={(e) => handleChange('appId', e.target.value)}
            disabled={loadingMeta.apps}
          >
            <option value="">Select Project</option>
            {apps.map(app => (
              <option key={app} value={app}>{app}</option>
            ))}
          </select>
        </div>

        {/* Action Selector */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider flex justify-between">
            Action
            {loadingMeta.actions && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
          </label>
          <select
            className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
            value={filter.action}
            onChange={(e) => handleChange('action', e.target.value)}
            disabled={!filter.appId || loadingMeta.actions}
          >
            <option value="">{filter.appId ? 'Select Action (Optional)' : 'Select Project First'}</option>
            {actions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        {/* Start Time */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Start Time</label>
          <input
            type="datetime-local"
            className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={filter.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
          />
        </div>

        {/* End Time */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">End Time</label>
          <input
            type="datetime-local"
            className="block w-full rounded-lg border-gray-300 bg-gray-50 border p-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={filter.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
          />
        </div>

        {/* Refresh Button */}
        <div className="flex flex-col justify-end">
          <button
            onClick={onRefresh}
            disabled={isLoading || !filter.appId}
            className={`flex items-center justify-center gap-2 w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 transition-all ${isLoading || !filter.appId ? 'opacity-70 cursor-not-allowed' : ''}`}
            title={!filter.appId ? "Please select a project first" : "Run Query"}
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Run Query'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;