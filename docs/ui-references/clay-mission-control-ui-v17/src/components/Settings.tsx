import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Layout, 
  Key, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Smartphone, 
  Mail, 
  Zap,
  Trash2,
  Download,
  Upload
} from 'lucide-react';

interface SettingsProps {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

type SettingsTab = 'appearance' | 'api' | 'risk' | 'notifications' | 'data';

export const Settings: React.FC<SettingsProps> = ({ theme, setTheme }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-3 text-clay-text">Theme Preference</label>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <button 
                  onClick={() => setTheme('dark')}
                  className={`border-2 rounded-md p-4 relative overflow-hidden transition-all text-left ${
                    theme === 'dark' ? 'border-clay-accent bg-clay-bg' : 'border-clay-border bg-clay-card/50 hover:border-clay-muted'
                  }`}
                >
                  {theme === 'dark' && <div className="absolute top-2 right-2 w-3 h-3 bg-clay-accent rounded-full" />}
                  <div className="w-full h-20 bg-clay-card rounded-md border border-clay-border mb-3 flex flex-col gap-2 p-2">
                    <div className="w-full h-2 bg-clay-bg rounded-md" />
                    <div className="w-2/3 h-2 bg-clay-bg rounded-md" />
                  </div>
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-clay-text' : 'text-clay-muted'}`}>Dark Mode</span>
                </button>
                <button 
                  onClick={() => setTheme('light')}
                  className={`border-2 rounded-md p-4 relative overflow-hidden transition-all text-left ${
                    theme === 'light' ? 'border-clay-accent bg-clay-card' : 'border-clay-border bg-clay-card/50 hover:border-clay-muted'
                  }`}
                >
                  {theme === 'light' && <div className="absolute top-2 right-2 w-3 h-3 bg-clay-accent rounded-full" />}
                  <div className="w-full h-20 bg-clay-bg rounded-md border border-clay-border mb-3 flex flex-col gap-2 p-2">
                    <div className="w-full h-2 bg-clay-border rounded-md" />
                    <div className="w-2/3 h-2 bg-clay-border rounded-md" />
                  </div>
                  <span className={`text-sm font-bold ${theme === 'light' ? 'text-clay-text' : 'text-clay-muted'}`}>Light Mode</span>
                </button>
              </div>
            </div>

            <hr className="border-clay-border/50" />

            <div>
              <div className="flex items-center gap-3 mb-3">
                <label className="block text-[11px] font-bold text-clay-text uppercase tracking-widest">Layout Density</label>
                <span className="text-[8px] bg-clay-warning/10 text-clay-warning border border-clay-warning/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Unimplemented</span>
              </div>
              <div className="space-y-3 max-w-md">
                <label className="flex items-center justify-between p-3 bg-clay-bg/50 border border-clay-border/60 rounded cursor-not-allowed opacity-60">
                  <div>
                    <div className="font-bold text-xs text-clay-text mb-0.5">Comfortable</div>
                    <div className="text-[10px] text-clay-muted">More spacing, easier to read</div>
                  </div>
                  <input type="radio" name="density" disabled className="accent-clay-accent" />
                </label>
                <label className="flex items-center justify-between p-3 bg-clay-accent/5 border border-clay-accent/40 rounded cursor-not-allowed">
                  <div>
                    <div className="font-bold text-xs text-clay-accent mb-0.5">Compact (Terminal Style)</div>
                    <div className="text-[10px] text-clay-muted">Maximum data density</div>
                  </div>
                  <input type="radio" name="density" defaultChecked disabled className="accent-clay-accent" />
                </label>
              </div>
            </div>

            <hr className="border-clay-border/50" />

            <div className="space-y-4 max-w-md">
              <div className="flex items-center justify-between p-3 bg-clay-bg/20 border border-clay-border/60 rounded cursor-not-allowed opacity-60">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                     <span className="font-bold text-xs text-clay-text">Order Book Micro-Panel</span>
                     <span className="text-[8px] bg-clay-warning/10 text-clay-warning border border-clay-warning/20 px-1 py-0.5 rounded font-bold uppercase tracking-widest">Unimplemented</span>
                  </div>
                  <div className="text-[10px] text-clay-muted">Display compact order book in Trading Workspace</div>
                </div>
                <div className="w-8 h-4 bg-clay-border/60 rounded-full relative">
                  <div className="absolute left-1 top-1 w-2 h-2 bg-clay-muted rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-clay-bg/20 border border-clay-border/60 rounded cursor-not-allowed opacity-60">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                     <span className="font-bold text-xs text-clay-text">Animations</span>
                     <span className="text-[8px] bg-clay-warning/10 text-clay-warning border border-clay-warning/20 px-1 py-0.5 rounded font-bold uppercase tracking-widest">Unimplemented</span>
                  </div>
                  <div className="text-[10px] text-clay-muted">Enable UI transitions and effects</div>
                </div>
                <div className="w-8 h-4 bg-clay-accent/60 rounded-full relative">
                  <div className="absolute right-1 top-1 w-2 h-2 bg-white/80 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'api':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
              {[
                { name: 'Binance API', status: 'connected', lastSync: '2m ago', key: '••••••••••••4x92' },
                { name: 'Bybit API', status: 'connected', lastSync: '5m ago', key: '••••••••••••8k11' },
                { name: 'Coinbase Pro', status: 'disconnected', lastSync: 'Never', key: 'Not Configured' },
              ].map((conn, i) => (
                <div key={i} className="bg-clay-bg/30 border border-clay-border/60 p-3 rounded flex items-center justify-between hover:border-clay-border transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${conn.status === 'connected' ? 'bg-clay-success/10 text-clay-success border border-clay-success/20' : 'bg-clay-muted/10 text-clay-muted border border-clay-border/60'}`}>
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-clay-text">{conn.name}</div>
                      <div className="text-[10px] font-mono text-clay-muted uppercase tracking-[0.1em]">{conn.key}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <div className={`text-[9px] font-bold uppercase tracking-[0.2em] ${conn.status === 'connected' ? 'text-clay-success' : 'text-clay-muted'}`}>
                        {conn.status}
                      </div>
                      <div className="text-[10px] text-clay-muted font-mono mt-0.5">Sync: {conn.lastSync}</div>
                    </div>
                    <button className="p-2 border border-transparent hover:border-clay-border hover:bg-clay-bg/50 rounded text-clay-muted hover:text-clay-text transition-all">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-2.5 bg-clay-bg/30 border border-dashed border-clay-border text-clay-muted text-[10px] uppercase font-bold tracking-widest hover:text-clay-text hover:border-clay-muted/50 rounded transition-all">
              + Add New Connector
            </button>
          </div>
        );
      case 'risk':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[9px] font-bold text-clay-muted uppercase tracking-[0.2em] mb-2">Max Risk Per Trade</label>
                  <div className="flex items-center gap-4">
                    <input type="range" className="flex-1 accent-clay-accent h-1 bg-clay-border/60 rounded appearance-none cursor-pointer" defaultValue={2} />
                    <span className="text-[11px] font-mono font-bold w-12 text-right text-clay-text bg-clay-bg/50 px-2 py-1 rounded border border-clay-border/60">2.0%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-clay-muted uppercase tracking-[0.2em] mb-2">Daily Loss Cap</label>
                  <div className="flex items-center gap-4">
                    <input type="range" className="flex-1 accent-clay-danger h-1 bg-clay-border/60 rounded appearance-none cursor-pointer" defaultValue={5} />
                    <span className="text-[11px] font-mono font-bold w-12 text-right text-clay-text bg-clay-bg/50 px-2 py-1 rounded border border-clay-border/60">5.0%</span>
                  </div>
                </div>
              </div>
              <div className="bg-clay-warning/5 border border-clay-warning/20 p-4 rounded-md">
                <div className="flex items-center gap-2 text-clay-warning mb-2.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Defensive Triggers</span>
                </div>
                <p className="text-[11px] font-medium text-clay-warning/80 leading-relaxed">
                  System will automatically enter Defensive Mode if drawdown exceeds 3% within a 4-hour window or if Chief Agent confidence drops below 40% across all active pairs.
                </p>
              </div>
            </div>
            <div className="pt-5 border-t border-clay-border/50">
              <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] mb-4 text-clay-muted">Exposure Caps</h4>
              <div className="space-y-2">
                {['BTC/USDT', 'ETH/USDT', 'SOL/USDT'].map(pair => (
                  <div key={pair} className="flex items-center justify-between p-3 bg-clay-bg/30 border border-clay-border/60 rounded hover:border-clay-border transition-colors">
                    <span className="text-xs font-bold text-clay-text">{pair}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-clay-muted font-mono uppercase tracking-widest bg-clay-bg/50 px-2 py-0.5 rounded border border-clay-border/40">Max Exposure: 5.0 {pair.split('/')[0]}</span>
                      <button className="text-[9px] font-bold tracking-[0.1em] text-clay-accent uppercase hover:text-clay-text transition-colors">Adjust</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              {[
                { label: 'Signal Alerts', desc: 'Notify when new high-confidence signals are detected', icon: Zap },
                { label: 'Degraded State Alerts', desc: 'Critical alerts when system performance drops', icon: AlertTriangle },
                { label: 'Session Events', desc: 'Summary of session starts, pauses, and completions', icon: Check },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-clay-bg/30 border border-clay-border/60 rounded hover:border-clay-border transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-clay-accent/10 border border-clay-accent/20 text-clay-accent flex items-center justify-center">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-clay-text mb-0.5">{item.label}</div>
                      <div className="text-[10px] font-medium text-clay-muted">{item.desc}</div>
                    </div>
                  </div>
                  <div className="w-8 h-4 bg-clay-accent/60 rounded-full relative cursor-pointer hover:bg-clay-accent transition-colors">
                    <div className="absolute right-1 top-1 w-2 h-2 bg-white/80 rounded-full shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-5 border-t border-clay-border/50">
              <div className="flex items-center gap-3 mb-4">
                 <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted">Delivery Channels</h4>
                 <span className="text-[8px] bg-clay-warning/10 text-clay-warning border border-clay-warning/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Unimplemented</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-clay-bg/30 border border-clay-border/60 rounded flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-clay-muted" />
                    <span className="text-xs font-bold text-clay-text">Mobile Push</span>
                  </div>
                  <span className="text-[9px] font-bold text-clay-success uppercase tracking-[0.2em]">Active</span>
                </div>
                <div className="p-4 bg-clay-bg/30 border border-clay-border/60 rounded flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-clay-muted" />
                    <span className="text-xs font-bold text-clay-text">Email Digest</span>
                  </div>
                  <button className="text-[9px] font-bold text-clay-accent uppercase tracking-[0.2em] hover:text-clay-text transition-colors">Configure</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 bg-clay-bg/30 border border-clay-border/60 rounded hover:border-clay-border transition-colors">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-2">Cache Usage</div>
                <div className="text-xl tracking-tight font-bold text-clay-text">1.24 GB</div>
                <div className="mt-3 h-1 bg-clay-bg/80 rounded-full overflow-hidden">
                  <div className="h-full bg-clay-accent w-[45%]" />
                </div>
              </div>
              <div className="p-4 bg-clay-bg/30 border border-clay-border/60 rounded hover:border-clay-border transition-colors">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-2">Retention Window</div>
                <div className="text-xl tracking-tight font-bold text-clay-text">90 Days</div>
                <div className="text-[10px] font-medium text-clay-muted mt-2">Rolling deletion active</div>
              </div>
              <div className="p-4 bg-clay-bg/30 border border-clay-border/60 rounded hover:border-clay-border transition-colors">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-clay-muted mb-2">Last Backup</div>
                <div className="text-xl tracking-tight font-bold text-clay-text">2h ago</div>
                <div className="text-[10px] font-medium text-clay-success mt-2">Cloud Sync OK</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-clay-bg/20 border border-clay-border/60 rounded hover:bg-clay-bg/40 hover:border-clay-border transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-clay-bg/50 border border-clay-border flex flex-col items-center justify-center text-clay-muted group-hover:text-clay-text transition-colors">
                     <Download className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-clay-text mb-0.5">Export Session Data</div>
                    <div className="text-[10px] font-medium text-clay-muted">Download full history as JSON/CSV</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-clay-muted group-hover:text-clay-text transition-colors" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-clay-bg/20 border border-clay-border/60 rounded hover:bg-clay-bg/40 hover:border-clay-border transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-clay-bg/50 border border-clay-border flex flex-col items-center justify-center text-clay-muted group-hover:text-clay-text transition-colors">
                     <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-clay-text mb-0.5">Import Strategy Config</div>
                    <div className="text-[10px] font-medium text-clay-muted">Restore rules and parameters from file</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-clay-muted group-hover:text-clay-text transition-colors" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-clay-danger/5 border border-clay-danger/20 rounded hover:bg-clay-danger/10 transition-colors group mt-2">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-clay-danger/10 border border-clay-danger/20 flex flex-col items-center justify-center text-clay-danger">
                     <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-clay-danger mb-0.5">Purge Local Cache</div>
                    <div className="text-[10px] font-medium text-clay-danger/60 tracking-wide">Clear all temporary session data</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="border-b border-clay-border/50 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-bold tracking-tight text-clay-text">Settings</h2>
          <span className="text-[9px] bg-clay-accent/10 border border-clay-accent/20 text-clay-accent px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">System Configuration</span>
        </div>
        <p className="text-clay-muted text-[10px] uppercase font-bold tracking-[0.2em] mt-2">Configure CLAY Mission Control preferences and connections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-[11px] font-bold tracking-wide uppercase transition-all ${
              activeTab === 'appearance' ? 'bg-clay-accent/10 text-clay-accent border border-clay-accent/20' : 'text-clay-muted hover:text-clay-text hover:bg-clay-bg/50 border border-transparent'
            }`}
          >
            <Layout className="w-4 h-4" /> Appearance
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-[11px] font-bold tracking-wide uppercase transition-all ${
              activeTab === 'api' ? 'bg-clay-accent/10 text-clay-accent border border-clay-accent/20' : 'text-clay-muted hover:text-clay-text hover:bg-clay-bg/50 border border-transparent'
            }`}
          >
            <Key className="w-4 h-4" /> API Connectors
          </button>
          <button 
            onClick={() => setActiveTab('risk')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-[11px] font-bold tracking-wide uppercase transition-all ${
              activeTab === 'risk' ? 'bg-clay-accent/10 text-clay-accent border border-clay-accent/20' : 'text-clay-muted hover:text-clay-text hover:bg-clay-bg/50 border border-transparent'
            }`}
          >
            <Shield className="w-4 h-4" /> Risk Limits
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-[11px] font-bold tracking-wide uppercase transition-all ${
              activeTab === 'notifications' ? 'bg-clay-accent/10 text-clay-accent border border-clay-accent/20' : 'text-clay-muted hover:text-clay-text hover:bg-clay-bg/50 border border-transparent'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-[11px] font-bold tracking-wide uppercase transition-all ${
              activeTab === 'data' ? 'bg-clay-accent/10 text-clay-accent border border-clay-accent/20' : 'text-clay-muted hover:text-clay-text hover:bg-clay-bg/50 border border-transparent'
            }`}
          >
            <Database className="w-4 h-4" /> Data Management
          </button>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-clay-card rounded border border-clay-border p-6 relative min-h-[500px]">
            <h3 className="text-lg font-bold mb-6 capitalize text-clay-text">{activeTab.replace('-', ' ')}</h3>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
