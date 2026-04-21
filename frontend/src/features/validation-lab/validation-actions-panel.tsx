type ValidationActionsPanelProps = {
  isLoading: boolean
  isActing: boolean
  onRunReplay: (runType: 'strategy_replay' | 'model_comparison' | 'signal_quality') => void
  onReviewStrategyActivation: () => void
  onReviewModelActivation: () => void
}

export function ValidationActionsPanel({
  isLoading,
  isActing,
  onRunReplay,
  onReviewStrategyActivation,
  onReviewModelActivation,
}: ValidationActionsPanelProps) {
  const disabled = isLoading || isActing

  return (
    <section aria-label="validation-actions-panel">
      <h3>Replay and Activation Actions</h3>
      <button disabled={disabled} onClick={() => onRunReplay('strategy_replay')} type="button">
        Run Strategy Replay
      </button>
      <button disabled={disabled} onClick={() => onRunReplay('model_comparison')} type="button">
        Run Model Comparison
      </button>
      <button disabled={disabled} onClick={() => onRunReplay('signal_quality')} type="button">
        Run Signal Quality Replay
      </button>
      <button disabled={disabled} onClick={onReviewStrategyActivation} type="button">
        Review Strategy Activation
      </button>
      <button disabled={disabled} onClick={onReviewModelActivation} type="button">
        Review Model Activation
      </button>
    </section>
  )
}
