import React from 'react';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Calendar,
  Filter
} from 'lucide-react';

export const SessionReview: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = React.useState<'history' | 'validation'>('history');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-clay-bg">
      <div className="px-8 py-6 border-b border-clay-border/50 flex items-center justify-between flex-shrink-0 bg-clay-card/30">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-clay-text">Session Review</h2>
          <p className="text-clay-muted text-[11px] mt-0.5">Historical performance, signal quality, and trade analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-clay-card border border-clay-border rounded-md text-xs font-bold hover:bg-clay-accent/5 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-clay-muted" />
            <span className="text-clay-text text-[10px]">Today</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-clay-card border border-clay-border rounded-md text-xs font-bold hover:bg-clay-accent/5 transition-colors">
            <Filter className="w-3.5 h-3.5 text-clay-muted" />
            <span className="text-clay-text text-[10px]">Filter</span>
          </button>
        </div>
      </div>

      <div className="px-8 flex items-center gap-8 border-b border-clay-border/30 flex-shrink-0 bg-clay-card/20">
        <button 
          onClick={() => setActiveSubTab('history')}
          className={`py-4 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all ${
            activeSubTab === 'history' ? 'border-clay-accent text-clay-accent' : 'border-transparent text-clay-muted hover:text-clay-text'
          }`}
        >
          Audit Timeline
        </button>
        <button 
          onClick={() => setActiveSubTab('validation')}
          className={`py-4 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all ${
            activeSubTab === 'validation' ? 'border-clay-accent text-clay-accent' : 'border-transparent text-clay-muted hover:text-clay-text'
          }`}
        >
          Demo Validation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {activeSubTab === 'history' ? (
          <>
            {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-clay-card p-5 rounded-md border border-clay-border">
          <div className="text-xs font-bold uppercase tracking-widest text-clay-muted mb-2">Total P&L</div>
          <div className="text-2xl font-bold text-clay-success">+$1,245.50</div>
          <div className="text-[10px] text-clay-muted mt-1">Win Rate: 68%</div>
        </div>
        <div className="bg-clay-card p-5 rounded-md border border-clay-border">
          <div className="text-xs font-bold uppercase tracking-widest text-clay-muted mb-2">Signals Generated</div>
          <div className="text-2xl font-bold text-clay-text">24</div>
          <div className="text-[10px] text-clay-muted mt-1">18 Long / 6 Short</div>
        </div>
        <div className="bg-clay-card p-5 rounded-md border border-clay-border">
          <div className="text-xs font-bold uppercase tracking-widest text-clay-muted mb-2">Signal Accuracy</div>
          <div className="text-2xl font-bold text-clay-accent">72.5%</div>
          <div className="text-[10px] text-clay-muted mt-1">Hit expected target</div>
        </div>
        <div className="bg-clay-card p-5 rounded-md border border-clay-border">
          <div className="text-xs font-bold uppercase tracking-widest text-clay-muted mb-2">Best Pair</div>
          <div className="text-2xl font-bold text-clay-text">SOL/USDT</div>
          <div className="text-[10px] text-clay-success mt-1">+$840.20</div>
        </div>
      </div>

      {/* Charts Area Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-clay-card p-6 rounded-md border border-clay-border h-80 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-clay-text">Cumulative P&L</h3>
            <BarChart2 className="w-4 h-4 text-clay-muted" />
          </div>
          <div className="flex-1 flex items-end p-4 gap-1 overflow-hidden bg-clay-bg/30 rounded-md border border-clay-border/50">
            {/* Mock P&L Chart */}
            {[35, 42, 38, 45, 52, 48, 55, 62, 58, 65, 72, 68, 75, 82, 78, 85, 92, 88, 95, 102].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-clay-success/20 border-t border-clay-success/40 transition-all hover:bg-clay-success/40" 
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="bg-clay-card p-6 rounded-md border border-clay-border h-80 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-clay-text">Accuracy by Strategy</h3>
            <BarChart2 className="w-4 h-4 text-clay-muted" />
          </div>
          <div className="flex-1 flex flex-col justify-center gap-6 p-6 bg-clay-bg/30 rounded-md border border-clay-border/50">
            {/* Mock Strategy Accuracy */}
            {[
              { label: 'Scalp Momentum', val: 68, color: 'bg-clay-accent' },
              { label: 'Mean Reversion', val: 54, color: 'bg-clay-warning' },
              { label: 'Breakout Engine', val: 42, color: 'bg-clay-muted' },
            ].map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-clay-muted">{s.label}</span>
                  <span className="text-clay-text">{s.val}%</span>
                </div>
                <div className="h-1.5 bg-clay-bg/40 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} transition-all`} style={{ width: `${s.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="bg-clay-card rounded-md border border-clay-border overflow-hidden">
        <div className="p-5 border-b border-clay-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-clay-text">Recent Signals & Outcomes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-clay-bg/50 text-xs uppercase tracking-wider text-clay-muted font-bold">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Pair</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Outcome</th>
                <th className="px-6 py-4 text-right">User Feedback (E9.2)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clay-border">
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="hover:bg-clay-accent/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-clay-muted text-xs">10:45 UTC</td>
                  <td className="px-6 py-4 font-bold text-clay-text">BTC/USDT</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] px-2 py-1 rounded-md font-bold uppercase bg-clay-success/10 text-clay-success">Long</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-clay-success font-bold text-xs flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Hit Target
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {i === 1 ? (
                      <span className="text-[10px] text-clay-muted bg-clay-bg px-2 py-1 rounded-md border border-clay-border">
                        Traded • Useful
                      </span>
                    ) : i === 2 ? (
                      <span className="text-[10px] text-clay-muted bg-clay-bg px-2 py-1 rounded-md border border-clay-border">
                        Skipped • Bad Timing
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-[10px] font-bold uppercase tracking-wider text-clay-accent hover:underline">
                          Log Feedback
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-clay-card p-5 rounded-md border border-clay-border">
                <div className="text-[10px] font-bold uppercase tracking-widest text-clay-muted mb-2">Readiness State</div>
                <div className="text-xl font-bold text-clay-success">VERIFIED</div>
                <div className="text-[10px] text-clay-muted mt-1 uppercase">Pre-session gate cleared</div>
              </div>
              <div className="bg-clay-card p-5 rounded-md border border-clay-border">
                <div className="text-[10px] font-bold uppercase tracking-widest text-clay-muted mb-2">Linked Signals</div>
                <div className="text-xl font-bold text-clay-text">12 Units</div>
                <div className="text-[10px] text-clay-muted mt-1 uppercase">Matched in broker log</div>
              </div>
              <div className="bg-clay-card p-5 rounded-md border border-clay-border">
                <div className="text-[10px] font-bold uppercase tracking-widest text-clay-muted mb-2">Discipline Score</div>
                <div className="text-xl font-bold text-clay-accent">98/100</div>
                <div className="text-[10px] text-clay-muted mt-1 uppercase">Manual execution accuracy</div>
              </div>
            </div>

            <div className="bg-clay-card rounded-md border border-clay-border overflow-hidden">
               <div className="p-4 border-b border-clay-border bg-clay-bg/30">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-clay-text">Validation Outcome Matrix</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-clay-bg/50 text-[10px] uppercase tracking-wider text-clay-muted font-bold">
                     <tr>
                       <th className="px-6 py-4">Signal ID</th>
                       <th className="px-6 py-4">Pair</th>
                       <th className="px-6 py-4">State</th>
                       <th className="px-6 py-4">Outcome</th>
                       <th className="px-6 py-4 text-right">Verdict</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-clay-border text-[11px]">
                     {[
                       { id: 'SIG-1042', pair: 'BTC/USDT', state: 'matched', outcome: 'Target Hit', verdict: 'discipline_pass' },
                       { id: 'SIG-1043', pair: 'SOL/USDT', state: 'late_matched', outcome: 'Partial target', verdict: 'execution_delay' },
                       { id: 'SIG-1044', pair: 'ETH/USDT', state: 'missed', outcome: 'Trade not taken', verdict: 'unresolved' },
                       { id: 'SIG-1045', pair: 'ADA/USDT', state: 'mismatched', outcome: 'Invalid entry', verdict: 'violation' },
                     ].map((row) => (
                       <tr key={row.id} className="hover:bg-clay-accent/5 transition-colors">
                         <td className="px-6 py-4 font-mono text-clay-muted">{row.id}</td>
                         <td className="px-6 py-4 font-bold text-clay-text">{row.pair}</td>
                         <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                             row.state === 'matched' ? 'bg-clay-success/10 text-clay-success' : 
                             row.state === 'missed' ? 'bg-clay-muted/10 text-clay-muted' : 'bg-clay-warning/10 text-clay-warning'
                           }`}>
                             {row.state.replace('_', ' ')}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-clay-muted">{row.outcome}</td>
                         <td className="px-6 py-4 text-right">
                           <span className={`font-bold uppercase ${
                             row.verdict === 'discipline_pass' ? 'text-clay-success' : 'text-clay-warning'
                           }`}>
                             {row.verdict.replace('_', ' ')}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            <div className="p-6 bg-clay-card border border-clay-border rounded-md">
               <h3 className="text-xs font-bold uppercase tracking-widest text-clay-text mb-4">Manual Action Log</h3>
               <div className="space-y-3 font-mono text-[10px]">
                 <div className="flex items-center gap-4 py-2 border-b border-clay-border">
                   <span className="text-clay-muted shrink-0 w-24">10:45:02 UTC</span>
                   <span className="text-clay-success font-bold w-16">MATCH</span>
                   <span className="text-clay-muted">Linked Signal SIG-1042 to Broker Order #88219 (BTC/USDT)</span>
                 </div>
                 <div className="flex items-center gap-4 py-2 border-b border-clay-border">
                   <span className="text-clay-muted shrink-0 w-24">11:12:45 UTC</span>
                   <span className="text-clay-warning font-bold w-16">DELAY</span>
                   <span className="text-clay-muted">SIG-1043 match delay: 42s. Entry skew: 0.12%</span>
                 </div>
                 <div className="flex items-center gap-4 py-2 opacity-50">
                    <span className="text-clay-muted shrink-0 w-24">...</span>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
