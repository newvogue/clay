export type SignalState = 'active' | 'weakening' | 'invalidated' | 'expired';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type ServiceStatus = 'online' | 'degraded' | 'offline';
export type SessionState = 'background' | 'preflight' | 'briefing' | 'active' | 'paused' | 'review' | 'defensive' | 'degraded' | 'invalidated';
export type LayoutMode = 'single' | 'hybrid';
export type ConsensusState = 'agreement' | 'partial' | 'conflict';

export interface TradingPair {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  volatility: number;
  lastScan: string;
  isFocused?: boolean;
  isBackup?: boolean;
}

export interface Signal {
  id: string;
  pair: string;
  type: 'long' | 'short';
  confidence: number;
  entryZone: string;
  target: string;
  stopLoss: string;
  riskLevel: 'low' | 'moderate' | 'high';
  expectedMove: string;
  timeframe: string;
  explanation: string;
  state: SignalState;
  timestamp: string;
  rank: number;
}

export interface SystemService {
  name: string;
  status: ServiceStatus;
  latency?: string;
  version?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  time: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  module: string;
  type: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}
