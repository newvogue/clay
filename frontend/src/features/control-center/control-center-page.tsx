import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Database,
  FileClock,
  HardDrive,
  Network,
  Radio,
  RefreshCcw,
  Settings2,
  Shield,
  Terminal,
  Workflow,
  XCircle,
} from 'lucide-react'

import { StatusBadge } from '../../components/status-badge'
import type {
  ActiveConfigurationSnapshot,
  AuditEventSnapshot,
  ConfigScopeSnapshot,
  ConnectorStatusSnapshot,
  ControlCenterSnapshot,
  IncidentSnapshot,
  IngestionHealthSnapshot,
  MarketFreshnessItem,
  RuntimeStatusSnapshot,
  ServiceCardSnapshot,
} from '../../types/control-center'
import type { RuntimeState, ServiceAction } from '../../types/runtime'
import { useControlCenter } from './use-control-center'

type ControlCenterTab = 'health' | 'audit' | 'config'

function formatTime(value: string | null | undefined): string {
  if (!value) {
    return '--:--:--'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleTimeString('en-GB', { hour12: false })
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return 'not recorded'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'short',
  })
}

function formatJson(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2)
}

function getRuntimeLabel(state: RuntimeState | undefined): string {
  if (!state) {
    return 'loading'
  }
  return state.replaceAll('_', ' ')
}

function getServiceIcon(service: ServiceCardSnapshot): LucideIcon {
  const token = `${service.service_kind} ${service.service_name}`.toLowerCase()
  if (token.includes('api')) {
    return Network
  }
  if (token.includes('storage') || token.includes('db') || token.includes('database')) {
    return Database
  }
  if (token.includes('risk')) {
    return Shield
  }
  return Cpu
}

function getStatusIcon(status: string): LucideIcon {
  const normalized = status.toLowerCase()
  if (normalized === 'healthy' || normalized === 'fresh' || normalized === 'pass') {
    return CheckCircle2
  }
  if (normalized === 'error' || normalized === 'stale' || normalized === 'blocked' || normalized === 'fail') {
    return XCircle
  }
  return AlertCircle
}

function getStatusTone(status: string): 'success' | 'warning' | 'danger' | 'muted' {
  const normalized = status.toLowerCase()
  if (normalized === 'healthy' || normalized === 'fresh' || normalized === 'pass') {
    return 'success'
  }
  if (normalized === 'error' || normalized === 'stale' || normalized === 'blocked' || normalized === 'fail') {
    return 'danger'
  }
  if (normalized === 'degraded' || normalized === 'warn' || normalized === 'warning') {
    return 'warning'
  }
  return 'muted'
}

export function ControlCenterPage() {
  const [activeTab, setActiveTab] = useState<ControlCenterTab>('health')
  const controlCenter = useControlCenter()
  const snapshot = controlCenter.snapshot

  const serviceSummary = useMemo(() => {
    const services = snapshot?.services ?? []
    const healthy = services.filter((service) => service.status === 'healthy').length
    const critical = services.filter((service) => service.criticality === 'critical').length
    return { critical, healthy, total: services.length }
  }, [snapshot?.services])

  return (
    <div aria-label="control-center-page" className="screen-page control-center-page" data-screen="control-center">
      <header className="screen-page-header control-center-header">
        <div>
          <h2>Control Center</h2>
          <p>System health, runtime status, managed services, and audit visibility</p>
        </div>
        <div className="control-center-command-row">
          <StatusBadge label={snapshot?.summary.overall_status ?? (controlCenter.isLoading ? 'loading' : 'unknown')} />
          <StatusBadge label={snapshot?.summary.actionability ?? 'limited'} />
          <button
            disabled={controlCenter.isActing}
            onClick={() => {
              void controlCenter.runIngestionCycle()
            }}
            type="button"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Run ingestion
          </button>
        </div>
      </header>

      <nav aria-label="Control center views" className="control-center-tabs">
        <TabButton activeTab={activeTab} id="health" label="System Health" onSelect={setActiveTab} />
        <TabButton activeTab={activeTab} id="audit" label="Audit Trail" onSelect={setActiveTab} />
        <TabButton activeTab={activeTab} id="config" label="Active Configuration" onSelect={setActiveTab} />
      </nav>

      {controlCenter.error ? (
        <section className="control-center-error-panel">
          <AlertCircle className="h-4 w-4 text-clay-danger" />
          <span>Control center error: {controlCenter.error}</span>
        </section>
      ) : null}

      {activeTab === 'health' ? (
        <HealthView
          isActing={controlCenter.isActing}
          isLoading={controlCenter.isLoading}
          onServiceAction={(serviceId, action) => {
            void controlCenter.runServiceAction(serviceId, action)
          }}
          onTransition={(target) => {
            void controlCenter.transitionRuntime(target)
          }}
          serviceSummary={serviceSummary}
          snapshot={snapshot}
        />
      ) : activeTab === 'audit' ? (
        <AuditView
          audit={snapshot?.audit ?? []}
          incidents={snapshot?.incidents ?? []}
          isLoading={controlCenter.isLoading}
        />
      ) : (
        <ConfigView
          config={snapshot?.config ?? null}
          isActing={controlCenter.isActing}
          isLoading={controlCenter.isLoading}
          onRestore={(scope) => {
            void controlCenter.restoreConfig(scope)
          }}
        />
      )}
    </div>
  )
}

