import React, { useState } from 'react';
import { BookOpen, FileText, CheckSquare, Search, Folder, AlertTriangle, Check, History } from 'lucide-react';

export const KnowledgeResearch: React.FC = () => {
  const [subTab, setSubTab] = useState('rules');

  const renderSubContent = () => {
    switch (subTab) {
      case 'checklists':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
            <div className="lg:col-span-4 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { id: 1, title: 'Morning Scalp Prep', status: 'ready', lastUsed: '2h ago', items: '12/12' },
                { id: 2, title: 'High Volatility Event', status: 'partial', lastUsed: '1d ago', items: '8/15' },
                { id: 3, title: 'Weekend Maintenance', status: 'blocked', lastUsed: '5d ago', items: '0/10' },
                { id: 4, title: 'New Pair Onboarding', status: 'ready', lastUsed: '3d ago', items: '20/20' },
              ].map(check => (
                <button 
                  key={check.id}
                  className={`w-full text-left p-3.5 bg-clay-card border rounded-md transition-all group ${
                    check.id === 1 ? 'border-clay-accent/50 bg-clay-accent/5' : 'border-clay-border hover:border-clay-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-[3px] tracking-wider ${
                      check.status === 'ready' ? 'bg-clay-success/10 text-clay-success border border-clay-success/20' :
                      check.status === 'partial' ? 'bg-clay-warning/10 text-clay-warning border border-clay-warning/20' :
                      'bg-clay-danger/10 text-clay-danger border border-clay-danger/20'
                    }`}>
                      {check.status}
                    </span>
                    <span className="text-[9px] text-clay-muted font-mono font-medium">{check.lastUsed}</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-clay-text group-hover:text-clay-accent transition-colors leading-tight">{check.title}</h4>
                  <div className="mt-3.5 flex items-center justify-between gap-4">
                    <div className="flex-1 h-1 bg-clay-bg/40 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          check.status === 'ready' ? 'bg-clay-success' :
                          check.status === 'partial' ? 'bg-clay-warning' :
                          'bg-clay-muted'
                        }`}
                        style={{ width: check.items.split('/')[0] === '0' ? '0%' : `${(parseInt(check.items.split('/')[0]) / parseInt(check.items.split('/')[1])) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-clay-muted font-bold whitespace-nowrap">{check.items}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="lg:col-span-8 bg-clay-card rounded-md border border-clay-border flex flex-col overflow-hidden">
              <div className="p-5 border-b border-clay-border flex items-center justify-between bg-clay-card/40">
                <div>
                  <h3 className="text-base font-bold tracking-tight">Morning Scalp Prep</h3>
                  <p className="text-[11px] text-clay-muted mt-0.5">Standard operating procedure for 08:00 UTC session start.</p>
                </div>
                <button className="px-3 py-1.5 bg-clay-accent/10 text-clay-accent border border-clay-accent/20 rounded text-[10px] font-bold opacity-60 cursor-default hover:bg-clay-accent/20 transition-all uppercase tracking-widest">
                  Start Checklist
                </button>
              </div>
              <div className="flex-1 space-y-2.5 overflow-y-auto p-5 custom-scrollbar">
                {[
                  { label: 'Verify API Connectivity (Binance/Bybit)', done: true },
                  { label: 'Check Economic Calendar for Red Folder events', done: true },
                  { label: 'Confirm Chief Agent v5.0.1 Health Check', done: true },
                  { label: 'Review Overnight P&L and Open Positions', done: true },
                  { label: 'Calibrate Volatility Filters for BTC/ETH', done: false },
                  { label: 'Sync Global Sentiment Index', done: false },
                  { label: 'Verify Hardware Wallet Connection', done: false },
                  { label: 'Test Emergency Kill-Switch Latency', done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-clay-bg/40 rounded border border-clay-border/30 hover:border-clay-border/60 transition-colors">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${item.done ? 'bg-clay-success border-clay-success text-white' : 'border-clay-muted/50 bg-clay-bg/20'}`}>
                      {item.done && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className={`text-xs font-medium ${item.done ? 'text-clay-muted line-through' : 'text-clay-text'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'research':
        return (
          <div className="space-y-6 overflow-y-auto h-full pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'Solana Ecosystem Deep Dive', sentiment: 'bullish', pairs: ['SOL', 'JUP', 'PYTH'], date: 'Mar 30, 2026', summary: 'Network upgrades and increased TVL suggest strong momentum continuation.' },
                { title: 'Macro: CPI Impact Analysis', sentiment: 'neutral', pairs: ['BTC', 'ETH'], date: 'Mar 29, 2026', summary: 'Expected volatility spike during release. Models suggest defensive positioning.' },
                { title: 'Layer 2 Scaling Wars v4', sentiment: 'bullish', pairs: ['ARB', 'OP', 'STRK'], date: 'Mar 28, 2026', summary: 'EIP-4844 impact assessment shows significant fee reduction for top L2s.' },
                { title: 'Stablecoin Liquidity Flow', sentiment: 'bearish', pairs: ['USDT', 'USDC'], date: 'Mar 27, 2026', summary: 'Slight outflow from exchanges noted in on-chain data. Caution advised.' },
                { title: 'AI Sector Momentum', sentiment: 'bullish', pairs: ['FET', 'RNDR', 'AGIX'], date: 'Mar 26, 2026', summary: 'Institutional interest in AI-related infrastructure tokens remains high.' },
                { title: 'DEX Volume Shift Report', sentiment: 'neutral', pairs: ['UNI', 'DYDX'], date: 'Mar 25, 2026', summary: 'Volume shifting towards perpetual DEXs as regulatory clarity improves.' },
              ].map((brief, i) => (
                <div key={i} className="bg-clay-card border border-clay-border rounded-md p-4 hover:border-clay-accent/50 transition-all cursor-pointer group flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-[3px] tracking-wider border ${
                      brief.sentiment === 'bullish' ? 'bg-clay-success/10 text-clay-success border-clay-success/20' :
                      brief.sentiment === 'bearish' ? 'bg-clay-danger/10 text-clay-danger border-clay-danger/20' :
                      'bg-clay-warning/10 text-clay-warning border-clay-warning/20'
                    }`}>
                      {brief.sentiment}
                    </span>
                    <span className="text-[9px] text-clay-muted font-mono font-medium">{brief.date}</span>
                  </div>
                  <h4 className="text-[13px] font-bold mb-2 group-hover:text-clay-accent transition-colors leading-tight text-clay-text">{brief.title}</h4>
                  <p className="text-[11px] text-clay-muted leading-relaxed mb-4 flex-1">{brief.summary}</p>
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-clay-border/30">
                    {brief.pairs.map(p => (
                      <span key={p} className="text-[8px] font-mono bg-clay-bg/30 border border-clay-border/50 px-1.5 py-0.5 rounded text-clay-muted font-bold">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'archive':
        return (
          <div className="flex h-full gap-6 overflow-hidden">
            <div className="w-72 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-6">
                <div>
                  <h5 className="text-[9px] font-bold uppercase tracking-[0.15em] text-clay-muted mb-3 px-2 opacity-60">March 2026</h5>
                  <div className="space-y-1.5">
                    {[
                      { id: 1, title: 'Session #412: High Volatility', date: 'Mar 30', type: 'Trade Log' },
                      { id: 2, title: 'Post-Mortem: BTC Flash Crash', date: 'Mar 28', type: 'Analysis' },
                      { id: 3, title: 'Strategy Calibration Notes', date: 'Mar 25', type: 'System' },
                      { id: 4, title: 'Session #411: Range Bound', date: 'Mar 24', type: 'Trade Log' },
                    ].map((note) => (
                      <button 
                        key={note.id} 
                        className={`w-full text-left p-3 rounded-md border transition-all ${
                          note.id === 1 ? 'bg-clay-accent/5 border-clay-accent/30' : 'bg-clay-card border-clay-border hover:border-clay-muted/50'
                        }`}
                      >
                        <div className="text-[8px] text-clay-muted mb-1 flex justify-between font-bold uppercase tracking-wider">
                          <span>{note.type}</span>
                          <span className="font-mono">{note.date}</span>
                        </div>
                        <div className="text-[11px] font-bold text-clay-text leading-tight">{note.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-[9px] font-bold uppercase tracking-[0.15em] text-clay-muted mb-3 px-2 opacity-60">February 2026</h5>
                  <div className="space-y-1.5">
                    {[
                      { id: 5, title: 'Monthly Performance Review', date: 'Feb 28', type: 'Report' },
                      { id: 6, title: 'Session #410: Bull Run', date: 'Feb 20', type: 'Trade Log' },
                    ].map((note) => (
                      <button key={note.id} className="w-full text-left p-3 bg-clay-card border border-clay-border rounded-md hover:border-clay-muted/50 transition-all">
                        <div className="text-[8px] text-clay-muted mb-1 flex justify-between font-bold uppercase tracking-wider">
                          <span>{note.type}</span>
                          <span className="font-mono">{note.date}</span>
                        </div>
                        <div className="text-[11px] font-bold text-clay-text leading-tight">{note.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-clay-card rounded-md border border-clay-border flex flex-col overflow-hidden">
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8 pb-8 border-b border-clay-border">
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-clay-accent mb-3">
                      <History className="w-3 h-3" /> Trade Log
                    </div>
                    <h1 className="text-2xl font-bold mb-3 tracking-tight">Session #412: High Volatility</h1>
                    <div className="flex items-center gap-5 text-[10px] text-clay-muted font-mono font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="text-clay-muted uppercase tracking-wider">Date:</span>
                        <span className="text-clay-text">Mar 30, 2026</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-clay-muted uppercase tracking-wider">Duration:</span>
                        <span className="text-clay-text">4h 12m</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-clay-muted uppercase tracking-wider">P&L:</span>
                        <span className="text-clay-success">+$1,240.00</span>
                      </div>
                    </div>
                  </div>
                  <div className="prose prose-invert prose-sm text-clay-muted leading-relaxed">
                    <h3 className="text-clay-text text-sm font-bold uppercase tracking-wider mb-4">Executive Summary</h3>
                    <p className="mb-6">Session dominated by aggressive BTC momentum following the US market open. Chief Agent correctly identified the 15m breakout at 68,400. Defensive mode was triggered briefly at 14:30 UTC due to orderbook imbalance.</p>
                    
                    <h3 className="text-clay-text text-sm font-bold uppercase tracking-wider mb-4">Key Observations</h3>
                    <ul className="space-y-2 mb-8">
                      <li className="flex gap-3"><span className="text-clay-accent mt-1">•</span> SOL/USDT correlation with BTC weakened significantly during the second hour.</li>
                      <li className="flex gap-3"><span className="text-clay-accent mt-1">•</span> Liquidity clusters at 70k acted as a magnet, as predicted by the Orderflow Agent.</li>
                      <li className="flex gap-3"><span className="text-clay-accent mt-1">•</span> Manual intervention was required once to adjust trailing stop on ETH position.</li>
                    </ul>

                    <div className="mt-10 p-5 bg-clay-bg/20 rounded-md border border-clay-border/50">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-clay-muted mb-4 border-b border-clay-border/30 pb-2">AI Reasoning Audit</h4>
                      <div className="space-y-2.5 font-mono text-[11px]">
                        <div className="flex gap-3"><span className="text-clay-muted">[14:02]</span> <span className="text-clay-success">SIGNAL:</span> <span className="text-clay-text">BTC Long (Conf: 88%)</span></div>
                        <div className="flex gap-3"><span className="text-clay-muted">[14:02]</span> <span className="text-clay-muted">REASON:</span> <span className="text-clay-muted italic">VWAP cross + Delta divergence</span></div>
                        <div className="flex gap-3"><span className="text-clay-muted">[14:30]</span> <span className="text-clay-warning">ACTION:</span> <span className="text-clay-text">Switch to Defensive Mode</span></div>
                        <div className="flex gap-3"><span className="text-clay-muted">[14:30]</span> <span className="text-clay-muted">REASON:</span> <span className="text-clay-muted italic">Large sell wall detected at 69,200</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-clay-card rounded-md border border-clay-border flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-clay-border flex items-center justify-between bg-clay-card/40">
              <div>
                <h1 className="text-lg font-bold tracking-tight">Scalp Momentum v5 Ruleset</h1>
                <div className="flex items-center gap-3 text-[10px] text-clay-muted font-mono font-medium mt-1">
                  <span>Updated: 2d ago</span>
                  <span className="opacity-30">•</span>
                  <span>Author: Chief Agent</span>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-clay-card border border-clay-border text-clay-muted rounded text-[10px] font-bold opacity-60 cursor-default hover:bg-clay-accent/5 transition-all uppercase tracking-widest">
                Edit Rules
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="max-w-3xl prose prose-invert prose-sm text-clay-muted leading-relaxed">
                <h3 className="text-clay-text text-sm font-bold uppercase tracking-wider mb-4">Core Philosophy</h3>
                <p className="mb-8">
                  This strategy capitalizes on short-term momentum bursts following periods of low volatility consolidation. It relies heavily on volume profile confirmation and RSI divergence on lower timeframes (15m, 1H).
                </p>

                <h3 className="text-clay-text text-sm font-bold uppercase tracking-wider mb-4">Entry Criteria (Long)</h3>
                <ul className="space-y-3 mb-8">
                  <li className="flex gap-3"><span className="text-clay-success mt-1">•</span> <span className="text-clay-text">Price must be above the 200 EMA on the 1H chart.</span></li>
                  <li className="flex gap-3"><span className="text-clay-success mt-1">•</span> <span className="text-clay-text">RSI (14) on 15m chart must show bullish divergence.</span></li>
                  <li className="flex gap-3"><span className="text-clay-success mt-1">•</span> <span className="text-clay-text">Volume on the breakout candle must be at least 1.5x the 20-period average.</span></li>
                  <li className="flex gap-3"><span className="text-clay-success mt-1">•</span> <span className="text-clay-text">AI Confidence score must be &gt; 70%.</span></li>
                </ul>

                <h3 className="text-clay-text text-sm font-bold uppercase tracking-wider mb-4">Risk Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-clay-bg/20 rounded border border-clay-border/50">
                    <div className="text-[9px] font-bold uppercase text-clay-muted mb-1">Max Risk</div>
                    <div className="text-sm font-bold text-clay-text">2.0% / Trade</div>
                  </div>
                  <div className="p-4 bg-clay-bg/20 rounded border border-clay-border/50">
                    <div className="text-[9px] font-bold uppercase text-clay-muted mb-1">Stop Loss</div>
                    <div className="text-sm font-bold text-clay-text">Local Swing Low</div>
                  </div>
                  <div className="p-4 bg-clay-bg/20 rounded border border-clay-border/50">
                    <div className="text-[9px] font-bold uppercase text-clay-muted mb-1">Take Profit</div>
                    <div className="text-sm font-bold text-clay-text">1:1.5 RR Scale</div>
                  </div>
                </div>

                <div className="mt-10 p-5 bg-clay-warning/5 border border-clay-warning/20 rounded-md">
                  <h4 className="text-clay-warning font-bold text-[11px] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Operational Constraint
                  </h4>
                  <p className="text-xs text-clay-warning/70 m-0 leading-relaxed">
                    Do not execute this strategy during major macroeconomic news releases (CPI, FOMC). The models are configured to automatically degrade confidence scores during these windows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-clay-bg">
      <div className="px-8 py-6 flex items-center justify-between flex-shrink-0 border-b border-clay-border/50 bg-clay-card/50">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-clay-text">Knowledge & Research</h2>
          <p className="text-clay-muted text-[11px] mt-0.5">Strategy rules, checklists, and market research repository.</p>
        </div>
        <div className="relative group">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-clay-muted group-focus-within:text-clay-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search knowledge base..." 
            className="pl-9 pr-4 py-1.5 bg-clay-bg/30 border border-clay-border rounded-md text-[11px] focus:outline-none focus:border-clay-accent/50 transition-all w-64 placeholder:text-clay-muted/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6 flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-56 space-y-6 flex-shrink-0">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-4 px-2 opacity-50">Repository</h3>
            <div className="space-y-1">
              <button 
                onClick={() => setSubTab('rules')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[11px] font-bold transition-all ${
                  subTab === 'rules' ? 'bg-clay-accent/10 text-clay-accent border border-clay-accent/20' : 'text-clay-muted hover:text-clay-text hover:bg-clay-accent/5 border border-transparent'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Strategy Rules
              </button>
              <button 
                onClick={() => setSubTab('checklists')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[11px] font-bold transition-all ${
                  subTab === 'checklists' ? 'bg-clay-accent/10 text-clay-accent border border-clay-accent/20' : 'text-clay-muted hover:text-clay-text hover:bg-clay-accent/5 border border-transparent'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" /> Pre-flight Checklists
              </button>
              <button 
                onClick={() => setSubTab('research')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[11px] font-bold transition-all ${
                  subTab === 'research' ? 'bg-clay-accent/10 text-clay-accent border border-clay-accent/20' : 'text-clay-muted hover:text-clay-text hover:bg-clay-accent/5 border border-transparent'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Market Research
              </button>
              <button 
                onClick={() => setSubTab('archive')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[11px] font-bold transition-all ${
                  subTab === 'archive' ? 'bg-clay-accent/10 text-clay-accent border border-clay-accent/20' : 'text-clay-muted hover:text-clay-text hover:bg-clay-accent/5 border border-transparent'
                }`}
              >
                <Folder className="w-3.5 h-3.5" /> Archived Notes
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderSubContent()}
        </div>
      </div>
    </div>
  );
};
