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
import { Activity } from 'lucide-react';

interface ResponseTimeChartProps {
  data: TimeConsumingRecord[];
  average: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass p-4 border border-blue-500/30 shadow-2xl rounded-lg text-sm neon-glow">
        <p className="font-semibold text-blue-300 mb-2">{new Date(label).toLocaleString()}</p>
        <p className="tech-number text-lg">Latency: {data.duration} <span className="text-xs opacity-60">ms</span></p>
        <div className="mt-2 space-y-1">
          <p className="text-gray-400 text-xs">Operation: <span className="text-blue-400">{data.action}</span></p>
          <p className="text-gray-400 text-xs">Transaction ID: <span className="text-blue-400">#{data.id}</span></p>
        </div>
      </div>
    );
  }
  return null;
};

const ResponseTimeChart: React.FC<ResponseTimeChartProps> = ({ data, average }) => {
  if (data.length === 0) {
    return (
      <div className="tech-chart-container h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 inline-block">
            <Activity className="w-12 h-12 text-blue-400" />
          </div>
          <p className="text-gray-400 text-lg">No Data Available</p>
          <p className="text-gray-500 text-sm mt-2">Select parameters to generate performance metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tech-chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="tech-title text-lg flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-400/20 border border-blue-500/30">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          Latency Analysis
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-400">Average: </span>
            <span className="tech-number">{average.toFixed(2)}</span>
            <span className="text-gray-400 text-xs opacity-60"> ms</span>
          </div>
          <div className="status-indicator success">
            Live Monitoring
          </div>
        </div>
      </div>
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
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(0, 212, 255, 0.1)"
              horizontal={true}
            />
            <XAxis
              dataKey="start_time"
              type="number"
              domain={['auto', 'auto']}
              tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              stroke="#6b7c93"
              fontSize={12}
            />
            <YAxis
              stroke="#6b7c93"
              fontSize={12}
              label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#6b7c93' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine
              y={average}
              label="Average"
              stroke="rgba(255, 51, 102, 0.5)"
              strokeDasharray="3 3"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="duration"
              name="Response Latency"
              stroke="url(#blueGradient)"
              strokeWidth={3}
              dot={{ r: 4, fill: '#00d4ff', stroke: '#00d4ff', strokeWidth: 2 }}
              activeDot={{ r: 8, stroke: '#00ffff', strokeWidth: 2 }}
              animationDuration={1500}
            />
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity={1} />
                <stop offset="50%" stopColor="#0099ff" stopOpacity={1} />
                <stop offset="100%" stopColor="#00ffff" stopOpacity={1} />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ResponseTimeChart;
