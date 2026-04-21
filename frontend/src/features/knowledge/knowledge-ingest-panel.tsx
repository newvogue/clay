type KnowledgeIngestPanelProps = {
  isLoading: boolean
  isActing: boolean
  onAddSample: (sampleType: 'strategy_rule' | 'checklist' | 'observation' | 'note') => void
}

export function KnowledgeIngestPanel({
  isLoading,
  isActing,
  onAddSample,
}: KnowledgeIngestPanelProps) {
  const disabled = isLoading || isActing

  return (
    <section aria-label="knowledge-ingest-panel">
      <h3>Quick Ingest</h3>
      <button disabled={disabled} onClick={() => onAddSample('strategy_rule')} type="button">
        Add Strategy Rule
      </button>
      <button disabled={disabled} onClick={() => onAddSample('checklist')} type="button">
        Add Checklist
      </button>
      <button disabled={disabled} onClick={() => onAddSample('observation')} type="button">
        Add Observation
      </button>
      <button disabled={disabled} onClick={() => onAddSample('note')} type="button">
        Add Note
      </button>
    </section>
  )
}
