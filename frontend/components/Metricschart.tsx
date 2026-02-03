"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState, useRef } from 'react';
import { Cpu, HardDrive, Activity } from 'lucide-react';

interface Metric {
  pod: string;
  cpu_millicores: number;
  memory_mb: number;
}

interface MetricsChartProps {
  metrics: Metric[];
}

interface HistoricalData {
  timestamp: string;
  [key: string]: number | string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-lg p-3 shadow-xl border border-gray-600/50">
        <p className="text-gray-400 text-xs mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="font-mono font-medium text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MetricsChart({ metrics }: MetricsChartProps) {
  const [history, setHistory] = useState<HistoricalData[]>([]);
  const [activeChart, setActiveChart] = useState<'cpu' | 'memory'>('cpu');

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    const dataPoint: HistoricalData = { timestamp };

    metrics.forEach(metric => {
      dataPoint[`${metric.pod}_cpu`] = metric.cpu_millicores;
      dataPoint[`${metric.pod}_mem`] = metric.memory_mb;
    });

    setHistory(prev => {
      const newHistory = [...prev, dataPoint];
      return newHistory.slice(-30); // Keep last 30 data points
    });
  }, [metrics]);

  if (history.length < 2) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Resource Usage</h3>
            <p className="text-gray-500 text-xs">Real-time metrics</p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-gray-400 text-sm">Collecting metrics...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const gradients = [
    { id: 'blue', start: '#3b82f6', end: '#06b6d4' },
    { id: 'green', start: '#10b981', end: '#34d399' },
    { id: 'purple', start: '#8b5cf6', end: '#a78bfa' },
    { id: 'orange', start: '#f59e0b', end: '#fbbf24' },
    { id: 'pink', start: '#ec4899', end: '#f472b6' },
  ];

  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

  return (
    <div className="glass rounded-xl p-6">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Resource Usage</h3>
            <p className="text-gray-500 text-xs">{history.length} data points</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 p-1 glass rounded-lg">
          <button
            onClick={() => setActiveChart('cpu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeChart === 'cpu' 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            CPU
          </button>
          <button
            onClick={() => setActiveChart('memory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeChart === 'memory' 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Memory
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {gradients.map((g, i) => (
                <linearGradient key={g.id} id={`gradient-${g.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={g.start} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={g.end} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.5} />
            <XAxis 
              dataKey="timestamp" 
              stroke="#6b7280" 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              unit={activeChart === 'cpu' ? 'm' : 'MB'}
            />
            <Tooltip content={<CustomTooltip />} />
            {metrics.map((metric, idx) => (
              <Area
                key={`${metric.pod}_${activeChart}`}
                type="monotone"
                dataKey={activeChart === 'cpu' ? `${metric.pod}_cpu` : `${metric.pod}_mem`}
                stroke={colors[idx % colors.length]}
                fill={`url(#gradient-${gradients[idx % gradients.length].id})`}
                name={metric.pod}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {metrics.map((metric, idx) => (
          <div key={metric.pod} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colors[idx % colors.length] }}
            />
            <span className="text-xs text-gray-400 font-mono">{metric.pod}</span>
          </div>
        ))}
      </div>
    </div>
  );
}