type TabButtonProps = {
  activeTab: ControlCenterTab
  id: ControlCenterTab
  label: string
  onSelect: (tab: ControlCenterTab) => void
}

function TabButton({ activeTab, id, label, onSelect }: TabButtonProps) {
  return (
    <button
      aria-pressed={activeTab === id}
      className={activeTab === id ? 'is-active' : ''}
      onClick={() => {
        onSelect(id)
      }}
      type="button"
    >
      {label}
    </button>
  )
}

type HealthViewProps = {
  snapshot: ControlCenterSnapshot | null
  serviceSummary: {
    critical: number
    healthy: number
    total: number
  }
  isLoading: boolean
  isActing: boolean
  onTransition: (target: RuntimeState) => void
  onServiceAction: (serviceId: string, action: ServiceAction) => void
}

function HealthView({
  snapshot,
  serviceSummary,
  isLoading,
  isActing,
  onTransition,
  onServiceAction,
}: HealthViewProps) {
  return (
    <>
      <ResourceStrip
        ingestion={snapshot?.ingestion ?? null}
        isLoading={isLoading}
        serviceSummary={serviceSummary}
        summary={snapshot?.summary ?? null}
      />

      <div className="control-center-health-grid">
        <RuntimePanel
          isActing={isActing}
          isLoading={isLoading}
          onTransition={onTransition}
          runtime={snapshot?.runtime ?? null}
        />
        <SystemHealthPanel ingestion={snapshot?.ingestion ?? null} isLoading={isLoading} />
      </div>

      <ManagedServicesPanel
        isActing={isActing}
        isLoading={isLoading}
        onAction={onServiceAction}
        services={snapshot?.services ?? []}
      />

      <RuntimeConsole
        audit={snapshot?.audit ?? []}
        incidents={snapshot?.incidents ?? []}
        isLoading={isLoading}
      />
    </>
  )
}

type ResourceStripProps = {
  summary: ControlCenterSnapshot['summary'] | null
  ingestion: IngestionHealthSnapshot | null
  serviceSummary: {
    critical: number
    healthy: number
    total: number
  }
  isLoading: boolean
}

function ResourceStrip({ summary, ingestion, serviceSummary, isLoading }: ResourceStripProps) {
  const marketFreshCount = ingestion?.market_items.filter((item) => item.status === 'fresh').length ?? 0
  const marketTotal = ingestion?.market_items.length ?? 0
  const connectorHealthyCount = ingestion?.connectors.filter((connector) => connector.status === 'healthy').length ?? 0
  const connectorTotal = ingestion?.connectors.length ?? 0
  const servicePct = serviceSummary.total === 0 ? 0 : Math.round((serviceSummary.healthy / serviceSummary.total) * 100)
  const freshnessPct = marketTotal === 0 ? 0 : Math.round((marketFreshCount / marketTotal) * 100)
  const connectorPct = connectorTotal === 0 ? 0 : Math.round((connectorHealthyCount / connectorTotal) * 100)

  return (
    <div aria-label="control center resource strip" className="control-resource-grid">
      <ResourceMetric
        icon={Cpu}
        label="Services"
        progress={servicePct}
        tone={servicePct >= 80 ? 'success' : servicePct >= 50 ? 'warning' : 'danger'}
        value={isLoading ? '...' : `${serviceSummary.healthy}/${serviceSummary.total}`}
      />
      <ResourceMetric
        icon={Database}
        label="Market Freshness"
        progress={freshnessPct}
        tone={ingestion?.blocks_active_trading ? 'danger' : freshnessPct >= 80 ? 'success' : 'warning'}
        value={isLoading ? '...' : `${marketFreshCount}/${marketTotal}`}
      />
      <ResourceMetric
        icon={Network}
        label="Connectors"
        progress={connectorPct}
        tone={connectorPct >= 80 ? 'success' : connectorPct >= 50 ? 'warning' : 'danger'}
        value={isLoading ? '...' : `${connectorHealthyCount}/${connectorTotal}`}
      />
      <ResourceMetric
        icon={Activity}
        label="Active Incidents"
        progress={summary ? Math.min(summary.active_incident_count * 25, 100) : 0}
        tone={summary?.critical_incident_count ? 'danger' : summary?.active_incident_count ? 'warning' : 'success'}
        value={isLoading ? '...' : `${summary?.active_incident_count ?? 0}`}
      />
    </div>
  )
}

