"use client";

import { Terminal } from 'lucide-react';

interface LogViewerProps {
  logs: string;
  podName: string;
}

export default function LogViewer({ logs, podName }: LogViewerProps) {
  const logLines = logs.split('\n');

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="bg-gray-900 px-6 py-3 border-b border-gray-700 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Logs: {podName}</span>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto font-mono text-xs bg-black">
        {logLines.map((line, idx) => (
          <div key={idx} className="text-green-400 hover:bg-gray-900 px-2 py-1">
            {line || '\u00A0'}
          </div>
        ))}
      </div>
    </div>
  );
}   