import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, subtotal, remove, update } = useCart();
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  return <section className="section cart-page">
    <div className="cart-heading">
      <div><p className="eyebrow">Your selected rituals</p><h1>Shopping bag</h1><p>{totalItems ? `${totalItems} ${totalItems === 1 ? 'item' : 'items'} ready for checkout.` : 'Your bag is ready when you are.'}</p></div>
      <Link className="text-link" to="/shop">Continue shopping →</Link>
    </div>
    {items.length ? <div className="cart-content cart-redesign">
      <div className="cart-items-panel">
        {items.map((item) => <article className="cart-line" key={item.id}>
          {item.image ? <img src={item.image} alt={item.name} /> : <div className="cart-thumb">M</div>}
          <div className="cart-item-copy"><p className="eyebrow">Mitti ritual</p><b>{item.name}</b><span>₹{Number(item.price).toFixed(2)} each</span><button className="cart-remove" onClick={() => remove(item.id)}>Remove</button></div>
          <div className="cart-item-actions"><div className="quantity-picker" aria-label={`Quantity for ${item.name}`}><button onClick={() => update(item.id, item.quantity - 1)} aria-label={`Remove one ${item.name}`}>−</button><span>{item.quantity}</span><button onClick={() => update(item.id, item.quantity + 1)} aria-label={`Add one ${item.name}`}>+</button></div><strong>₹{(item.price * item.quantity).toFixed(2)}</strong></div>
        </article>)}
      </div>
      <aside className="cart-summary"><p className="eyebrow">Order summary</p><div><span>Subtotal</span><strong>₹{subtotal.toFixed(2)}</strong></div><div><span>Shipping</span><small>Calculated at checkout</small></div><div className="cart-total"><span>Total</span><strong>₹{subtotal.toFixed(2)}</strong></div><p>Secure checkout. Shipping and final availability are confirmed before your order is placed.</p><Link className="button" to="/checkout">Proceed to checkout <span>→</span></Link></aside>
    </div> : <div className="empty-state"><span className="empty-mark">◌</span><h3>Your bag is waiting.</h3><p>Add a ritual when our collection opens.</p><Link className="text-link" to="/shop">Visit the shop →</Link></div>}
  </section>;
}
