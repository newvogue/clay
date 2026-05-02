import React from 'react';
import { MOCK_SIGNALS, MOCK_SERVICES } from '../mockData';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Clock,
  ArrowRight,
  BarChart3,
  AlertCircle,
  Percent,
  RefreshCw,
  Terminal,
  Cpu
} from 'lucide-react';
import { SessionState } from '../types';

interface OverviewProps {
  onNavigate: (tab: string) => void;
  sessionState: SessionState;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate, sessionState }) => {
  const activeSignals = MOCK_SIGNALS.filter(s => s.state === 'active');
  const degradedServices = MOCK_SERVICES.filter(s => s.status !== 'online');

  return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-clay-text">Mission Overview</h2>
          <p className="text-clay-muted text-[10px] uppercase tracking-[0.2em] font-bold pb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-clay-accent animate-pulse" />
            System state and market intelligence
          </p>
        </div>
        <div className="flex items-center gap-4 bg-clay-card px-3 py-1.5 rounded border border-clay-border/60">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded animate-pulse ${
              sessionState === 'active' ? 'bg-clay-success' : 
              sessionState === 'background' ? 'bg-clay-accent' : 
              'bg-clay-warning'
            }`} />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">
              {sessionState === 'background' ? 'Standby Mode' : `${sessionState} session`}
            </span>
          </div>
          <div className="w-px h-3 bg-clay-border/60" />
          <span className="text-[10px] font-mono text-clay-muted uppercase font-bold">Upt: 4h 12m</span>
        </div>
      </div>

      {/* Top KPI Row - 5 Compact Blocks */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-clay-card p-4 rounded border border-clay-border/60 flex flex-col justify-between min-h-[90px] group hover:border-clay-accent/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">Active Signals</h3>
            <Zap className="w-3.5 h-3.5 text-clay-accent" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-clay-text leading-none">{activeSignals.length}</div>
            <div className="text-[9px] text-clay-success font-bold uppercase tracking-widest">+2 last 1h</div>
          </div>
        </div>

        <div className="bg-clay-card p-4 rounded border border-clay-border/60 flex flex-col justify-between min-h-[90px] group hover:border-clay-success/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">Today P&L</h3>
            <BarChart3 className="w-3.5 h-3.5 text-clay-success" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-clay-success leading-none">+$1.2k</div>
            <div className="text-[9px] text-clay-muted font-bold uppercase tracking-widest">3 closed</div>
          </div>
        </div>

        <div className="bg-clay-card p-4 rounded border border-clay-border/60 flex flex-col justify-between min-h-[90px] group hover:border-clay-accent/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">Win Rate</h3>
            <Percent className="w-3.5 h-3.5 text-clay-accent" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-clay-text leading-none">78<span className="text-lg text-clay-muted">%</span></div>
            <div className="text-[9px] text-clay-muted font-bold uppercase tracking-widest">1.4 RR avg</div>
          </div>
        </div>

        <div className="bg-clay-card p-4 rounded border border-clay-border/60 flex flex-col justify-between min-h-[90px] group hover:border-clay-warning/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">System Health</h3>
            <ShieldCheck className={`w-3.5 h-3.5 ${degradedServices.length === 0 ? 'text-clay-success' : 'text-clay-warning'}`} />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-lg font-bold text-clay-text leading-none">{degradedServices.length === 0 ? 'Optimal' : 'Degraded'}</div>
            <div className="text-[9px] text-clay-muted font-bold uppercase tracking-widest">
              {degradedServices.length === 0 ? 'All nodes' : 'See logs'}
            </div>
          </div>
        </div>

        <div className="bg-clay-card p-4 rounded border border-clay-border/60 flex flex-col justify-between min-h-[90px] group hover:border-clay-warning/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">Active Alerts</h3>
            <AlertCircle className="w-3.5 h-3.5 text-clay-warning" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-clay-text leading-none">04</div>
            <div className="text-[9px] text-clay-warning font-bold uppercase tracking-widest">2 High Pri</div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-clay-card p-3 rounded border border-clay-border/60 flex items-center justify-between">
          <div>
            <div className="text-[8px] font-bold text-clay-muted uppercase tracking-[0.2em] mb-1">Consensus</div>
            <div className="text-[10px] font-bold text-clay-success tracking-widest">AGREEMENT</div>
          </div>
          <div className="flex gap-[2px]">
            {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-sm bg-clay-success border border-clay-success/20" />)}
          </div>
        </div>
        <div className="bg-clay-card p-3 rounded border border-clay-border/60 flex items-center justify-between">
          <div>
            <div className="text-[8px] font-bold text-clay-muted uppercase tracking-[0.2em] mb-1">Review Score</div>
            <div className="text-[10px] font-bold text-clay-accent tracking-widest">94 / 100</div>
          </div>
          <ShieldCheck className="w-4 h-4 text-clay-accent/40" />
        </div>
        <div className="bg-clay-card p-3 rounded border border-clay-border/60 flex items-center justify-between">
          <div>
            <div className="text-[8px] font-bold text-clay-muted uppercase tracking-[0.2em] mb-1">Ingestion</div>
            <div className="text-[10px] font-bold text-clay-text tracking-widest">NOMINAL</div>
          </div>
          <div className="text-[10px] text-clay-muted font-mono font-bold">128 KB/S</div>
        </div>
        <div className="bg-clay-card p-3 rounded border border-clay-border/60 flex items-center justify-between">
          <div>
            <div className="text-[8px] font-bold text-clay-muted uppercase tracking-[0.2em] mb-1">Backup Ready</div>
            <div className="text-[10px] font-bold text-clay-success tracking-widest">SYNCED</div>
          </div>
          <RefreshCw className="w-4 h-4 text-clay-success/40" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top Signals Panel */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-clay-card rounded border border-clay-border/60 flex flex-col h-[340px]">
            <div className="px-5 py-3.5 border-b border-clay-border/60 flex items-center justify-between bg-clay-bg/30">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">Top Ranked Signals</h3>
              <button 
                onClick={() => onNavigate('trading')}
                className="text-[9px] uppercase font-bold tracking-widest text-clay-accent hover:text-clay-accent/80 flex items-center gap-1.5 transition-colors bg-clay-accent/10 px-2.5 py-1 rounded border border-clay-accent/20"
              >
                Workspace <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 space-y-2.5 overflow-y-auto custom-scrollbar">
              {MOCK_SIGNALS.slice(0, 4).map((signal) => {
                const isLong = signal.type === 'long';
                return (
                  <div key={signal.id} className="flex items-center justify-between p-3.5 bg-clay-bg/50 rounded border border-clay-border/40 hover:border-clay-accent/30 transition-colors cursor-pointer" onClick={() => onNavigate('trading')}>
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded flex items-center justify-center border ${
                        isLong ? 'bg-clay-success/10 text-clay-success border-clay-success/20' : 'bg-clay-danger/10 text-clay-danger border-clay-danger/20'
                      }`}>
                        {isLong ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="font-bold text-sm text-clay-text">{signal.pair}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border border-current ${
                            isLong ? 'bg-clay-success/10 text-clay-success' : 'bg-clay-danger/10 text-clay-danger'
                          }`}>
                            {signal.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-clay-muted flex items-center gap-4 font-bold tracking-widest">
                          <span>Conf: {(signal.confidence * 100).toFixed(0)}%</span>
                          <span>Target: {signal.expectedMove}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono font-bold tracking-widest text-clay-muted mb-1.5">{signal.timeframe}</div>
                      <div className="flex items-center gap-2 justify-end">
                        <div className={`w-1.5 h-1.5 rounded-sm ${
                          signal.state === 'active' ? 'bg-clay-success' : 'bg-clay-warning'
                        }`} />
                        <span className="text-[9px] text-clay-muted uppercase tracking-[0.1em] font-bold">{signal.state}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Alerts / Audit Trail */}
          <div className="bg-clay-card rounded border border-clay-border/60 flex flex-col h-[180px]">
            <div className="px-5 py-3.5 border-b border-clay-border/60 flex items-center justify-between bg-clay-bg/30">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted flex items-center gap-2"><Terminal className="w-3.5 h-3.5" /> Recent Alerts / Audit Trail</h3>
              <button 
                onClick={() => onNavigate('control')}
                className="text-[9px] uppercase font-bold tracking-widest text-clay-muted hover:text-clay-text flex items-center gap-1 transition-colors"
              >
                Full Log <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 space-y-2.5 font-mono text-[10px] overflow-y-auto custom-scrollbar font-bold tracking-tight">
              <div className="flex items-center gap-4 text-clay-muted py-1 border-b border-clay-border/30 last:border-0 hover:bg-clay-bg/50 px-2 rounded -mx-2 transition-colors">
                <span className="text-clay-muted/50 w-14">15:02:05</span>
                <span className="text-clay-accent w-12">[EXEC]</span>
                <span className="truncate">Subscribing to BTC/USDT, SOL/USDT streams.</span>
              </div>
              <div className="flex items-center gap-4 text-clay-muted py-1 border-b border-clay-border/30 last:border-0 hover:bg-clay-bg/50 px-2 rounded -mx-2 transition-colors">
                <span className="text-clay-muted/50 w-14">15:01:42</span>
                <span className="text-clay-warning w-12">[WARN]</span>
                <span className="truncate">Sentiment Agent latency spike: 850ms.</span>
              </div>
              <div className="flex items-center gap-4 text-clay-muted py-1 border-b border-clay-border/30 last:border-0 hover:bg-clay-bg/50 px-2 rounded -mx-2 transition-colors">
                <span className="text-clay-muted/50 w-14">14:58:12</span>
                <span className="text-clay-success w-12">[INFO]</span>
                <span className="truncate">Signal generated for ETH/USDT (Conf: 82%).</span>
              </div>
              <div className="flex items-center gap-4 text-clay-muted py-1 border-b border-clay-border/30 last:border-0 hover:bg-clay-bg/50 px-2 rounded -mx-2 transition-colors">
                <span className="text-clay-muted/50 w-14">14:55:30</span>
                <span className="text-clay-success w-12">[INFO]</span>
                <span className="truncate">Scalp Momentum v5 initialized successfully.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-clay-card rounded border border-clay-border/60 p-5">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => onNavigate('trading')}
                className="w-full py-3 bg-clay-accent/10 hover:bg-clay-accent/20 text-clay-accent border border-clay-accent/20 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-sm"
              >
                <Activity className="w-3.5 h-3.5" />
                Trading Workspace
              </button>
              <button 
                onClick={() => onNavigate('control')}
                className="w-full py-3 bg-clay-bg hover:bg-clay-bg/80 text-clay-text border border-clay-border/60 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-clay-muted" />
                Control Center
              </button>
            </div>
          </div>

          <div className="bg-clay-card rounded border border-clay-border/60 p-5">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-4">Active Strategy</h3>
            <div className="space-y-5">
              <div>
                <div className="text-[8px] text-clay-muted uppercase tracking-[0.2em] mb-1.5 font-bold">Current Profile</div>
                <div className="text-sm font-bold text-clay-text tracking-widest uppercase">Scalp Momentum v5</div>
              </div>
              <div className="pt-2 border-t border-clay-border/40">
                <div className="text-[8px] text-clay-muted uppercase tracking-[0.2em] mb-1.5 font-bold">Risk Regime</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm bg-clay-warning" />
                  <span className="text-[10px] font-bold text-clay-warning uppercase tracking-widest">Moderate / Aggressive</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Status / Service Health */}
          <div className="bg-clay-card rounded border border-clay-border/60 p-5">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-4">System Nodes</h3>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between bg-clay-bg/30 px-3 py-2 rounded border border-clay-border/40">
                <span className="text-[9px] uppercase tracking-widest text-clay-muted font-bold flex items-center gap-2"><Cpu className="w-3 h-3" /> Core API</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded bg-clay-success" />
                  <span className="text-[9px] text-clay-success font-bold uppercase tracking-widest">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-clay-bg/30 px-3 py-2 rounded border border-clay-border/40">
                <span className="text-[9px] uppercase tracking-widest text-clay-muted font-bold flex items-center gap-2"><Cpu className="w-3 h-3" /> Chief Agent</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded bg-clay-success" />
                  <span className="text-[9px] text-clay-success font-bold uppercase tracking-widest">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-clay-bg/30 px-3 py-2 rounded border border-clay-border/40">
                <span className="text-[9px] uppercase tracking-widest text-clay-muted font-bold flex items-center gap-2"><Cpu className="w-3 h-3" /> Risk Engine</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded bg-clay-success" />
                  <span className="text-[9px] text-clay-success font-bold uppercase tracking-widest">Ready</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-clay-bg/30 px-3 py-2 rounded border border-clay-border/40 border-l-2 border-l-clay-warning">
                <span className="text-[9px] uppercase tracking-widest text-clay-muted font-bold flex items-center gap-2"><Cpu className="w-3 h-3" /> Sentiment</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded bg-clay-warning" />
                  <span className="text-[9px] text-clay-warning font-bold uppercase tracking-widest">Degraded</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
