import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
export default function CartPage() {
  const { items, subtotal, remove } = useCart();
  return (
    <section className="section cart-page">
      <div className="page-intro">
        <p className="eyebrow">Your bag</p>
        <h1>Ready when you are.</h1>
      </div>
      {items.length ? (
        <div className="cart-content">
          <div>
            {items.map((item) => (
              <div className="cart-line" key={item.id}>
                {item.image ? <img src={item.image} alt="" /> : <div className="cart-thumb">M</div>}
                <div className="cart-item-copy">
                  <b>{item.name}</b>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <button onClick={() => remove(item.id)}>Remove</button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <span>Subtotal</span>
            <strong>₹{subtotal.toFixed(2)}</strong>
            <small>Shipping and final availability are confirmed at checkout.</small>
            <Link className="button" to="/checkout">
              Continue to checkout
            </Link>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-mark">◌</span>
          <h3>Your bag is waiting.</h3>
          <p>Add a ritual when our collection opens.</p>
          <Link className="text-link" to="/shop">
            Visit the shop →
          </Link>
        </div>
      )}
    </section>
  );
}
