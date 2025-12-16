
import { TimeConsumingRecord, FilterCriteria, ApiCallDetail } from '../types';

// Cast import.meta to any to fix TypeScript error "Property 'env' does not exist on type 'ImportMeta'"
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://testnet-collect-esgrh0ke8fti72qw.pundix.com/collect';

// API Endpoint Configuration based on Swagger JSON
const ENDPOINTS = {
  QUERY_APP_KEY: '/api/timeConsuming/queryTimeConsumingAppKey',
  QUERY_ACTION: '/api/timeConsuming/queryAction',
  QUERY_PAGE: '/api/timeConsuming/queryPage',
  QUERY_DETAILS: '/api/timeConsuming/queryDetailsList',
};

/**
 * Standard API Response Wrapper
 * Matches Resp«T» in Swagger
 */
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

/**
 * Paged Response Data Wrapper
 * Matches Page«QueryPageOutput» in Swagger
 */
interface PageData<T> {
  currentPageNo: number;
  data: T[];
  pageSize: number;
  totalCount: number;
  totalPage: number;
}

/**
 * Item structure from QueryPageOutput
 */
interface QueryPageOutput {
  action: string;
  appName: string;
  duration: number;
  id: number;
  startTime: number;
}

/**
 * Item structure from QueryDetailsListOutput
 */
interface QueryDetailsListOutput {
  action: string;
  duration: number;
  startTime: number;
}

/**
 * Helper function to perform API requests
 */
async function fetchApi<T>(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json() as ApiResponse<T>;

    // Swagger definitions usually return code 200 for success
    if (json.code !== 200) {
      console.warn(`API returned non-200 code: ${json.code}`, json.msg);
    }

    // Return the data payload directly
    return json.data;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

/**
 * API 1: Fetch Project List (App IDs)
 * Endpoint: /api/timeConsuming/queryTimeConsumingAppKey (POST)
 */
export const fetchProjects = async (): Promise<string[]> => {
  return fetchApi<string[]>(ENDPOINTS.QUERY_APP_KEY, 'POST', {});
};

/**
 * API 2: Fetch Actions for a Project
 * Endpoint: /api/timeConsuming/queryAction (POST)
 * Body: { appName: string }
 */
export const fetchActions = async (appId: string): Promise<string[]> => {
  if (!appId) return [];
  return fetchApi<string[]>(ENDPOINTS.QUERY_ACTION, 'POST', { appName: appId });
};

/**
 * API 3: Query Performance Records
 * Endpoint: /api/timeConsuming/queryPage (POST)
 * Fetches a large page (1000 items) to populate the chart and client-side table
 */
export const fetchPerformanceData = async (filter: FilterCriteria): Promise<TimeConsumingRecord[]> => {
  const payload: any = {
    pageIndex: 1,
    pageSize: 1000, // Fetch large dataset for chart trends
  };

  if (filter.appId) {
    payload.appName = filter.appId;
  }
  
  if (filter.action) {
    payload.action = filter.action;
  }

  if (filter.startTime) {
    payload.startTime = new Date(filter.startTime).getTime();
  }
  
  if (filter.endTime) {
    payload.endTime = new Date(filter.endTime).getTime();
  }

  const pageResult = await fetchApi<PageData<QueryPageOutput>>(ENDPOINTS.QUERY_PAGE, 'POST', payload);
  
  const rawData = pageResult?.data || [];

  // Normalize data to match TimeConsumingRecord interface
  const list = rawData.map((item) => {
    const start = Number(item.startTime || 0);
    const duration = Number(item.duration || 0);
    const end = start + duration;

    return {
      id: item.id,
      app_id: item.appName,
      action: item.action,
      start_time: start,
      end_time: end,
      dt: start, 
      duration: duration,
      api_calls: undefined // Details are fetched on demand
    };
  });
  
  // Return list without client-side sorting (relying on backend order)
  return list;
};

/**
 * API 4: Fetch Transaction Details
 * Endpoint: /api/timeConsuming/queryDetailsList (POST)
 * Body: { id: number }
 */
export const fetchTransactionDetails = async (id: number): Promise<ApiCallDetail[]> => {
  const result = await fetchApi<QueryDetailsListOutput[]>(ENDPOINTS.QUERY_DETAILS, 'POST', { id });
  
  if (!result) return [];

  return result.map((item, index) => ({
    id: `${id}-${index}`, // Generate a unique key for list rendering
    endpoint: item.action, // 'action' from backend maps to 'endpoint' in UI
    duration: item.duration,
  }));
};
