import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
const labels = [
  ['products', 'Products'],
  ['drafts', 'Draft products'],
  ['lowStock', 'Low-stock items'],
  ['orders', 'Orders'],
  ['pendingReviews', 'Reviews to moderate'],
];
export default function DashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    adminApi
      .dashboard()
      .then(setData)
      .catch(() => setData({}));
  }, []);
  return (
    <section>
      <div className="page-heading">
        <div>
          <h2>Overview</h2>
          <p>A clear view of your catalogue and care queue.</p>
        </div>
      </div>
      <div className="metric-grid">
        {labels.map(([key, label]) => (
          <article key={key}>
            <span>{label}</span>
            <strong>{data ? data[key] : '—'}</strong>
          </article>
        ))}
      </div>
      <div className="admin-note">
        <h3>Start with a draft</h3>
        <p>
          Create your product records privately, then complete their images, ingredients, pricing
          and inventory before publishing. Nothing appears in the storefront until its status is set
          to published.
        </p>
      </div>
    </section>
  );
}
