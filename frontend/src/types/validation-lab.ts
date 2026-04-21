export type ValidationLabSummary = {
  replay_ready: boolean
  activation_review_status: string
  total_runs: number
  staged_review_count: number
  operator_message: string
}

export type ValidationRunSnapshot = {
  run_id: number
  run_type: string
  label: string
  strategy_mode: string
  model_version: string
  period_start: string
  period_end: string
  trades_simulated: number
  win_rate: number
  net_pnl_pct: number
  max_drawdown_pct: number
  decision_quality_score: number
  summary: string
  created_at: string
}

export type ActivationReviewSnapshot = {
  review_id: string
  target_type: string
  target_id: string
  current_value: string
  proposed_value: string
  status: string
  severity: 'info' | 'warning' | 'critical'
  summary: string
  evidence: Record<string, unknown>
  created_at: string
  applied_at: string | null
}

export type ValidationLabSnapshot = {
  summary: ValidationLabSummary
  runs: ValidationRunSnapshot[]
  activation_reviews: ActivationReviewSnapshot[]
}
