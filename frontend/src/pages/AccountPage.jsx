import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';
import { formatLongDate } from '../utils/dates';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const initials = useMemo(
    () =>
      (user?.name || '')
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    [user?.name]
  );

  useEffect(() => {
    let active = true;
    if (!user) {
      setOrdersLoading(false);
      return () => {
        active = false;
      };
    }
    setOrdersLoading(true);
    ordersApi
      .mine()
      .then(({ orders: result }) => {
        if (active) setOrders(result || []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const signOut = async () => {
    setSigningOut(true);
    setError('');
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'We could not sign you out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) return <section className="account-loading">Loading your account…</section>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <section className="account-page">
      <div className="account-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>My account</span>
      </div>
      {location.state?.notice && (
        <div className="account-notice" role="status">
          {location.state.notice}
        </div>
      )}
      <div className="account-layout">
        <aside className="profile-rail">
          <div className="profile-card">
            <div className="profile-avatar">{initials || 'MR'}</div>
            <p className="profile-overline">Your Mitti account</p>
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <span className={`verification-pill ${user.isEmailVerified ? 'verified' : ''}`}>
              <i />
              {user.isEmailVerified ? 'Email verified' : 'Email not verified'}
            </span>
            <div className="profile-divider" />
            <a href="#account-details">
              Personal details <span>→</span>
            </a>
            <a href="#order-history">
              Order history <span>→</span>
            </a>
            <button className="signout-button" onClick={signOut} disabled={signingOut}>
              {signingOut ? 'Signing out…' : 'Sign out'} <span>↗</span>
            </button>
          </div>
          <div className="profile-help">
            <span>Need a hand?</span>
            <p>We’re happy to help with your account or an order.</p>
            <Link to="/contact">Contact our team →</Link>
          </div>
        </aside>

        <section className="account-content">
          <header className="account-welcome">
            <div>
              <p className="account-eyebrow">A little space for you</p>
              <h2>Welcome back, {user.name.split(' ')[0]}.</h2>
              <p>Your care journey, gathered in one place.</p>
            </div>
            <span className="welcome-mark" aria-hidden="true">
              ✳
            </span>
          </header>

          <div className="account-stat-grid">
            <article>
              <span>Orders placed</span>
              <strong>{ordersLoading ? '—' : orders.length}</strong>
              <small>Your purchases with Mitti Rituals</small>
            </article>
            <article>
              <span>Account status</span>
              <strong className="stat-status">
                {user.isEmailVerified ? 'Verified' : 'Active'}
              </strong>
              <small>
                {user.isEmailVerified ? 'Your email is confirmed' : 'Email confirmation is pending'}
              </small>
            </article>
          </div>

          <section className="details-panel" id="account-details">
            <div className="panel-heading">
              <div>
                <p className="account-eyebrow">Your profile</p>
                <h3>Personal details</h3>
              </div>
              <span className="panel-icon">01</span>
            </div>
            <div className="details-grid">
              <div>
                <span>Full name</span>
                <strong>{user.name}</strong>
              </div>
              <div>
                <span>Email address</span>
                <strong>{user.email}</strong>
              </div>
            </div>
          </section>

          <section className="orders-panel" id="order-history">
            <div className="panel-heading">
              <div>
                <p className="account-eyebrow">Your purchases</p>
                <h3>Order history</h3>
              </div>
              <span className="panel-icon">02</span>
            </div>
            {error && (
              <p className="account-error" role="alert">
                {error}
              </p>
            )}
            {ordersLoading ? (
              <div className="orders-loading">
                <i />
                <i />
                <i />
              </div>
            ) : orders.length ? (
              <div className="order-cards">
                {orders.map((order) => (
                  <article className="order-card" key={order._id}>
                    <div className="order-number">
                      <span>Order</span>
                      <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                    </div>
                    <div>
                      <span>Date</span>
                      <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span>Items</span>
                      <strong>
                        {order.items.reduce((count, item) => count + item.quantity, 0)}
                      </strong>
                    </div>
                    <div>
                      <span>Total</span>
                      <strong>₹{Number(order.total).toFixed(2)}</strong>
                    </div>
                    <span className="order-state">{order.fulfillmentStatus}</span>
                    <div className="order-meta">
                      <span>Delivery</span>
                      <strong className="order-delivery-date">
                        {order.deliveredAt
                          ? `Delivered ${formatLongDate(order.deliveredAt)}`
                          : order.fulfillmentStatus === 'cancelled'
                            ? 'Order cancelled'
                            : order.estimatedDeliveryAt
                              ? `Estimated by ${formatLongDate(order.estimatedDeliveryAt)}`
                              : 'Estimate unavailable'}
                      </strong>
                      <span>Payment</span>
                      <strong>
                        {order.paymentState === 'cod' ? 'Cash on delivery' : order.paymentState}
                      </strong>
                      <span>Delivering to</span>
                      <strong>
                        {order.deliveryAddress?.city}, {order.deliveryAddress?.state} ·{' '}
                        {order.deliveryAddress?.postalCode}
                      </strong>
                      <span>Items</span>
                      <strong>
                        {order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="orders-empty">
                <span className="empty-ring">◌</span>
                <h4>Your first order is waiting.</h4>
                <p>When you find the ritual that feels right, your order details will live here.</p>
                <Link to="/shop">
                  Explore the collection <span>→</span>
                </Link>
              </div>
            )}
          </section>
        </section>
      </div>
    </section>
  );
}
