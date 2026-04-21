import type { KnowledgeSummarySnapshot } from '../../types/knowledge'

type KnowledgeStateBannerProps = {
  summary: KnowledgeSummarySnapshot | null
  isLoading: boolean
  error: string | null
}

export function KnowledgeStateBanner({ summary, isLoading, error }: KnowledgeStateBannerProps) {
  return (
    <section aria-label="knowledge-state-banner">
      <h2>Knowledge Base</h2>
      {isLoading ? <p>Loading knowledge layer...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!isLoading && !error && summary ? (
        <>
          <p>Total items: {summary.total_items}</p>
          <p>Total chunks: {summary.total_chunks}</p>
          <p>Retrieval mode: {summary.retrieval_mode}</p>
          <p>{summary.operator_message}</p>
        </>
      ) : null}
    </section>
  )
}