type ResourceMetricProps = {
  icon: LucideIcon
  label: string
  value: string
  progress: number
  tone: 'success' | 'warning' | 'danger'
}

function ResourceMetric({ icon: Icon, label, value, progress, tone }: ResourceMetricProps) {
  return (
    <div className="control-resource-card">
      <div className={`control-resource-icon is-${tone}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="control-resource-body">
        <div>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
        <div className="control-resource-track">
          <span className={`is-${tone}`} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

type RuntimePanelProps = {
  runtime: RuntimeStatusSnapshot | null
  isLoading: boolean
  isActing: boolean
  onTransition: (target: RuntimeState) => void
}

function RuntimePanel({ runtime, isLoading, isActing, onTransition }: RuntimePanelProps) {
  return (
    <section className="control-runtime-panel">
      <PanelTitle
        icon={Radio}
        kicker="Control Plane"
        subtitle={runtime?.blocking_reason ?? 'Runtime can only move through explicit operator transitions.'}
        title="Runtime Status"
      />

      {isLoading || !runtime ? (
        <div className="control-empty-line">Loading runtime...</div>
      ) : (
        <>
          <div className="control-runtime-state-card">
            <div>
              <span>Current state</span>
              <strong>{getRuntimeLabel(runtime.state)}</strong>
            </div>
            <StatusBadge label={runtime.preflight_status} />
          </div>

          <div className="control-transition-grid">
            {runtime.allowed_transitions.length === 0 ? (
              <div className="control-empty-line">No transitions currently allowed.</div>
            ) : (
              runtime.allowed_transitions.map((target) => (
                <button
                  disabled={isActing}
                  key={target}
                  onClick={() => {
                    onTransition(target)
                  }}
                  type="button"
                >
                  <Workflow className="h-3.5 w-3.5" />
                  Switch to {target.replaceAll('_', ' ')}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </section>
  )
}

type SystemHealthPanelProps = {
  ingestion: IngestionHealthSnapshot | null
  isLoading: boolean
}

function SystemHealthPanel({ ingestion, isLoading }: SystemHealthPanelProps) {
  return (
    <section className="control-system-panel">
      <PanelTitle
        icon={Shield}
        kicker="Ingestion Guard"
        subtitle="Freshness, connector posture, and active-session blocking state."
        title="System Health"
      />

      {isLoading || !ingestion ? (
        <div className="control-empty-line">Loading ingestion health...</div>
      ) : (
        <>
          <div className="control-health-summary">
            <StatusLine label="Market" value={ingestion.market_status} />
            <StatusLine label="Context" value={ingestion.context_status} />
            <StatusLine label="Trading Block" value={ingestion.blocks_active_trading ? 'blocked' : 'clear'} />
          </div>

          <div className="control-two-column-list">
            <div>
              <h3>Market Freshness</h3>
              <div className="control-list-stack">
                {ingestion.market_items.length === 0 ? (
                  <div className="control-empty-line">No market freshness rows.</div>
                ) : (
                  ingestion.market_items.map((item) => <MarketFreshnessRow item={item} key={`${item.symbol}-${item.timeframe}`} />)
                )}
              </div>
            </div>
            <div>
              <h3>Connectors</h3>
              <div className="control-list-stack">
                {ingestion.connectors.length === 0 ? (
                  <div className="control-empty-line">No connector observations.</div>
                ) : (
                  ingestion.connectors.map((connector) => <ConnectorRow connector={connector} key={connector.connector_id} />)
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

type StatusLineProps = {
  label: string
  value: string
}

function StatusLine({ label, value }: StatusLineProps) {
  return (
    <div className="control-status-line">
      <span>{label}</span>
      <StatusBadge label={value} />
    </div>
  )
}

type MarketFreshnessRowProps = {
  item: MarketFreshnessItem
}

function MarketFreshnessRow({ item }: MarketFreshnessRowProps) {
  return (
    <div className="control-data-row">
      <div>
        <strong>{item.symbol}</strong>
        <span>{item.timeframe} / {formatTime(item.latest_bar_open_time)}</span>
      </div>
      <StatusBadge label={item.status} />
    </div>
  )
}

type ConnectorRowProps = {
  connector: ConnectorStatusSnapshot
}

function ConnectorRow({ connector }: ConnectorRowProps) {
  return (
    <div className="control-data-row">
      <div>
        <strong>{connector.connector_id}</strong>
        <span>{connector.connector_type} / {formatTime(connector.observed_at)}</span>
      </div>
      <StatusBadge label={connector.status} />
    </div>
  )
}

type ManagedServicesPanelProps = {
  services: ServiceCardSnapshot[]
  isLoading: boolean
  isActing: boolean
  onAction: (serviceId: string, action: ServiceAction) => void
}

function ManagedServicesPanel({ services, isLoading, isActing, onAction }: ManagedServicesPanelProps) {
  return (
    <section className="control-services-panel">
      <PanelTitle
        icon={HardDrive}
        kicker={`${services.length} registered`}
        subtitle="Lifecycle actions remain operator-reviewed and never run silently."
        title="Managed Services"
      />

      {isLoading ? (
        <div className="control-empty-line">Loading services...</div>
      ) : (
        <div className="control-service-grid">
          {services.length === 0 ? (
            <div className="control-empty-line">No managed services registered.</div>
          ) : (
            services.map((service) => (
              <ServiceCard
                isActing={isActing}
                key={service.service_id}
                onAction={onAction}
                service={service}
              />
            ))
          )}
        </div>
      )}
    </section>
  )
}

type ServiceCardProps = {
  service: ServiceCardSnapshot
  isActing: boolean
  onAction: (serviceId: string, action: ServiceAction) => void
}

function ServiceCard({ service, isActing, onAction }: ServiceCardProps) {
  const Icon = getServiceIcon(service)
  const StatusIcon = getStatusIcon(service.status)
  const tone = getStatusTone(service.status)

  return (
    <article className={`control-service-card is-${tone}`}>
      <div className="control-service-card-header">
        <div className={`control-service-icon is-${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3>{service.service_name}</h3>
          <span>{service.service_kind} / {service.lifecycle_class}</span>
        </div>
        <StatusIcon className={`control-service-status-icon is-${tone}`} />
      </div>

      <div className="control-service-meta">
        <StatusLine label="Status" value={service.status} />
        <StatusLine label="Criticality" value={service.criticality} />
        {service.freshness_status ? <StatusLine label="Freshness" value={service.freshness_status} /> : null}
      </div>

      {service.last_error ? (
        <p className="control-service-error">Last error: {service.last_error}</p>
      ) : (
        <p className="control-service-heartbeat">Heartbeat: {formatDateTime(service.last_heartbeat_at)}</p>
      )}

      <div className="control-service-actions">
        {service.allowed_actions.length === 0 ? (
          <span>No operator actions</span>
        ) : (
          service.allowed_actions.map((action) => (
            <button
              disabled={isActing}
              key={`${service.service_id}-${action}`}
              onClick={() => {
                onAction(service.service_id, action)
              }}
              type="button"
            >
              {action}
            </button>
          ))
        )}
      </div>
    </article>
  )
}

type RuntimeConsoleProps = {
  audit: AuditEventSnapshot[]
  incidents: IncidentSnapshot[]
  isLoading: boolean
}

function RuntimeConsole({ audit, incidents, isLoading }: RuntimeConsoleProps) {
  const consoleLines = [
    ...incidents.slice(0, 2).map((incident) => ({
      at: incident.recorded_at,
      level: incident.severity.toUpperCase(),
      message: `${incident.source_name}: ${incident.message}`,
    })),
    ...audit.slice(0, 5).map((event) => ({
      at: event.timestamp,
      level: 'AUDIT',
      message: event.event_type,
    })),
  ]

  return (
    <section className="control-console-panel">
      <div className="control-console-title">
        <div>
          <Terminal className="h-3.5 w-3.5 text-clay-accent" />
          <h2>Runtime Console</h2>
        </div>
        <span>Streaming</span>
      </div>
      <div className="control-console-body">
        {isLoading ? (
          <p>Loading console events...</p>
        ) : consoleLines.length === 0 ? (
          <p>No runtime events yet.</p>
        ) : (
          consoleLines.map((line) => (
            <p key={`${line.level}-${line.at}-${line.message}`}>
              <span>[{formatTime(line.at)}]</span>
              <strong>{line.level}</strong>
              {line.message}
            </p>
          ))
        )}
      </div>
    </section>
  )
}

type AuditViewProps = {
  incidents: IncidentSnapshot[]
  audit: AuditEventSnapshot[]
  isLoading: boolean
}

function AuditView({ incidents, audit, isLoading }: AuditViewProps) {
  return (
    <div className="control-audit-grid">
      <section className="control-audit-panel">
        <PanelTitle
          icon={AlertCircle}
          kicker={`${incidents.length} open`}
          subtitle="Incident state is visible here before it becomes a session-review artifact."
          title="Alerts and Audit"
        />

        {isLoading ? (
          <div className="control-empty-line">Loading incidents...</div>
        ) : incidents.length === 0 ? (
          <div className="control-empty-line">No active incidents.</div>
        ) : (
          <div className="control-list-stack">
            {incidents.map((incident) => (
              <IncidentCard incident={incident} key={`${incident.source_name}-${incident.recorded_at}`} />
            ))}
          </div>
        )}
      </section>

      <section className="control-audit-panel">
        <PanelTitle
          icon={FileClock}
          kicker={`${audit.length} events`}
          subtitle="Recent operator and control-plane events."
          title="Audit Trail"
        />

        {isLoading ? (
          <div className="control-empty-line">Loading audit trail...</div>
        ) : audit.length === 0 ? (
          <div className="control-empty-line">No audit events yet.</div>
        ) : (
          <div className="control-audit-list">
            {audit.map((event) => (
              <AuditEventCard event={event} key={`${event.event_type}-${event.timestamp}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

type IncidentCardProps = {
  incident: IncidentSnapshot
}

function IncidentCard({ incident }: IncidentCardProps) {
  return (
    <article className={`control-incident-card is-${getStatusTone(incident.severity)}`}>
      <div>
        <StatusBadge label={incident.severity} />
        {incident.lifecycle_status ? <StatusBadge label={incident.lifecycle_status} /> : null}
      </div>
      <strong>{incident.source_name}</strong>
      <p>{incident.message}</p>
      <span>{formatDateTime(incident.recorded_at)}</span>
    </article>
  )
}

type AuditEventCardProps = {
  event: AuditEventSnapshot
}

function AuditEventCard({ event }: AuditEventCardProps) {
  return (
    <article className="control-audit-event">
      <div>
        <span>{formatDateTime(event.timestamp)}</span>
        <strong>{event.event_type}</strong>
      </div>
      <pre>{formatJson(event.payload)}</pre>
    </article>
  )
}

type ConfigViewProps = {
  config: ActiveConfigurationSnapshot | null
  isLoading: boolean
  isActing: boolean
  onRestore: (scope: string) => void
}

function ConfigView({ config, isLoading, isActing, onRestore }: ConfigViewProps) {
  return (
    <section className="control-config-panel">
      <PanelTitle
        icon={Settings2}
        kicker={config?.config_dir ?? 'config directory'}
        subtitle="Active config scopes stay visible before any rollback or reload operation."
        title="Active Configuration"
      />

      {isLoading || !config ? (
        <div className="control-empty-line">Loading configuration...</div>
      ) : (
        <div className="control-config-grid">
          {config.scopes.map((scope) => (
            <ConfigScopeCard
              isActing={isActing}
              key={scope.scope}
              onRestore={onRestore}
              scope={scope}
            />
          ))}
        </div>
      )}
    </section>
  )
}

type ConfigScopeCardProps = {
  scope: ConfigScopeSnapshot
  isActing: boolean
  onRestore: (scope: string) => void
}

function ConfigScopeCard({ scope, isActing, onRestore }: ConfigScopeCardProps) {
  return (
    <article className="control-config-card">
      <div className="control-config-card-header">
        <div>
          <h3>{scope.scope}</h3>
          <span>{scope.mutable ? 'mutable scope' : 'locked scope'}</span>
        </div>
        <StatusBadge label={scope.mutable ? 'mutable' : 'locked'} />
      </div>
      <pre>{formatJson(scope.values)}</pre>
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
    </article>
  )
}

type PanelTitleProps = {
  icon: LucideIcon
  title: string
  kicker: string
  subtitle: string
}

function PanelTitle({ icon: Icon, title, kicker, subtitle }: PanelTitleProps) {
  return (
    <div className="control-panel-title">
      <div>
        <span>{kicker}</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <Icon className="h-4 w-4 text-clay-accent" />
    </div>
  )
}
