import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import App from './App'

describe('App', () => {
  let snapshot: Record<string, any>

  beforeEach(() => {
    snapshot = {
      summary: {
        runtime_state: 'background_monitoring',
        overall_status: 'degraded',
        actionability: 'limited',
        active_incident_count: 1,
        critical_incident_count: 0,
        last_status_refresh_at: '2026-04-16T12:00:00Z',
        blocking_reason: null,
      },
      runtime: {
        state: 'background_monitoring',
        allowed_transitions: ['pre_session', 'degraded'],
        preflight_status: 'pass',
        blocking_reason: null,
      },
      services: [
        {
          service_id: 'control-api',
          service_name: 'Control Api',
          service_kind: 'api',
          lifecycle_class: 'always-on',
          criticality: 'critical',
          status: 'healthy',
          last_heartbeat_at: null,
          last_error: null,
          freshness_status: null,
          allowed_actions: [],
        },
        {
          service_id: 'pair-scanner',
          service_name: 'Pair Scanner',
          service_kind: 'worker',
          lifecycle_class: 'on-demand',
          criticality: 'optional',
          status: 'stopped',
          last_heartbeat_at: null,
          last_error: null,
          freshness_status: null,
          allowed_actions: ['start', 'restart'],
        },
      ],
      ingestion: {
        market_status: 'fresh',
        context_status: 'degraded',
        blocks_active_trading: false,
        market_items: [
          {
            symbol: 'BTCUSDT',
            timeframe: '15m',
            status: 'fresh',
            evaluated_at: '2026-04-16T12:00:00Z',
            latest_bar_open_time: '2026-04-16T11:45:00Z',
            reason: 'delta=0:10:00',
          },
        ],
        connectors: [
          {
            connector_id: 'demo-news',
            connector_type: 'news',
            status: 'degraded',
            observed_at: '2026-04-16T12:00:00Z',
          },
        ],
      },
      incidents: [
        {
          source_name: 'demo_news_feed',
          severity: 'warning',
          message: 'connector recovered after retry',
          recorded_at: '2026-04-16T12:00:00Z',
        },
      ],
      audit: [
        {
          timestamp: '2026-04-16T12:00:00Z',
          event_type: 'runtime.transitioned',
          payload: { target: 'background_monitoring' },
        },
      ],
      config: {
        config_dir: '/tmp/clay-config',
        scopes: [
          {
            scope: 'runtime',
            mutable: true,
            values: {
              work_window_start: '09:00',
              work_window_end: '22:00',
              default_state: 'background_monitoring',
            },
          },
        ],
      },
    }

    vi.stubGlobal(
      'fetch',
      vi.fn((input: string | URL | Request, init?: RequestInit) => {
        const url = String(input)
        const method = init?.method ?? 'GET'

        if (url.endsWith('/control-center/overview') && method === 'GET') {
          return Promise.resolve(
            new Response(JSON.stringify(snapshot), { status: 200 }),
          )
        }

        if (url.endsWith('/runtime/transition') && method === 'POST') {
          snapshot.runtime.state = 'pre_session'
          snapshot.runtime.allowed_transitions = ['active_session', 'degraded']
          snapshot.summary.runtime_state = 'pre_session'
          return Promise.resolve(
            new Response(JSON.stringify(snapshot.runtime), { status: 200 }),
          )
        }

        if (url.endsWith('/services/pair-scanner/actions') && method === 'POST') {
          snapshot.services[1].status = 'healthy'
          snapshot.services[1].allowed_actions = ['stop', 'restart']
          return Promise.resolve(
            new Response(
              JSON.stringify({
                service_id: 'pair-scanner',
                status: 'healthy',
              }),
              { status: 200 },
            ),
          )
        }

        if (url.endsWith('/ingestion/run') && method === 'POST') {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                started_at: '2026-04-16T12:00:00Z',
                finished_at: '2026-04-16T12:01:00Z',
                market_records_written: 4,
                news_records_written: 1,
                sentiment_records_written: 1,
                freshness_updates_written: 2,
                connector_statuses: [],
                incidents: [],
              }),
              { status: 200 },
            ),
          )
        }

        if (url.endsWith('/configs/runtime/restore') && method === 'POST') {
          snapshot.config.scopes[0].values.default_state = 'background_monitoring'
          return Promise.resolve(
            new Response(
              JSON.stringify({
                scope: 'runtime',
                config: snapshot.config.scopes[0].values,
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

    vi.stubGlobal('confirm', vi.fn(() => true))
    vi.stubGlobal('EventSource', EventSourceMock)
    Object.defineProperty(globalThis, 'EventSource', {
      value: EventSourceMock,
      writable: true,
      configurable: true,
    })
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
    expect(await screen.findByRole('heading', { name: /control center/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /system health/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /managed services/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /alerts and audit/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /active configuration/i })).toBeInTheDocument()
    expect((await screen.findAllByText(/^background_monitoring$/i)).length).toBeGreaterThan(0)
    expect(await screen.findByRole('button', { name: /switch to pre_session/i })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /^start pair-scanner$/i })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /run ingestion cycle/i })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /restore runtime/i })).toBeInTheDocument()
  })

  it('sends control actions and refreshes runtime and services', async () => {
    render(<App />)

    fireEvent.click(await screen.findByRole('button', { name: /switch to pre_session/i }))
    expect(await screen.findByRole('button', { name: /switch to active_session/i })).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: /^start pair-scanner$/i }))
    expect(await screen.findByRole('button', { name: /^stop pair-scanner$/i })).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: /run ingestion cycle/i }))
    expect(await screen.findByText(/market status/i)).toBeInTheDocument()
  })
})
