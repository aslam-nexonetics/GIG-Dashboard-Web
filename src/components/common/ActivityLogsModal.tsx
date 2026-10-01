'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Modal } from '@/components/common/Modal';
import { logger, LogLevel } from '@/services/logger';
import { Terminal, Trash2, Copy, Check, Filter } from 'lucide-react';

interface ActivityLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLogsModal: React.FC<ActivityLogsModalProps> = ({ isOpen, onClose }) => {
  const logs = useSyncExternalStore(
    (callback) => logger.subscribe(callback),
    () => logger.getSnapshot(),
    () => []
  );

  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const handleClear = () => {
    logger.clearLogs();
  };

  const handleCopy = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.tag}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'all') return true;
    if (filterLevel === 'API') return log.tag === 'API';
    return log.level === filterLevel;
  });

  const getLevelBadge = (level: LogLevel, tag: string) => {
    if (tag === 'API') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          API
        </span>
      );
    }
    switch (level) {
      case 'ERROR':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
            ERR
          </span>
        );
      case 'WARN':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
            WRN
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
            INF
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Diagnostics & API Activity Logs"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-600">Filter:</span>
            <div className="flex gap-1">
              {['all', 'API', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    filterLevel === lvl
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleClear}
              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Logs container */}
        <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-xs max-h-96 overflow-y-auto space-y-2 border border-slate-800 shadow-inner">
          {filteredLogs.length === 0 ? (
            <p className="text-slate-500 italic py-6 text-center">No log records recorded yet.</p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/60 p-1 rounded">
                <span className="text-slate-500 text-[11px] shrink-0">
                  {log.timestamp.slice(11, 19)}
                </span>
                <span className="shrink-0">{getLevelBadge(log.level, log.tag)}</span>
                <span className="text-slate-400 font-semibold shrink-0">[{log.tag}]</span>
                <span className="text-slate-200 break-all flex-1">{log.message}</span>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            Showing {filteredLogs.length} events (retains last 150)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
