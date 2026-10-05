import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import EmptyAdminState from '../components/EmptyAdminState';
import Status from '../components/Status';

const blankOffer = { product: '', type: 'percentage', value: '', startsAt: '', endsAt: '', enabled: true };

function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function offerState(offer) {
  const now = Date.now();
  if (!offer.enabled) return { label: 'Disabled', tone: 'draft' };
  if (offer.startsAt && new Date(offer.startsAt).getTime() > now) return { label: 'Scheduled', tone: 'pending' };
  if (offer.endsAt && new Date(offer.endsAt).getTime() <= now) return { label: 'Expired', tone: 'archived' };
  return { label: 'Active', tone: 'published' };
}

function OfferForm({ offer, products, onClose, onSaved }) {
  const [data, setData] = useState(() => offer ? {
    product: offer.product?._id || offer.product || '', type: offer.type, value: offer.value,
    startsAt: toInputDate(offer.startsAt), endsAt: toInputDate(offer.endsAt), enabled: offer.enabled,
  } : blankOffer);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (key, value) => setData((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError('');
    const payload = { ...data, value: Number(data.value), startsAt: data.startsAt || undefined, endsAt: data.endsAt || undefined };
    try {
      if (offer) await adminApi.updateOffer(offer._id, payload);
      else await adminApi.createOffer(payload);
      onSaved(); onClose();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <div className="modal-backdrop"><form className="modal compact offer-form" onSubmit={submit}>
    <div className="modal-title"><div><h2>{offer ? 'Edit offer' : 'New offer'}</h2><p>{offer ? 'Update the price, time window, or restart this offer.' : 'Set the price and schedule when it should run.'}</p></div><button type="button" onClick={onClose}>×</button></div>
    {error && <p className="form-error">{error}</p>}
    <label>Product<select required value={data.product} onChange={(e) => update('product', e.target.value)}><option value="">Select a product</option>{products.map((product) => <option value={product._id} key={product._id}>{product.name}</option>)}</select></label>
    <label>Discount type<select value={data.type} onChange={(e) => update('type', e.target.value)}><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></label>
    <label>{data.type === 'percentage' ? 'Discount percentage' : 'Discount amount (₹)'}<input required min="0" max={data.type === 'percentage' ? '100' : undefined} type="number" value={data.value} onChange={(e) => update('value', e.target.value)} /></label>
    <label>Starts at<input type="datetime-local" value={data.startsAt} onChange={(e) => update('startsAt', e.target.value)} /></label>
    <label>Ends at<input type="datetime-local" value={data.endsAt} onChange={(e) => update('endsAt', e.target.value)} /></label>
    <label className="offer-enabled"><input type="checkbox" checked={data.enabled} onChange={(e) => update('enabled', e.target.checked)} /> Offer is enabled</label>
    <button disabled={busy}>{busy ? 'Saving…' : offer ? 'Save offer' : 'Create offer'}</button>
  </form></div>;
}

export default function OffersPage() {
  const [offers, setOffers] = useState(null);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => adminApi.offers().then(({ offers: list }) => setOffers(list)).catch(() => setOffers([]));
  useEffect(() => { void load(); adminApi.products().then(({ products: list }) => setProducts(list)); }, []);
  return <section>
    <div className="page-heading"><div><h2>Offers</h2><p>Expired offers are clearly marked. Edit one any time to change its value or restart its schedule.</p></div><button onClick={() => setEditing('new')}>+ New offer</button></div>
    {offers === null ? <div className="table-loading">Loading offers…</div> : !offers.length ? <EmptyAdminState title="No offers created" text="Create a scheduled offer only when a product and its final pricing are ready." /> : <div className="table-wrap"><table><thead><tr><th>Product</th><th>Discount</th><th>Window</th><th>Status</th><th>Action</th></tr></thead><tbody>{offers.map((offer) => { const state = offerState(offer); return <tr key={offer._id}><td>{offer.product?.name || 'Archived product'}</td><td>{offer.type === 'percentage' ? `${offer.value}%` : `₹${offer.value}`}</td><td>{offer.startsAt ? new Date(offer.startsAt).toLocaleString() : 'Now'} — {offer.endsAt ? new Date(offer.endsAt).toLocaleString() : 'No end'}</td><td><Status tone={state.tone}>{state.label}</Status></td><td><button className="secondary" onClick={() => setEditing(offer)}>Edit</button></td></tr>; })}</tbody></table></div>}
    {editing && <OfferForm offer={editing === 'new' ? null : editing} products={products} onClose={() => setEditing(null)} onSaved={load} />}
  </section>;
}
