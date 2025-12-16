
// Matches the 'time_consuming' table concept
export interface TimeConsumingRecord {
  id: number;
  app_id: string;
  action: string;
  start_time: number; // bigint in DB, number (timestamp ms) in JS
  end_time: number;   // bigint in DB, number (timestamp ms) in JS
  dt: number;         // Created at timestamp
  duration: number;   // Calculated frontend side: end - start
  api_calls?: ApiCallDetail[]; // Simulated details for internal API calls
}

// Details about specific API calls made during the action
export interface ApiCallDetail {
  id: string;
  endpoint: string;
  duration: number;
}

// For filtering the dataset
export interface FilterCriteria {
  appId: string;
  action: string;
  startTime: string; // ISO string for input[type=datetime-local]
  endTime: string;   // ISO string for input[type=datetime-local]
}

// Summary statistics
export interface PerformanceStats {
  averageResponseTime: number;
  totalRequests: number;
  maxResponseTime: number;
  minResponseTime: number;
}