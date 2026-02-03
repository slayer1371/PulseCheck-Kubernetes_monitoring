"use client";

import { useCallback } from 'react';
import { Activity, RefreshCw, Zap, Shield } from 'lucide-react';
import { usePolling } from '@/hooks/usePolling';
import ClusterOverview from '@/components/ClusterOverview';
import PodTable from '@/components/Podtable';
import MetricsChart from '@/components/Metricschart';
import NodeList from '@/components/Nodelist';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const fetchCluster = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/cluster`);
    if (!res.ok) throw new Error('Failed to fetch cluster data');
    return res.json();
  }, []);

  const fetchPods = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/pods`);
    if (!res.ok) throw new Error('Failed to fetch pods');
    return res.json();
  }, []);

  const fetchMetrics = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/metrics`);
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  }, []);

  const fetchNodes = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/nodes`);
    if (!res.ok) throw new Error('Failed to fetch nodes');
    return res.json();
  }, []);

  const { data: clusterData, loading: clusterLoading, error: clusterError } = usePolling(fetchCluster, 5000);
  const { data: podsData, loading: podsLoading, error: podsError } = usePolling(fetchPods, 5000);
  const { data: metricsData, loading: metricsLoading } = usePolling(fetchMetrics, 5000);
  const { data: nodesData, loading: nodesLoading } = usePolling(fetchNodes, 10000);

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative glass-strong border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl">
                  <Activity className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">PulseCheck</h1>
                <p className="text-gray-400 text-xs flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  Kubernetes Cluster Monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
                <span className="status-dot status-running" />
                <span className="text-xs text-gray-300">Live</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 glass px-3 py-1.5 rounded-full">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Auto-refresh: 5s</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {(clusterError || podsError) && (
          <div className="mb-6 p-4 glass rounded-xl border border-red-500/30 bg-red-500/10">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm">
                Connection issue: {clusterError || podsError}. Retrying...
              </p>
            </div>
          </div>
        )}

        {/* Cluster Overview */}
        <section className="mb-8">
          <ClusterOverview data={clusterData} loading={clusterLoading} />
        </section>

        {/* Metrics Charts */}
        {metricsData && metricsData.metrics && metricsData.metrics.length > 0 && (
          <section className="mb-8">
            <MetricsChart metrics={metricsData.metrics} />
          </section>
        )}

        {/* Pods Table */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
              Pods
            </h2>
            {podsData?.pods && (
              <span className="text-xs text-gray-400 glass px-3 py-1 rounded-full">
                {podsData.pods.length} total
              </span>
            )}
          </div>
          {podsLoading && !podsData ? (
            <div className="glass rounded-xl p-12 text-center">
              <div className="inline-flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-gray-400">Loading pods...</span>
              </div>
            </div>
          ) : podsData && podsData.pods ? (
            <PodTable 
              pods={podsData.pods} 
              metrics={metricsData?.metrics || []} 
            />
          ) : (
            <div className="glass rounded-xl p-12 text-center text-gray-400">
              No pods found in the default namespace
            </div>
          )}
        </section>

        {/* Nodes */}
        {nodesData && nodesData.nodes && (
          <section className="mb-8">
            <NodeList nodes={nodesData.nodes} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-gray-800/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-xs">
            PulseCheck • Real-time Kubernetes Monitoring
          </p>
        </div>
      </footer>
    </div>
  );
} 