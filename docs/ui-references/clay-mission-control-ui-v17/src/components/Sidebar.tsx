import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings2, 
  MessageSquare, 
  History, 
  BookOpen, 
  Settings,
  ShieldCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Zap,
  FlaskConical,
  Radio,
  FileSearch
} from 'lucide-react';
import { motion } from 'motion/react';
import { SessionState } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  sessionState: SessionState;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'trading', label: 'Trading Workspace', icon: BarChart3 },
  { id: 'session-control', label: 'Session Control', icon: Zap },
  { id: 'control', label: 'Control Center', icon: Radio },
  { id: 'ai', label: 'AI Console', icon: MessageSquare },
  { id: 'lab', label: 'Validation Lab', icon: FlaskConical },
  { id: 'review', label: 'Session Review', icon: FileSearch },
  { id: 'research', label: 'Knowledge / Research', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, sessionState }) => {
  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      className="h-screen bg-clay-card border-r border-clay-border flex flex-col flex-shrink-0 z-20 relative overflow-hidden"
    >
      <div className={`flex items-center h-14 ${isCollapsed ? 'justify-center border-b border-transparent' : 'gap-3 px-5 border-b border-clay-border'}`}>
        <div className="w-7 h-7 bg-clay-accent/10 border border-clay-accent/20 rounded flex items-center justify-center flex-shrink-0">
          <Activity className="text-clay-accent w-4 h-4" />
        </div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="font-bold text-sm tracking-tight whitespace-nowrap text-clay-text leading-tight">CLAY</span>
            <span className="text-[9px] uppercase tracking-widest text-clay-muted font-bold leading-tight">Terminal v17</span>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-clay-accent/10 border border-clay-accent/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-clay-accent' 
                  : 'text-clay-muted hover:text-clay-text hover:bg-clay-bg border border-transparent'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute left-0 w-[3px] h-4 bg-clay-accent rounded-r-full"
                />
              )}
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-clay-accent' : 'group-hover:text-clay-text'} transition-colors`} />
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-bold whitespace-nowrap tracking-tight transition-colors"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-clay-border bg-clay-bg/50">
        <div className="space-y-0.5 mb-3">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded transition-all ${
              activeTab === 'settings' ? 'bg-clay-accent/10 border border-clay-accent/20 text-clay-accent' : 'text-clay-muted hover:text-clay-text hover:bg-clay-card border border-transparent'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings className="w-4 h-4 flex-shrink-0 transition-colors" />
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-bold whitespace-nowrap tracking-tight"
              >
                Settings
              </motion.span>
            )}
          </button>

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded text-clay-muted hover:text-clay-text hover:bg-clay-card border border-transparent transition-all ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-bold whitespace-nowrap tracking-tight"
              >
                Collapse
              </motion.span>
            )}
          </button>
        </div>
        
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-clay-card rounded border border-clay-border/60 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-clay-border/50">
              <span className="text-[9px] uppercase tracking-widest text-clay-muted font-bold">Mission Status</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${
                  sessionState === 'active' ? 'text-clay-success' : 
                  (sessionState === 'background' || sessionState === 'preflight') ? 'text-clay-muted' : 
                  'text-clay-warning'
                }`}>
                  {sessionState === 'defensive' ? 'Defensive' : 
                   sessionState === 'paused' ? 'Paused' : 
                   sessionState === 'degraded' ? 'Degraded' : 
                   sessionState === 'active' ? 'Active' : 
                   'Standby'}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  sessionState === 'active' ? 'bg-clay-success animate-pulse' : 
                  (sessionState === 'background' || sessionState === 'preflight') ? 'bg-clay-muted' : 
                  'bg-clay-warning animate-pulse'
                }`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-2">
              <div className="flex justify-between items-center bg-clay-bg/50 px-1.5 py-1 rounded border border-clay-border/30">
                <span className="text-[8px] uppercase text-clay-muted font-bold tracking-wider">API</span>
                <span className="text-[9px] text-clay-success font-mono font-bold">OK</span>
              </div>
              <div className="flex justify-between items-center bg-clay-bg/50 px-1.5 py-1 rounded border border-clay-border/30">
                <span className="text-[8px] uppercase text-clay-muted font-bold tracking-wider">MDL</span>
                <span className="text-[9px] text-clay-text font-mono font-bold">3/3</span>
              </div>
              <div className="flex justify-between items-center bg-clay-bg/50 px-1.5 py-1 rounded border border-clay-border/30">
                <span className="text-[8px] uppercase text-clay-muted font-bold tracking-wider">RSK</span>
                <span className="text-[9px] text-clay-warning font-mono font-bold">MOD</span>
              </div>
              <div className="flex justify-between items-center bg-clay-bg/50 px-1.5 py-1 rounded border border-clay-border/30">
                <span className="text-[8px] uppercase text-clay-muted font-bold tracking-wider">LAT</span>
                <span className="text-[9px] text-clay-success font-mono font-bold">42ms</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};
