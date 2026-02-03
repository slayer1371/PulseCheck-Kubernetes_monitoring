"use client";

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Box, Server, Network, Calendar } from 'lucide-react';
import { usePolling } from '@/hooks/usePolling';
import LogViewer from '@/components/LogViewer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PodDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const podName = params.name as string;

  const fetchPodDetails = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/pods/${podName}`);
    if (!res.ok) throw new Error('Failed to fetch pod details');
    return res.json();
  }, [podName]);

  const fetchLogs = useCallback(async () => {
    const res = await fetch(`${API_URL}/api/pods/${podName}/logs?tail=100`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  }, [podName]);

  const { data: podDetails, loading: detailsLoading } = usePolling(fetchPodDetails, 5000);
  const { data: logsData, loading: logsLoading } = usePolling(fetchLogs, 3000);

  if (detailsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading pod details...</div>
      </div>
    );
  }

  if (!podDetails) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Pod not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <Box className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white font-mono">{podName}</h1>
              <p className="text-gray-400 text-sm">Pod Details</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pod Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5" />
              Pod Information
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-gray-500 text-sm">Status</dt>
                <dd className={`text-lg font-semibold ${
                  podDetails.status === 'Running' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {podDetails.status}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 text-sm">Namespace</dt>
                <dd className="text-white">{podDetails.namespace}</dd>
              </div>
              <div>
                <dt className="text-gray-500 text-sm">Node</dt>
                <dd className="text-white font-mono">{podDetails.node}</dd>
              </div>
              <div>
                <dt className="text-gray-500 text-sm">IP Address</dt>
                <dd className="text-white font-mono">{podDetails.ip}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Network className="w-5 h-5" />
              Containers
            </h3>
            <div className="space-y-3">
              {podDetails.containers?.map((container: any, idx: number) => (
                <div key={idx} className="bg-gray-900 p-4 rounded border border-gray-700">
                  <div className="font-semibold text-white mb-2">{container.name}</div>
                  <div className="text-sm text-gray-400 font-mono">{container.image}</div>
                  {container.ports && container.ports.length > 0 && (
                    <div className="mt-2 text-sm text-gray-500">
                      Ports: {container.ports.map((p: any) => p.containerPort).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timeline
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-gray-500 text-sm">Created</dt>
                <dd className="text-white text-sm">
                  {podDetails.createdAt ? new Date(podDetails.createdAt).toLocaleString() : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 text-sm">Started</dt>
                <dd className="text-white text-sm">
                  {podDetails.startedAt ? new Date(podDetails.startedAt).toLocaleString() : 'N/A'}
                </dd>
              </div>
              {podDetails.deletedAt && (
                <div>
                  <dt className="text-gray-500 text-sm">Deleted</dt>
                  <dd className="text-white text-sm">{new Date(podDetails.deletedAt).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Pod Phase</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Phase</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded">
                  {podDetails.phase || 'Unknown'}
                </span>
              </div>
              {podDetails.qos && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">QoS Class</span>
                  <span className="text-white text-sm">{podDetails.qos}</span>
                </div>
              )}
              {podDetails.restartCount !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Restart Count</span>
                  <span className={`text-sm ${podDetails.restartCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {podDetails.restartCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logs Section */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Logs</h3>
          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">Loading logs...</div>
            </div>
          ) : logsData?.logs ? (
            <LogViewer logs={logsData.logs} podName={podName} />
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">No logs available</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}