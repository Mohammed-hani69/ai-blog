import React, { useEffect, useRef } from 'react';
import { LogEntry, AIState } from '../types';

interface AIStatusTerminalProps {
  logs: LogEntry[];
  currentState: AIState;
}

export const AIStatusTerminal: React.FC<AIStatusTerminalProps> = ({ logs, currentState }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getStatusColor = (state: AIState) => {
    switch (state) {
      case AIState.IDLE: return 'bg-slate-500';
      case AIState.ERROR: return 'bg-red-500';
      case AIState.COMPLETE: return 'bg-green-500';
      default: return 'bg-blue-500 animate-pulse';
    }
  };

  return (
    <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex flex-col h-[400px] text-right" dir="ltr">
      {/* We keep dir="ltr" for the terminal code look, or we can make it RTL if we want Arabic logs to read right-to-left naturally. 
          However, terminals are often LTR. Given the request is fully Arabic, let's use RTL for the container but keep font monospace. */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between" dir="rtl">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(currentState)}`}></div>
          <span className="text-xs font-mono text-slate-400 uppercase">{currentState}</span>
        </div>
        <div className="text-xs font-mono text-slate-600">وكيل الذكاء الاصطناعي V2.5</div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent" dir="rtl">
        {logs.length === 0 && (
          <p className="text-slate-600 italic">في انتظار الأمر...</p>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex items-start space-x-2 space-x-reverse">
            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
            <span className={`
              ${log.type === 'error' ? 'text-red-400' : ''}
              ${log.type === 'success' ? 'text-green-400' : ''}
              ${log.type === 'system' ? 'text-yellow-400' : ''}
              ${log.type === 'info' ? 'text-blue-300' : ''}
            `}>
              {log.type === 'system' && '> '}
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};