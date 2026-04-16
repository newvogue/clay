import type { ActiveConfigurationSnapshot } from '../../types/control-center'

type ActiveConfigurationPanelProps = {
  config: ActiveConfigurationSnapshot | null
  isLoading: boolean
  isActing: boolean
  onRestore: (scope: string) => void
}

export function ActiveConfigurationPanel({
  config,
  isLoading,
  isActing,
  onRestore,
}: ActiveConfigurationPanelProps) {
  return (
    <section>
      <h2>Active Configuration</h2>
      {isLoading || !config ? (
        <p>Loading configuration...</p>
      ) : (
        <>
          <p>Config dir: {config.config_dir}</p>
          <ul>
            {config.scopes.map((scope) => (
              <li key={scope.scope}>
                <strong>{scope.scope}</strong>
                <pre>{JSON.stringify(scope.values, null, 2)}</pre>
                {scope.mutable ? (
                  <button
                    disabled={isActing}
                    onClick={() => {
                      onRestore(scope.scope)
                    }}
                    type="button"
                  >
                    Restore {scope.scope}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
