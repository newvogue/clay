import React from 'react';
import { Signal, SessionState, LayoutMode, TradingPair } from '../types';
import { 
  Brain, 
  ShieldAlert, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Activity,
  Timer,
  ArrowUpRight,
  BarChart3,
  Newspaper,
  TrendingUp as SentimentPositive,
  TrendingDown as SentimentNegative,
  Minus as SentimentNeutral,
  Navigation,
  Target,
  Shield,
  Zap,
  AlertTriangle,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_NEWS } from '../mockData';

interface TradingWorkspaceProps {
  selectedSignal?: Signal;
  layoutMode: LayoutMode;
  sessionState: SessionState;
  focusPair: string;
  shortlist: TradingPair[];
  onFocusChange: (symbol: string) => void;
}

const SituationMap: React.FC<{ signal?: Signal; state: SessionState; pair: string }> = ({ signal, state, pair }) => {
  const isLong = signal?.type === 'long';
  
  if (!signal) {
    return (
      <div className="relative w-full h-full bg-clay-bg overflow-hidden flex flex-col">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="w-full h-full" style={{ 
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px' 
          }} />
        </div>

        <div className="absolute top-4 left-6 z-10 flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] text-clay-muted font-bold">Analyst Situation Map</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tighter">{pair}</span>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-clay-muted/10 text-clay-muted border border-clay-border/50">
              Monitoring Mode
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Scanning Line Animation */}
          <motion.div 
            animate={{ y: [0, 400, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[1px] bg-clay-accent/20 z-0"
          />

          <div className="text-clay-muted flex flex-col items-center gap-4 z-10">
            <div className="relative">
              <Navigation className="w-10 h-10 opacity-20 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-4 h-4 text-clay-accent/40" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-clay-muted/60">Awaiting Signal Trigger</span>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-clay-accent animate-ping" />
                <span className="text-[9px] font-mono text-clay-muted/40 uppercase">Scanning market structure...</span>
              </div>
            </div>
          </div>

          {/* Mock Levels for Monitoring */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute left-0 right-0 border-t border-clay-border border-dashed" style={{ top: '30%' }} />
            <div className="absolute left-0 right-0 border-t border-clay-border border-dashed" style={{ top: '70%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-clay-bg overflow-hidden flex flex-col">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }} />
      </div>

      {/* Situation Map Header */}
      <div className="absolute top-4 left-6 z-10 flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] text-clay-muted font-bold">Analyst Situation Map</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tighter">{signal.pair}</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase ${isLong ? 'bg-clay-success/10 text-clay-success' : 'bg-clay-danger/10 text-clay-danger'}`}>
              {signal.type} Bias
            </span>
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative mt-16 px-12">
        {/* Price Trace / Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isLong ? '#10b981' : '#ef4444'} stopOpacity="0.2" />
              <stop offset="100%" stopColor={isLong ? '#10b981' : '#ef4444'} stopOpacity="0.8" />
            </linearGradient>
          </defs>
          
          {/* Predicted Path */}
          <motion.path
            d={isLong ? "M 50 400 Q 150 380 250 390 T 450 320 T 650 280 T 850 200" : "M 50 200 Q 150 220 250 210 T 450 280 T 650 320 T 850 400"}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          {/* Current Price Trace (Minimal) */}
          <path
            d={isLong ? "M 0 410 L 20 405 L 40 408 L 50 400" : "M 0 190 L 20 195 L 40 192 L 50 200"}
            fill="none"
            stroke="currentColor"
            className="text-clay-muted/40"
            strokeWidth="1.5"
          />
          
          {/* Current Price Node */}
          <circle cx="50" cy={isLong ? "400" : "200"} r="3" fill="currentColor" className="text-clay-text animate-pulse" />
        </svg>

        {/* Level Markers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Target */}
          <div className="absolute left-0 right-0 border-t border-clay-success/30 border-dashed flex items-center justify-end pr-4" style={{ top: isLong ? '20%' : '80%' }}>
            <div className="bg-clay-success/10 text-clay-success px-2 py-1 rounded-md text-[10px] font-bold border border-clay-success/20 -translate-y-1/2">
              TARGET: {signal.target}
            </div>
          </div>

          {/* Entry Zone */}
          <div className="absolute left-0 right-0 bg-clay-accent/5 border-y border-clay-accent/20 flex items-center justify-start pl-4" style={{ top: isLong ? '65%' : '35%', height: '40px' }}>
            <div className="text-clay-accent text-[10px] font-bold uppercase tracking-widest">
              ENTRY ZONE: {signal.entryZone}
            </div>
          </div>

          {/* Stop Loss */}
          <div className="absolute left-0 right-0 border-t border-clay-danger/30 border-dashed flex items-center justify-end pr-4" style={{ top: isLong ? '85%' : '15%' }}>
            <div className="bg-clay-danger/10 text-clay-danger px-2 py-1 rounded-md text-[10px] font-bold border border-clay-danger/20 -translate-y-1/2">
              STOP: {signal.stopLoss}
            </div>
          </div>

          {/* Invalidation Level */}
          <div className="absolute left-0 right-0 border-t border-clay-border/30 flex items-center justify-start pl-4" style={{ top: isLong ? '92%' : '8%' }}>
            <div className="text-clay-muted text-[9px] font-bold uppercase tracking-widest -translate-y-1/2">
              Invalidation: {isLong ? '$66,800' : '$72,400'}
            </div>
          </div>
        </div>

        {/* Directional Bias Overlay */}
        <div className="absolute bottom-8 right-8 flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <Navigation className={`w-4 h-4 ${isLong ? 'text-clay-success rotate-45' : 'text-clay-danger rotate-[225deg]'}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${isLong ? 'text-clay-success' : 'text-clay-danger'}`}>
              Predicted Trajectory
            </span>
          </div>
          <span className="text-[10px] text-clay-muted font-mono">Confidence: {(signal.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export const TradingWorkspace: React.FC<TradingWorkspaceProps> = ({ 
  selectedSignal, 
  layoutMode, 
  sessionState,
  focusPair,
  shortlist,
  onFocusChange
}) => {
  const isLong = selectedSignal?.type === 'long';
  const isHybrid = layoutMode === 'hybrid';
  
  // Operating States
  const isDefensive = sessionState === 'defensive';
  const isPaused = sessionState === 'paused';
  const isDegraded = sessionState === 'degraded';
  const isInvalidated = sessionState === 'invalidated' || selectedSignal?.state === 'invalidated';
  const isWeakening = selectedSignal?.state === 'weakening';

  const getStateTreatment = () => {
    if (isInvalidated) return 'border-clay-danger/40 bg-clay-danger/[0.02] shadow-[inset_0_0_40px_rgba(239,68,68,0.05)]';
    if (isDefensive) return 'border-clay-danger/30 bg-clay-danger/[0.01] shadow-[inset_0_0_30px_rgba(239,68,68,0.03)]';
    if (isDegraded) return 'border-clay-warning/30 bg-clay-warning/[0.01] shadow-[inset_0_0_30px_rgba(245,158,11,0.03)]';
    return 'border-clay-border';
  };

  return (
    <div className={`flex-1 flex flex-col bg-clay-bg relative transition-all duration-500 ${isInvalidated ? 'grayscale-[0.3]' : ''}`}>
      {/* Operating State Overlays */}
      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/70 backdrop-blur-[6px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-8">
              <div className="relative">
                <div className="w-24 h-24 bg-clay-warning/10 rounded-md flex items-center justify-center border border-clay-warning/30">
                  <Pause className="w-10 h-10 text-clay-warning fill-current" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-clay-warning rounded-md flex items-center justify-center animate-pulse">
                  <Timer className="w-3.5 h-3.5 text-black" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold tracking-tighter text-clay-warning mb-3 uppercase italic">System Paused</h3>
                <p className="text-clay-muted text-sm max-w-xs font-medium leading-relaxed">Execution and monitoring suspended by operator command. All active streams are on standby.</p>
              </div>
              <button className="px-10 py-3 bg-clay-warning text-black font-bold rounded-md text-[10px] uppercase tracking-[0.2em] hover:bg-clay-warning/90 transition-all shadow-xl">
                Resume Operations
              </button>
            </div>
          </motion.div>
        )}

        {isInvalidated && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 pointer-events-none border-[1px] border-clay-danger/20"
          >
            <div className="absolute top-8 right-8">
              <div className="border-2 border-clay-danger text-clay-danger px-4 py-1 text-xs font-black uppercase tracking-widest opacity-40 select-none rotate-12">
                Invalidated
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global State Indicators */}
      <div className="absolute top-4 right-6 z-30 flex flex-col items-end gap-2">
        {isDefensive && (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-clay-danger text-white px-4 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 border border-white/20"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Defensive Protocol Active
          </motion.div>
        )}
        {isDegraded && (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-clay-warning text-black px-4 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 border border-black/10"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Performance Degraded
          </motion.div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 flex flex-col min-w-0 border-r transition-colors duration-500 ${getStateTreatment()}`}>
          {/* Header / Pair Context */}
          <div className="h-14 border-b border-clay-border flex items-center justify-between px-5 bg-clay-card/40">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-clay-text">
                  {focusPair}
                  {selectedSignal ? (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      isInvalidated ? 'bg-clay-danger text-white' : 
                      isWeakening ? 'bg-clay-warning text-black' : 
                      'bg-clay-success/10 text-clay-success border border-clay-success/20'
                    }`}>
                      {selectedSignal.state}
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase bg-clay-muted/10 text-clay-muted border border-clay-border/50 tracking-wider">
                      Monitoring
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 text-[9px] text-clay-muted font-mono font-medium">
                  <span>${shortlist.find(p => p.symbol === focusPair)?.price.toLocaleString() || '---'}</span>
                  <span className={shortlist.find(p => p.symbol === focusPair)?.change24h && shortlist.find(p => p.symbol === focusPair)!.change24h >= 0 ? 'text-clay-success' : 'text-clay-danger'}>
                    {shortlist.find(p => p.symbol === focusPair)?.change24h ? (shortlist.find(p => p.symbol === focusPair)!.change24h >= 0 ? '+' : '') + shortlist.find(p => p.symbol === focusPair)!.change24h + '%' : '---'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-clay-bg/30 rounded-md border border-clay-border/50">
                <Timer className="w-3 h-3 text-clay-muted" />
                <span className="text-[9px] font-bold text-clay-muted uppercase tracking-widest">Update: 00:42</span>
              </div>
              <button className="flex items-center gap-1.5 px-2.5 py-1 bg-clay-accent/10 text-clay-accent border border-clay-accent/20 rounded-md text-[9px] font-bold hover:bg-clay-accent/20 transition-all uppercase tracking-widest">
                <ExternalLink className="w-3 h-3" />
                Exchange
              </button>
            </div>
          </div>

          {/* Chart Area (Analyst Style Situation Map) */}
          <div className="flex-1 relative bg-clay-bg p-4 overflow-hidden">
            <div className="h-full border border-clay-border/60 rounded bg-clay-card/30 backdrop-blur-sm relative overflow-hidden shadow-inner">
              <SituationMap signal={selectedSignal} state={sessionState} pair={focusPair} />
            </div>
          </div>

          {/* Reasoning & Explanation (Primary Analyst Focus) */}
          <div className="h-64 border-t border-clay-border bg-clay-card p-4 flex gap-4 overflow-hidden flex-shrink-0">
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">
                <Brain className="w-3.5 h-3.5 text-clay-accent" />
                AI Reasoning & Context
              </div>
              <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar text-clay-text">
                <p className="text-xs leading-relaxed mb-4 font-medium text-clay-text/90 border-l-[3px] border-clay-accent/40 pl-3">
                  {selectedSignal?.explanation || `System is currently in Monitoring Mode for ${focusPair}. No active signal triggers have been detected in the current timeframe. Price action is consolidating within established ranges. CLAY v5 models are scanning for liquidity sweeps or momentum shifts.`}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-clay-bg/50 rounded border border-clay-border/40 hover:border-clay-border transition-colors">
                    <div className="text-[8px] text-clay-muted uppercase font-bold mb-1.5 tracking-[0.1em]">Sentiment Context</div>
                    <p className="text-[10px] text-clay-muted leading-snug font-medium">
                      {selectedSignal ? 'Social volume increasing on X. Whale movements detected in last 15m.' : 'Sentiment remains neutral. Social volume is within baseline parameters. No significant whale activity detected.'}
                    </p>
                  </div>
                  <div className="p-3 bg-clay-bg/50 rounded border border-clay-border/40 hover:border-clay-border transition-colors">
                    <div className="text-[8px] text-clay-muted uppercase font-bold mb-1.5 tracking-[0.1em]">Technical Confluence</div>
                    <p className="text-[10px] text-clay-muted leading-snug font-medium">
                      {selectedSignal ? 'RSI divergence on 1H. EMA 20/50 crossover confirmed.' : 'Price consolidating within tight range. RSI neutral at 50. Volume profile shows no clear directional bias.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-80 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">
                <ShieldAlert className="w-3.5 h-3.5 text-clay-warning" />
                Risk Assessment
              </div>
              <div className={`flex-1 p-4 rounded flex flex-col justify-between border shadow-sm transition-colors duration-500 ${
                isDefensive ? 'bg-clay-danger/10 border-clay-danger/30' : 'bg-clay-bg border-clay-border'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[9px] font-bold uppercase tracking-[0.1em] ${isDefensive ? 'text-clay-danger' : 'text-clay-muted'}`}>
                      {isDefensive ? 'Defensive Risk' : 'Risk Posture'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isDefensive ? 'text-clay-danger' : selectedSignal?.riskLevel === 'high' ? 'text-clay-danger' : selectedSignal?.riskLevel === 'low' ? 'text-clay-success' : 'text-clay-warning'}`}>
                      {isDefensive ? 'Critical' : selectedSignal?.riskLevel || 'Neutral'}
                    </span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDefensive ? 'bg-clay-danger/20' : 'bg-clay-border/60'}`}>
                    <div 
                      className={`h-full transition-all duration-1000 ${isDefensive ? 'bg-clay-danger' : selectedSignal?.riskLevel === 'high' ? 'bg-clay-danger' : selectedSignal?.riskLevel === 'low' ? 'bg-clay-success' : 'bg-clay-warning'}`} 
                      style={{ width: isDefensive ? '100%' : selectedSignal?.riskLevel === 'high' ? '90%' : selectedSignal?.riskLevel === 'moderate' ? '60%' : selectedSignal?.riskLevel === 'low' ? '30%' : '5%' }} 
                    />
                  </div>
                </div>
                <p className={`text-[10px] leading-relaxed italic font-medium ${isDefensive ? 'text-clay-danger/80' : 'text-clay-muted/80'}`}>
                  {isDefensive 
                    ? '"System in defensive posture. All new executions blocked. Monitoring existing exposure only."'
                    : selectedSignal 
                      ? '"High volatility expected due to upcoming macro data. Suggest 0.5% position size."'
                      : '"Monitoring mode active. Risk posture is neutral. No immediate action required."'
                  }
                </p>
                <button className={`w-full py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] rounded border transition-all ${
                  isDefensive 
                    ? 'bg-clay-danger/20 text-clay-danger border-clay-danger/30 hover:bg-clay-danger/30' 
                    : 'bg-clay-card text-clay-text border-clay-border hover:bg-clay-bg'
                }`}>
                  {isDefensive ? 'Override Protocol' : 'Log Observation'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: News & Radar */}
        <div className="w-80 flex flex-col bg-clay-card border-l border-clay-border flex-shrink-0">
          {/* News & Sentiment Block */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-3 border-b border-clay-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">
                <Newspaper className="w-3.5 h-3.5 text-clay-accent" />
                News & Sentiment
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {MOCK_NEWS.map(item => (
                <div key={item.id} className="p-3 bg-clay-bg rounded border border-clay-border/60 hover:border-clay-muted/30 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] text-clay-muted uppercase font-bold tracking-[0.1em]">{item.source} <span className="opacity-40 px-1">•</span> {item.time}</span>
                    {item.sentiment === 'positive' ? <SentimentPositive className="w-3 h-3 text-clay-success" /> : 
                     item.sentiment === 'negative' ? <SentimentNegative className="w-3 h-3 text-clay-danger" /> : 
                     <SentimentNeutral className="w-3 h-3 text-clay-muted" />}
                  </div>
                  <h4 className="text-[10px] font-bold leading-relaxed group-hover:text-clay-text transition-colors text-clay-text/80">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Strip (Variant B) */}
          {isHybrid && (
            <div className="h-[45%] border-t border-clay-border flex flex-col min-h-0 bg-clay-bg/30">
              <div className="p-3 border-b border-clay-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">
                  <Activity className="w-3.5 h-3.5" />
                  Radar Strip
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-clay-success animate-pulse" />
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {shortlist.filter(p => p.symbol !== focusPair).map(pair => (
                  <button 
                    key={pair.symbol}
                    onClick={() => onFocusChange(pair.symbol)}
                    className="w-full p-2.5 bg-clay-card rounded border border-clay-border hover:border-clay-accent/40 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[10px] tracking-widest uppercase text-clay-text">{pair.symbol}</span>
                      <ArrowUpRight className="w-3 h-3 text-clay-muted group-hover:text-clay-accent transition-colors" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-clay-muted font-bold">${pair.price.toLocaleString()}</span>
                      <span className={`text-[10px] font-bold ${pair.change24h >= 0 ? 'text-clay-success' : 'text-clay-danger'}`}>
                        {pair.change24h >= 0 ? '+' : ''}{pair.change24h}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
