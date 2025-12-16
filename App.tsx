
import React, { useState } from 'react';
import FilterPanel from './components/FilterPanel';
import StatsCards from './components/StatsCards';
import ResponseTimeChart from './components/ResponseTimeChart';
import { FilterCriteria, TimeConsumingRecord, PerformanceStats } from './types';
import { fetchPerformanceData, fetchTransactionDetails } from './services/apiService';
import { LayoutDashboard, Search, BarChart3, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, ChevronRight as ChevronIcon, Database, Loader2 } from 'lucide-react';

function App() {
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
    if (!filter.appId) {
      alert("Please select a Project first.");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchPerformanceData(filter);
      setData(result);
      setHasFetched(true);
      setCurrentPage(1); // Reset to first page on new query
      setExpandedRows(new Set()); // Reset expansions
      setLoadingRows(new Set());
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">System Performance Monitor</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <section>
          <FilterPanel 
            filter={filter} 
            onFilterChange={setFilter} 
            onRefresh={handleRunQuery}
            isLoading={loading}
          />
        </section>

        {!hasFetched ? (
          /* Empty State / Welcome Screen */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="bg-indigo-50 p-6 rounded-full mb-6">
              <BarChart3 className="w-12 h-12 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Analyze</h2>
            <p className="text-gray-500 max-w-md">
              Select a <span className="font-semibold text-gray-700">Project</span> and an <span className="font-semibold text-gray-700">Action</span> above, then click <span className="font-semibold text-indigo-600">Run Query</span> to view performance metrics.
            </p>
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
            <section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Total {data.length} records
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="w-10 px-6 py-3"></th>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">App ID</th>
                      <th className="px-6 py-3">Action</th>
                      <th className="px-6 py-3">Start Time</th>
                      <th className="px-6 py-3">Duration</th>
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
                            className={`border-b transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                            onClick={() => toggleRowExpansion(record.id)}
                          >
                            <td className="px-6 py-4">
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronIcon className="w-4 h-4 text-gray-500" />}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs">{record.id}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{record.app_id}</td>
                            <td className="px-6 py-4">
                              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">
                                {record.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(record.start_time).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`font-medium ${record.duration > 1000 ? 'text-red-600' : 'text-gray-900'}`}>
                                {record.duration} ms
                              </span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center">
                                 <span className={`w-2.5 h-2.5 rounded-full mr-2 ${record.duration < 500 ? 'bg-green-500' : record.duration < 1500 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                                 {record.duration < 500 ? 'Normal' : record.duration < 1500 ? 'Slow' : 'Critical'}
                               </div>
                            </td>
                          </tr>
                          
                          {/* Expanded Detail Row */}
                          {isExpanded && (
                            <tr className="bg-gray-50">
                              <td colSpan={7} className="px-6 py-4 shadow-inner">
                                <div className="ml-8">
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Database className="w-3 h-3" />
                                    Internal API Call Breakdown
                                  </h4>
                                  
                                  {isRowLoading ? (
                                    <div className="flex items-center justify-center py-4 bg-white rounded-lg border border-gray-200">
                                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
                                      <span className="text-sm text-gray-500">Loading details...</span>
                                    </div>
                                  ) : (
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                      {record.api_calls && record.api_calls.length > 0 ? (
                                        <table className="w-full text-xs">
                                          <thead className="bg-gray-100 text-gray-600">
                                            <tr>
                                              <th className="px-4 py-2 text-left">Endpoint</th>
                                              <th className="px-4 py-2 text-right">Duration</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {record.api_calls.map((api, idx) => (
                                              <tr key={api.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-2 font-mono text-gray-700">{api.endpoint}</td>
                                                <td className="px-4 py-2 text-right font-medium text-gray-900">{api.duration} ms</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm">
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
                         <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                           <div className="flex flex-col items-center justify-center gap-2">
                             <Search className="w-8 h-8 text-gray-300" />
                             <p>No records found for the selected criteria.</p>
                           </div>
                         </td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {data.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm text-gray-500 hidden sm:block">
                    Showing <span className="font-medium">{startRecord}</span> to <span className="font-medium">{endRecord}</span> of <span className="font-medium">{data.length}</span> results
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600"
                      title="First Page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <span className="text-sm font-medium text-gray-700 px-3 min-w-[5rem] text-center">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-600"
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
      </main>
    </div>
  );
}

export default App;
