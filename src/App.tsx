
import React, { useState } from 'react';
import FilterPanel from './components/FilterPanel';
import StatsCards from './components/StatsCards';
import ResponseTimeChart from './components/ResponseTimeChart';
import LatencyTestPanel from './components/LatencyTestPanel';
import TailwindTest from './components/TailwindTest';
import { FilterCriteria, TimeConsumingRecord, PerformanceStats } from './types/types';
import { fetchPerformanceData, fetchTransactionDetails } from './services/apiService';
import { LayoutDashboard, Search, BarChart3, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, ChevronRight as ChevronIcon, Database, Loader2, Cpu, Activity, Zap, Shield, Globe, Info, Palette } from 'lucide-react';
import { PrivyWalletButton } from './components/PrivyWalletButton';
import './styles/index.css';

function App() {
  const [activeTab, setActiveTab] = useState<'performance' | 'latency' | 'tailwind'>('performance');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [data, setData] = useState<TimeConsumingRecord[]>([]);
  
  // Expanded Rows State
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  // Loading state for individual row expansion
  const [loadingRows, setLoadingRows] = useState<Set<number>>(new Set());
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  
  // Initial time range: Last 24 hours
  const initialEndTime = new Date();
  const initialStartTime = new Date(initialEndTime.getTime() - 24 * 60 * 60 * 1000);

  // Helper to format date for input[type="datetime-local"]
  // Adjusted to show local time instead of UTC
  const formatForInput = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const [filter, setFilter] = useState<FilterCriteria>({
    appId: '',
    action: '',
    startTime: formatForInput(initialStartTime),
    endTime: formatForInput(initialEndTime)
  });

  const executeQuery = async () => {
    console.log("=== Execute Query Started ===");
    console.log("Current filter:", filter);

    if (!filter.appId) {
      console.error("No project selected");
      alert("Please select a Project first.");
      return;
    }

    console.log("Setting loading to true");
    setLoading(true);

    try {
      console.log("Calling fetchPerformanceData...");
      const result = await fetchPerformanceData(filter);
      console.log("Query result length:", result?.length || 0);
      console.log("Query result sample:", result?.slice(0, 3));

      setData(result || []);
      setHasFetched(true);
      setCurrentPage(1); // Reset to first page on new query
      setExpandedRows(new Set()); // Reset expansions
      setLoadingRows(new Set());

      console.log("Data set successfully, hasFetched:", true);
    } catch (error) {
      console.error("Failed to fetch data", error);
      console.error("Error details:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });

      // Show user-friendly error message
      if (error instanceof Error) {
        alert(`查询失败: ${error.message}`);
      } else {
        alert("查询失败: 未知错误");
      }

      // Clear previous data on error
      setData([]);
      setHasFetched(false);
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
    console.log("=== Execute Query Ended ===");
  };

  const handleRunQuery = () => {
    executeQuery();
  };

  const toggleRowExpansion = async (id: number) => {
    const isExpanding = !expandedRows.has(id);
    
    // Toggle UI state
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);

    // Fetch details if expanding and data not present
    if (isExpanding) {
      const recordIndex = data.findIndex(r => r.id === id);
      if (recordIndex !== -1 && !data[recordIndex].api_calls) {
        
        // Mark as loading
        const newLoading = new Set(loadingRows);
        newLoading.add(id);
        setLoadingRows(newLoading);

        try {
          const details = await fetchTransactionDetails(id);
          
          setData(prevData => {
            const newData = [...prevData];
            // Re-find index to be safe
            const idx = newData.findIndex(r => r.id === id);
            if (idx !== -1) {
              newData[idx] = { ...newData[idx], api_calls: details };
            }
            return newData;
          });
        } catch (error) {
          console.error(`Failed to fetch details for ${id}`, error);
        } finally {
          setLoadingRows(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }
    }
  };

  // Client-side Statistics Calculation
  const calculateStats = (records: TimeConsumingRecord[]): PerformanceStats => {
    if (records.length === 0) {
      return { averageResponseTime: 0, totalRequests: 0, maxResponseTime: 0, minResponseTime: 0 };
    }

    const totalRequests = records.length;
    const totalTime = records.reduce((acc, curr) => acc + curr.duration, 0);
    const maxResponseTime = Math.max(...records.map(r => r.duration));
    const minResponseTime = Math.min(...records.map(r => r.duration));

    return {
      averageResponseTime: totalTime / totalRequests,
      totalRequests,
      maxResponseTime,
      minResponseTime
    };
  };

  const stats = calculateStats(data);

  // Pagination Logic (Client Side)
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, data.length);
  const currentTableData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setExpandedRows(new Set()); // Reset expansions on page change
    }
  };

  return (
    // <WalletProvider>
      <>
        {/* 科技感网格背景 */}
        <div className="tech-grid"></div>

        {/* 粒子背景效果 */}
        <div className="particles">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        <div className="min-h-screen relative">
        {/* Header */}
        <header className="glass sticky top-0 z-50 border-b border-blue-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
            <div className="neon-glow p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <h1 className="tech-title text-xl">System Performance Monitor</h1>

            {/* Tab Navigation */}
            <nav className="ml-8 flex items-center gap-2 bg-blue-500/10 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('performance')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'performance'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-blue-500/20'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 inline mr-2" />
                性能监控
              </button>
              <button
                onClick={() => setActiveTab('latency')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'latency'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-blue-500/20'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                延时测试
              </button>
              <button
                onClick={() => setActiveTab('tailwind')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'tailwind'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-purple-500/20'
                }`}
              >
                <Palette className="w-4 h-4 inline mr-2" />
                Tailwind 测试
              </button>
              <a
                href="/about.html"
                className="px-4 py-2 rounded-md text-sm font-medium transition-all text-gray-400 hover:text-white hover:bg-blue-500/20"
              >
                <Info className="w-4 h-4 inline mr-2" />
                About
              </a>
            </nav>

            <div className="ml-auto flex items-center gap-4">
              <PrivyWalletButton />
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'performance' ? (
            <>
              {/* Filters */}
              <section>
                <FilterPanel
                  filter={filter}
                  onFilterChange={setFilter}
                  onRefresh={handleRunQuery}
                  isLoading={loading}
                />
              </section>

              {console.log("Rendering Performance Tab - hasFetched:", hasFetched, "loading:", loading, "data.length:", data?.length)}
              {!hasFetched ? (
                /* Empty State / Welcome Screen */
                <div className="flex flex-col items-center justify-center py-20 tech-card text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
                  <div className="neon-glow p-8 rounded-full mb-8 bg-gradient-to-br from-blue-500/20 to-cyan-400/20">
                    <Activity className="w-16 h-16 text-blue-400" />
                  </div>
                  <h2 className="tech-title text-3xl mb-4">System Ready</h2>
                  <p className="text-gray-400 max-w-lg leading-relaxed">
                    Select a <span className="text-blue-400 font-semibold">Project</span> and configure your <span className="text-blue-400 font-semibold">Query Parameters</span>, then initiate real-time performance analysis.
                  </p>
                  <div className="mt-8 flex gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>Real-time Monitoring</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span>Secure Analysis</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <section>
                     <StatsCards stats={stats} />
                  </section>

                  {/* Charts - Uses FULL data for trend */}
                  <section>
                    <ResponseTimeChart data={data} average={stats.averageResponseTime} />
                  </section>

                  {/* Data Table - Uses SLICED data for pagination */}
                  <section className="mt-8 tech-table">
                    <div className="px-6 py-4 border-b border-blue-500/20 flex justify-between items-center backdrop-blur-sm">
                      <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Transaction Log
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="status-indicator success">
                          Total: {data.length} records
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-300">
                        <thead>
                          <tr>
                            <th className="w-10 px-6 py-3"></th>
                            <th className="px-6 py-3">Transaction ID</th>
                            <th className="px-6 py-3">Application</th>
                            <th className="px-6 py-3">Operation</th>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">Latency</th>
                            <th className="px-6 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentTableData.map((record) => {
                            const isExpanded = expandedRows.has(record.id);
                            const isRowLoading = loadingRows.has(record.id);

                            return (
                              <React.Fragment key={record.id}>
                                <tr
                                  className={`border-b border-blue-500/10 transition-all duration-300 cursor-pointer ${isExpanded ? 'bg-blue-500/5' : 'hover:bg-blue-500/10'}`}
                                  onClick={() => toggleRowExpansion(record.id)}
                                >
                                  <td className="px-6 py-4">
                                    {isExpanded ? <ChevronDown className="w-4 h-4 text-blue-400" /> : <ChevronIcon className="w-4 h-4 text-gray-500" />}
                                  </td>
                                  <td className="px-6 py-4 font-mono text-xs text-blue-300">#{record.id}</td>
                                  <td className="px-6 py-4 font-medium text-gray-200">{record.app_id}</td>
                                  <td className="px-6 py-4">
                                    <span className="bg-blue-500/20 text-blue-300 text-xs font-medium px-3 py-1 rounded-full border border-blue-500/30">
                                      {record.action}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">{new Date(record.start_time).toLocaleString()}</td>
                                  <td className="px-6 py-4">
                                    <span className={`tech-number ${record.duration > 1000 ? 'text-red-400' : 'text-green-400'}`}>
                                      {record.duration} <span className="text-xs opacity-60">ms</span>
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                     {record.duration < 500 ? (
                                       <span className="status-indicator success">Optimal</span>
                                     ) : record.duration < 1500 ? (
                                       <span className="status-indicator warning">Delayed</span>
                                     ) : (
                                       <span className="status-indicator danger">Critical</span>
                                     )}
                                  </td>
                                </tr>

                                {/* Expanded Detail Row */}
                                {isExpanded && (
                                  <tr className="bg-blue-500/5 backdrop-blur-sm">
                                    <td colSpan={7} className="px-6 py-4 shadow-inner">
                                      <div className="ml-8">
                                        <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                          <Database className="w-3 h-3" />
                                          API Call Analysis
                                        </h4>

                                        {isRowLoading ? (
                                          <div className="flex items-center justify-center py-8 tech-card">
                                            <div className="tech-loader mr-3"></div>
                                            <span className="text-sm text-gray-400">Analyzing API calls...</span>
                                          </div>
                                        ) : (
                                          <div className="tech-card overflow-hidden">
                                            {record.api_calls && record.api_calls.length > 0 ? (
                                              <table className="w-full text-xs">
                                                <thead className="bg-blue-500/10 border-b border-blue-500/20">
                                                  <tr>
                                                    <th className="px-4 py-3 text-left text-blue-300">Endpoint</th>
                                                    <th className="px-4 py-3 text-right text-blue-300">Response Time</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {record.api_calls.map((api, idx) => (
                                                    <tr key={api.id} className="border-b border-blue-500/10 last:border-0 hover:bg-blue-500/5 transition-colors">
                                                      <td className="px-4 py-3 font-mono text-gray-300">{api.endpoint}</td>
                                                      <td className="px-4 py-3 text-right">
                                                        <span className={`tech-number text-sm ${api.duration > 200 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                          {api.duration} <span className="text-xs opacity-60">ms</span>
                                                        </span>
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            ) : (
                                              <div className="p-6 text-center text-gray-500 text-sm">
                                                <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                No detailed call information available.
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                          {data.length === 0 && (
                             <tr>
                               <td colSpan={7} className="px-6 py-12 text-center">
                                 <div className="flex flex-col items-center justify-center gap-4">
                                   <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20">
                                     <Search className="w-12 h-12 text-blue-400" />
                                   </div>
                                   <div>
                                     <p className="text-gray-400 text-lg font-medium">No Data Found</p>
                                     <p className="text-gray-500 text-sm mt-1">Try adjusting your query parameters</p>
                                   </div>
                                 </div>
                               </td>
                             </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {data.length > 0 && (
                      <div className="tech-pagination">
                        <div className="text-sm text-gray-400 hidden sm:block">
                          Displaying <span className="tech-number">{startRecord}-{endRecord}</span> of <span className="tech-number">{data.length}</span> records
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                          <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="neon-glow p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-300"
                            title="First Page"
                          >
                            <ChevronsLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="neon-glow p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-300"
                            title="Previous Page"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          <span className="tech-title text-sm px-4 min-w-[6rem] text-center">
                            {currentPage} / {totalPages}
                          </span>

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="neon-glow p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-300"
                            title="Next Page"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="neon-glow p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-300"
                            title="Last Page"
                          >
                            <ChevronsRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                </>
              )}
            </>
          ) : activeTab === 'latency' ? (
            <LatencyTestPanel />
          ) : (
            <TailwindTest />
          )}
        </main>
      </div>
      </>
    // </WalletProvider>
  );
}

export default App;
