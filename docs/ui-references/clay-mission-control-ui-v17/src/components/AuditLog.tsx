import React from 'react';
import { MOCK_AUDIT_LOG } from '../mockData';
import { Terminal, Shield, Zap, AlertTriangle, Info } from 'lucide-react';

export const AuditLog: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-clay-bg">
      <div className="p-6 border-b border-clay-border flex items-center justify-between bg-clay-card/30">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-clay-text">System Audit Trail</h2>
          <p className="text-clay-muted text-xs font-mono uppercase tracking-widest mt-1">Full traceability of all system events & decisions</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-clay-bg border border-clay-border rounded text-[10px] font-bold text-clay-muted hover:text-clay-text transition-colors">
            Export JSON
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {MOCK_AUDIT_LOG.map((event) => (
            <div key={event.id} className="flex gap-4 p-3 bg-clay-card rounded-md border border-clay-border hover:border-clay-accent/30 transition-colors group">
              <div className="text-[10px] font-mono text-clay-muted w-20 flex-shrink-0 pt-1">
                {event.timestamp}
              </div>
              
              <div className="flex-shrink-0 pt-1">
                {event.severity === 'warning' ? <AlertTriangle className="w-4 h-4 text-clay-warning" /> :
                 event.severity === 'error' ? <AlertTriangle className="w-4 h-4 text-clay-danger" /> :
                 event.type === 'STATE_CHANGE' ? <Shield className="w-4 h-4 text-clay-accent" /> :
                 <Info className="w-4 h-4 text-clay-muted" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-clay-muted uppercase tracking-wider">{event.actor}</span>
                  <span className="text-[9px] bg-clay-bg px-1.5 py-0.5 rounded-md border border-clay-border text-clay-muted">{event.module}</span>
                  <span className="text-[9px] font-mono text-clay-accent ml-auto opacity-0 group-hover:opacity-100 transition-opacity">{event.type}</span>
                </div>
                <p className="text-sm text-clay-text leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
