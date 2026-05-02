import React, { useState } from 'react';
import { 
  MessageSquare, 
  BrainCircuit, 
  Send, 
  Bot, 
  User,
  Zap,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  FileSearch,
  LayoutGrid,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
  type?: 'text' | 'explanation' | 'conflict' | 'system';
}

export const AIConsole: React.FC = () => {
  const [activeView, setActiveView] = useState<'orchestration' | 'consensus' | 'terminal'>('orchestration');
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-clay-bg">
      {/* Header */}
      <div className="px-6 py-5 border-b border-clay-border/50 flex items-center justify-between bg-clay-card/30">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-clay-text">AI Console</h2>
          <p className="text-clay-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-1">Role Orchestration & Agent Consensus</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-clay-card border border-clay-border/60 rounded">
          {['orchestration', 'consensus', 'terminal'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view as any)}
              className={`px-3.5 py-1.5 text-[9px] font-bold uppercase rounded transition-all tracking-[0.1em] ${
                activeView === view ? 'bg-clay-accent text-white shadow-sm' : 'text-clay-muted hover:text-clay-text hover:bg-clay-bg/50'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {activeView === 'orchestration' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { role: 'Chief Agent', model: 'GPT-4o (Cloud)', status: 'Online', mission: 'Session Orchestration', icon: BrainCircuit, color: 'text-clay-accent' },
              { role: 'Market Analyst', model: 'Claude 3.5 Sonnet', status: 'Online', mission: 'Signal Generation', icon: TrendingUp, color: 'text-clay-success' },
              { role: 'Risk Officer', model: 'Llama 3.1 70B (Local)', status: 'Online', mission: 'Safety Enforcement', icon: ShieldCheck, color: 'text-clay-accent' },
              { role: 'Sentiment Agent', model: 'Gemini 1.5 Pro', status: 'Degraded', mission: 'Contextual Ingestion', icon: MessageSquare, color: 'text-clay-warning' },
              { role: 'Audit Reviewer', model: 'GPT-4o mini', status: 'Online', mission: 'Execution Oversight', icon: FileSearch, color: 'text-clay-muted' },
              { role: 'Research Hub', model: 'Grok-1', status: 'Online', mission: 'Knowledge Synthesis', icon: LayoutGrid, color: 'text-clay-muted' },
            ].map((agent) => (
              <div key={agent.role} className="bg-clay-card border border-clay-border/60 rounded p-5 flex flex-col gap-4 hover:border-clay-accent/30 transition-all group">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded bg-clay-bg/50 border border-clay-border/40 group-hover:border-clay-accent/20 transition-all ${agent.color}`}>
                    <agent.icon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-clay-bg/50 border border-clay-border/40 rounded font-mono text-[9px] font-bold uppercase tracking-widest">
                    <div className={`w-1.5 h-1.5 rounded-sm ${agent.status === 'Online' ? 'bg-clay-success' : 'bg-clay-warning animate-pulse'}`} />
                    <span className={agent.status === 'Online' ? 'text-clay-success' : 'text-clay-warning'}>{agent.status}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-clay-text">{agent.role}</h3>
                  <div className="text-[10px] text-clay-muted mt-1 font-mono tracking-wide">{agent.model}</div>
                </div>
                <div className="pt-3 border-t border-clay-border/40">
                  <div className="text-[9px] uppercase font-bold text-clay-muted mb-1 tracking-[0.2em]">Active Mission</div>
                  <div className="text-[11px] text-clay-text font-medium">{agent.mission}</div>
                </div>
                <button className="mt-2 w-full py-2 bg-clay-bg border border-clay-border/60 hover:border-clay-accent/40 hover:text-clay-accent text-[9px] font-bold uppercase tracking-widest rounded transition-all">Configure</button>
              </div>
            ))}
          </div>
        ) : activeView === 'consensus' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
             <div className="lg:col-span-8 space-y-5">
                <div className="bg-clay-card border border-clay-border/60 rounded flex flex-col overflow-hidden">
                  <div className="p-3.5 border-b border-clay-border/60 bg-clay-bg/30 flex items-center justify-between">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">Reasoning Conflict: ETH/USDT</h3>
                    <span className="text-[9px] bg-clay-warning/10 text-clay-warning px-2 py-0.5 rounded border border-clay-warning/20 font-bold uppercase tracking-widest">Conflict Detected</span>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex gap-4 p-4 bg-clay-bg/30 border-l-2 border-clay-success rounded-r">
                      <div className="shrink-0 pt-1">
                        <TrendingUp className="w-4 h-4 text-clay-success" />
                      </div>
                      <div>
                         <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-clay-success mb-1.5">Market Analyst (Bullish)</div>
                         <p className="text-[11px] text-clay-text/90 leading-relaxed font-medium">
                           "Momentum indicators on 15m and 1h timeframes are reaching oversold territory with hidden bullish divergence. Liquidity sweep of prior low completed. Strong buy setup."
                         </p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-clay-bg/30 border-l-2 border-clay-danger rounded-r">
                      <div className="shrink-0 pt-1">
                         <TrendingUp className="w-4 h-4 text-clay-danger scale-y-[-1]" />
                      </div>
                      <div>
                         <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-clay-danger mb-1.5">Strategy Reviewer (Bearish)</div>
                         <p className="text-[11px] text-clay-text/90 leading-relaxed font-medium">
                           "Macro trend remains heavily bearish. Market is currently printing lower highs on the 4H. Entering longs here is high risk as we are likely in a relief bounce before further distribution."
                         </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-clay-accent/5 border-t border-clay-border/60 flex items-center justify-between">
                    <div className="text-[11px] font-bold text-clay-text uppercase tracking-widest">Consensus Verdict: <span className="text-clay-warning">NEUTRAL / SIDELINE</span></div>
                    <button className="px-4 py-2 bg-clay-accent/10 border border-clay-accent/30 hover:bg-clay-accent/20 text-clay-accent text-[9px] font-bold rounded uppercase tracking-widest transition-all">Apply Decision</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                   <div className="bg-clay-card border border-clay-border/60 rounded p-5">
                      <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-4 border-b border-clay-border/60 pb-3">Active Consensus</h4>
                      <div className="space-y-4 pt-1">
                         {['BTC/USDT', 'SOL/USDT', 'LINK/USDT'].map(pair => (
                           <div key={pair} className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-clay-text tracking-wide">{pair}</span>
                              <div className="flex gap-1.5">
                                {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-sm bg-clay-success" />)}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="bg-clay-card border border-clay-border/60 rounded p-5">
                      <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-4 border-b border-clay-border/60 pb-3">Model Confidence</h4>
                      <div className="space-y-4 pt-1">
                         {['Momentum', 'Volume', 'Social', 'Macro'].map(m => (
                           <div key={m} className="space-y-1.5">
                              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                                <span className="text-clay-muted">{m}</span>
                                <span className="text-clay-text font-mono">82%</span>
                              </div>
                              <div className="h-1 bg-clay-bg/80 rounded-full overflow-hidden">
                                <div className="h-full bg-clay-accent w-[82%]" />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>

             <div className="lg:col-span-4 space-y-5">
                <div className="bg-clay-card border border-clay-border/60 rounded p-5">
                   <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-4">Fallback Posture</h3>
                   <div className="space-y-3">
                      <div className="p-3 bg-clay-bg border border-clay-accent/50 rounded">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-clay-accent tracking-widest uppercase">Standard Mode</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-clay-accent" />
                         </div>
                         <p className="text-[10px] text-clay-text font-medium leading-relaxed">Full orchestration enabled. Real-time consensus active.</p>
                      </div>
                      <div className="p-3 bg-clay-bg/30 border border-clay-border/60 rounded opacity-60">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-clay-muted tracking-widest uppercase">Degraded (Local)</span>
                            <RefreshCw className="w-3.5 h-3.5 text-clay-muted" />
                         </div>
                         <p className="text-[10px] text-clay-muted leading-relaxed font-medium">Switch to local models if API latency &gt; 2s.</p>
                      </div>
                   </div>
                </div>

                <div className="bg-clay-card border border-clay-border/60 rounded p-5 flex flex-col">
                   <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-4 border-b border-clay-border/60 pb-3">Model Change Review</h3>
                   <div className="p-4 bg-clay-bg/50 border border-clay-border/60 rounded border-dashed flex-1 flex flex-col justify-center">
                      <div className="text-[8px] text-clay-muted mb-2 tracking-[0.2em] font-bold uppercase">Staged Change</div>
                      <div className="text-xs font-bold text-clay-text mb-2 tracking-wide">GPT-4o → GPT-4.5</div>
                      <p className="text-[11px] text-clay-muted font-medium leading-relaxed mb-4">
                        Update Chief Agent to the latest reasoning engine. 12% improvement in edge-case synthesis observed in lab.
                      </p>
                      <button className="w-full py-2 bg-clay-card border border-clay-border text-clay-muted hover:text-clay-text hover:border-clay-muted/40 transition-all text-[9px] font-bold uppercase tracking-[0.2em] rounded mt-auto">Review & Apply</button>
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="h-full bg-clay-card border border-clay-border/60 rounded flex flex-col overflow-hidden shadow-sm">
             <div className="p-3 border-b border-clay-border/60 bg-clay-bg/30 font-mono text-[9px] text-clay-text flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold tracking-widest uppercase">
                   <div className="w-1.5 h-1.5 bg-clay-success rounded-full animate-pulse" />
                   AI_ORCHESTRATOR_RUNNING
                </div>
                <span className="text-clay-muted tracking-wide">v5.0.4 - PID: 8842</span>
             </div>
             <div className="flex-1 p-5 font-mono text-[11px] text-clay-text font-bold tracking-tight space-y-2 overflow-y-auto custom-scrollbar">
                <p><span className="text-clay-accent w-24 inline-block">[CHIEF]</span> Awaiting role assignment...</p>
                <p><span className="text-clay-success w-24 inline-block">[ANALYST]</span> Watching session pair: BTC/USDT</p>
                <p><span className="text-clay-accent w-24 inline-block">[CHIEF]</span> System heartbeat: NOMINAL</p>
                <p><span className="text-clay-warning w-24 inline-block">[SENTIMENT]</span> Latency spike: 1.2s</p>
                <p><span className="text-clay-accent w-24 inline-block">[CHIEF]</span> Re-routing sentiment ingestion via secondary gateway.</p>
                <p><span className="text-clay-success w-24 inline-block">[RISK]</span> Drawdown limit verified: OK</p>
                <div className="w-1.5 h-3 bg-clay-accent animate-pulse inline-block align-middle ml-1 relative top-1 opacity-50" />
             </div>
             <div className="p-4 border-t border-clay-border/60 bg-clay-bg/50">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="ENTER COMMAND..."
                    className="w-full bg-clay-bg/50 border border-clay-border/60 rounded px-4 py-2.5 font-mono text-[10px] font-bold tracking-widest text-clay-text focus:outline-none focus:border-clay-accent/50 placeholder:text-clay-muted/50 transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[8px] tracking-[0.2em] font-mono font-bold text-clay-muted">
                    <span className="bg-clay-card px-1.5 py-0.5 border border-clay-border/60 rounded">ENTER</span>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
