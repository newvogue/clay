import { StatusBadge } from '../../components/status-badge'
import type { PreflightResult } from '../../types/runtime'

type AlertsPanelProps = {
  preflight: PreflightResult | null
  isLoading: boolean
  error: string | null
}

export function AlertsPanel({ preflight, isLoading, error }: AlertsPanelProps) {

  return (
    <section aria-label="Alerts">
      <h2>Alerts</h2>
      {isLoading ? <p>Loading alerts...</p> : null}
      {error ? <p>Alerts unavailable: {error}</p> : null}
      {preflight ? (
        <>
          <p>
            Preflight status: <StatusBadge label={preflight.status} />
          </p>
          <p>
            {preflight.status === 'pass' ? 'No active alerts.' : 'Preflight requires attention.'}
          </p>
        </>
      ) : null}
    </section>
  )
}
