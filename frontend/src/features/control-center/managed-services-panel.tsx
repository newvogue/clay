import { StatusBadge } from '../../components/status-badge'
import type { ServiceCardSnapshot } from '../../types/control-center'
import type { ServiceAction } from '../../types/runtime'

type ManagedServicesPanelProps = {
  services: ServiceCardSnapshot[]
  isLoading: boolean
  isActing: boolean
  onAction: (serviceId: string, action: ServiceAction) => void
}

export function ManagedServicesPanel({
  services,
  isLoading,
  isActing,
  onAction,
}: ManagedServicesPanelProps) {
  return (
    <section>
      <h2>Managed Services</h2>
      {isLoading ? (
        <p>Loading services...</p>
      ) : (
        <ul>
          {services.map((service) => (
            <li key={service.service_id}>
              <strong>{service.service_name}</strong> ({service.service_kind}){' '}
              <StatusBadge label={service.status} />
              <div>Lifecycle: {service.lifecycle_class}</div>
              <div>Criticality: {service.criticality}</div>
              {service.last_error ? <div>Last error: {service.last_error}</div> : null}
              <div>
                {service.allowed_actions.map((action) => (
                  <button
                    key={`${service.service_id}-${action}`}
                    disabled={isActing}
                    onClick={() => {
                      onAction(service.service_id, action)
                    }}
                    type="button"
                  >
                    {action} {service.service_id}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
