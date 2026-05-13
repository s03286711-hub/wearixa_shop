'use client';
import { useEffect, useState } from 'react';
import { productService, categoryService } from '@/services';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Trash2, Edit, Plus, X, Upload, Search, Loader2, CheckCircle } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [keyword, setKeyword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    brand: '',
    category: '',
    stock: '',
    images: [] as File[],
    sizes: [] as string[],
    colors: [] as string[],
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll({ keyword, pageSize: 50 });
      setProducts(data.products || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [keyword]);
  useEffect(() => { categoryService.getAll().then(setCategories); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete product "${title}"?`)) return;
    try {
      await productService.delete(id);
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setSubmitError('');
    setSuccessMsg('');
    setForm({ title: '', description: '', price: '', discountPrice: '', brand: '', category: '', stock: '', images: [], sizes: [], colors: [] });
  };

  const handleEdit = (p: any) => {
    setEditingProduct(p);
    setSubmitError('');
    setSuccessMsg('');
    setForm({
      title: p.title,
      description: p.description,
      price: p.price.toString(),
      discountPrice: p.discountPrice ? p.discountPrice.toString() : '',
      brand: p.brand,
      category: p.category?._id || p.category,
      stock: p.stock.toString(),
      images: [],
      sizes: p.sizes || [],
      colors: p.colors || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('price', form.price);
    if (form.discountPrice) formData.append('discountPrice', form.discountPrice);
    formData.append('brand', form.brand);
    formData.append('category', form.category);
    formData.append('stock', form.stock);
    form.sizes.forEach(s => formData.append('sizes', s));
    form.colors.forEach(c => formData.append('colors', c));

    if (form.images.length > 0) {
      form.images.forEach(img => formData.append('images', img));
    }

    try {
      if (editingProduct) {
        await productService.update(editingProduct._id, formData);
        setSuccessMsg('Product updated successfully!');
      } else {
        await productService.create(formData);
        setSuccessMsg('Product created successfully!');
      }
      fetchProducts();
      setTimeout(() => {
        closeModal();
      }, 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '600' }}>Products Management</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: '4px' }}>{products.length} products total</p>
        </div>
        <button onClick={() => { setEditingProduct(null); setSubmitError(''); setSuccessMsg(''); setShowModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input className="input-field" placeholder="Search products..." value={keyword} onChange={e => setKeyword(e.target.value)} style={{ paddingLeft: '40px' }} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Brand', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'var(--color-muted)', fontWeight: '500', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '52px', borderRadius: '4px', overflow: 'hidden', background: 'var(--color-surface-2)', flexShrink: 0 }}>
                          <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontWeight: '500' }}>{p.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-muted)' }}>{p.category?.name || 'N/A'}</td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: '600' }}>${p.price.toFixed(2)}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ color: p.stock < 10 ? '#f87171' : 'inherit' }}>{p.stock}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-muted)' }}>{p.brand}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(p)} style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-muted)', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(p._id, p.title)} style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-muted)', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} disabled={submitting} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.5 : 1 }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Error message */}
              {submitError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.875rem 1rem', color: '#f87171', fontSize: '0.875rem' }}>
                  ⚠️ {submitError}
                </div>
              )}

              {/* Success message */}
              {successMsg && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '0.875rem 1rem', color: '#4ade80', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} /> {successMsg}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Title</label>
                <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required disabled={submitting} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Description</label>
                <textarea className="input-field" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} required disabled={submitting} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Price ($)</label>
                  <input className="input-field" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required disabled={submitting} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Discount ($)</label>
                  <input className="input-field" type="number" step="0.01" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} placeholder="Optional" disabled={submitting} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Stock</label>
                  <input className="input-field" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required disabled={submitting} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required disabled={submitting}>
                    <option value="">Select Category</option>
                    {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Brand</label>
                  <input className="input-field" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} required disabled={submitting} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Sizes <span style={{ color: 'var(--color-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => {
                    const selected = form.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={submitting}
                        onClick={() => setForm(f => ({
                          ...f,
                          sizes: selected
                            ? f.sizes.filter(s => s !== size)
                            : [...f.sizes, size]
                        }))}
                        style={{
                          padding: '6px 18px',
                          borderRadius: '6px',
                          border: selected ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
                          background: selected ? 'rgba(201,168,76,0.15)' : 'transparent',
                          color: selected ? 'var(--color-accent)' : 'var(--color-muted)',
                          fontWeight: selected ? '700' : '400',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s',
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {form.sizes.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>No sizes selected — product will show without size options.</p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Colors <span style={{ color: 'var(--color-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {[
                    { name: 'Black', hex: '#000000' },
                    { name: 'White', hex: '#FFFFFF' },
                    { name: 'Red', hex: '#FF0000' },
                    { name: 'Blue', hex: '#0000FF' },
                    { name: 'Green', hex: '#008000' },
                    { name: 'Gray', hex: '#808080' },
                    { name: 'Beige', hex: '#F5F5DC' },
                    { name: 'Gold', hex: '#D4AF37' }
                  ].map(color => {
                    const selected = form.colors.includes(color.name);
                    return (
                      <button
                        key={color.name}
                        type="button"
                        title={color.name}
                        disabled={submitting}
                        onClick={() => setForm(f => ({
                          ...f,
                          colors: selected
                            ? f.colors.filter(c => c !== color.name)
                            : [...f.colors, color.name]
                        }))}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: color.hex,
                          border: selected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: selected ? '0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-accent)' : 'none',
                        }}
                      >
                        {color.name === 'White' && !selected && <div style={{ width: '100%', height: '100%', border: '1px solid #ddd', borderRadius: '50%' }} />}
                      </button>
                    );
                  })}
                </div>
                {form.colors.length > 0 && (
                   <p style={{ fontSize: '0.75rem', color: 'var(--color-accent)', marginTop: '0.75rem' }}>
                     Selected: {form.colors.join(', ')}
                   </p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Images</label>
                <div style={{ border: '2px dashed var(--color-border)', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'border-color 0.3s', opacity: submitting ? 0.6 : 1 }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                  onClick={() => { if (!submitting) document.getElementById('img-upload')?.click(); }}
                >
                  <Upload size={32} style={{ color: 'var(--color-muted)', marginBottom: '1rem' }} />
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    {form.images.length > 0 ? `${form.images.length} image(s) selected ✓ — click to change` : 'Click to upload images (Max 5)'}
                  </p>
                  <input id="img-upload" type="file" multiple accept="image/*" onChange={e => {
                    if (e.target.files) setForm(f => ({ ...f, images: Array.from(e.target.files!) }));
                  }} style={{ display: 'none' }} disabled={submitting} />
                  {form.images.length > 0 && (
                    <p style={{ marginTop: '0.75rem', color: 'var(--color-accent)', fontWeight: '600', fontSize: '0.85rem' }}>
                      {form.images.map(f => f.name).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: submitting ? 0.8 : 1 }}>
                {submitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    {editingProduct ? 'Updating...' : 'Creating...'}
                    {form.images.length > 0 && ' (Uploading images...)'}
                  </>
                ) : (
                  editingProduct ? 'Update Product' : 'Create Product'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
