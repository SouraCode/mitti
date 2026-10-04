import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import EmptyAdminState from '../components/EmptyAdminState';
import Status from '../components/Status';
export default function ReviewsPage() {
  const [reviews, setReviews] = useState(null);
  const [filter, setFilter] = useState('pending');
  const load = () =>
    adminApi
      .reviews(filter)
      .then(({ reviews }) => setReviews(reviews))
      .catch(() => setReviews([]));
  useEffect(() => {
    void load();
  }, [filter]);
  const moderate = (id, status) => adminApi.moderate(id, status).then(load);
  return (
    <section>
      <div className="page-heading">
        <div>
          <h2>Reviews</h2>
          <p>New reviews are held for your approval before customers can see them.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>
      {reviews === null ? (
        <div className="table-loading">Loading reviews…</div>
      ) : !reviews.length ? (
        <EmptyAdminState
          title="No reviews in this queue"
          text="Customer reviews, including optional images, will appear here for moderation."
        />
      ) : (
        <div className="review-list">
          {reviews.map((r) => (
            <article key={r._id}>
              <div>
                <strong>{r.product?.name}</strong>
                <small>
                  {r.customer?.name} · {r.rating}/5{' '}
                  {r.verifiedPurchase ? '· Verified purchase' : ''}
                </small>
              </div>
              <p>{r.body || 'No written comment.'}</p>
              <div className="review-actions">
                <Status tone={r.status}>{r.status}</Status>
                {r.status !== 'approved' && (
                  <button onClick={() => moderate(r._id, 'approved')}>Approve</button>
                )}
                {r.status !== 'rejected' && (
                  <button className="secondary" onClick={() => moderate(r._id, 'rejected')}>
                    Reject
                  </button>
                )}
                {r.status !== 'hidden' && (
                  <button className="secondary" onClick={() => moderate(r._id, 'hidden')}>
                    Hide
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
