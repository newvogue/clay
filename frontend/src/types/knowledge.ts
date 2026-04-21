export type KnowledgeSummarySnapshot = {
  total_items: number
  total_chunks: number
  retrieval_mode: string
  retrieval_policy: string
  hot_path_dependency: boolean
  operator_message: string
}

export type KnowledgeItemSnapshot = {
  item_id: number
  title: string
  category: string
  priority: string
  tags: string[]
  source_type: string
  content_preview: string
  created_at: string
  updated_at: string
  chunk_count: number
}

export type KnowledgeSearchResultSnapshot = {
  item_id: number
  title: string
  category: string
  priority: string
  tags: string[]
  score: number
  matched_chunk: string
  rationale: string
}

export type KnowledgeSnapshot = {
  summary: KnowledgeSummarySnapshot
  recent_items: KnowledgeItemSnapshot[]
  search_results: KnowledgeSearchResultSnapshot[]
}
