import React from 'react';
import { Play, RotateCcw, Activity, ShieldCheck, ChevronRight, BarChart2, Filter, Download } from 'lucide-react';
import { motion } from 'motion/react';

export const ValidationLab: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-clay-bg">
      <div className="px-6 py-5 border-b border-clay-border/50 flex items-center justify-between bg-clay-card/30">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-clay-text">Validation Lab</h2>
          <p className="text-clay-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-1">Replay, Strategy Backtesting & Model Candidate Validation</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-clay-accent text-white rounded text-[9px] font-bold tracking-[0.2em] uppercase hover:bg-clay-accent/80 transition-colors shadow-sm">
            <Play className="w-3.5 h-3.5" />
            New Replay Run
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* Lab Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-clay-card p-4 rounded border border-clay-border/60 hover:border-clay-border transition-colors">
            <div className="text-[9px] font-bold text-clay-muted uppercase tracking-[0.2em] mb-2">Total Lab Runs</div>
            <div className="text-2xl font-bold text-clay-text tracking-tight">142</div>
            <div className="text-[10px] text-clay-muted mt-1 font-mono tracking-widest uppercase">Last 24h: 12 runs</div>
          </div>
          <div className="bg-clay-card p-4 rounded border border-clay-border/60 hover:border-clay-border transition-colors">
            <div className="text-[9px] font-bold text-clay-muted uppercase tracking-[0.2em] mb-2">Avg. Decision Quality</div>
            <div className="text-2xl font-bold text-clay-success tracking-tight">92.4%</div>
            <div className="text-[10px] text-clay-muted mt-1 font-mono tracking-widest uppercase">Benchmark: 85%</div>
          </div>
          <div className="bg-clay-card p-4 rounded border border-clay-border/60 hover:border-clay-border transition-colors">
            <div className="text-[9px] font-bold text-clay-muted uppercase tracking-[0.2em] mb-2">Staged Candidates</div>
            <div className="text-2xl font-bold text-clay-warning tracking-tight">03</div>
            <div className="text-[10px] text-clay-muted mt-1 font-mono tracking-widest uppercase">Pending Review</div>
          </div>
          <div className="bg-clay-card p-4 rounded border border-clay-border/60 hover:border-clay-border transition-colors">
            <div className="text-[9px] font-bold text-clay-muted uppercase tracking-[0.2em] mb-2">Simulation Net P&L</div>
            <div className="text-2xl font-bold text-clay-success tracking-tight">+$12,450</div>
            <div className="text-[10px] text-clay-muted mt-1 font-mono tracking-widest uppercase">Virtual equity</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Validation Runs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-clay-border/50 pb-3">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">Validation Runs</h3>
              <div className="flex gap-1.5">
                <button className="px-2 py-1 text-[9px] font-bold tracking-[0.1em] bg-clay-card border border-clay-border rounded text-clay-text shadow-sm">ALL</button>
                <button className="px-2 py-1 text-[9px] font-bold tracking-[0.1em] rounded text-clay-muted hover:text-clay-text hover:bg-clay-bg/50 transition-colors">COMPLETED</button>
                <button className="px-2 py-1 text-[9px] font-bold tracking-[0.1em] rounded text-clay-muted hover:text-clay-text hover:bg-clay-bg/50 transition-colors">RUNNING</button>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'VAL-082', strategy: 'Scalp Momentum v5.2', status: 'completed', winRate: '78%', pnl: '+$420', decision: '88/100' },
                { id: 'VAL-083', strategy: 'RSI Divergence Pro', status: 'running', winRate: '--', pnl: '--', decision: '--' },
                { id: 'VAL-081', strategy: 'Mean Reversion Ultra', status: 'completed', winRate: '62%', pnl: '-$110', decision: '74/100' },
              ].map((run, i) => (
                <div key={run.id} className="bg-clay-card border border-clay-border/60 rounded p-4 flex items-center justify-between hover:border-clay-accent/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${run.status === 'running' ? 'bg-clay-accent/10 border border-clay-accent/20 text-clay-accent animate-pulse' : 'bg-clay-bg/50 border border-clay-border/60 text-clay-muted'}`}>
                      {run.status === 'running' ? <Activity className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-bold text-clay-text">{run.strategy}</span>
                        <span className="text-[9px] font-mono text-clay-muted uppercase tracking-widest bg-clay-bg/50 px-1 border border-clay-border/40 rounded">{run.id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold uppercase tracking-[0.1em] ${run.status === 'running' ? 'text-clay-accent' : 'text-clay-muted'}`}>
                          {run.status}
                        </span>
                        <span className="text-[9px] text-clay-muted font-mono tracking-widest uppercase">1,200 Ticks Replayed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 text-right">
                    <div className="hidden md:block">
                      <div className="text-[9px] uppercase font-bold tracking-[0.1em] text-clay-muted mb-1">Win Rate</div>
                      <div className="text-[13px] font-bold font-mono text-clay-text">{run.winRate}</div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-[9px] uppercase font-bold tracking-[0.1em] text-clay-muted mb-1">Net P&L</div>
                      <div className={`text-[13px] font-bold font-mono ${run.pnl.startsWith('+') ? 'text-clay-success' : 'text-clay-danger'}`}>{run.pnl}</div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-[9px] uppercase font-bold tracking-[0.1em] text-clay-muted mb-1">Decision Q</div>
                      <div className="text-[13px] font-bold font-mono text-clay-text">{run.decision}</div>
                    </div>
                    <button className="p-1.5 opacity-40 group-hover:opacity-100 group-hover:bg-clay-bg border border-transparent group-hover:border-clay-border rounded text-clay-muted hover:text-clay-text transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration & Staging */}
          <div className="space-y-5">
            <div className="bg-clay-card border border-clay-border/60 rounded p-5 flex flex-col gap-4">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted border-b border-clay-border/60 pb-3">Activation Review</h3>
              
              <div className="space-y-4 pt-1">
                <div className="p-4 bg-clay-bg/30 border border-clay-border/60 rounded shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-clay-text tracking-wide">Scalp Momentum v5.3</span>
                    <span className="text-[9px] bg-clay-accent/10 text-clay-accent px-1.5 py-0.5 rounded border border-clay-accent/20 font-bold uppercase tracking-widest">Staged</span>
                  </div>
                  <p className="text-[11px] font-medium text-clay-muted leading-relaxed mb-4">
                    Improved exit logic for low volatility regimes. Passed 500-run Monte Carlo simulation with 1.4 Profit Factor.
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-clay-accent/10 border border-clay-accent/30 text-clay-accent hover:bg-clay-accent/20 text-[9px] font-bold rounded uppercase tracking-[0.1em] transition-colors">ACTIVATE</button>
                    <button className="flex-1 py-2 bg-clay-card border border-clay-border/60 text-clay-muted text-[9px] font-bold rounded uppercase tracking-[0.1em] hover:text-clay-danger hover:border-clay-danger/30 transition-colors">BLOCK</button>
                  </div>
                </div>

                <div className="p-4 bg-clay-bg/30 border border-clay-border/60 rounded shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-clay-text tracking-wide">Trend Follower V2</span>
                    <span className="text-[9px] bg-clay-warning/10 text-clay-warning border border-clay-warning/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Flagged</span>
                  </div>
                  <p className="text-[11px] font-medium text-clay-muted leading-relaxed mb-4">
                    Significant drawdown (8.4%) detected in sideways market replay. Model needs re-calibration.
                  </p>
                  <button className="w-full py-2 bg-clay-card border border-clay-border text-clay-muted hover:text-clay-text hover:border-clay-muted/60 text-[9px] font-bold rounded uppercase tracking-[0.1em] transition-colors">Send Back</button>
                </div>
              </div>
            </div>

            <div className="bg-clay-card border border-clay-border/60 rounded p-5">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-4">Quick Replay Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-clay-muted uppercase tracking-[0.1em] mb-2 block">Time Speed</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['1X', '5X', '10X', 'MAX'].map(s => (
                      <button key={s} className={`py-1.5 text-[10px] font-bold font-mono rounded border ${s === '10X' ? 'bg-clay-accent/10 border-clay-accent/40 text-clay-accent shadow-sm' : 'bg-clay-bg/50 border-clay-border/60 text-clay-muted hover:text-clay-text'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-clay-muted uppercase tracking-[0.1em] mb-2 block">Replay Source</label>
                  <select className="w-full bg-clay-bg/50 border border-clay-border/60 rounded p-2.5 text-[11px] font-bold text-clay-text outline-none focus:border-clay-accent/50 cursor-pointer">
                    <option>Recent Session Data (48h)</option>
                    <option>High Volatility Events</option>
                    <option>Custom Date Range</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-clay-border/60 mt-4">
                   <div className="w-1.5 h-1.5 bg-clay-success rounded-full" />
                   <span className="text-[9px] text-clay-text font-bold tracking-[0.1em] uppercase">Simulator Engine Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
