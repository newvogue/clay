import type { ActivationReviewSnapshot } from '../../types/validation-lab'

type ActivationReviewPanelProps = {
  pendingReview: ActivationReviewSnapshot | null
  reviews: ActivationReviewSnapshot[]
  isLoading: boolean
  isActing: boolean
  onApply: () => void
}

export function ActivationReviewPanel({
  pendingReview,
  reviews,
  isLoading,
  isActing,
  onApply,
}: ActivationReviewPanelProps) {
  return (
    <section aria-label="activation-review-panel">
      <h3>Activation Reviews</h3>
      {isLoading ? <p>Loading activation reviews...</p> : null}
      {!isLoading && pendingReview ? (
        <article>
          <h4>Pending Review</h4>
          <p>{pendingReview.summary}</p>
          <p>Status: {pendingReview.status}</p>
          <p>Severity: {pendingReview.severity}</p>
          <button disabled={isActing} onClick={onApply} type="button">
            Apply Activation Review
          </button>
        </article>
      ) : null}
      {!isLoading
        ? reviews.map((review) => (
            <article key={review.review_id}>
              <h4>{review.target_type}</h4>
              <p>{review.summary}</p>
              <p>Status: {review.status}</p>
              <p>Severity: {review.severity}</p>
            </article>
          ))
        : null}
    </section>
  )
}
