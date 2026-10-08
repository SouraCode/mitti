import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ordersApi, paymentsApi } from '../services/api';
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
  const [codEnabled, setCodEnabled] = useState(false);
  const [onlinePayments, setOnlinePayments] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('cod');
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
      .then(({ methods = [], onlinePayments: online = false, razorpay = {} }) => {
        const codAvailable = methods.some((method) => method.id === 'cod' && method.enabled);
        const razorpayAvailable = methods.some((method) => method.id === 'razorpay' && method.enabled);
        setCodEnabled(codAvailable);
        setOnlinePayments(online && Boolean(razorpay.keyId));
        setRazorpayKeyId(razorpay.keyId || '');
        setSelectedMethod(razorpayAvailable ? 'razorpay' : 'cod');
      })
      .catch(() => {
        setCodEnabled(false);
        setOnlinePayments(false);
        setRazorpayKeyId('');
        setSelectedMethod('cod');
      })
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

  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(window.Razorpay);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        if (window.Razorpay) resolve(window.Razorpay);
        else reject(new Error('Razorpay is unavailable right now.'));
      };
      script.onerror = () => reject(new Error('Unable to load the Razorpay payment popup.'));
      document.body.appendChild(script);
    });

  const placeOrderWithRazorpay = async () => {
    setPlacing(true);
    setError('');
    try {
      const paymentPayload = await paymentsApi.createOrder({
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        deliveryAddress: address,
      });

      const razorpayLibrary = await loadRazorpayScript();
      const options = {
        key: paymentPayload.keyId || razorpayKeyId,
        amount: paymentPayload.amount,
        currency: paymentPayload.currency,
        order_id: paymentPayload.razorpayOrderId,
        name: 'Mitti Rituals',
        description: 'Order payment',
        handler: async function handlePayment(response) {
          try {
            const verified = await paymentsApi.verify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            setOrder(verified.order);
            clear();
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (err) {
            setError(err.message || 'Payment verification failed. Please contact support.');
          } finally {
            setPlacing(false);
          }
        },
        prefill: {
          name: address.name,
          email: user.email,
          contact: address.phone,
        },
        theme: { color: '#6b4f3d' },
        modal: {
          ondismiss: () => {
            setError('Payment was cancelled. Your cart is still intact and you can retry.');
            setPlacing(false);
          },
        },
      };

      const razorpayCheckout = new razorpayLibrary(options);
      razorpayCheckout.on('payment.failed', function (response) {
        setError(
          response.error?.description ||
            'Payment failed. Your order was not paid and the cart remains available for retry.'
        );
        setPlacing(false);
      });
      razorpayCheckout.open();
    } catch (err) {
      setError(err.message || 'We could not start the online payment flow. Please try again.');
      setPlacing(false);
    }
  };

  const canPlaceCodOrder = codEnabled && !loadingPayment && !placing;
  const canPlaceRazorpayOrder = onlinePayments && !loadingPayment && !placing;
  const checkoutTitle = step === 0 ? 'Delivery details' : step === 1 ? 'Payment' : 'Order confirmed';

  return (
    <section className="section checkout-page">
      <div className="checkout-intro">
        <div>
          <p className="eyebrow">Secure checkout</p>
          <h1>{checkoutTitle}</h1>
        </div>
        {!order && <Link className="text-link" to="/cart">Edit bag →</Link>}
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
            <label className={`payment-option ${codEnabled ? 'available' : 'unavailable'}`}>
              <input
                type="radio"
                name="payment"
                checked={selectedMethod === 'cod'}
                onChange={() => setSelectedMethod('cod')}
                disabled={!codEnabled}
              />
              <span>
                <strong>Cash on delivery</strong>
                <small>
                  {codEnabled
                    ? 'Pay when your order arrives.'
                    : 'Currently unavailable — the store has not enabled cash on delivery.'}
                </small>
              </span>
              <b>{codEnabled ? 'Available' : 'Unavailable'}</b>
            </label>
            <label className={`payment-option ${onlinePayments ? 'available' : 'unavailable'}`}>
              <input
                type="radio"
                name="payment"
                checked={selectedMethod === 'razorpay'}
                onChange={() => setSelectedMethod('razorpay')}
                disabled={!onlinePayments}
              />
              <span>
                <strong>Online payment</strong>
                <small>
                  {onlinePayments
                    ? 'Pay safely with Razorpay.'
                    : 'Online payment is not available yet.'}
                </small>
              </span>
              <b>{onlinePayments ? 'Available' : 'Unavailable'}</b>
            </label>
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
                disabled={
                  (selectedMethod === 'cod' && !canPlaceCodOrder) ||
                  (selectedMethod === 'razorpay' && !canPlaceRazorpayOrder)
                }
                onClick={selectedMethod === 'razorpay' ? placeOrderWithRazorpay : placeOrder}
              >
                {placing
                  ? 'Processing…'
                  : loadingPayment
                    ? 'Checking payment…'
                    : selectedMethod === 'razorpay'
                      ? 'Pay with Razorpay'
                      : 'Place order'}
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
            <strong>{order.paymentMethod === 'razorpay' ? 'Razorpay payment' : 'Cash on delivery'}</strong>
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
      <div className="order-summary-topline"><p className="eyebrow">Order summary</p><span>Secure checkout</span></div>
      <h2>
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </h2>
      <div className="summary-items">
        {items.map((item) => (
          <div className="summary-item" key={item.id}>
            {item.image ? <img src={item.image} alt={`${item.name} product`} loading="lazy" decoding="async" /> : <div className="cart-thumb">M</div>}
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
