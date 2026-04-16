import type { RuntimeSnapshot } from '../../types/runtime'
import { StatusBadge } from '../../components/status-badge'

type RuntimePanelProps = {
  runtime: RuntimeSnapshot | null
  isLoading: boolean
  isActing: boolean
  error: string | null
  onTransition: (target: RuntimeSnapshot['allowed_transitions'][number]) => void
}

export function RuntimePanel({
  runtime,
  isLoading,
  isActing,
  error,
  onTransition,
}: RuntimePanelProps) {

  return (
    <section aria-label="Runtime foundation">
      <h2>Runtime state</h2>
      {isLoading ? <p>Loading runtime snapshot...</p> : null}
      {error ? <p>Runtime snapshot unavailable: {error}</p> : null}
      {runtime ? (
        <>
          <p>
            Current state: <StatusBadge label={runtime.state} />
          </p>
          <p>Allowed transitions: {runtime.allowed_transitions.join(', ')}</p>
          <div>
            {runtime.allowed_transitions.map((target) => (
              <button
                key={target}
                type="button"
                onClick={() => {
                  onTransition(target)
                }}
                disabled={isActing}
              >
                Switch to {target}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
