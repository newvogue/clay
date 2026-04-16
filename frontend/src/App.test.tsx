import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import App from './App'

describe('App', () => {
  let runtimeState = 'background_monitoring'
  let runtimeTransitions = ['pre_session', 'degraded']
  let pairScannerStatus = 'stopped'
  let pairScannerActions = ['start', 'restart']

  beforeEach(() => {
    runtimeState = 'background_monitoring'
    runtimeTransitions = ['pre_session', 'degraded']
    pairScannerStatus = 'stopped'
    pairScannerActions = ['start', 'restart']

    vi.stubGlobal(
      'fetch',
      vi.fn((input: string | URL | Request, init?: RequestInit) => {
        const url = String(input)
        const method = init?.method ?? 'GET'

        if (url.endsWith('/runtime/state') && method === 'GET') {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                state: runtimeState,
                allowed_transitions: runtimeTransitions,
              }),
              { status: 200 },
            ),
          )
        }

        if (url.endsWith('/services') && method === 'GET') {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                items: [
                  {
                    service_id: 'control-api',
                    service_type: 'api',
                    criticality: 'critical',
                    startup_policy: 'always-on',
                    status: 'healthy',
                    last_error: null,
                    allowed_actions: [],
                  },
                  {
                    service_id: 'pair-scanner',
                    service_type: 'worker',
                    criticality: 'optional',
                    startup_policy: 'on-demand',
                    status: pairScannerStatus,
                    last_error: null,
                    allowed_actions: pairScannerActions,
                  },
                ],
              }),
              { status: 200 },
            ),
          )
        }

        if (url.endsWith('/preflight') && method === 'GET') {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                status: 'pass',
                checks: [{ service_id: 'control-api', status: 'ok' }],
              }),
              { status: 200 },
            ),
          )
        }

        if (url.endsWith('/runtime/transition') && method === 'POST') {
          runtimeState = 'pre_session'
          runtimeTransitions = ['active_session', 'degraded']
          return Promise.resolve(
            new Response(
              JSON.stringify({
                state: runtimeState,
                allowed_transitions: runtimeTransitions,
              }),
              { status: 200 },
            ),
          )
        }

        if (url.endsWith('/services/pair-scanner/actions') && method === 'POST') {
          pairScannerStatus = 'healthy'
          pairScannerActions = ['stop', 'restart']
          return Promise.resolve(
            new Response(
              JSON.stringify({
                service_id: 'pair-scanner',
                status: pairScannerStatus,
              }),
              { status: 200 },
            ),
          )
        }

        return Promise.resolve(new Response('Not found', { status: 404 }))
      }),
    )

    class EventSourceMock {
      addEventListener() {}

      close() {}
    }

    vi.stubGlobal('EventSource', EventSourceMock)
    Object.defineProperty(window, 'EventSource', {
      value: EventSourceMock,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the runtime foundation shell with live control data', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Clay' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /runtime state/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /services/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /alerts/i })).toBeInTheDocument()
    expect(await screen.findByText(/background_monitoring/i)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /switch to pre_session/i })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /^start pair-scanner$/i })).toBeInTheDocument()
    expect(await screen.findByText(/preflight status/i)).toBeInTheDocument()
  })

  it('sends control actions and refreshes runtime and services', async () => {
    render(<App />)

    fireEvent.click(await screen.findByRole('button', { name: /switch to pre_session/i }))
    expect(await screen.findByText(/pre_session/i)).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: /^start pair-scanner$/i }))
    expect(await screen.findByText(/^healthy$/i)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /^stop pair-scanner$/i })).toBeInTheDocument()
  })
})
