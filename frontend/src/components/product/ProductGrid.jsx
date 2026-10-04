import EmptyState from '../common/EmptyState';
import ProductCard from './ProductCard';
export default function ProductGrid({ products = [], loading }) {
  if (loading)
    return (
      <div className="loading-grid">
        <i />
        <i />
        <i />
      </div>
    );
  if (!products.length) return <EmptyState />;
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id || product._id} product={product} />
      ))}
    </div>
  );
}
