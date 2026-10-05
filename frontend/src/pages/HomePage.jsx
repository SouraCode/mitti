import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useWishlist } from '../context/WishlistContext';

const icons = {
  drop: <path d="M12 3.5S6.5 10 6.5 14.2a5.5 5.5 0 0 0 11 0C17.5 10 12 3.5 12 3.5Z" />,
  sparkle: <><path d="m12 3 1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3Z" /><path d="m19 3 .5 2.5L22 6l-2.5.5L19 9l-.5-2.5L16 6l2.5-.5L19 3Z" /></>,
  leaf: <><path d="M19.5 4.5C11 4.5 5.5 8.7 5.5 15.2c0 2.2 1.4 4.3 3.7 4.3 6.5 0 10.3-7.4 10.3-15Z" /><path d="M4 20c3.3-4 7.2-6.9 12-9" /></>,
  waves: <><path d="M3 8c2.2-2 4.4-2 6.6 0s4.4 2 6.6 0 4.4-2 5.8 0" /><path d="M3 13c2.2-2 4.4-2 6.6 0s4.4 2 6.6 0 4.4-2 5.8 0" /><path d="M3 18c2.2-2 4.4-2 6.6 0s4.4 2 6.6 0 4.4-2 5.8 0" /></>,
  shield: <><path d="M12 3.5 19 6v5.2c0 4.4-2.8 7.4-7 9.3-4.2-1.9-7-4.9-7-9.3V6l7-2.5Z" /><path d="m8.8 12.4 2.1 2.1 4.4-4.5" /></>,
  arrow: <><path d="M4 12h15" /><path d="m14 6 6 6-6 6" /></>,
  home: <><path d="m3.5 10 8.5-7 8.5 7v10.5H14v-6h-4v6H3.5V10Z" /></>,
  bag: <><path d="M5 8h14l1 12H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
  heart: <path d="M20.8 8.8c0 5-8.8 10.7-8.8 10.7S3.2 13.8 3.2 8.8A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.8 2.2Z" />,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
};

function Icon({ name, size = 24 }) {
  return <svg aria-hidden="true" className="ritual-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

const categoryDetails = ['leaf', 'sparkle', 'drop', 'waves', 'shield'];

function formatProduct(product, index) {
  const regularPrice = Number(product.regularPrice);
  const price = Number(product.price);
  const offerPercent = product.offer && regularPrice > 0
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0;
  return {
    id: product.id || product._id,
    slug: product.slug,
    name: product.name,
    category: product.category || 'Daily skin essential',
    price,
    regularPrice,
    onOffer: Boolean(product.offer && offerPercent > 0),
    rating: product.rating?.average ? Number(product.rating.average).toFixed(1) : 'New',
    reviews: product.rating?.count ? `${product.rating.count} reviews` : 'No reviews yet',
    badge: offerPercent > 0 ? `${offerPercent}% off` : index === 0 ? 'Best seller' : '',
    image: product.images?.[0]?.url || '',
    source: product,
  };
}

export default function HomePage() {
  const { products, loading } = useProducts({ limit: '3' });
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const categories = useCategories();
  const featured = products.slice(0, 3).map(formatProduct);

  return (
    <div className="ritual-home">
      <section className="ritual-hero">
        <div className="ritual-hero-copy"><p className="ritual-overline">Botanical essentials</p><h1>Your skin,<br />but better.</h1><p>Clean formulas.<br />Visible results.</p><Link to="/shop" className="ritual-hero-button">Discover your routine <Icon name="arrow" size={17} /></Link></div>
        <div className="ritual-hero-image" role="img" aria-label="Woman enjoying a fresh skincare ritual" />
        <div className="ritual-product-bottle" aria-hidden="true"><span>MITTI</span><small>Glow<br />Face Serum</small><i>Vitamin C · 30 ml</i></div>
      </section>

      {categories.length > 0 && <section className="ritual-benefits ritual-categories" aria-label="Shop by category">
        {categories.map((category, index) => {
          const icon = categoryDetails[index % categoryDetails.length];
          return <Link to={`/shop?category=${encodeURIComponent(category.name)}`} key={category._id} className="ritual-benefit"><span className={category.image?.url ? 'has-category-image' : ''}>{category.image?.url ? <img src={category.image.url} alt="" /> : <Icon name={icon} size={26} />}</span><strong>{category.name}</strong></Link>;
        })}
      </section>}

      <section className="ritual-products" aria-labelledby="bestsellers-title">
        <div className="ritual-section-heading"><div><p className="ritual-overline">Made for your every day</p><h2 id="bestsellers-title">Bestsellers</h2></div><Link to="/shop">View all <Icon name="arrow" size={18} /></Link></div>
        <div className="ritual-product-grid">
          {featured.map((product) => <article className="ritual-product-card" key={product.id}>
            <Link to={product.slug ? `/products/${product.slug}` : '/shop'} className={`ritual-product-image${product.image ? '' : ' is-empty'}`}>{product.badge && <span>{product.badge}</span>}{product.image ? <img src={product.image} alt={product.name} /> : <em>Product photo<br />coming soon</em>}</Link>
            <button className={`ritual-wishlist-button${has(product.source) ? ' is-saved' : ''}`} onClick={() => toggle(product.source)} aria-label={`${has(product.source) ? 'Remove' : 'Add'} ${product.name} ${has(product.source) ? 'from' : 'to'} wishlist`} aria-pressed={has(product.source)}>{has(product.source) ? '♥' : '♡'}</button>
            <div className="ritual-product-info"><Link to={product.slug ? `/products/${product.slug}` : '/shop'}><h3>{product.name}</h3></Link><p>{product.category}</p><small>★ {product.rating} <i>({product.reviews})</i></small><div><span className="ritual-price"><strong>₹{product.price}</strong>{product.onOffer && <del>₹{product.regularPrice}</del>}</span><button onClick={() => add(product)} aria-label={`Add ${product.name} to bag`}>+</button></div></div>
          </article>)}
          {!loading && !featured.length && <p className="ritual-no-products">Products will appear here once they are published.</p>}
        </div>
      </section>

      <section className="ritual-quiz"><div><p className="ritual-overline">Personal care, simplified</p><h2>Build your perfect routine</h2><p>Find products matched to your skin.</p><Link to="/ritual-guide">Take skin quiz <Icon name="arrow" size={17} /></Link></div></section>

    </div>
  );
}
