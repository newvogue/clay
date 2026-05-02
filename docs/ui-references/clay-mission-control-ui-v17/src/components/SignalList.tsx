import React from 'react';
import { Signal, TradingPair } from '../types';
import { motion } from 'motion/react';
import { AlertCircle, TrendingUp, TrendingDown, Clock, Target, Eye } from 'lucide-react';

interface SignalListProps {
  signals: Signal[];
  selectedId: string;
  onSelect: (id: string) => void;
  onFocusChange: (symbol: string) => void;
  shortlist: TradingPair[];
}

export const SignalList: React.FC<SignalListProps> = ({ signals, selectedId, onSelect, onFocusChange, shortlist }) => {
  return (
    <div className="w-80 border-r border-clay-border bg-clay-bg flex flex-col h-full overflow-hidden">
      {/* Signals Zone */}
      <div className="flex-[2] flex flex-col min-h-0">
        <div className="p-4 border-b border-clay-border flex items-center justify-between bg-clay-card/50">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-clay-accent" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-clay-text">Active Signals</h2>
          </div>
          <span className="text-[10px] bg-clay-accent/20 text-clay-accent px-1.5 py-0.5 rounded-md font-bold">
            {signals.filter(s => s.state === 'active').length}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {signals.map((signal) => {
            const isSelected = selectedId === signal.id;
            const isInvalidated = signal.state === 'invalidated';
            const isWeakening = signal.state === 'weakening';

            return (
              <button
                key={signal.id}
                onClick={() => !isInvalidated && onSelect(signal.id)}
                disabled={isInvalidated}
                className={`w-full text-left p-3 rounded-md border transition-all relative overflow-hidden group ${
                  isSelected 
                    ? 'bg-clay-accent/10 border-clay-accent/50 ring-1 ring-clay-accent/20' 
                    : isInvalidated
                      ? 'bg-clay-bg/50 border-clay-border opacity-50 cursor-not-allowed'
                      : 'bg-clay-card border-clay-border hover:border-clay-muted/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight text-clay-text">{signal.pair}</span>
                    <span className="text-[10px] text-clay-muted font-mono uppercase">{signal.timeframe} • {signal.riskLevel} risk</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 ${
                    signal.type === 'long' ? 'bg-clay-success/10 text-clay-success' : 'bg-clay-danger/10 text-clay-danger'
                  }`}>
                    {signal.type === 'long' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {signal.type}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-clay-bg/20 p-1.5 rounded-md">
                    <span className="block text-[9px] text-clay-muted uppercase font-bold">Target</span>
                    <span className="text-[11px] font-mono text-clay-success">{signal.target}</span>
                  </div>
                  <div className="bg-clay-bg/20 p-1.5 rounded-md">
                    <span className="block text-[9px] text-clay-muted uppercase font-bold">Stop</span>
                    <span className="text-[11px] font-mono text-clay-danger">{signal.stopLoss}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1 bg-clay-border rounded-md overflow-hidden">
                      <div 
                        className={`h-full rounded-md ${isInvalidated ? 'bg-clay-muted' : 'bg-clay-accent'}`}
                        style={{ width: `${signal.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-clay-muted">{(signal.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <span className="text-[9px] text-clay-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isInvalidated && (
                  <div className="absolute inset-0 bg-clay-bg/60 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="flex items-center gap-1.5 text-clay-danger bg-clay-danger/10 px-3 py-1 rounded-md border border-clay-danger/20">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Invalidated</span>
                    </div>
                  </div>
                )}

                {isWeakening && !isInvalidated && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-clay-warning rounded-md animate-pulse" title="Signal Weakening" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monitoring Pool Zone */}
      <div className="flex-1 border-t border-clay-border flex flex-col min-h-0 bg-clay-bg/20">
        <div className="p-4 border-b border-clay-border flex items-center justify-between bg-clay-card/50">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-clay-muted" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-clay-text">Monitoring Pool</h2>
          </div>
          <span className="text-[9px] font-mono text-clay-muted">SCAN: 12s ago</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {shortlist.map((pair) => (
            <div 
              key={pair.symbol}
              onClick={() => onFocusChange(pair.symbol)}
              className={`flex flex-col p-2.5 rounded-md border transition-all cursor-pointer ${
                pair.isFocused 
                  ? 'bg-clay-accent/10 border-clay-accent/40 shadow-[0_0_10px_rgba(59,130,246,0.05)]' 
                  : 'bg-clay-card/40 border-clay-border/30 hover:border-clay-muted/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-tight text-clay-text">{pair.symbol}</span>
                  {pair.isBackup && (
                    <span className="text-[8px] uppercase font-bold text-clay-warning bg-clay-warning/10 px-1 rounded-md border border-clay-warning/20">Backup</span>
                  )}
                  {pair.isFocused && (
                    <span className="text-[8px] uppercase font-bold text-clay-accent bg-clay-accent/10 px-1 rounded-md border border-clay-accent/20">Focus</span>
                  )}
                </div>
                <span className="text-[10px] text-clay-muted font-mono">${pair.price.toLocaleString()}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <span className="text-[8px] text-clay-muted uppercase font-bold">24h Chg</span>
                  <span className={`text-[10px] font-mono font-bold ${pair.change24h >= 0 ? 'text-clay-success' : 'text-clay-danger'}`}>
                    {pair.change24h >= 0 ? '+' : ''}{pair.change24h}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-clay-muted uppercase font-bold">Volatility</span>
                  <span className="text-[10px] font-mono text-clay-text">{(pair.volatility * 100).toFixed(1)}%</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[8px] text-clay-muted uppercase font-bold">Last Scan</span>
                  <span className="text-[10px] font-mono text-clay-muted">{pair.lastScan}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
