import { StatusBadge } from '../../components/status-badge'
import type { ServiceAction, ServiceRecord } from '../../types/runtime'

type ServicesTableProps = {
  services: ServiceRecord[]
  isLoading: boolean
  isActing: boolean
  error: string | null
  onAction: (serviceId: string, action: ServiceAction) => void
}

export function ServicesTable({
  services,
  isLoading,
  isActing,
  error,
  onAction,
}: ServicesTableProps) {

  return (
    <section aria-label="Services">
      <h2>Services</h2>
      {isLoading ? <p>Loading services...</p> : null}
      {error ? <p>Services unavailable: {error}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.service_id}>
              <td>{service.service_id}</td>
              <td>{service.service_type}</td>
              <td>
                <StatusBadge label={service.status} />
              </td>
              <td>
                {service.allowed_actions?.length ? (
                  service.allowed_actions.map((action) => (
                    <button
                      key={`${service.service_id}-${action}`}
                      type="button"
                      onClick={() => {
                        onAction(service.service_id, action)
                      }}
                      disabled={isActing}
                    >
                      {action} {service.service_id}
                    </button>
                  ))
                ) : (
                  'read-only'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
