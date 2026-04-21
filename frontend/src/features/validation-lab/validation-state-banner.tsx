import type { ValidationLabSummary } from '../../types/validation-lab'

type ValidationStateBannerProps = {
  summary: ValidationLabSummary | null
  isLoading: boolean
  error: string | null
}

export function ValidationStateBanner({ summary, isLoading, error }: ValidationStateBannerProps) {
  return (
    <section aria-label="validation-state-banner">
      <h2>Validation Lab</h2>
      {isLoading ? <p>Loading validation lab...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!isLoading && !error && summary ? (
        <>
          <p>Replay ready: {String(summary.replay_ready)}</p>
          <p>Activation review status: {summary.activation_review_status}</p>
          <p>Total runs: {summary.total_runs}</p>
          <p>{summary.operator_message}</p>
        </>
      ) : null}
    </section>
  )
}
