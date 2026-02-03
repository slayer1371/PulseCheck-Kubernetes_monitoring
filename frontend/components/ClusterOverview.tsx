"use client";

import { Activity, Server, Box, Layers, TrendingUp, AlertTriangle } from 'lucide-react';

interface ClusterData {
  cluster_name: string;
  nodes: {
    total: number;
    ready: number;
  };
  pods: {
    total: number;
    by_status: {
      Running: number;
      Pending: number;
      Failed: number;
      Succeeded: number;
    };
  };
  namespaces: number;
}

interface ClusterOverviewProps {
  data: ClusterData | null;
  loading?: boolean;
}

export default function ClusterOverview({ data, loading }: ClusterOverviewProps) {
  if (!data || loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-xl p-6 card-hover">
            <div className="shimmer h-4 rounded w-1/2 mb-3" />
            <div className="shimmer h-10 rounded w-3/4 mb-2" />
            <div className="shimmer h-3 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      icon: Server,
      label: "Nodes",
      value: `${data.nodes.ready}/${data.nodes.total}`,
      subtext: "Ready",
      color: "blue",
      gradient: "from-blue-500 to-cyan-400",
      bgGlow: "bg-blue-500/20",
      percentage: Math.round((data.nodes.ready / data.nodes.total) * 100)
    },
    {
      icon: Box,
      label: "Pods",
      value: data.pods.total,
      subtext: `${data.pods.by_status.Running} Running`,
      color: "green",
      gradient: "from-green-500 to-emerald-400",
      bgGlow: "bg-green-500/20",
      percentage: Math.round((data.pods.by_status.Running / Math.max(data.pods.total, 1)) * 100)
    },
    {
      icon: data.pods.by_status.Failed > 0 ? AlertTriangle : TrendingUp,
      label: "Health",
      value: data.pods.by_status.Failed,
      subtext: data.pods.by_status.Failed > 0 ? "Failed pods" : "All healthy",
      color: data.pods.by_status.Failed > 0 ? "red" : "green",
      gradient: data.pods.by_status.Failed > 0 ? "from-red-500 to-orange-400" : "from-green-500 to-emerald-400",
      bgGlow: data.pods.by_status.Failed > 0 ? "bg-red-500/20" : "bg-green-500/20",
      percentage: 100 - Math.round((data.pods.by_status.Failed / Math.max(data.pods.total, 1)) * 100)
    },
    {
      icon: Layers,
      label: "Namespaces",
      value: data.namespaces,
      subtext: "Active",
      color: "purple",
      gradient: "from-purple-500 to-pink-400",
      bgGlow: "bg-purple-500/20",
      percentage: 100
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { text: string; bg: string; ring: string }> = {
      blue: { text: "text-blue-400", bg: "bg-blue-500/10", ring: "ring-blue-500/20" },
      green: { text: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/20" },
      red: { text: "text-red-400", bg: "bg-red-500/10", ring: "ring-red-500/20" },
      purple: { text: "text-purple-400", bg: "bg-purple-500/10", ring: "ring-purple-500/20" }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const colors = getColorClasses(stat.color);
        return (
          <div 
            key={idx} 
            className="relative glass rounded-xl p-6 card-hover overflow-hidden group"
          >
            {/* Background glow effect */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 ${stat.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {/* Content */}
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
                <div className={`p-2 rounded-lg ${colors.bg} ring-1 ${colors.ring}`}>
                  <stat.icon className={`w-4 h-4 ${colors.text}`} />
                </div>
              </div>
              
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1 animate-count`}>
                {stat.value}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">{stat.subtext}</span>
                {stat.percentage !== undefined && (
                  <span className={`text-xs font-medium ${colors.text}`}>
                    {stat.percentage}%
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1 bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-linear-to-r ${stat.gradient} rounded-full transition-all duration-1000`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}