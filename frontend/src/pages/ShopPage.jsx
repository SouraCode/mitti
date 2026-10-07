import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const active = params.get('category') || 'All rituals';
  const categories = ['All rituals', ...useCategories().map((category) => category.name)];
  const search = params.get('search') || '';
  const { products, loading } = useProducts({
    category: active === 'All rituals' ? '' : active,
    search,
    sort: params.get('sort') || 'newest',
  });
  const setCategory = (category) => {
    const next = new URLSearchParams(params);
    category === 'All rituals' ? next.delete('category') : next.set('category', category);
    setParams(next);
  };
  return (
    <section className="shop-page section">
      <div className="shop-heading">
        <div>
          <p className="eyebrow">The collection</p>
          <h1>{search ? `Results for “${search}”` : 'Shop all rituals'}</h1>
        </div>
        {!loading && <span>{products.length} {products.length === 1 ? 'product' : 'products'}</span>}
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
