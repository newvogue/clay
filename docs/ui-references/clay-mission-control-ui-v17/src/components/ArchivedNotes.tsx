import React from 'react';
import { History, Search, Filter, Calendar } from 'lucide-react';

export const ArchivedNotes: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-8 pb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Archived Notes</h2>
          <p className="text-clay-muted text-sm">Historical session logs, post-mortems, and system audits.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted" />
            <input 
              type="text" 
              placeholder="Search archive..." 
              className="pl-9 pr-4 py-2 bg-clay-card border border-clay-border rounded text-sm focus:outline-none focus:border-clay-accent transition-colors w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-clay-card border border-clay-border rounded text-xs font-bold hover:bg-white/5 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-8 pt-4 flex gap-8">
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 flex-shrink-0">
          <div className="space-y-6">
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-clay-muted mb-3 px-2">March 2026</h5>
              <div className="space-y-2">
                {[
                  { title: 'Session #412: High Volatility', date: 'Mar 30', type: 'Trade Log' },
                  { title: 'Post-Mortem: BTC Flash Crash', date: 'Mar 28', type: 'Analysis' },
                  { title: 'Strategy Calibration Notes', date: 'Mar 25', type: 'System' },
                  { title: 'Session #411: Range Bound', date: 'Mar 24', type: 'Trade Log' },
                ].map((note, i) => (
                  <button key={i} className="w-full text-left p-3 bg-clay-card border border-clay-border rounded hover:bg-white/5 transition-colors">
                    <div className="text-[9px] text-clay-muted mb-1 flex justify-between">
                      <span>{note.type}</span>
                      <span>{note.date}</span>
                    </div>
                    <div className="text-xs font-bold text-gray-200">{note.title}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-clay-muted mb-3 px-2">February 2026</h5>
              <div className="space-y-2">
                {[
                  { title: 'Monthly Performance Review', date: 'Feb 28', type: 'Report' },
                  { title: 'Session #410: Bull Run', date: 'Feb 20', type: 'Trade Log' },
                ].map((note, i) => (
                  <button key={i} className="w-full text-left p-3 bg-clay-card border border-clay-border rounded hover:bg-white/5 transition-colors">
                    <div className="text-[9px] text-clay-muted mb-1 flex justify-between">
                      <span>{note.type}</span>
                      <span>{note.date}</span>
                    </div>
                    <div className="text-xs font-bold text-gray-200">{note.title}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-clay-card rounded-md border border-clay-border p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 pb-8 border-b border-clay-border">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-clay-accent mb-2">
                <History className="w-3 h-3" /> Trade Log
              </div>
              <h1 className="text-2xl font-bold mb-2">Session #412: High Volatility</h1>
              <div className="flex items-center gap-4 text-xs text-clay-muted font-mono">
                <span>Date: Mar 30, 2026</span>
                <span>Duration: 4h 12m</span>
                <span>P&L: +$1,240</span>
              </div>
            </div>
            <div className="prose prose-invert prose-sm text-gray-300">
              <h3 className="text-gray-100">Executive Summary</h3>
              <p>Session dominated by aggressive BTC momentum following the US market open. Chief Agent correctly identified the 15m breakout at 68,400. Defensive mode was triggered briefly at 14:30 UTC due to orderbook imbalance.</p>
              
              <h3 className="text-gray-100 mt-6">Key Observations</h3>
              <ul>
                <li>SOL/USDT correlation with BTC weakened significantly during the second hour.</li>
                <li>Liquidity clusters at 70k acted as a magnet, as predicted by the Orderflow Agent.</li>
                <li>Manual intervention was required once to adjust trailing stop on ETH position.</li>
              </ul>

              <div className="mt-8 p-4 bg-clay-bg rounded border border-clay-border">
                <h4 className="text-xs font-bold uppercase mb-3">AI Reasoning Audit</h4>
                <div className="space-y-2 font-mono text-[11px] text-clay-muted">
                  <div>[14:02] Signal: BTC Long (Conf: 88%)</div>
                  <div>[14:02] Reason: VWAP cross + Delta divergence</div>
                  <div>[14:30] Action: Switch to Defensive Mode</div>
                  <div>[14:30] Reason: Large sell wall detected at 69,200</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
