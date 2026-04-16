import type {
  PreflightResult,
  RuntimeSnapshot,
  ServiceAction,
  ServiceRecord,
  RuntimeState,
} from '../types/runtime'

const API_BASE_URL =
  import.meta.env.VITE_CLAY_API_BASE_URL?.trim() || 'http://127.0.0.1:8000'

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`)
  }
  return (await response.json()) as T
}

async function postJson<T>(path: string, body: object): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`)
  }

  return (await response.json()) as T
}

export function getRuntimeSnapshot(): Promise<RuntimeSnapshot> {
  return getJson<RuntimeSnapshot>('/runtime/state')
}

export function getServices(): Promise<{ items: ServiceRecord[] }> {
  return getJson<{ items: ServiceRecord[] }>('/services')
}

export function getPreflight(): Promise<PreflightResult> {
  return getJson<PreflightResult>('/preflight')
}

export function transitionRuntime(target: RuntimeState): Promise<RuntimeSnapshot> {
  return postJson<RuntimeSnapshot>('/runtime/transition', { target })
}

export function runServiceAction(
  serviceId: string,
  action: ServiceAction,
): Promise<{ service_id: string; status: string }> {
  return postJson<{ service_id: string; status: string }>(`/services/${serviceId}/actions`, {
    action,
  })
}

export function getEventStreamUrl(): string {
  return `${API_BASE_URL}/events/stream`
}
