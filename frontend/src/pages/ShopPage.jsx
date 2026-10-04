import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import { useProducts } from '../hooks/useProducts';
const categories = ['All rituals', 'Hair care', 'Skin care', 'Cleansing'];
export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const active = params.get('category') || 'All rituals';
  const { products, loading } = useProducts({
    category: active === 'All rituals' ? '' : active,
    sort: params.get('sort') || 'newest',
  });
  const setCategory = (category) => {
    const next = new URLSearchParams(params);
    category === 'All rituals' ? next.delete('category') : next.set('category', category);
    setParams(next);
  };
  return (
    <section className="shop-page section">
      <div className="page-intro">
        <p className="eyebrow">The collection</p>
        <h1>Care, in its own time.</h1>
        <p>Our catalogue will be shaped by fresh, small-batch releases.</p>
      </div>
      <div className="shop-tools">
        <div className="filter-tabs">
          {categories.map((category) => (
            <button
              className={active === category ? 'active' : ''}
              onClick={() => setCategory(category)}
              key={category}
            >
              {category}
            </button>
          ))}
        </div>
        <select
          aria-label="Sort products"
          value={params.get('sort') || 'newest'}
          onChange={(e) => {
            const next = new URLSearchParams(params);
            next.set('sort', e.target.value);
            setParams(next);
          }}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>
      <ProductGrid products={products} loading={loading} />
    </section>
  );
}
