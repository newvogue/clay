import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'

import { getAlphaOverview } from '../../api/alpha-client'
import { getDemoTradingOverview, ingestDemoResult, logCurrentDemoTrade } from '../../api/demo-trading-client'
import { recheckReliability } from '../../api/reliability-client'
import { startSession } from '../../api/session-client'
import { captureSessionFeedback, getSessionReviewOverview } from '../../api/session-review-client'
import { runValidation } from '../../api/validation-lab-client'
import type { AlphaOperatorStepSnapshot, AlphaReadinessSnapshot } from '../../types/alpha'

type AlphaOperatorState = {
  snapshot: AlphaReadinessSnapshot | null
  isLoading: boolean
  isActing: boolean
  error: string | null
  lastActionMessage: string | null
}

export type AlphaOperatorController = AlphaOperatorState & {
  nextStep: AlphaOperatorStepSnapshot | null
  canRunNextStep: boolean
  refresh: () => Promise<void>
  runNextStep: () => Promise<void>
}

const runnableStepIds = new Set([
  'start_or_resume_session',
  'log_demo_decision',
  'resolve_demo_result',
  'review_feedback',
  'run_validation_replay',
  'recheck_reliability',
])

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Unexpected alpha operator error'
}

function findNextStep(snapshot: AlphaReadinessSnapshot | null): AlphaOperatorStepSnapshot | null {
  return snapshot?.operator_steps.find((step) => step.is_next) ?? null
}

function canRunStep(step: AlphaOperatorStepSnapshot | null): boolean {
  return Boolean(step && runnableStepIds.has(step.step_id))
}

async function resolveAwaitingDemoResult(): Promise<void> {
  const demoSnapshot = await getDemoTradingOverview()
  const targetRecord =
    demoSnapshot.records.find((record) => record.awaiting_result)
    ?? demoSnapshot.records.find((record) => record.outcome_status === 'unresolved')

  if (!targetRecord) {
    throw new Error('No awaiting demo result is available for alpha resolution.')
  }

  await ingestDemoResult(targetRecord.record_id, 1.4, {
    entryPrice: 100,
    exitPrice: 101.4,
    externalTradeId: `alpha-console-${targetRecord.record_id}`,
  })
}

async function captureReviewFeedback(): Promise<void> {
  const reviewSnapshot = await getSessionReviewOverview()
  const targetRecord =
    reviewSnapshot.records.find((record) => record.outcome_status !== 'unresolved')
    ?? reviewSnapshot.records[0]

  if (!targetRecord) {
    throw new Error('No reviewable demo record is available for alpha feedback.')
  }

  await captureSessionFeedback(
    targetRecord.record_id,
    'useful',
    'Alpha operator console feedback checkpoint.',
  )
}

async function executeAlphaStep(step: AlphaOperatorStepSnapshot): Promise<void> {
  if (step.step_id === 'start_or_resume_session') {
    await startSession()
    return
  }
  if (step.step_id === 'log_demo_decision') {
    await logCurrentDemoTrade('entered')
    return
  }
  if (step.step_id === 'resolve_demo_result') {
    await resolveAwaitingDemoResult()
    return
  }
  if (step.step_id === 'review_feedback') {
    await captureReviewFeedback()
    return
  }
  if (step.step_id === 'run_validation_replay') {
    await runValidation('strategy_replay', 'Alpha operator console replay')
    return
  }
  if (step.step_id === 'recheck_reliability') {
    await recheckReliability()
    return
  }
  throw new Error(`${step.action_label} needs manual operator navigation.`)
}

export function useAlphaOperatorConsole(): AlphaOperatorController {
  const [state, setState] = useState<AlphaOperatorState>({
    snapshot: null,
    isLoading: true,
    isActing: false,
    error: null,
    lastActionMessage: null,
  })

  const refresh = useCallback(async () => {
    setState((current) => ({
      ...current,
      isLoading: true,
      error: null,
    }))
    try {
      const snapshot = await getAlphaOverview()
      startTransition(() => {
        setState((current) => ({
          ...current,
          snapshot,
          isLoading: false,
          error: null,
        }))
      })
    } catch (error: unknown) {
      startTransition(() => {
        setState((current) => ({
          ...current,
          isLoading: false,
          error: getErrorMessage(error),
        }))
      })
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const nextStep = useMemo(() => findNextStep(state.snapshot), [state.snapshot])
  const canRunNextStep = useMemo(() => canRunStep(nextStep), [nextStep])

  const runNextStep = useCallback(async () => {
    const step = findNextStep(state.snapshot)
    if (!step) {
      return
    }
    if (!canRunStep(step)) {
      setState((current) => ({
        ...current,
        error: `${step.action_label} needs manual operator navigation.`,
      }))
      return
    }

    setState((current) => ({
      ...current,
      isActing: true,
      error: null,
      lastActionMessage: null,
    }))
    try {
      await executeAlphaStep(step)
      const snapshot = await getAlphaOverview()
      startTransition(() => {
        setState((current) => ({
          ...current,
          snapshot,
          isLoading: false,
          isActing: false,
          error: null,
          lastActionMessage: `${step.action_label} completed.`,
        }))
      })
    } catch (error: unknown) {
      startTransition(() => {
        setState((current) => ({
          ...current,
          isActing: false,
          error: getErrorMessage(error),
        }))
      })
    }
  }, [state.snapshot])

  return {
    ...state,
    nextStep,
    canRunNextStep,
    refresh,
    runNextStep,
  }
}
