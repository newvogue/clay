import { StatusBadge } from '../../components/status-badge'
import type { AuditEventSnapshot, IncidentSnapshot } from '../../types/control-center'

type AlertsAuditPanelProps = {
  incidents: IncidentSnapshot[]
  audit: AuditEventSnapshot[]
  isLoading: boolean
}

export function AlertsAuditPanel({
  incidents,
  audit,
  isLoading,
}: AlertsAuditPanelProps) {
  return (
    <section>
      <h2>Alerts and Audit</h2>
      {isLoading ? (
        <p>Loading incidents and audit...</p>
      ) : (
        <>
          <h3>Incidents</h3>
          <ul>
            {incidents.length === 0 ? (
              <li>No active incidents.</li>
            ) : (
              incidents.map((incident) => (
                <li key={`${incident.source_name}-${incident.recorded_at}`}>
                  <StatusBadge label={incident.severity} /> {incident.source_name}: {incident.message}
                </li>
              ))
            )}
          </ul>
          <h3>Audit Trail</h3>
          <ul>
            {audit.length === 0 ? (
              <li>No audit events yet.</li>
            ) : (
              audit.map((event) => (
                <li key={`${event.event_type}-${event.timestamp}`}>
                  {event.event_type} at {event.timestamp}
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </section>
  )
}
