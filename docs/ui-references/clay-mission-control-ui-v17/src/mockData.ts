import { Signal, TradingPair, SystemService, NewsItem } from './types';

export const MOCK_PAIRS: TradingPair[] = [
  { symbol: 'BTC/USDT', price: 68432.50, change24h: 2.4, volume24h: 1200000000, volatility: 0.15, lastScan: '2m ago' },
  { symbol: 'ETH/USDT', price: 3452.12, change24h: -1.2, volume24h: 850000000, volatility: 0.22, lastScan: '5m ago' },
  { symbol: 'SOL/USDT', price: 145.67, change24h: 5.8, volume24h: 450000000, volatility: 0.45, lastScan: '1m ago' },
  { symbol: 'BNB/USDT', price: 582.30, change24h: 0.5, volume24h: 210000000, volatility: 0.12, lastScan: '8m ago' },
];

export const MOCK_SIGNALS: Signal[] = [
  {
    id: '1',
    pair: 'BTC/USDT',
    type: 'long',
    confidence: 0.85,
    entryZone: '$68,100 - $68,300',
    target: '$71,200',
    stopLoss: '$67,450',
    riskLevel: 'moderate',
    expectedMove: '+3.5%',
    timeframe: '4H',
    explanation: 'Strong accumulation at support level with increasing RSI divergence. Volume profile suggests low resistance up to 71k.',
    state: 'active',
    timestamp: '2026-03-31T14:30:00Z',
    rank: 1,
  },
  {
    id: '2',
    pair: 'SOL/USDT',
    type: 'long',
    confidence: 0.72,
    entryZone: '$142 - $144',
    target: '$158',
    stopLoss: '$139',
    riskLevel: 'high',
    expectedMove: '+8.2%',
    timeframe: '1H',
    explanation: 'Breakout from bullish pennant confirmed on high volume. Ecosystem sentiment is peaking.',
    state: 'active',
    timestamp: '2026-03-31T14:45:00Z',
    rank: 2,
  },
  {
    id: '3',
    pair: 'ETH/USDT',
    type: 'short',
    confidence: 0.45,
    entryZone: '$3,480 - $3,500',
    target: '$3,320',
    stopLoss: '$3,545',
    riskLevel: 'low',
    expectedMove: '-2.1%',
    timeframe: '15M',
    explanation: 'Local rejection at psychological resistance. Weakening order book support.',
    state: 'weakening',
    timestamp: '2026-03-31T14:55:00Z',
    rank: 3,
  },
];

export const MOCK_SERVICES: SystemService[] = [
  { name: 'Binance API Connector', status: 'online', latency: '45ms' },
  { name: 'Chief Agent (GPT-4o)', status: 'online', version: 'v5.0.1' },
  { name: 'Risk Engine', status: 'online', latency: '12ms' },
  { name: 'Sentiment Analyzer', status: 'degraded', latency: '850ms' },
  { name: 'Historical Data Node', status: 'online', version: 'v5.0.0' },
];

export const MOCK_NEWS: NewsItem[] = [
  { id: '1', title: 'SEC Approves New ETF Structure', source: 'Reuters', sentiment: 'positive', time: '10m ago' },
  { id: '2', title: 'Major Exchange Outage Reported', source: 'CoinDesk', sentiment: 'negative', time: '25m ago' },
  { id: '3', title: 'Whale Moves 5000 BTC to Cold Storage', source: 'WhaleAlert', sentiment: 'neutral', time: '1h ago' },
];

export const MOCK_AUDIT_LOG: any[] = [
  { id: '1', timestamp: '14:00:01', actor: 'System', module: 'Runtime', type: 'STATE_CHANGE', description: 'System transitioned to BACKGROUND_MONITORING', severity: 'info' },
  { id: '2', timestamp: '14:02:45', actor: 'MarketScanner', module: 'Scanner', type: 'SHORTLIST_UPDATE', description: 'Shortlist refreshed: 12 pairs analyzed', severity: 'info' },
  { id: '3', timestamp: '14:10:12', actor: 'RiskEngine', module: 'Risk', type: 'LATENCY_WARNING', description: 'Sentiment API latency exceeded 500ms', severity: 'warning' },
  { id: '4', timestamp: '14:15:00', actor: 'ChiefAgent', module: 'Orchestrator', type: 'SIGNAL_GEN', description: 'New LONG signal generated for BTC/USDT', severity: 'info' },
];
