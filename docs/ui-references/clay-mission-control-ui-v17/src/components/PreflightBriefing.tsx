import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Zap, 
  ArrowRight,
  BrainCircuit,
  Target,
  AlertTriangle,
  MousePointer2,
  Star
} from 'lucide-react';
import { MOCK_SIGNALS, MOCK_PAIRS } from '../mockData';
import { TradingPair } from '../types';

interface PreflightBriefingProps {
  onComplete: (focusPair: string, backupPairs: string[]) => void;
}

export const PreflightBriefing: React.FC<PreflightBriefingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'preflight' | 'briefing' | 'focus'>('preflight');
  const [checks, setChecks] = useState({
    dataFreshness: 'pending',
    apiStatus: 'pending',
    modelsLoaded: 'pending',
    riskLimits: 'pending'
  });

  const [selectedFocus, setSelectedFocus] = useState<string>(MOCK_PAIRS[0].symbol);
  const [selectedBackups, setSelectedBackups] = useState<string[]>([MOCK_PAIRS[1].symbol, MOCK_PAIRS[2].symbol]);

  useEffect(() => {
    const runChecks = async () => {
      const keys = Object.keys(checks) as Array<keyof typeof checks>;
      for (const key of keys) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setChecks(prev => ({ ...prev, [key]: 'success' }));
      }
    };
    runChecks();
  }, []);

  const allChecksPassed = Object.values(checks).every(c => c === 'success');

  const toggleBackup = (symbol: string) => {
    if (symbol === selectedFocus) return;
    setSelectedBackups(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol].slice(0, 2)
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-clay-bg/95 backdrop-blur-xl flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {step === 'preflight' ? (
          <motion.div 
            key="preflight"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-lg bg-clay-card border border-clay-border rounded-md p-8 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-clay-accent/10 rounded-md flex items-center justify-center text-clay-accent border border-clay-accent/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-clay-text">Hard Preflight Check</h2>
                <p className="text-clay-muted text-[10px] font-mono uppercase tracking-widest">System Readiness Protocol v5.0</p>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              {Object.entries(checks).map(([key, status]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-clay-bg/20 rounded-md border border-clay-border">
                  <span className="text-sm font-medium capitalize text-clay-text">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {status === 'pending' ? (
                    <Loader2 className="w-4 h-4 text-clay-accent animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-clay-success" />
                  )}
                </div>
              ))}
            </div>

            <button
              disabled={!allChecksPassed}
              onClick={() => setStep('briefing')}
              className="w-full py-4 bg-clay-accent hover:bg-clay-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-clay-accent/20"
            >
              PROCEED TO BRIEFING
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : step === 'briefing' ? (
          <motion.div 
            key="briefing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-4xl bg-clay-card border border-clay-border rounded-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-clay-border bg-clay-bg/20">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-clay-accent/10 rounded-md flex items-center justify-center text-clay-accent">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-clay-text">Pre-Session Briefing</h2>
              </div>
              <p className="text-clay-muted text-sm">Chief Agent analysis of current market regime and session strategy.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-clay-muted mb-4">Shortlist Candidates</h3>
                  <div className="space-y-3">
                    {MOCK_SIGNALS.map(s => (
                      <div key={s.id} className="p-4 bg-clay-bg/20 rounded-md border border-clay-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-clay-text">{s.pair}</span>
                          <span className="text-[10px] bg-clay-accent/10 text-clay-accent px-1.5 py-0.5 rounded-md font-bold uppercase">{s.timeframe}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-clay-muted">Conf: {(s.confidence * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="p-5 bg-clay-warning/5 border border-clay-warning/20 rounded-md">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-clay-warning mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Risk Alerts
                  </h3>
                  <p className="text-xs text-clay-warning/80 leading-relaxed">
                    Social sentiment for ETH is currently degraded due to high API latency. Momentum models show slight divergence on BTC 4H.
                  </p>
                </section>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-clay-muted mb-4">AI Strategy Summary</h3>
                  <div className="p-6 bg-clay-bg/20 rounded-md border border-clay-border space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-clay-accent flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-sm text-clay-text">Scalp Momentum v5</span>
                    </div>
                    <p className="text-sm text-clay-muted leading-relaxed">
                      "Market is currently in a low-volatility consolidation phase. I recommend focusing on 15m breakouts with high volume confirmation. Defensive mode triggers are set at 1.5% drawdown."
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-clay-muted mb-4">Session Parameters</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-clay-bg/20 rounded-md border border-clay-border">
                      <div className="text-[10px] text-clay-muted uppercase font-bold mb-1">Risk Profile</div>
                      <div className="text-sm font-bold text-clay-warning">Moderate</div>
                    </div>
                    <div className="p-4 bg-clay-bg/20 rounded-md border border-clay-border">
                      <div className="text-[10px] text-clay-muted uppercase font-bold mb-1">Account Mode</div>
                      <div className="text-sm font-bold text-clay-accent">Demo / Test</div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-8 bg-clay-card border-t border-clay-border flex gap-4">
              <button 
                onClick={() => setStep('preflight')}
                className="px-6 py-3 bg-clay-bg/20 border border-clay-border text-clay-muted hover:text-clay-text rounded-md font-bold transition-all"
              >
                BACK
              </button>
              <button 
                onClick={() => setStep('focus')}
                className="flex-1 py-3 bg-clay-accent hover:bg-clay-accent/90 text-white rounded-md font-bold transition-all shadow-lg shadow-clay-accent/20"
              >
                SELECT SESSION FOCUS
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="focus"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-clay-card border border-clay-border rounded-md p-8 shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-clay-accent/10 rounded-md flex items-center justify-center text-clay-accent border border-clay-accent/20">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-clay-text">Session Focus Selection</h2>
                <p className="text-clay-muted text-sm">Define your primary target and backup candidates for this session.</p>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-clay-muted mb-3 flex items-center gap-2">
                  <MousePointer2 className="w-3.5 h-3.5" /> Primary Focus Pair
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {MOCK_PAIRS.slice(0, 6).map(pair => (
                    <button
                      key={pair.symbol}
                      onClick={() => {
                        setSelectedFocus(pair.symbol);
                        setSelectedBackups(prev => prev.filter(s => s !== pair.symbol));
                      }}
                      className={`p-3 rounded-md border transition-all text-sm font-bold ${
                        selectedFocus === pair.symbol 
                          ? 'bg-clay-accent border-clay-accent text-white shadow-lg shadow-clay-accent/20' 
                          : 'bg-clay-bg/20 border-clay-border text-clay-muted hover:border-clay-muted/50'
                      }`}
                    >
                      {pair.symbol}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-clay-muted mb-3 flex items-center gap-2">
                  <Star className="w-3.5 h-3.5" /> Backup Candidates (Max 2)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {MOCK_PAIRS.slice(0, 6).map(pair => (
                    <button
                      key={pair.symbol}
                      disabled={selectedFocus === pair.symbol}
                      onClick={() => toggleBackup(pair.symbol)}
                      className={`p-3 rounded-md border transition-all text-sm font-bold ${
                        selectedBackups.includes(pair.symbol)
                          ? 'bg-clay-card border-clay-accent text-clay-accent' 
                          : 'bg-clay-bg/20 border-clay-border text-clay-muted hover:border-clay-muted/50 disabled:opacity-30 disabled:cursor-not-allowed'
                      }`}
                    >
                      {pair.symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep('briefing')}
                className="px-6 py-3 bg-clay-bg/20 border border-clay-border text-clay-muted hover:text-clay-text rounded-md font-bold transition-all"
              >
                BACK
              </button>
              <button 
                onClick={() => onComplete(selectedFocus, selectedBackups)}
                className="flex-1 py-3 bg-clay-success hover:bg-clay-success/90 text-white rounded-md font-bold transition-all shadow-lg shadow-clay-success/20"
              >
                START ACTIVE SESSION
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
