import { useState } from 'react';
import { Link } from 'react-router-dom';
function offerLabel(product) {
  if (!product.offer) return '';
  const regular = Number(product.regularPrice);
  const current = Number(product.price);
  const percent = regular > 0 ? Math.round(((regular - current) / regular) * 100) : 0;
  return percent > 0 ? `${percent}% off` : 'Special offer';
}
export default function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const onOffer = Boolean(product.offer);
  const image = product.images?.[0];
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
            <span>{imageFailed ? 'Image unavailable' : 'Image coming soon'}</span>
          )}
        </div>
        <div className="product-info">
          <p className="product-category">{product.category}</p>
          <h3>{product.name}</h3>
          <p className="product-prices">
            {Number.isFinite(Number(product.price)) ? (
              <>
                <strong>₹{product.price}</strong>
                {onOffer && (
                  <>
                    <del>₹{product.regularPrice}</del>
                    <span className="product-offer-copy">{offerLabel(product)}</span>
                  </>
                )}
              </>
            ) : (
              'Details coming soon'
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}
