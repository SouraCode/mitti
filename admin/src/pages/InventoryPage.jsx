import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import EmptyAdminState from '../components/EmptyAdminState';
export default function InventoryPage() {
  const [products, setProducts] = useState(null);
  const [editing, setEditing] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    setLoadError('');
    return adminApi
      .products()
      .then(({ products }) => setProducts(products))
      .catch((err) => {
        setProducts([]);
        setLoadError(err.message);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    void load();
  }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      await adminApi.inventory(editing._id, { quantity: Number(quantity), reason });
      setEditing(null);
      void load();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <section>
      <div className="page-heading">
        <div>
          <h2>Inventory</h2>
          <p>Exact quantities remain private and are the source of truth for checkout.</p>
        </div>
      </div>
      {loadError && (
        <div className="admin-error" role="alert">
          <span>{loadError}</span>
          <button className="secondary" onClick={() => void load()}>
            Try again
          </button>
        </div>
      )}
      {loading ? (
        <div className="table-loading">Loading inventory…</div>
      ) : !loadError && !products?.length ? (
        <EmptyAdminState
          title="No inventory to manage"
          text="Stock controls will appear after you create product drafts."
        />
      ) : (
        !loadError && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Exact quantity</th>
                  <th>Threshold</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.name}</strong>
                      <small>{p.sku}</small>
                    </td>
                    <td>{p.stockQuantity}</td>
                    <td>{p.lowStockThreshold}</td>
                    <td>
                      <button
                        className="secondary"
                        onClick={() => {
                          setEditing(p);
                          setQuantity(p.stockQuantity);
                          setReason('');
                          setError('');
                        }}
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      {editing && (
        <div className="modal-backdrop">
          <form className="modal compact" onSubmit={save}>
            <div className="modal-title">
              <h2>Adjust inventory</h2>
              <button type="button" onClick={() => setEditing(null)}>
                ×
              </button>
            </div>
            <p>{editing.name}</p>
            {error && <p className="form-error">{error}</p>}
            <label>
              New exact quantity
              <input
                min="0"
                required
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <label>
              Reason
              <textarea required value={reason} onChange={(e) => setReason(e.target.value)} />
            </label>
            <button>Save adjustment</button>
          </form>
        </div>
      )}
    </section>
  );
}
