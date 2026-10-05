import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import EmptyAdminState from '../components/EmptyAdminState';
import Status from '../components/Status';
const blank = {
  name: '',
  sku: '',
  category: '',
  shortDescription: '',
  description: '',
  ingredients: [],
  directions: '',
  regularPrice: '',
  stockQuantity: 0,
  lowStockThreshold: 10,
  status: 'draft',
};
function ProductForm({ product, onSaved, close }) {
  const [data, setData] = useState(() =>
    product ? { ...product, ingredientsText: (product.ingredients || []).join('\n') } : { ...blank }
  );
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    adminApi.categories().then(({ categories: list }) => setCategories(list)).catch(() => setCategories([]));
  }, []);
  const set = (key, value) => setData((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...data,
        regularPrice: Number(data.regularPrice),
        stockQuantity: Number(data.stockQuantity),
        lowStockThreshold: Number(data.lowStockThreshold),
        ingredients:
          data.ingredientsText
            ?.split('\n')
            .map((v) => v.trim())
            .filter(Boolean) || [],
      };
      const savedProduct = product
        ? (await adminApi.updateProduct(product._id, payload)).product
        : (await adminApi.createProduct(payload)).product;
      if (images.length) {
        const form = new FormData();
        images.forEach((image) => form.append('images', image));
        try {
          await adminApi.uploadImages(savedProduct._id, form);
        } catch (uploadError) {
          onSaved(`Product saved, but image upload failed: ${uploadError.message}`);
          close();
          setBusy(false);
          return;
        }
      }
      onSaved();
      close();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="modal-backdrop">
      <form className="modal product-form" onSubmit={submit}>
        <div className="modal-title">
          <h2>{product ? 'Edit product' : 'New product'}</h2>
          <button type="button" onClick={close}>
            ×
          </button>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-grid">
          <label>
            Name
            <input required value={data.name} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label>
            SKU
            <input required value={data.sku} onChange={(e) => set('sku', e.target.value)} />
          </label>
          <label>
            Category
            <select
              required
              value={data.category}
              onChange={(e) => set('category', e.target.value)}
            >
              <option value="" disabled>
                Choose a category
              </option>
              {data.category && !categories.some((category) => category.name === data.category) && (
                <option value={data.category}>{data.category} (existing)</option>
              )}
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <a className="category-manage-link" href="/admin/categories">+ Create or manage categories</a>
          </label>
          <label>
            Regular price (₹)
            <input
              required
              min="0"
              type="number"
              value={data.regularPrice}
              onChange={(e) => set('regularPrice', e.target.value)}
            />
          </label>
          <label>
            Initial stock
            <input
              required
              min="0"
              type="number"
              value={data.stockQuantity}
              onChange={(e) => set('stockQuantity', e.target.value)}
            />
          </label>
          <label>
            Low-stock threshold
            <input
              required
              min="0"
              type="number"
              value={data.lowStockThreshold}
              onChange={(e) => set('lowStockThreshold', e.target.value)}
            />
          </label>
          <label>
            Status
            <select value={data.status} onChange={(e) => set('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>
        <div className="image-upload-field">
          <label htmlFor="product-images">Product images</label>
          <span>
            {product?.images?.length
              ? `${product.images.length} image${product.images.length === 1 ? '' : 's'} already saved. `
              : ''}
            Up to 10 JPG, PNG or WebP images total (5 MB each). First image is the cover.
          </span>
          {product?.images?.length > 0 && (
            <div className="existing-product-images">
              {product.images.map((image) => (
                <img key={image._id || image.url} src={image.url} alt={image.alt || product.name} />
              ))}
            </div>
          )}
          <input
            id="product-images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={(product?.images?.length || 0) >= 10}
            onChange={(e) =>
              setImages(
                Array.from(e.target.files || []).slice(
                  0,
                  Math.max(0, 10 - (product?.images?.length || 0))
                )
              )
            }
          />
          {images.length > 0 && (
            <span className="selected-images">
              {images.length} new image{images.length === 1 ? '' : 's'} selected:{' '}
              {images.map((image) => image.name).join(', ')}
            </span>
          )}
        </div>
        <label>
          Short description
          <textarea
            value={data.shortDescription}
            onChange={(e) => set('shortDescription', e.target.value)}
          />
        </label>
        <label>
          Full description
          <textarea value={data.description} onChange={(e) => set('description', e.target.value)} />
        </label>
        <label>
          Ingredients (one per line)
          <textarea
            value={data.ingredientsText || ''}
            onChange={(e) => set('ingredientsText', e.target.value)}
          />
        </label>
        <label>
          Directions
          <textarea value={data.directions} onChange={(e) => set('directions', e.target.value)} />
        </label>
        <button disabled={busy}>
          {busy ? 'Saving product…' : product ? 'Save changes' : 'Create product'}
        </button>
      </form>
    </div>
  );
}
export default function ProductsPage() {
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    setLoadError('');
    return adminApi
      .products(search ? `?search=${encodeURIComponent(search)}` : '')
      .then(({ products }) => setProducts(products))
      .catch((error) => {
        setProducts([]);
        setLoadError(error.message);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    void load();
  }, []);
  const openNew = () => {
    setEditing(null);
    setForm(true);
  };
  const openEdit = (product) => {
    setEditing(product);
    setForm(true);
  };
  const close = () => {
    setForm(false);
    setEditing(null);
  };
  return (
    <section>
      <div className="page-heading">
        <div>
          <h2>Products</h2>
          <p>Products stay private until you publish them.</p>
        </div>
        <button onClick={openNew}>+ New product</button>
      </div>
      <div className="toolbar">
        <input
          placeholder="Search name or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="secondary" onClick={() => void load()}>
          Search
        </button>
      </div>
      {notice && (
        <div className="admin-error" role="status">
          <span>{notice}</span>
          <button className="secondary" onClick={() => setNotice('')}>
            Dismiss
          </button>
        </div>
      )}
      {loadError && (
        <div className="admin-error" role="alert">
          <span>{loadError}</span>
          <button className="secondary" onClick={() => void load()}>
            Try again
          </button>
        </div>
      )}
      {loading ? (
        <div className="table-loading">Loading products…</div>
      ) : !loadError && products?.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <strong>{p.name}</strong>
                    <small>{p.category}</small>
                    {p.images?.length > 0 && (
                      <small>
                        {p.images.length} image{p.images.length === 1 ? '' : 's'}
                      </small>
                    )}
                  </td>
                  <td>{p.sku}</td>
                  <td>₹{p.regularPrice}</td>
                  <td>{p.stockQuantity}</td>
                  <td>
                    <Status tone={p.status}>{p.status}</Status>
                  </td>
                  <td>
                    <button className="secondary" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loadError && (
          <EmptyAdminState
            title="No products yet"
            text="Create a private draft when product details are ready. Nothing has been invented or published."
          />
        )
      )}
      {form && (
        <ProductForm
          key={editing?._id || 'new-product'}
          product={editing}
          onSaved={(message) => {
            void load();
            if (message) setNotice(message);
          }}
          close={close}
        />
      )}
    </section>
  );
}
