import React from 'react';
import { Zap, ShieldCheck, BrainCircuit, Play, Pause, Square, AlertTriangle, CheckCircle2, RotateCcw, Crosshair } from 'lucide-react';
import { motion } from 'motion/react';
import { SessionState, TradingPair } from '../types';

interface SessionControlProps {
  sessionState: SessionState;
  onStateChange: (state: SessionState) => void;
  focusPair: string;
  onFocusChange: (symbol: string) => void;
  shortlist: TradingPair[];
}

export const SessionControl: React.FC<SessionControlProps> = ({ 
  sessionState, 
  onStateChange, 
  focusPair, 
  onFocusChange,
  shortlist
}) => {
  const isActive = sessionState === 'active';
  const isPaused = sessionState === 'paused';
  const isPending = sessionState === 'background' || sessionState === 'preflight' || sessionState === 'briefing';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-clay-bg">
      <div className="p-6 border-b border-clay-border flex items-center justify-between bg-clay-card/30">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-clay-text">Session Control</h2>
          <p className="text-clay-muted text-[10px] font-mono uppercase tracking-widest mt-1">Lifecycle Orchestration & Active Command</p>
        </div>
        <div className="flex items-center gap-2">
          {sessionState === 'background' ? (
            <button 
              onClick={() => onStateChange('preflight')}
              className="flex items-center gap-2 px-4 py-2 bg-clay-accent text-white rounded-md text-xs font-bold hover:bg-clay-accent/80 shadow-lg shadow-clay-accent/20 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              INITIATE NEW MISSION
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onStateChange(isActive ? 'paused' : 'active')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                  isActive 
                    ? 'bg-clay-warning/10 border-clay-warning/30 text-clay-warning hover:bg-clay-warning/20' 
                    : 'bg-clay-accent border-clay-accent text-white hover:bg-clay-accent/80'
                }`}
              >
                {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isActive ? 'PAUSE MISSION' : 'RESUME MISSION'}
              </button>
              <button 
                onClick={() => onStateChange('background')}
                className="flex items-center gap-2 px-3 py-1.5 bg-clay-card border border-clay-border text-clay-danger rounded-md text-xs font-bold hover:bg-clay-danger/10 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                TERMINATE
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Status Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Health Panel */}
            <div className="bg-clay-card rounded-md border border-clay-border p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldCheck className="w-24 h-24" />
               </div>
               <div className="flex items-center gap-3 mb-6">
                 <div className={`p-2 rounded-md ${isActive ? 'bg-clay-success/10 text-clay-success' : 'bg-clay-muted/10 text-clay-muted'}`}>
                   <Activity className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-clay-text">Mission Status: <span className="uppercase">{sessionState}</span></h3>
                   <p className="text-clay-muted text-xs font-mono uppercase tracking-tighter">Mission Elasped: 02:44:12</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: 'Risk State', value: 'NOMINAL', color: 'text-clay-success' },
                   { label: 'Consensus', value: 'AGREEMENT', color: 'text-clay-success' },
                   { label: 'AI Posture', value: 'SCALPER-V5', color: 'text-clay-accent' },
                   { label: 'Latency', value: '42ms', color: 'text-clay-muted' }
                 ].map(stat => (
                   <div key={stat.label} className="p-3 bg-clay-bg/30 rounded-md border border-clay-border/50">
                     <span className="text-[9px] uppercase font-bold text-clay-muted block mb-1">{stat.label}</span>
                     <span className={`text-xs font-bold ${stat.color}`}>{stat.value}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Hard Preflight Logic */}
            <div className="bg-clay-card rounded-md border border-clay-border overflow-hidden">
              <div className="p-4 border-b border-clay-border flex items-center justify-between bg-clay-bg/30">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-clay-accent" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-clay-text">Hard Preflight Checks</h3>
                </div>
                <span className="text-[10px] font-mono text-clay-muted uppercase">Version 5.0.4</span>
              </div>
              <div className="divide-y divide-clay-border">
                {[
                  { id: 'AUTH', label: 'Exchange API Connectivity', status: 'verified', time: '02s ago' },
                  { id: 'MDAT', label: 'Market Data Ingestion Health', status: 'verified', time: '01s ago' },
                  { id: 'VALI', label: 'Signal Validation Service', status: 'verified', time: 'Now' },
                  { id: 'RISK', label: 'Balance & Exposure Limits', status: 'verified', time: 'Now' },
                  { id: 'LOCL', label: 'Local Fallback Ready', status: 'warning', time: 'Syncing...' },
                ].map(check => (
                  <div key={check.id} className="p-4 flex items-center justify-between hover:bg-clay-accent/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${check.status === 'verified' ? 'bg-clay-success' : 'bg-clay-warning animate-pulse'}`} />
                      <div>
                        <div className="text-xs font-bold text-clay-text">{check.label}</div>
                        <div className="text-[9px] text-clay-muted font-mono uppercase">{check.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-clay-muted font-mono">{check.time}</span>
                      <CheckCircle2 className={`w-4 h-4 ${check.status === 'verified' ? 'text-clay-success' : 'text-clay-muted'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration & Selection Column */}
          <div className="space-y-6">
            <div className="bg-clay-card rounded-md border border-clay-border p-5">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-clay-border">
                <h3 className="text-xs font-bold uppercase tracking-widest text-clay-text">Focused Target</h3>
                <Crosshair className="w-3.5 h-3.5 text-clay-accent" />
              </div>
              
              <div className="space-y-3">
                <div className="p-4 bg-clay-bg/50 border-2 border-clay-accent rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-clay-accent flex items-center justify-center text-white font-bold text-xs">
                      {focusPair.substring(0, 1)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-clay-text">{focusPair}</div>
                      <div className="text-[10px] text-clay-muted uppercase font-bold">Primary Target</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-clay-success">+$240.20</div>
                    <div className="text-[9px] text-clay-muted uppercase">Today</div>
                  </div>
                </div>

                <div className="bg-clay-bg/30 border border-clay-border rounded-md p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-clay-muted uppercase">Backup Selection</span>
                    <button className="text-[10px] font-bold text-clay-accent hover:underline uppercase">EDIT LIST</button>
                  </div>
                  <div className="space-y-2">
                    {shortlist.filter(p => !p.isFocused).map(pair => (
                      <div key={pair.symbol} className="flex items-center justify-between p-2 bg-clay-card border border-clay-border/50 rounded-md">
                         <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded flex items-center justify-center bg-clay-bg border border-clay-border text-[9px] font-bold">
                             {pair.symbol.substring(0, 1)}
                           </div>
                           <span className="text-xs font-bold text-clay-text">{pair.symbol}</span>
                         </div>
                         <button className="p-1 px-2 text-[9px] font-bold text-clay-muted hover:text-clay-accent border border-clay-border bg-clay-bg rounded uppercase transition-colors">
                           Swap
                         </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-clay-card border border-clay-border rounded-md p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-clay-text">Dynamic Replacement</h3>
              <div className="p-3 bg-clay-bg/30 border border-clay-border rounded-md border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-clay-warning" />
                  <span className="text-[11px] font-bold text-clay-warning uppercase">Drift Alert</span>
                </div>
                <p className="text-[10px] text-clay-muted leading-relaxed mb-3">
                  SOL/USDT volume is dropping below strategy thresholds. Recommend swapping to ADA/USDT for session continuity.
                </p>
                <button className="w-full py-1.5 bg-clay-warning/10 border border-clay-warning/30 text-clay-warning text-[10px] font-bold rounded uppercase hover:bg-clay-warning/20">
                  APPLY REPLACEMENT
                </button>
              </div>
            </div>

            <div className="bg-clay-accent/10 border border-clay-accent p-5 rounded-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-20 transition-transform group-hover:scale-110">
                <BrainCircuit className="w-12 h-12" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-clay-accent mb-2">AI Strategy Briefing</h3>
              <p className="text-[10px] text-clay-text leading-relaxed">
                "Market is currently in an accumulation phase. I am prioritizing 15m breakout patterns with high volume clusters. Defensive exit active if session drawdown exceeds 2%."
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button className="text-[10px] font-bold text-clay-accent uppercase hover:underline">Full Strategy Breakdown</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
