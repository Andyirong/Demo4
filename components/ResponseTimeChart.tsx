import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { TimeConsumingRecord } from '../types';

interface ResponseTimeChartProps {
  data: TimeConsumingRecord[];
  average: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg text-sm">
        <p className="font-semibold text-gray-700">{new Date(label).toLocaleString()}</p>
        <p className="text-indigo-600 font-bold">Duration: {data.duration} ms</p>
        <p className="text-gray-500 text-xs mt-1">Action: {data.action}</p>
        <p className="text-gray-500 text-xs">ID: {data.id}</p>
      </div>
    );
  }
  return null;
};

const ResponseTimeChart: React.FC<ResponseTimeChartProps> = ({ data, average }) => {
  if (data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-white rounded-xl border border-gray-100 text-gray-400">
        No data available for the selected range.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Response Time Trend</h3>
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="start_time" 
              type="number"
              domain={['auto', 'auto']}
              tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={average} label="Avg" stroke="red" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="duration"
              name="Response Time (ms)"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 3, fill: '#4f46e5' }}
              activeDot={{ r: 6 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ResponseTimeChart;
