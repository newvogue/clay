import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { SignalList } from './components/SignalList';
import { TradingWorkspace } from './components/TradingWorkspace';
import { ControlCenter } from './components/ControlCenter';
import { Overview } from './components/Overview';
import { AIConsole } from './components/AIConsole';
import { SessionReview } from './components/SessionReview';
import { KnowledgeResearch } from './components/KnowledgeResearch';
import { Settings } from './components/Settings';
import { PreflightBriefing } from './components/PreflightBriefing';
import { ValidationLab } from './components/ValidationLab';
import { SessionControl } from './components/SessionControl';
import { MOCK_SIGNALS, MOCK_PAIRS } from './mockData';
import { SessionState, LayoutMode, TradingPair, ConsensusState } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sessionState, setSessionState] = useState<SessionState>('background');
  const [consensusState, setConsensusState] = useState<ConsensusState>('agreement');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('single');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [focusPair, setFocusPair] = useState<string>('BTC/USDT');
  const [shortlist, setShortlist] = useState<TradingPair[]>(MOCK_PAIRS.slice(0, 3).map(p => ({ ...p, isFocused: p.symbol === 'BTC/USDT' })));
  const [selectedSignalId, setSelectedSignalId] = useState(MOCK_SIGNALS[0].id);
  const [showToast, setShowToast] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('clay-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // Apply theme to document
  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('clay-theme', theme);
  }, [theme]);

  // Auto-dismiss toast
  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Sync selectedSignalId with focusPair to ensure single source of truth
  React.useEffect(() => {
    const signal = MOCK_SIGNALS.find(s => s.pair === focusPair);
    setSelectedSignalId(signal ? signal.id : '');
  }, [focusPair]);

  const handleSignalSelect = (id: string) => {
    setSelectedSignalId(id);
    const signal = MOCK_SIGNALS.find(s => s.id === id);
    if (signal) {
      setFocusPair(signal.pair);
      // Also update shortlist if needed
      setShortlist(prev => {
        const exists = prev.find(p => p.symbol === signal.pair);
        if (exists) {
          return prev.map(p => ({ ...p, isFocused: p.symbol === signal.pair }));
        }
        // If not in shortlist, we might want to add it or just focus it
        return prev.map(p => ({ ...p, isFocused: p.symbol === signal.pair }));
      });
    }
  };

  const handlePreflightComplete = (focus: string, backups: string[]) => {
    setFocusPair(focus);
    const updatedShortlist = MOCK_PAIRS.filter(p => p.symbol === focus || backups.includes(p.symbol))
      .map(p => ({
        ...p,
        isFocused: p.symbol === focus,
        isBackup: backups.includes(p.symbol)
      }));
    setShortlist(updatedShortlist);
    setSessionState('active');
    setActiveTab('trading'); // Auto transition to Trading Workspace
  };

  const renderContent = () => {
    const selectedSignal = MOCK_SIGNALS.find(s => s.id === selectedSignalId);
    switch (activeTab) {
      case 'overview':
        return <Overview onNavigate={setActiveTab} sessionState={sessionState} />;
      case 'trading':
        return (
          <div className="flex-1 flex overflow-hidden">
            <SignalList 
              signals={MOCK_SIGNALS} 
              selectedId={selectedSignalId} 
              onSelect={handleSignalSelect}
              onFocusChange={(symbol) => {
                setFocusPair(symbol);
                setShortlist(prev => prev.map(p => ({ ...p, isFocused: p.symbol === symbol })));
              }}
              shortlist={shortlist}
            />
            <TradingWorkspace 
              selectedSignal={selectedSignal}
              layoutMode={layoutMode}
              sessionState={sessionState}
              focusPair={focusPair}
              shortlist={shortlist}
              onFocusChange={(symbol) => {
                setFocusPair(symbol);
                setShortlist(prev => prev.map(p => ({ ...p, isFocused: p.symbol === symbol })));
              }}
            />
          </div>
        );
      case 'control':
        return <ControlCenter sessionState={sessionState} />;
      case 'session-control':
        return (
          <SessionControl 
            sessionState={sessionState} 
            onStateChange={setSessionState}
            focusPair={focusPair}
            onFocusChange={setFocusPair}
            shortlist={shortlist}
          />
        );
      case 'lab':
        return <ValidationLab />;
      case 'ai':
        return <AIConsole />;
      case 'review':
        return <SessionReview />;
      case 'research':
        return <KnowledgeResearch />;
      case 'settings':
        return <Settings theme={theme} setTheme={setTheme} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-clay-muted">
            <div className="w-16 h-16 bg-clay-card rounded-md border border-clay-border flex items-center justify-center">
              <span className="text-2xl">🚧</span>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-clay-text">Screen Under Development</h3>
              <p className="text-sm">The {activeTab} module is currently being calibrated.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-clay-bg text-clay-text overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        sessionState={sessionState}
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <TopBar 
          sessionState={sessionState} 
          onStateChange={setSessionState}
          consensusState={consensusState}
          onConsensusChange={setConsensusState}
          layoutMode={layoutMode}
          onLayoutChange={setLayoutMode}
        />
        
        <div className="flex-1 flex overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 flex overflow-hidden w-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Preflight & Briefing Overlay */}
        <AnimatePresence>
          {(sessionState === 'preflight' || sessionState === 'briefing') && (
            <PreflightBriefing onComplete={handlePreflightComplete} />
          )}
        </AnimatePresence>

        {/* Global Notification Overlay */}
        <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end gap-4">
          {/* Demo State Controller */}
          <div className="group relative">
            <div className="bg-clay-card border border-clay-border p-1 rounded-md shadow-2xl flex items-center gap-1 transition-all duration-300 w-10 group-hover:w-auto overflow-hidden group-hover:px-2 group-hover:py-1.5 group-hover:rounded-md">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-clay-muted group-hover:hidden">
                <Settings2 className="w-4 h-4" />
              </div>
              <div className="hidden group-hover:flex items-center gap-2 whitespace-nowrap">
                <span className="text-[9px] font-bold uppercase text-clay-muted px-2 border-r border-clay-border mr-1">Demo / Debug</span>
                {(['background', 'active', 'degraded', 'defensive', 'paused', 'invalidated'] as SessionState[]).map(state => (
                  <button
                    key={state}
                    onClick={() => setSessionState(state)}
                    className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-colors ${
                      sessionState === state ? 'bg-clay-accent text-white' : 'bg-clay-bg/40 text-clay-muted hover:text-clay-text'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showToast && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-clay-card border border-clay-border p-4 rounded-lg shadow-2xl flex items-center gap-4 max-w-sm"
              >
                <div className="w-10 h-10 bg-clay-success/10 rounded-md flex items-center justify-center text-clay-success">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-clay-text">New Signal Detected</h4>
                  <p className="text-[11px] text-clay-muted">SOL/USDT momentum breakout confirmed by Chief Agent.</p>
                </div>
                <button 
                  onClick={() => setShowToast(false)}
                  className="text-clay-muted hover:text-clay-text"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

import { Settings2 } from 'lucide-react';
