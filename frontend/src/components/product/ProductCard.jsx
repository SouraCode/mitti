import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
function offerLabel(product) {
  if (!product.offer) return '';
  const regular = Number(product.regularPrice);
  const current = Number(product.price);
  const percent = regular > 0 ? Math.round(((regular - current) / regular) * 100) : 0;
  return percent > 0 ? `${percent}% off` : 'Special offer';
}
export default function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const { add, update, items, notice } = useCart();
  const { has, toggle } = useWishlist();
  const onOffer = Boolean(product.offer);
  const image = product.images?.[0];
  const price = Number(product.price);
  const stockQuantity = product.stock?.quantity;
  const outOfStock = product.stock?.state === 'out_of_stock';
  const lowStock = product.stock?.state === 'low_stock';
  const productId = product.id || product._id;
  const cartItem = items.find((item) => item.id === productId);
  const addToBag = () => {
    add({
      id: productId,
      name: product.name,
      slug: product.slug,
      image: image?.url || '',
      price: price || 0,
      stockQuantity,
      stockLabel: product.stock?.label,
    });
  };
  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`}>
        <div className="product-image">
          {onOffer && <span className="product-sale-badge">{offerLabel(product)}</span>}
          {image?.url && !imageFailed ? (
            <img
              src={image.url}
              alt={image.alt || product.name}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="product-image-placeholder">
              <i>MITTI</i>
              {imageFailed ? 'Photo unavailable' : 'Photo coming soon'}
            </span>
          )}
        </div>
      </Link>
      <button
        type="button"
        className={`product-wishlist-button${has(product) ? ' is-saved' : ''}`}
        aria-label={`${has(product) ? 'Remove' : 'Add'} ${product.name} ${has(product) ? 'from' : 'to'} wishlist`}
        aria-pressed={has(product)}
        onClick={() => toggle(product)}
      >{has(product) ? '♥' : '♡'}</button>
      <div className="product-info">
        <Link to={`/products/${product.slug}`}>
          <p className="product-category">{product.category}</p>
          <h3>{product.name}</h3>
        </Link>
        {(lowStock || outOfStock) && (
          <p className={`product-stock-note ${product.stock.state}`}>{product.stock.label}</p>
        )}
        <div className="product-card-bottom">
          <p className="product-prices">
            {Number.isFinite(price) ? (
              <>
                <strong>₹{product.price}</strong>
                {onOffer && <del>₹{product.regularPrice}</del>}
              </>
            ) : 'Details coming soon'}
          </p>
          {cartItem ? (
            <div className="card-quantity-control" aria-label={`Quantity for ${product.name}`}>
              <button type="button" onClick={() => update(productId, cartItem.quantity - 1)} aria-label={`Remove one ${product.name}`}>−</button>
              <span aria-live="polite">{cartItem.quantity}</span>
              <button type="button" onClick={addToBag} aria-label={`Add one ${product.name}`}>+</button>
            </div>
          ) : (
            <button
              type="button"
              className="product-quick-add"
              aria-label={`Add ${product.name} to your bag`}
              onClick={addToBag}
              disabled={outOfStock}
            >
              {outOfStock ? '×' : '+'}
            </button>
          )}
        </div>
        {notice?.productId === productId && (
          <p className="cart-limit-message" role="status">{notice.message}</p>
        )}
      </div>
    </article>
  );
}
