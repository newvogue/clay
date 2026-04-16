import { ActiveConfigurationPanel } from './features/control-center/active-configuration-panel'
import { AlertsAuditPanel } from './features/control-center/alerts-audit-panel'
import { ControlCenterStateBanner } from './features/control-center/state-banner'
import { ManagedServicesPanel } from './features/control-center/managed-services-panel'
import { RuntimeStatusPanel } from './features/control-center/runtime-status-panel'
import { SystemHealthPanel } from './features/control-center/system-health-panel'
import { useControlCenter } from './features/control-center/use-control-center'

export function App() {
  const controlCenter = useControlCenter()
  const snapshot = controlCenter.snapshot

  return (
    <main>
      <h1>Clay</h1>
      <p>Operator-facing control center for runtime, ingestion, incidents, and safe system actions.</p>
      <ControlCenterStateBanner
        summary={snapshot?.summary ?? null}
        isLoading={controlCenter.isLoading}
        error={controlCenter.error}
      />
      <SystemHealthPanel
        ingestion={snapshot?.ingestion ?? null}
        isLoading={controlCenter.isLoading}
        isActing={controlCenter.isActing}
        onRunIngestion={() => {
          void controlCenter.runIngestionCycle()
        }}
      />
      <RuntimeStatusPanel
        runtime={snapshot?.runtime ?? null}
        isLoading={controlCenter.isLoading}
        isActing={controlCenter.isActing}
        onTransition={(target) => {
          void controlCenter.transitionRuntime(target)
        }}
      />
      <ManagedServicesPanel
        services={snapshot?.services ?? []}
        isLoading={controlCenter.isLoading}
        isActing={controlCenter.isActing}
        onAction={(serviceId, action) => {
          void controlCenter.runServiceAction(serviceId, action)
        }}
      />
      <AlertsAuditPanel
        incidents={snapshot?.incidents ?? []}
        audit={snapshot?.audit ?? []}
        isLoading={controlCenter.isLoading}
      />
      <ActiveConfigurationPanel
        config={snapshot?.config ?? null}
        isLoading={controlCenter.isLoading}
        isActing={controlCenter.isActing}
        onRestore={(scope) => {
          void controlCenter.restoreConfig(scope)
        }}
      />
    </main>
  )
}

export default App
