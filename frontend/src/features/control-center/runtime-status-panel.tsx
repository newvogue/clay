import { StatusBadge } from '../../components/status-badge'
import type { RuntimeStatusSnapshot } from '../../types/control-center'
import type { RuntimeState } from '../../types/runtime'

type RuntimeStatusPanelProps = {
  runtime: RuntimeStatusSnapshot | null
  isLoading: boolean
  isActing: boolean
  onTransition: (target: RuntimeState) => void
}

export function RuntimeStatusPanel({
  runtime,
  isLoading,
  isActing,
  onTransition,
}: RuntimeStatusPanelProps) {
  return (
    <section>
      <h2>Runtime Status</h2>
      {isLoading || !runtime ? (
        <p>Loading runtime...</p>
      ) : (
        <>
          <p>Current state: <StatusBadge label={runtime.state} /></p>
          <p>Preflight status: <StatusBadge label={runtime.preflight_status} /></p>
          {runtime.blocking_reason ? <p>Blocking reason: {runtime.blocking_reason}</p> : null}
          <div>
            {runtime.allowed_transitions.map((target) => (
              <button
                key={target}
                disabled={isActing}
                onClick={() => {
                  onTransition(target)
                }}
                type="button"
              >
                Switch to {target}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
