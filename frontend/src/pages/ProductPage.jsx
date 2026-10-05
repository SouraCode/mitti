import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import ProductGrid from '../components/product/ProductGrid';
import SectionHeading from '../components/common/SectionHeading';
import { useProducts } from '../hooks/useProducts';
import { productsApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

function offerLabel(product) {
  if (!product.offer) return '';
  const regular = Number(product.regularPrice);
  const current = Number(product.price);
  const percent = regular > 0 ? Math.round(((regular - current) / regular) * 100) : 0;
  return percent > 0 ? `${percent}% off` : 'Special offer';
}

function GalleryPhoto({ image, name, index }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className="gallery-photo-fallback" role="img" aria-label={`Photo unavailable for ${name}`}>
      Photo unavailable
    </div>
  ) : (
    <img
      src={image.url}
      alt={image.alt || name}
      loading={index > 1 ? 'lazy' : 'eager'}
      onError={() => setFailed(true)}
    />
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const [state, setState] = useState({ loading: true, product: null });
  const [added, setAdded] = useState(false);
  const { products: allProducts, loading: suggestionsLoading } = useProducts({ limit: '12' });

  useEffect(() => {
    let active = true;
    setState({ loading: true, product: null });
    productsApi
      .getBySlug(slug)
      .then(({ product }) => {
        if (active) setState({ loading: false, product });
      })
      .catch(() => {
        if (active) setState({ loading: false, product: null });
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (state.loading)
    return (
      <section className="section product-unavailable">
        <div className="table-loading">Loading ritual…</div>
      </section>
    );
  if (!state.product)
    return (
      <section className="section product-unavailable">
        <EmptyState
          title="This ritual is not available right now"
          text="Product details will appear here when this item is published."
          action="Return to the shop"
        />
      </section>
    );

  const { product } = state;
  const images = product.images || [];
  const suggested = allProducts
    .filter((item) => item.id !== product.id)
    .sort(
      (a, b) => Number(b.category === product.category) - Number(a.category === product.category)
    )
    .slice(0, 4);
  const addProduct = () => {
    add({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: images.find((image) => image.isPrimary)?.url || images[0]?.url || '',
      price: product.price,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <>
      <section className="section product-detail">
        <div className="detail-gallery" aria-label={`${product.name} photos`}>
          {images.length ? (
            images.map((image, index) => (
              <GalleryPhoto image={image} name={product.name} index={index} key={image.url} />
            ))
          ) : (
            <div className="product-image detail-placeholder">Image coming soon</div>
          )}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          {product.offer && <span className="detail-sale-badge">{offerLabel(product)}</span>}
          <p className={`detail-price${product.offer ? ' has-offer' : ''}`}>
            <strong>₹{product.price}</strong>
            {product.offer && <del>₹{product.regularPrice}</del>}
          </p>
          <p className={`stock ${product.stock.state}`}>{product.stock.label}</p>
          <p>{product.description || product.shortDescription}</p>
          {product.ingredients?.length > 0 && (
            <div>
              <h3>Ingredients</h3>
              <p>{product.ingredients.join(', ')}</p>
            </div>
          )}
          {product.directions && (
            <div>
              <h3>How to use</h3>
              <p>{product.directions}</p>
            </div>
          )}
          <button
            className={`button add-to-bag-button${added ? ' is-added' : ''}`}
            disabled={product.stock.state === 'out_of_stock'}
            onClick={addProduct}
          >
            {product.stock.state === 'out_of_stock'
              ? 'Out of stock'
              : added
                ? 'Added to bag ✓'
                : 'Add to bag'}
          </button>
          <button
            type="button"
            className={`detail-wishlist-button${has(product) ? ' is-saved' : ''}`}
            onClick={() => toggle(product)}
            aria-pressed={has(product)}
          >
            {has(product) ? '♥ Saved to wishlist' : '♡ Save to wishlist'}
          </button>
        </div>
      </section>
      {(suggestionsLoading || suggested.length > 0) && (
        <section className="section suggested-products">
          <SectionHeading eyebrow="More to explore" title="You may also love" />
          <ProductGrid products={suggested} loading={suggestionsLoading} />
        </section>
      )}
    </>
  );
}
