import type { ValidationRunSnapshot } from '../../types/validation-lab'

type ValidationRunsPanelProps = {
  runs: ValidationRunSnapshot[]
  isLoading: boolean
}

export function ValidationRunsPanel({ runs, isLoading }: ValidationRunsPanelProps) {
  return (
    <section aria-label="validation-runs-panel">
      <h3>Replay Runs</h3>
      {isLoading ? <p>Loading validation runs...</p> : null}
      {!isLoading && runs.length === 0 ? <p>No validation runs yet.</p> : null}
      {!isLoading
        ? runs.map((run) => (
            <article key={run.run_id}>
              <h4>{run.label}</h4>
              <p>Type: {run.run_type}</p>
              <p>Strategy: {run.strategy_mode}</p>
              <p>Model: {run.model_version}</p>
              <p>Trades: {run.trades_simulated}</p>
              <p>Win rate: {run.win_rate}</p>
              <p>Net PnL: {run.net_pnl_pct}%</p>
              <p>Max drawdown: {run.max_drawdown_pct}%</p>
              <p>{run.summary}</p>
            </article>
          ))
        : null}
    </section>
  )
}
