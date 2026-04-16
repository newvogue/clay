import { StatusBadge } from '../../components/status-badge'
import type { GlobalHealthSummary } from '../../types/control-center'

type ControlCenterStateBannerProps = {
  summary: GlobalHealthSummary | null
  isLoading: boolean
  error: string | null
}

export function ControlCenterStateBanner({
  summary,
  isLoading,
  error,
}: ControlCenterStateBannerProps) {
  if (isLoading) {
    return <section aria-label="control center state">Loading control center...</section>
  }

  if (error) {
    return <section aria-label="control center state">Control center error: {error}</section>
  }

  if (!summary) {
    return <section aria-label="control center state">No control center snapshot available.</section>
  }

  return (
    <section aria-label="control center state">
      <h2>Control Center</h2>
      <p>Runtime: <StatusBadge label={summary.runtime_state} /></p>
      <p>Overall status: <StatusBadge label={summary.overall_status} /></p>
      <p>Actionability: <StatusBadge label={summary.actionability} /></p>
      <p>Active incidents: {summary.active_incident_count}</p>
      <p>Critical incidents: {summary.critical_incident_count}</p>
      {summary.blocking_reason ? <p>Blocking reason: {summary.blocking_reason}</p> : null}
    </section>
  )
}
