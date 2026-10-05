import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';
import { formatLongDate } from '../utils/dates';

const steps = [
  ['pending', 'Order confirmed', 'We have received your order.'],
  ['processing', 'Preparing your order', 'Your rituals are being carefully packed.'],
  ['shipped', 'On the way', 'Your order has left our studio.'],
  ['delivered', 'Delivered', 'Your order has arrived.'],
];

function statusIndex(status) {
  return Math.max(0, steps.findIndex(([key]) => key === status));
}

function ItemImage({ item }) {
  if (item.image) return <img src={item.image} alt="" />;
  return <span className="order-item-image-empty" aria-hidden="true">✦</span>;
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setError('');
    ordersApi
      .getMine(orderId)
      .then(({ order: result }) => active && setOrder(result))
      .catch((err) => active && setError(err.message || 'We could not load this order.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [orderId, user]);

  const itemCount = useMemo(
    () => order?.items?.reduce((total, item) => total + item.quantity, 0) || 0,
    [order]
  );

  if (authLoading) return <section className="order-details-loading">Loading your order…</section>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (loading) return <section className="order-details-loading">Loading your order…</section>;
  if (error || !order)
    return (
      <section className="order-details-error">
        <h1>We couldn’t find that order.</h1>
        <p>{error || 'It may no longer be available.'}</p>
        <Link className="button" to="/account">Back to my account</Link>
      </section>
    );

  const current = statusIndex(order.fulfillmentStatus);
  const cancelled = order.fulfillmentStatus === 'cancelled';
  const deliveryNote = order.deliveredAt
    ? `Delivered on ${formatLongDate(order.deliveredAt)}`
    : order.estimatedDeliveryAt
      ? `Estimated delivery by ${formatLongDate(order.estimatedDeliveryAt)}`
      : 'Delivery estimate unavailable';
  const address = [
    order.deliveryAddress?.name,
    order.deliveryAddress?.line1,
    order.deliveryAddress?.line2,
    [order.deliveryAddress?.city, order.deliveryAddress?.state].filter(Boolean).join(', '),
    order.deliveryAddress?.postalCode,
  ].filter(Boolean);

  return (
    <section className="order-details-page">
      <header className="order-details-header">
        <button type="button" className="order-back" onClick={() => navigate('/account')} aria-label="Back to my account">←</button>
        <div><p className="eyebrow">My orders</p><h1>Order details</h1></div>
        <Link to="/contact" className="order-help-link">Need help?</Link>
      </header>

      <div className="order-details-meta">
        <span>Ordered on <strong>{formatLongDate(order.createdAt)}</strong></span>
        <span>Order ID <strong>#{order._id.slice(-7).toUpperCase()}</strong></span>
      </div>

      {cancelled ? (
        <div className="order-detail-cancelled">This order has been cancelled. Please contact us if you need help.</div>
      ) : (
        <>
          <section className="order-track-panel">
            <div className="order-track-title"><span>✦</span><div><p className="eyebrow">Your order</p><h2>Track your ritual</h2></div></div>
            <ol className="order-detail-timeline">
              {steps.map(([key, title, copy], index) => {
                const complete = index <= current;
                const currentStep = index === current;
                return <li key={key} className={complete ? 'complete' : ''}>
                  <i>{index < current ? '✓' : index + 1}</i>
                  <div><strong>{title}</strong><span>{currentStep ? (index === 0 ? `Placed ${formatLongDate(order.createdAt)}` : `Current update · ${formatLongDate(order.updatedAt)}`) : copy}</span></div>
                </li>;
              })}
            </ol>
            <p className="order-delivery-banner">{deliveryNote}</p>
          </section>

          <section className="order-items-panel">
            <div className="order-items-heading"><div><p className="eyebrow">Your selection</p><h2>Order items <small>({itemCount})</small></h2></div><span>₹{Number(order.total).toFixed(2)}</span></div>
            <div className="order-detail-items">
              {order.items.map((item, index) => <article key={`${item.product}-${index}`}>
                {item.slug ? <Link to={`/products/${item.slug}`} className="order-item-image"><ItemImage item={item} /></Link> : <div className="order-item-image"><ItemImage item={item} /></div>}
                <div className="order-item-copy"><p>{item.sku || 'Mitti Rituals'}</p>{item.slug ? <Link to={`/products/${item.slug}`}>{item.name}</Link> : <strong>{item.name}</strong>}<span>Qty: {item.quantity}</span></div>
                <strong className="order-item-price">₹{Number(item.unitPrice * item.quantity).toFixed(2)}</strong>
              </article>)}
            </div>
          </section>
        </>
      )}

      <section className="order-detail-info">
        <article><span>Delivery address</span><strong>{address[0] || 'Address unavailable'}</strong>{address.slice(1).map((line) => <p key={line}>{line}</p>)}</article>
        <article><span>Payment method</span><strong>{order.paymentState === 'cod' ? 'Cash on delivery' : order.paymentState}</strong><p>{order.paymentState === 'paid' ? 'Payment received' : 'Payment status will update with your order.'}</p></article>
        <article><span>Order total</span><strong>₹{Number(order.total).toFixed(2)}</strong><p>{itemCount} {itemCount === 1 ? 'item' : 'items'} in this order</p></article>
      </section>
    </section>
  );
}
