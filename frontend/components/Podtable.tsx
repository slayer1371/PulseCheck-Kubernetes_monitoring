"use client";

import Link from 'next/link';
import { CheckCircle, XCircle, Clock, AlertCircle, ExternalLink, Cpu, HardDrive } from 'lucide-react';

interface Pod {
  name: string;
  namespace: string;
  status: string;
  ready: string;
  restarts: number;
  age: string;
  node: string;
  ip: string;
}

interface Metric {
  pod: string;
  cpu: string;
  cpu_millicores: number;
  memory: string;
  memory_mb: number;
}

interface PodTableProps {
  pods: Pod[];
  metrics: Metric[];
}

export default function PodTable({ pods, metrics }: PodTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Running':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Running':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20', dot: 'status-running' };
      case 'Pending':
        return { text: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20', dot: 'status-pending' };
      case 'Failed':
        return { text: 'text-red-400', bg: 'bg-red-500/10', ring: 'ring-red-500/20', dot: 'status-failed' };
      default:
        return { text: 'text-gray-400', bg: 'bg-gray-500/10', ring: 'ring-gray-500/20', dot: '' };
    }
  };

  const getMetricsForPod = (podName: string) => {
    return metrics.find(m => m.pod === podName);
  };

  const getCpuColor = (millicores: number) => {
    if (millicores > 500) return 'text-red-400';
    if (millicores > 200) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getMemoryColor = (mb: number) => {
    if (mb > 512) return 'text-red-400';
    if (mb > 256) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Ready
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  CPU
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" />
                  Memory
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Restarts
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Age
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Node
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {pods.map((pod, index) => {
              const podMetrics = getMetricsForPod(pod.name);
              const statusClasses = getStatusClasses(pod.status);
              return (
                <tr 
                  key={pod.name} 
                  className="table-row-hover group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <span className={`status-dot ${statusClasses.dot}`} />
                      <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${statusClasses.bg} ${statusClasses.text} ring-1 ${statusClasses.ring} transition-all`}>
                        {pod.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/pods/${pod.name}`}
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-mono text-sm group/link transition-colors"
                    >
                      <span className="group-hover/link:underline">{pod.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${pod.ready === '1/1' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {pod.ready}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-mono ${podMetrics ? getCpuColor(podMetrics.cpu_millicores) : 'text-gray-500'}`}>
                      {podMetrics?.cpu || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-mono ${podMetrics ? getMemoryColor(podMetrics.memory_mb) : 'text-gray-500'}`}>
                      {podMetrics?.memory || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                      pod.restarts > 5 
                        ? 'bg-red-500/10 text-red-400' 
                        : pod.restarts > 0 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'text-gray-400'
                    }`}>
                      {pod.restarts}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {pod.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {pod.node || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {pods.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          No pods found
        </div>
      )}
    </div>
  );
}