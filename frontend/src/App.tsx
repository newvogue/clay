import { useControlPlane } from './hooks/use-control-plane'
import { AlertsPanel } from './features/alerts/alerts-panel'
import { RuntimePanel } from './features/runtime/runtime-panel'
import { ServicesTable } from './features/services/services-table'

export function App() {
  const controlPlane = useControlPlane()

  return (
    <main>
      <h1>Clay</h1>
      <p>Your own trading workspace. Signals, review, and control.</p>
      <RuntimePanel
        runtime={controlPlane.runtime}
        isLoading={controlPlane.isLoading}
        isActing={controlPlane.isActing}
        error={controlPlane.error}
        onTransition={(target) => {
          void controlPlane.transitionRuntime(target)
        }}
      />
      <ServicesTable
        services={controlPlane.services}
        isLoading={controlPlane.isLoading}
        isActing={controlPlane.isActing}
        error={controlPlane.error}
        onAction={(serviceId, action) => {
          void controlPlane.runServiceAction(serviceId, action)
        }}
      />
      <AlertsPanel
        preflight={controlPlane.preflight}
        isLoading={controlPlane.isLoading}
        error={controlPlane.error}
      />
    </main>
  )
}

export default App
