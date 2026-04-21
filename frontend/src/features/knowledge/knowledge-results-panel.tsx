import type { KnowledgeItemSnapshot, KnowledgeSearchResultSnapshot } from '../../types/knowledge'

type KnowledgeResultsPanelProps = {
  recentItems: KnowledgeItemSnapshot[]
  searchResults: KnowledgeSearchResultSnapshot[]
  isLoading: boolean
}

export function KnowledgeResultsPanel({
  recentItems,
  searchResults,
  isLoading,
}: KnowledgeResultsPanelProps) {
  return (
    <section aria-label="knowledge-results-panel">
      <h3>Knowledge Results</h3>
      {isLoading ? <p>Loading knowledge results...</p> : null}
      {!isLoading && (
        <>
          <h4>Recent Items</h4>
          {recentItems.length === 0 ? <p>No knowledge items yet.</p> : null}
          {recentItems.map((item) => (
            <article key={item.item_id}>
              <h5>{item.title}</h5>
              <p>Category: {item.category}</p>
              <p>Priority: {item.priority}</p>
              <p>Chunks: {item.chunk_count}</p>
              <p>{item.content_preview}</p>
            </article>
          ))}
          <h4>Search Results</h4>
          {searchResults.length === 0 ? <p>No search results for the current query.</p> : null}
          {searchResults.map((item) => (
            <article key={`search-${item.item_id}`}>
              <h5>{item.title}</h5>
              <p>Score: {item.score}</p>
              <p>{item.matched_chunk}</p>
              <p>{item.rationale}</p>
            </article>
          ))}
        </>
      )}
    </section>
  )
}
