import { Clock, Shield, Zap, AlertTriangle, RefreshCw, Play, Square, Pause, Layout, LayoutGrid, Monitor, Cpu, Activity, Info, Terminal } from 'lucide-react';
import { SessionState, LayoutMode, ConsensusState } from '../types';

interface TopBarProps {
  sessionState: SessionState;
  onStateChange: (state: SessionState) => void;
  consensusState: ConsensusState;
  onConsensusChange: (state: ConsensusState) => void;
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  sessionState, 
  onStateChange, 
  consensusState,
  onConsensusChange,
  layoutMode, 
  onLayoutChange 
}) => {
  const isActive = sessionState === 'active' || sessionState === 'defensive' || sessionState === 'paused' || sessionState === 'degraded' || sessionState === 'invalidated';
  const isDefensive = sessionState === 'defensive';
  const isPaused = sessionState === 'paused';
  const isDegraded = sessionState === 'degraded';

  return (
    <header className="h-14 border-b border-clay-border bg-clay-card flex items-center justify-between px-5 z-10 flex-shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-[0.2em] text-clay-muted font-bold mb-1">Session Mode</span>
            <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest transition-colors border ${
              isDefensive ? 'bg-clay-danger border-clay-danger text-white hover:bg-clay-danger/90 cursor-pointer' :
              isPaused ? 'bg-clay-warning border-clay-warning text-black hover:bg-clay-warning/90 cursor-pointer' :
              isDegraded ? 'bg-clay-warning/20 border-clay-warning/40 text-clay-warning hover:bg-clay-warning/30 cursor-pointer' :
              isActive ? 'bg-clay-success/10 text-clay-success border-clay-success/20 hover:bg-clay-success/20 cursor-pointer' : 
              'bg-clay-bg border-clay-border text-clay-muted hover:text-clay-text cursor-pointer'
            }`} onClick={() => onStateChange(sessionState === 'active' ? 'paused' : 'active')}>
              {isDefensive ? 'Defensive' : isPaused ? 'Paused' : isDegraded ? 'Degraded' : isActive ? 'Active' : 'Standby'}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-[0.2em] text-clay-muted font-bold mb-1">Consensus</span>
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onConsensusChange(consensusState === 'agreement' ? 'partial' : consensusState === 'partial' ? 'conflict' : 'agreement')}>
              <div className="flex gap-[2px]">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-sm ${
                    consensusState === 'agreement' ? 'bg-clay-success group-hover:opacity-80' : 
                    consensusState === 'partial' && i < 3 ? 'bg-clay-warning group-hover:opacity-80' : 
                    consensusState === 'conflict' && i === 1 ? 'bg-clay-danger group-hover:opacity-80' : 
                    'bg-clay-border'
                  }`} />
                ))}
              </div>
              <span className="text-[9px] font-mono text-clay-text uppercase font-bold group-hover:text-clay-accent transition-colors">{consensusState}</span>
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-clay-border/60" />

        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-clay-bg border border-clay-border rounded flex items-center justify-center text-clay-accent">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-[0.2em] text-clay-muted font-bold mb-0.5">Active Strategy</span>
            <div className="text-[10px] font-bold text-clay-text uppercase tracking-widest leading-tight">Scalp Momentum v5.04</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* View Mode Icons */}
        <div className="hidden lg:flex items-center gap-1">
          <button className="p-1.5 text-clay-muted hover:text-clay-accent hover:bg-clay-bg rounded transition-colors" title="System Logs">
             <Terminal className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-clay-muted hover:text-clay-accent hover:bg-clay-bg rounded transition-colors" title="Model Metrics">
             <Cpu className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-clay-muted hover:text-clay-accent hover:bg-clay-bg rounded transition-colors" title="Visual Settings">
             <Info className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden lg:block h-6 w-px bg-clay-border/60" />

        {/* Layout Toggle */}
        <div className="flex items-center gap-1 bg-clay-bg p-0.5 rounded border border-clay-border/60">
          <button 
            onClick={() => onLayoutChange('single')}
            className={`p-1.5 rounded transition-all ${layoutMode === 'single' ? 'bg-clay-card text-clay-accent border border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-clay-muted hover:text-clay-text border border-transparent'}`}
            title="Single Focus"
          >
            <Layout className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => onLayoutChange('hybrid')}
            className={`p-1.5 rounded transition-all ${layoutMode === 'hybrid' ? 'bg-clay-card text-clay-accent border border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-clay-muted hover:text-clay-text border border-transparent'}`}
            title="Hybrid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => onStateChange(sessionState === 'background' ? 'preflight' : 'background')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm ${
            sessionState === 'background' 
              ? 'bg-clay-accent text-white hover:bg-clay-accent/80 border border-transparent' 
              : 'bg-clay-bg border border-clay-danger/30 text-clay-danger hover:bg-clay-danger/10'
          }`}
        >
          {sessionState === 'background' ? <Play className="w-3 h-3 fill-current" /> : <Square className="w-3 h-3 fill-current" />}
          {sessionState === 'background' ? 'Start Session' : 'End Session'}
        </button>

        <div className="flex items-center gap-4 bg-clay-bg px-3 py-1.5 rounded border border-clay-border/60">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-clay-muted" />
            <span className="text-[10px] font-mono text-clay-muted font-bold">14:02:05 <span className="opacity-40">UTC</span></span>
          </div>
          <div className="w-px h-3 bg-clay-border/60" />
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-3 h-3 text-clay-accent ${isActive ? 'animate-spin-slow' : ''}`} />
            <span className="text-[10px] font-mono text-clay-muted font-bold">00:42</span>
          </div>
        </div>
      </div>
    </header>
  );
};
