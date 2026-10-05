import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import ProductGrid from '../components/product/ProductGrid';
import { useWishlist } from '../context/WishlistContext';

export default function WishlistPage() {
  const { items } = useWishlist();
  return (
    <section className="section wishlist-page">
      <div className="page-intro">
        <p className="eyebrow">Your saved rituals</p>
        <h1>Wishlist</h1>
        <p>Keep the products you love close for your next self-care moment.</p>
      </div>
      {items.length ? (
        <ProductGrid products={items} />
      ) : (
        <EmptyState
          title="Your wishlist is waiting."
          text="Tap the heart on any product to save it here."
          action="Discover the collection"
        />
      )}
      {items.length > 0 && <Link className="text-link wishlist-continue" to="/shop">Continue shopping →</Link>}
    </section>
  );
}
