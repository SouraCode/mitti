import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import EmptyAdminState from '../components/EmptyAdminState';
import Status from '../components/Status';
export default function OffersPage() {
  const [offers, setOffers] = useState(null);
  const [products, setProducts] = useState([]);
  const [show, setShow] = useState(false);
  const [data, setData] = useState({ product: '', type: 'percentage', value: '', enabled: true });
  const [error, setError] = useState('');
  const load = () =>
    adminApi
      .offers()
      .then(({ offers }) => setOffers(offers))
      .catch(() => setOffers([]));
  useEffect(() => {
    load();
    adminApi.products().then(({ products }) => setProducts(products));
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createOffer({ ...data, value: Number(data.value) });
      setShow(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <section>
      <div className="page-heading">
        <div>
          <h2>Offers</h2>
          <p>Discounts are validated and calculated by the API, never by the storefront.</p>
        </div>
        <button onClick={() => setShow(true)}>+ New offer</button>
      </div>
      {offers === null ? (
        <div className="table-loading">Loading offers…</div>
      ) : !offers.length ? (
        <EmptyAdminState
          title="No offers created"
          text="Create a scheduled offer only when a product and its final pricing are ready."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Discount</th>
                <th>Window</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o._id}>
                  <td>{o.product?.name || 'Archived product'}</td>
                  <td>{o.type === 'percentage' ? `${o.value}%` : `₹${o.value}`}</td>
                  <td>
                    {o.startsAt ? new Date(o.startsAt).toLocaleDateString() : 'Now'} —{' '}
                    {o.endsAt ? new Date(o.endsAt).toLocaleDateString() : 'No end'}
                  </td>
                  <td>
                    <Status tone={o.enabled ? 'published' : 'draft'}>
                      {o.enabled ? 'enabled' : 'disabled'}
                    </Status>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {show && (
        <div className="modal-backdrop">
          <form className="modal compact" onSubmit={submit}>
            <div className="modal-title">
              <h2>New offer</h2>
              <button type="button" onClick={() => setShow(false)}>
                ×
              </button>
            </div>
            {error && <p className="form-error">{error}</p>}
            <label>
              Product
              <select
                required
                value={data.product}
                onChange={(e) => setData({ ...data, product: e.target.value })}
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option value={p._id} key={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Discount type
              <select
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value })}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </label>
            <label>
              Value
              <input
                required
                min="0"
                type="number"
                value={data.value}
                onChange={(e) => setData({ ...data, value: e.target.value })}
              />
            </label>
            <label>
              Starts at
              <input
                type="datetime-local"
                onChange={(e) => setData({ ...data, startsAt: e.target.value || undefined })}
              />
            </label>
            <label>
              Ends at
              <input
                type="datetime-local"
                onChange={(e) => setData({ ...data, endsAt: e.target.value || undefined })}
              />
            </label>
            <button>Create offer</button>
          </form>
        </div>
      )}
    </section>
  );
}
