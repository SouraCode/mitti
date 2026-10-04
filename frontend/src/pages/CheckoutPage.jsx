import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../services/api';
import { formatLongDate } from '../utils/dates';

const initialAddress = {
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};
const steps = ['Delivery address', 'Payment method', 'Order placed'];

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, clear } = useCart();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(() => ({ ...initialAddress, name: user?.name || '' }));
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  useEffect(() => {
    if (!user) return;
    setAddress((current) => ({ ...current, name: current.name || user.name }));
    ordersApi
      .paymentOptions()
      .then(({ methods = [] }) =>
        setPaymentEnabled(methods.some((method) => method.id === 'cod' && method.enabled))
      )
      .catch(() => setPaymentEnabled(false))
      .finally(() => setLoadingPayment(false));
  }, [user]);

  if (authLoading)
    return (
      <section className="section checkout-page">
        <p>Loading your account…</p>
      </section>
    );
  if (!user) return <Navigate to="/login" replace state={{ from: '/checkout' }} />;
  if (!items.length && !order)
    return (
      <section className="section checkout-page">
        <div className="empty-state">
          <h3>Your bag is empty.</h3>
          <p>Add a product before starting checkout.</p>
          <Link className="button" to="/shop">
            Explore the collection
          </Link>
        </div>
      </section>
    );

  const updateAddress = (event) =>
    setAddress((current) => ({ ...current, [event.target.name]: event.target.value }));
  const continueToPayment = (event) => {
    event.preventDefault();
    setError('');
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const placeOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      const result = await ordersApi.create({
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        deliveryAddress: address,
        paymentMethod: 'cod',
      });
      setOrder(result.order);
      clear();
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'We could not place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <section className="section checkout-page">
      <div className="page-intro">
        <p className="eyebrow">Your order</p>
        <h1>{order ? 'Thank you.' : 'A few details, then it’s yours.'}</h1>
        <p>Complete each step to place your order securely.</p>
      </div>
      <ol className="checkout-steps" aria-label="Checkout progress">
        {steps.map((label, index) => (
          <li className={step === index ? 'active' : step > index ? 'complete' : ''} key={label}>
            <span>{step > index ? '✓' : `0${index + 1}`}</span>
            {label}
          </li>
        ))}
      </ol>
      {error && (
        <p className="checkout-error" role="alert">
          {error}
        </p>
      )}

      {step === 0 && (
        <div className="checkout-layout">
          <form className="checkout-panel checkout-form" onSubmit={continueToPayment}>
            <p className="eyebrow">Step 1</p>
            <h2>Delivery address</h2>
            <div className="checkout-fields">
              <label>
                Full name
                <input
                  required
                  autoComplete="name"
                  name="name"
                  value={address.name}
                  onChange={updateAddress}
                />
              </label>
              <label>
                Phone number
                <input
                  required
                  autoComplete="tel"
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={updateAddress}
                />
              </label>
              <label className="wide">
                Address line 1
                <input
                  required
                  autoComplete="address-line1"
                  name="line1"
                  value={address.line1}
                  onChange={updateAddress}
                />
              </label>
              <label className="wide">
                Address line 2 <span>(optional)</span>
                <input
                  autoComplete="address-line2"
                  name="line2"
                  value={address.line2}
                  onChange={updateAddress}
                />
              </label>
              <label>
                City
                <input
                  required
                  autoComplete="address-level2"
                  name="city"
                  value={address.city}
                  onChange={updateAddress}
                />
              </label>
              <label>
                State / region
                <input
                  required
                  autoComplete="address-level1"
                  name="state"
                  value={address.state}
                  onChange={updateAddress}
                />
              </label>
              <label>
                Postal code
                <input
                  required
                  autoComplete="postal-code"
                  name="postalCode"
                  value={address.postalCode}
                  onChange={updateAddress}
                />
              </label>
              <label>
                Country
                <input
                  required
                  autoComplete="country-name"
                  name="country"
                  value={address.country}
                  onChange={updateAddress}
                />
              </label>
            </div>
            <button className="button">Continue to payment</button>
          </form>
          <OrderSummary items={items} subtotal={subtotal} itemCount={itemCount} />
        </div>
      )}

      {step === 1 && (
        <div className="checkout-layout">
          <div className="checkout-panel">
            <p className="eyebrow">Step 2</p>
            <h2>Choose a payment method</h2>
            <label className={`payment-option ${paymentEnabled ? 'available' : 'unavailable'}`}>
              <input type="radio" name="payment" checked readOnly />
              <span>
                <strong>Cash on delivery</strong>
                <small>
                  {paymentEnabled
                    ? 'Pay when your order arrives.'
                    : 'Currently unavailable — the store has not enabled cash on delivery.'}
                </small>
              </span>
              <b>{paymentEnabled ? 'Available' : 'Unavailable'}</b>
            </label>
            <div className="payment-option unavailable">
              <span className="payment-radio" />
              <span>
                <strong>Online payment</strong>
                <small>
                  Card, UPI and wallet payments will appear after a payment provider is connected.
                </small>
              </span>
              <b>Coming soon</b>
            </div>
            <div className="checkout-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setStep(0);
                  setError('');
                }}
              >
                Back to address
              </button>
              <button
                className="button"
                disabled={!paymentEnabled || loadingPayment || placing}
                onClick={placeOrder}
              >
                {placing ? 'Placing order…' : loadingPayment ? 'Checking payment…' : 'Place order'}
              </button>
            </div>
          </div>
          <OrderSummary items={items} subtotal={subtotal} itemCount={itemCount} address={address} />
        </div>
      )}

      {step === 2 && order && (
        <div className="checkout-confirmation">
          <span className="confirmation-check">✓</span>
          <p className="eyebrow">Order received</p>
          <h2>Your order is placed.</h2>
          <p>
            We’ve recorded your order and its current status is{' '}
            <strong>{order.fulfillmentStatus}</strong>. You can follow updates from your profile.
          </p>
          <div className="confirmation-order">
            <span>Order number</span>
            <strong>#{order._id.slice(-6).toUpperCase()}</strong>
            <span>Estimated delivery</span>
            <strong>{formatLongDate(order.estimatedDeliveryAt) || 'To be confirmed'}</strong>
            <span>Payment</span>
            <strong>Cash on delivery</strong>
            <span>Total</span>
            <strong>₹{Number(order.total).toFixed(2)}</strong>
          </div>
          <div className="checkout-actions">
            <Link className="button" to="/account">
              View order in my profile
            </Link>
            <Link className="text-link" to="/shop">
              Continue shopping →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function OrderSummary({ items, subtotal, itemCount, address }) {
  return (
    <aside className="checkout-panel order-summary">
      <p className="eyebrow">Order summary</p>
      <h2>
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </h2>
      <div className="summary-items">
        {items.map((item) => (
          <div className="summary-item" key={item.id}>
            {item.image ? <img src={item.image} alt="" /> : <div className="cart-thumb">M</div>}
            <span>
              {item.name}
              <small>Qty {item.quantity}</small>
            </span>
            <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
          </div>
        ))}
      </div>
      <div className="summary-total">
        <span>Subtotal</span>
        <strong>₹{subtotal.toFixed(2)}</strong>
      </div>
      <small className="shipping-note">Shipping is confirmed by the store after your order.</small>
      {address && (
        <div className="summary-address">
          <p className="eyebrow">Delivering to</p>
          <strong>{address.name}</strong>
          <span>
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ''}
          </span>
          <span>
            {address.city}, {address.state} {address.postalCode}
          </span>
          <span>{address.phone}</span>
        </div>
      )}
    </aside>
  );
}
