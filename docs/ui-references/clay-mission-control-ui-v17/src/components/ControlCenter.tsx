import React, { useState } from 'react';
import { MOCK_SERVICES } from '../mockData';
import { SessionState } from '../types';
import { AuditLog } from './AuditLog';
import { 
  Shield, 
  Activity, 
  Cpu, 
  Globe, 
  Database, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Terminal,
  HardDrive,
  Network
} from 'lucide-react';

interface ControlCenterProps {
  sessionState: SessionState;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({ sessionState }) => {
  const [activeSubTab, setActiveSubTab] = useState<'health' | 'audit' | 'reliability'>('health');

  const getSessionModeLabel = (state: SessionState) => {
    switch (state) {
      case 'active': return 'Live Trading (Manual Execution)';
      case 'background': return 'Background Monitoring (Passive)';
      case 'degraded': return 'Degraded Performance (Limited Ops)';
      case 'defensive': return 'Defensive Mode (Risk Reduction)';
      case 'paused': return 'Session Paused (Manual Override)';
      case 'invalidated': return 'Session Invalidated (Critical Failure)';
      default: return 'Unknown Mode';
    }
  };

  return (
      <div className="flex-1 flex flex-col overflow-hidden bg-clay-bg">
      <div className="px-6 py-5 border-b border-clay-border/50 flex items-center justify-between flex-shrink-0 bg-clay-card/30">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-clay-text">Control Center</h2>
          <p className="text-clay-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-1">System health, runtime status, and AI orchestration.</p>
        </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 bg-clay-card border border-clay-border/60 text-clay-muted rounded text-[9px] font-bold opacity-50 cursor-default uppercase tracking-widest">
              Restart Services
            </button>
            <button className="px-3 py-1.5 bg-clay-accent/10 text-clay-accent border border-clay-accent/20 rounded text-[9px] font-bold opacity-70 cursor-default uppercase tracking-widest">
              Diagnostics
            </button>
          </div>
      </div>

      {/* Sub-navigation */}
      <div className="px-6 flex items-center gap-6 border-b border-clay-border/30 flex-shrink-0 bg-clay-card/20">
        <button 
          onClick={() => setActiveSubTab('health')}
          className={`py-3.5 text-[9px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all ${
            activeSubTab === 'health' ? 'border-clay-accent text-clay-accent' : 'border-transparent text-clay-muted hover:text-clay-text'
          }`}
        >
          System Health
        </button>
        <button 
          onClick={() => setActiveSubTab('audit')}
          className={`py-3.5 text-[9px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all ${
            activeSubTab === 'audit' ? 'border-clay-accent text-clay-accent' : 'border-transparent text-clay-muted hover:text-clay-text'
          }`}
        >
          Audit Trail
        </button>
        <button 
          onClick={() => setActiveSubTab('reliability')}
          className={`py-3.5 text-[9px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all ${
            activeSubTab === 'reliability' ? 'border-clay-accent text-clay-accent' : 'border-transparent text-clay-muted hover:text-clay-text'
          }`}
        >
          Reliability Center
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {activeSubTab === 'health' ? (
          <>
            {/* System Resources (E4.1) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-clay-card p-3 rounded border border-clay-border/60 flex items-center gap-3 hover:border-clay-border transition-colors">
                <div className="p-2 bg-clay-bg/50 rounded border border-clay-border/40 text-clay-muted">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[9px] mb-1.5 font-bold uppercase tracking-widest">
                    <span className="text-clay-muted">CPU</span>
                    <span className="font-mono text-clay-text">24%</span>
                  </div>
                  <div className="h-1 bg-clay-bg/60 rounded-full overflow-hidden">
                    <div className="h-full bg-clay-accent w-1/4 transition-all duration-1000" />
                  </div>
                </div>
              </div>
              <div className="bg-clay-card p-3 rounded border border-clay-border/60 flex items-center gap-3 hover:border-clay-border transition-colors">
                <div className="p-2 bg-clay-bg/50 rounded border border-clay-border/40 text-clay-warning">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[9px] mb-1.5 font-bold uppercase tracking-widest">
                    <span className="text-clay-muted">RAM (32G)</span>
                    <span className="font-mono text-clay-warning">78%</span>
                  </div>
                  <div className="h-1 bg-clay-bg/60 rounded-full overflow-hidden">
                    <div className="h-full bg-clay-warning w-[78%] transition-all duration-1000" />
                  </div>
                </div>
              </div>
              <div className="bg-clay-card p-3 rounded border border-clay-border/60 flex items-center gap-3 hover:border-clay-border transition-colors">
                <div className="p-2 bg-clay-bg/50 rounded border border-clay-border/40 text-clay-muted">
                  <HardDrive className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[9px] mb-1.5 font-bold uppercase tracking-widest">
                    <span className="text-clay-muted">Storage</span>
                    <span className="font-mono text-clay-text">4.2G</span>
                  </div>
                  <div className="h-1 bg-clay-bg/60 rounded-full overflow-hidden">
                    <div className="h-full bg-clay-success w-[15%] transition-all duration-1000" />
                  </div>
                </div>
              </div>
              <div className="bg-clay-card p-3 rounded border border-clay-border/60 flex items-center gap-3 hover:border-clay-border transition-colors">
                <div className="p-2 bg-clay-bg/50 rounded border border-clay-border/40 text-clay-muted">
                  <Network className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[9px] mb-1.5 font-bold uppercase tracking-widest">
                    <span className="text-clay-muted">Latency</span>
                    <span className="font-mono text-clay-text">45ms</span>
                  </div>
                  <div className="h-1 bg-clay-bg/60 rounded-full overflow-hidden">
                    <div className="h-full bg-clay-success w-[10%] transition-all duration-1000" />
                  </div>
                </div>
              </div>
            </div>

            {/* Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {MOCK_SERVICES.map((service, i) => (
                <div key={i} className="bg-clay-card p-4 rounded border border-clay-border flex flex-col gap-4 hover:border-clay-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded border ${
                        service.status === 'online' ? 'bg-clay-success/10 text-clay-success border-clay-success/20' : 
                        service.status === 'degraded' ? 'bg-clay-warning/10 text-clay-warning border-clay-warning/20' : 'bg-clay-danger/10 text-clay-danger border-clay-danger/20'
                      }`}>
                        {service.name.includes('API') ? <Globe className="w-4 h-4" /> : 
                         service.name.includes('Agent') ? <Cpu className="w-4 h-4" /> : 
                         service.name.includes('Risk') ? <Shield className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-clay-text">{service.name}</h3>
                        <p className="text-[9px] text-clay-muted font-mono font-bold uppercase tracking-widest mt-0.5">
                          {service.version || service.latency || 'v1.0.0'}
                        </p>
                      </div>
                    </div>
                    {service.status === 'online' ? <CheckCircle2 className="w-4 h-4 text-clay-success" /> : 
                     service.status === 'degraded' ? <AlertCircle className="w-4 h-4 text-clay-warning" /> : <XCircle className="w-4 h-4 text-clay-danger" />}
                  </div>
                  
                  <div className="h-1 bg-clay-bg/40 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${
                      service.status === 'online' ? 'bg-clay-success w-full' : 
                      service.status === 'degraded' ? 'bg-clay-warning w-2/3' : 'bg-clay-danger w-1/4'
                    }`} />
                  </div>
                </div>
              ))}
            </div>

            {/* System Logs & Model Registry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Model Registry (E5.5) */}
              <div className="lg:col-span-4 bg-clay-card rounded border border-clay-border p-5 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">Model Registry</h3>
                  <span className="text-[9px] bg-clay-accent/10 text-clay-accent px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border border-clay-accent/20">Active</span>
                </div>
                
                <div className="space-y-3 flex-1">
                  <div className="p-3.5 bg-clay-bg/20 rounded border border-clay-border/50 hover:border-clay-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-[9px] text-clay-accent font-bold uppercase tracking-[0.1em] mb-1">Chief Agent</div>
                        <div className="text-xs font-bold text-clay-text tracking-wide">GPT-4o (Cloud)</div>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-clay-success mt-1.5" />
                    </div>
                    <div className="text-[9px] text-clay-muted font-mono font-bold uppercase tracking-widest">v5.0.1 • Production</div>
                  </div>

                  <div className="p-3.5 bg-clay-bg/20 rounded border border-clay-border/50 hover:border-clay-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-[9px] text-clay-accent font-bold uppercase tracking-[0.1em] mb-1">Forecast Model</div>
                        <div className="text-xs font-bold text-clay-text tracking-wide">Local Compact</div>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-clay-success mt-1.5" />
                    </div>
                    <div className="text-[9px] text-clay-muted font-mono font-bold uppercase tracking-widest">v5.0.0 • 2026-03-28</div>
                  </div>

                  <div className="p-3.5 bg-clay-bg/20 rounded border border-clay-border/50 border-l-2 border-l-clay-warning hover:border-clay-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-[9px] text-clay-warning font-bold uppercase tracking-[0.1em] mb-1">Sentiment Agent</div>
                        <div className="text-xs font-bold text-clay-text tracking-wide">Claude 3.5 Haiku</div>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-clay-warning mt-1.5" />
                    </div>
                    <div className="text-[9px] text-clay-muted font-mono font-bold uppercase tracking-widest">Degraded • 850ms</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 bg-clay-card rounded border border-clay-border flex flex-col h-[400px]">
                <div className="p-3.5 border-b border-clay-border flex items-center justify-between bg-clay-bg/30">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-clay-accent" />
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">Runtime Console</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-clay-success animate-pulse" />
                    <span className="text-[9px] font-mono text-clay-muted font-bold tracking-widest uppercase">Streaming</span>
                  </div>
                </div>
                <div className="flex-1 p-4 font-mono text-[10px] space-y-2 overflow-y-auto bg-clay-bg custom-scrollbar shadow-inner font-bold tracking-tight">
                  <p className="text-clay-muted"><span className="opacity-40 w-16 inline-block">[15:02:01]</span> <span className="text-clay-success">INFO</span> Initializing connection to Binance WebSocket...</p>
                  <p className="text-clay-muted"><span className="opacity-40 w-16 inline-block">[15:02:02]</span> <span className="text-clay-success">INFO</span> Chief Agent v5.0.1 online. Thinking level: HIGH.</p>
                  <p className="text-clay-muted"><span className="opacity-40 w-16 inline-block">[15:02:03]</span> <span className="text-clay-warning">WARN</span> Sentiment Analyzer latency spike detected: 850ms.</p>
                  <p className="text-clay-muted"><span className="opacity-40 w-16 inline-block">[15:02:04]</span> <span className="text-clay-success">INFO</span> Shortlist refreshed. 12 pairs analyzed, 3 signals generated.</p>
                  <p className="text-clay-muted"><span className="opacity-40 w-16 inline-block">[15:02:05]</span> <span className="text-clay-accent">EXEC</span> Subscribing to BTC/USDT, SOL/USDT, ETH/USDT streams.</p>
                  <p className="text-clay-muted"><span className="opacity-40 w-16 inline-block">[15:02:05]</span> <span className="text-clay-muted/50">DBUG</span> Risk engine heartbeat: OK.</p>
                  <div className="w-1.5 h-3 bg-clay-accent animate-pulse inline-block align-middle ml-1 opacity-50 relative top-1" />
                </div>
              </div>
            </div>

            <div className="bg-clay-card rounded border border-clay-border p-5 flex flex-col gap-5">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">Active Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-clay-muted tracking-widest">Active Strategy</label>
                  <div className="p-3 bg-clay-bg/30 rounded border border-clay-border text-[11px] uppercase tracking-widest font-bold text-clay-text">
                    Scalp Momentum v5
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-clay-muted tracking-widest">Risk Profile</label>
                  <div className="p-3 bg-clay-bg/30 rounded border border-clay-border text-[11px] uppercase tracking-widest font-bold text-clay-warning">
                    Moderate / Aggressive
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-clay-muted tracking-widest">Session Mode</label>
                  <div className="p-3 bg-clay-bg/30 rounded border border-clay-border text-[11px] uppercase tracking-widest font-bold text-clay-text">
                    {getSessionModeLabel(sessionState)}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button className="px-4 py-2.5 bg-clay-card border border-clay-border text-clay-muted rounded text-[9px] font-bold opacity-60 hover:opacity-100 hover:bg-clay-accent/10 transition-all uppercase tracking-[0.2em]">
                  Modify Session Config
                </button>
              </div>
            </div>
          </>
        ) : activeSubTab === 'audit' ? (
          <AuditLog />
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-clay-card p-5 rounded border border-clay-border relative overflow-hidden group hover:border-clay-success/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-clay-success/10 text-clay-success rounded border border-clay-success/20">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-text">Local Fallback</h3>
                </div>
                <div className="text-2xl font-bold text-clay-text mb-1">READY</div>
                <p className="text-[10px] text-clay-muted uppercase font-bold tracking-widest">Sync: 100% • 12ms latency</p>
              </div>
              <div className="bg-clay-card p-5 rounded border border-clay-border relative overflow-hidden group hover:border-clay-accent/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-clay-accent/10 text-clay-accent rounded border border-clay-accent/20">
                    <Database className="w-4 h-4" />
                  </div>
                  <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-text">Release Gates</h3>
                </div>
                <div className="text-2xl font-bold text-clay-success">STABLE</div>
                <p className="text-[10px] text-clay-muted uppercase font-bold tracking-widest">3 Gate(s) Cleared</p>
              </div>
              <div className="bg-clay-card p-5 rounded border border-clay-border relative overflow-hidden group hover:border-clay-warning/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-clay-warning/10 text-clay-warning rounded border border-clay-warning/20">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-text">Degraded Triggers</h3>
                </div>
                <div className="text-2xl font-bold text-clay-warning">ACTIVE</div>
                <p className="text-[10px] text-clay-muted uppercase font-bold tracking-widest">1 Auto-fallback enabled</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-clay-card rounded border border-clay-border p-5 space-y-5">
                 <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted border-b border-clay-border pb-3">Readiness Checks</h3>
                 <div className="space-y-3">
                    {[
                      { label: 'Local Market Cache', status: 'pass' },
                      { label: 'Offline Signal Engine', status: 'pass' },
                      { label: 'Ingestion Watchdog', status: 'pass' },
                      { label: 'Latency Guard', status: 'fail' },
                      { label: 'Manual Execution Path', status: 'pass' },
                    ].map(check => (
                      <div key={check.label} className="flex items-center justify-between p-3 bg-clay-bg/30 border border-clay-border/50 rounded hover:bg-clay-bg/50 transition-colors">
                        <span className="text-[10px] font-bold text-clay-muted uppercase tracking-wider">{check.label}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${check.status === 'pass' ? 'bg-clay-success/10 text-clay-success border-clay-success/30' : 'bg-clay-danger/10 text-clay-danger border-clay-danger/30 animate-pulse'}`}>
                          {check.status}
                        </span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-5">
                 <div className="bg-clay-card rounded border border-clay-border p-5">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-4">Active incidents</h3>
                    <div className="p-4 bg-clay-danger/5 border border-clay-danger/20 rounded relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-clay-danger" />
                       <div className="flex items-center gap-2 mb-2 pl-2">
                         <AlertCircle className="w-4 h-4 text-clay-danger" />
                         <span className="text-[10px] font-bold text-clay-danger tracking-widest uppercase">System Latency Alert</span>
                       </div>
                       <p className="text-[11px] text-clay-muted leading-relaxed mb-4 pl-2 font-medium">
                         API ingestion latency exceeded 500ms for &gt; 30s. Automatically failed over to Secondary Node (US-EAST).
                       </p>
                       <div className="flex gap-2 pl-2">
                         <button className="px-3 py-1.5 bg-clay-danger/10 border border-clay-danger/30 text-clay-danger hover:bg-clay-danger/20 text-[9px] font-bold rounded uppercase tracking-widest transition-all">Acknowledge</button>
                         <button className="px-3 py-1.5 bg-clay-card border border-clay-border/60 hover:border-clay-muted/40 text-clay-muted hover:text-clay-text text-[9px] font-bold rounded uppercase tracking-widest transition-all">View Logs</button>
                       </div>
                    </div>
                 </div>

                 <div className="bg-clay-card rounded border border-clay-border p-5">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-4">Operator Message</h3>
                    <div className="bg-clay-bg/50 p-4 rounded border border-clay-border border-dashed relative">
                       <div className="absolute top-[-8px] left-4 bg-clay-card px-2 text-[8px] uppercase tracking-widest text-clay-muted font-bold">Priority Note</div>
                       <p className="text-[11px] italic text-clay-muted leading-relaxed font-medium">
                         "System stability is priority during current high-volatility window. Ensure Demo Validation is active for all test signals before promotion to Live execution."
                       </p>
                       <div className="mt-3 text-[9px] uppercase font-bold text-clay-accent tracking-widest">— SYSTEM OPERATOR</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
