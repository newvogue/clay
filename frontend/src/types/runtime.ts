export type RuntimeState =
  | 'background_monitoring'
  | 'pre_session'
  | 'active_session'
  | 'paused'
  | 'review'
  | 'degraded'

export interface RuntimeSnapshot {
  state: RuntimeState
  allowed_transitions: RuntimeState[]
}

export type ServiceAction = 'start' | 'stop' | 'restart'

export type ServiceStatus =
  | 'stopped'
  | 'starting'
  | 'healthy'
  | 'degraded'
  | 'stale'
  | 'error'
  | 'stopping'

export type ServiceCriticality = 'critical' | 'important' | 'optional'

export interface ServiceRecord {
  service_id: string
  service_type: string
  criticality: ServiceCriticality
  startup_policy: string
  status: ServiceStatus
  last_error: string | null
  allowed_actions?: ServiceAction[]
}

export interface PreflightCheck {
  service_id: string
  status: string
}

export interface PreflightResult {
  status: string
  checks: PreflightCheck[]
}
