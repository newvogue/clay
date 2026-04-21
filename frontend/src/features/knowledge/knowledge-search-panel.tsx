type KnowledgeSearchPanelProps = {
  query: string
  isLoading: boolean
  onQueryChange: (query: string) => void
  onSearch: () => void
}

export function KnowledgeSearchPanel({
  query,
  isLoading,
  onQueryChange,
  onSearch,
}: KnowledgeSearchPanelProps) {
  return (
    <section aria-label="knowledge-search-panel">
      <h3>Research Search</h3>
      <label>
        Search knowledge
        <input
          onChange={(event) => onQueryChange(event.target.value)}
          type="text"
          value={query}
        />
      </label>
      <button disabled={isLoading} onClick={onSearch} type="button">
        Search Knowledge
      </button>
    </section>
  )
}
