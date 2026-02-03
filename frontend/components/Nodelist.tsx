"use client";

import { Server, CheckCircle, XCircle } from 'lucide-react';

interface Node {
  name: string;
  status: string;
  roles: string[];
  version: string;
  os: string;
}

export default function NodeList({ nodes }: { nodes: Node[] }) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Server className="w-5 h-5" />
        Cluster Nodes
      </h3>
      <div className="space-y-3">
        {nodes.map((node) => (
          <div key={node.name} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {node.status === 'Ready' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-mono text-white font-semibold">{node.name}</span>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                node.status === 'Ready' 
                  ? 'bg-green-900 text-green-400' 
                  : 'bg-red-900 text-red-400'
              }`}>
                {node.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Role:</span>
                <span className="ml-2 text-gray-300">{node.roles.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-500">Version:</span>
                <span className="ml-2 text-gray-300">{node.version}</span>
              </div>
              <div>
                <span className="text-gray-500">OS:</span>
                <span className="ml-2 text-gray-300">{node.os}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}