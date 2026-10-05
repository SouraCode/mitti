import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import EmptyAdminState from '../components/EmptyAdminState';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => {
    setError('');
    try {
      const { categories: list } = await adminApi.categories();
      setCategories(list);
    } catch (e) {
      setCategories([]);
      setError(e.message);
    }
  };
  useEffect(() => { void load(); }, []);
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true); setError('');
    try {
      const { category } = await adminApi.createCategory(trimmed);
      if (image) {
        const form = new FormData();
        form.append('image', image);
        await adminApi.uploadCategoryImage(category._id, form);
      }
      setName(''); setImage(null);
      form.reset();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const uploadImage = async (category, file) => {
    if (!file) return;
    setBusy(true); setError('');
    try {
      const form = new FormData();
      form.append('image', file);
      await adminApi.uploadCategoryImage(category._id, form);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (category) => {
    if (!window.confirm(`Remove the category “${category.name}”? Products will not be deleted.`)) return;
    setBusy(true); setError('');
    try {
      await adminApi.removeCategory(category._id);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return <section>
    <div className="page-heading"><div><h2>Categories</h2><p>Create separate product categories. They are not derived from product names.</p></div></div>
    <form className="category-form category-create-form" onSubmit={submit}>
      <label htmlFor="category-name">Category name<input id="category-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Body care" maxLength="80" /></label>
      <label htmlFor="category-image">Category image <input id="category-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImage(e.target.files?.[0] || null)} /></label>
      <button disabled={busy}>{busy ? 'Creating…' : 'Create category'}</button>
    </form>
    <p className="category-help">Add a name and optional JPG, PNG, or WebP image (up to 5 MB). Every category you create appears on the storefront.</p>
    {error && <div className="admin-error" role="alert"><span>{error}</span><button className="secondary" type="button" onClick={() => void load()}>Try again</button></div>}
    {categories.length ? <div className="category-card-grid">{categories.map((category) => <article className="category-admin-card" key={category._id}><div className="category-admin-image">{category.image?.url ? <img src={category.image.url} alt={category.name} /> : <span>No image</span>}</div><div><strong>{category.name}</strong><small>{category.image?.url ? 'Image uploaded' : 'Add or replace the image below'}</small><label className="category-image-replace">{category.image?.url ? 'Replace image' : 'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => void uploadImage(category, e.target.files?.[0])} /></label><button className="category-remove" type="button" disabled={busy} onClick={() => void remove(category)}>Remove category</button></div></article>)}</div> : <EmptyAdminState title="No categories yet" text="Start by creating categories, then assign one while creating a product." />}
  </section>;
}
