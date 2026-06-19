'use client';
import '@/app/admin/animations.css';
import { useEffect, useState } from 'react';
import { productService, categoryService } from '@/services';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Trash2, Edit, Plus, X, Upload, Search, Loader2, CheckCircle, 
  Package, DollarSign, AlertTriangle, Layers, ArrowRight, ShieldCheck, Tag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
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
    dealType: '',
    shippingCharges: '',
    applyShippingCharges: false,
    isCodAvailable: true,
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
    setForm({ title: '', description: '', price: '', discountPrice: '', brand: '', category: '', stock: '', images: [], sizes: [], colors: [], dealType: '', shippingCharges: '', applyShippingCharges: false, isCodAvailable: true });
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
      dealType: p.dealType || '',
      shippingCharges: p.shippingCharges ? p.shippingCharges.toString() : '0',
      applyShippingCharges: p.applyShippingCharges || false,
      isCodAvailable: p.isCodAvailable !== undefined ? p.isCodAvailable : true,
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
    formData.append('sizes', form.sizes.join(','));
    formData.append('colors', form.colors.join(','));
    formData.append('dealType', form.dealType);
    formData.append('shippingCharges', form.shippingCharges || '0');
    formData.append('applyShippingCharges', form.applyShippingCharges.toString());
    formData.append('isCodAvailable', form.isCodAvailable.toString());

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

  // Telemetry metric computations
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;

  // Filter products by segment
  const filteredProducts = products.filter(p => {
    if (activeFilter === 'low') return p.stock > 0 && p.stock < 10;
    if (activeFilter === 'out') return p.stock === 0;
    if (activeFilter === 'free') return !p.applyShippingCharges;
    return true;
  });

  return (
    <div>
      {/* Upper header action area */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Products Management <span style={{ fontSize: '0.72rem', background: 'rgba(201, 168, 76, 0.1)', color: 'var(--color-accent)', padding: '4px 10px', borderRadius: '20px', fontFamily: 'monospace', fontWeight: 'bold' }}>PORTAL_V2</span>
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Real-time inventory and catalog status telemetry</p>
        </div>
        <button onClick={() => { setEditingProduct(null); setSubmitError(''); setSuccessMsg(''); setShowModal(true); }} className="btn-primary hover-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(201, 168, 76, 0.25)' }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Telemetry KPI Stats Summary Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { title: 'Catalog Volume', val: totalProducts, label: 'Active listings', color: 'var(--color-accent)', icon: Package, kpiClass: 'kpi-card' },
          { title: 'Inventory Val', val: `Rs. ${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label: 'Asset appraisal', color: '#10b981', icon: DollarSign, kpiClass: 'kpi-card-green' },
          { title: 'Critical Stock', val: outOfStockCount, label: 'Depleted entries', color: '#ef4444', icon: AlertTriangle, pulse: outOfStockCount > 0, kpiClass: 'kpi-card-rose' },
          { title: 'Low Allocations', val: lowStockCount, label: 'Restock advised', color: '#f59e0b', icon: Layers, pulse: lowStockCount > 0, kpiClass: 'kpi-card-orange' },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`glass ${card.kpiClass}`}
              style={{
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.015)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.title}</span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {card.val}
                  {card.pulse && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: card.color,
                      boxShadow: `0 0 8px ${card.color}`,
                      animation: 'pulse 1.8s infinite alternate'
                    }} />
                  )}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{card.label}</span>
              </div>
              <div 
                className="kpi-icon-container"
                style={{
                  background: `rgba(255, 255, 255, 0.03)`,
                  borderRadius: '8px',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={24} style={{ filter: `drop-shadow(0 0 4px ${card.color}44)` }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Cyber Search & Segment Toolbar */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input className="input-field" placeholder="Search product serials, category name..." value={keyword} onChange={e => setKeyword(e.target.value)} style={{ paddingLeft: '40px' }} />
        </div>

        {/* Quick Filter Pill Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Catalog', count: totalProducts },
            { id: 'low', label: 'Low Allocations', count: lowStockCount, color: '#f59e0b' },
            { id: 'out', label: 'Depleted Stock', count: outOfStockCount, color: '#ef4444' },
            { id: 'free', label: 'Complimentary Shipping', count: products.filter(p => !p.applyShippingCharges).length },
          ].map(filt => (
            <button
              key={filt.id}
              onClick={() => setActiveFilter(filt.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: activeFilter === filt.id ? '1px solid var(--color-accent)' : '1px solid rgba(255, 255, 255, 0.06)',
                background: activeFilter === filt.id ? 'rgba(201, 168, 76, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: activeFilter === filt.id ? 'var(--color-accent)' : 'var(--color-muted)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                fontWeight: activeFilter === filt.id ? '700' : '400',
                transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={e => {
                if (activeFilter !== filt.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (activeFilter !== filt.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.color = 'var(--color-muted)';
                }
              }}
            >
              {filt.label}
              <span style={{
                background: activeFilter === filt.id ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.08)',
                color: activeFilter === filt.id ? '#0d0d0d' : 'var(--color-muted)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: '700'
              }}>{filt.count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Product', 'Category', 'Price', 'Stock Status', 'Brand', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'var(--color-muted)', fontWeight: '500', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredProducts.map((p, idx) => (
                    <motion.tr 
                      key={p._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                      className="ledger-row" 
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '52px', borderRadius: '4px', overflow: 'hidden', background: 'var(--color-surface-2)', flexShrink: 0, border: '1px solid rgba(255,255,255,0.04)' }}>
                            <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <span style={{ fontWeight: '500' }}>{p.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--color-muted)' }}>{p.category?.name || 'N/A'}</td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: '600' }}>Rs. {p.price.toFixed(2)}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: p.stock === 0 ? '#ef4444' : p.stock < 10 ? '#f59e0b' : '#10b981',
                            boxShadow: p.stock === 0 
                              ? '0 0 8px #ef4444' 
                              : p.stock < 10 
                                ? '0 0 8px #f59e0b' 
                                : '0 0 8px #10b981',
                          }} />
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '0.78rem',
                            fontWeight: 'bold',
                            color: p.stock === 0 ? '#f87171' : p.stock < 10 ? '#fbbf24' : '#34d399'
                          }}>
                            {p.stock === 0 ? 'OUT_OF_STOCK' : p.stock < 10 ? `LOW_STOCK (${p.stock})` : `STABLE (${p.stock})`}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--color-muted)' }}>{p.brand}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEdit(p)} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-muted)', padding: '6px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.background = 'rgba(201, 168, 76, 0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(p._id, p.title)} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-muted)', padding: '6px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass animate-fade-in admin-modal-content" style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
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

              <div className="admin-form-grid-3">
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Price (Rs.)</label>
                  <input className="input-field" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required disabled={submitting} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Discount (Rs.)</label>
                  <input className="input-field" type="number" step="0.01" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} placeholder="Optional" disabled={submitting} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Stock</label>
                  <input className="input-field" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required disabled={submitting} />
                </div>
              </div>

              <div className="admin-form-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Shipping</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <input 
                      type="checkbox" 
                      id="ship-toggle"
                      checked={form.applyShippingCharges} 
                      onChange={e => setForm(f => ({ ...f, applyShippingCharges: e.target.checked }))} 
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent)' }}
                    />
                    <label htmlFor="ship-toggle" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                      {form.applyShippingCharges ? 'Charges Apply' : 'Free Shipping'}
                    </label>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>COD Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <input 
                      type="checkbox" 
                      id="cod-toggle"
                      checked={form.isCodAvailable} 
                      onChange={e => setForm(f => ({ ...f, isCodAvailable: e.target.checked }))} 
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent)' }}
                    />
                    <label htmlFor="cod-toggle" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                      {form.isCodAvailable ? 'COD Allowed' : 'Prepaid Only'}
                    </label>
                  </div>
                </div>
              </div>

              {form.applyShippingCharges && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Base Shipping Rate (Rs.)</label>
                  <input className="input-field" type="number" step="0.01" value={form.shippingCharges} onChange={e => setForm(f => ({ ...f, shippingCharges: e.target.value }))} placeholder="0" disabled={submitting} />
                </div>
              )}
              <div className="admin-form-grid-3">
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Deal / Season</label>
                  <select className="input-field" value={form.dealType} onChange={e => setForm(f => ({ ...f, dealType: e.target.value }))} disabled={submitting}>
                    <option value="">None</option>
                    <option value="Summer Collection">Summer Collection</option>
                    <option value="Winter Collection">Winter Collection</option>
                    <option value="Eid Special">Eid Special</option>
                    <option value="Independence Day">Independence Day</option>
                    <option value="Holiday Deal">Holiday Deal</option>
                    <option value="Christmas Offer">Christmas Offer</option>
                    <option value="Holi Special">Holi Special</option>
                  </select>
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

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse {
          0% { transform: scale(0.92); opacity: 0.6; }
          100% { transform: scale(1.1); opacity: 1; }
        }
        
        .admin-form-grid-5 {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }
        
        .admin-form-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .admin-form-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .admin-form-grid-5,
          .admin-form-grid-3,
          .admin-form-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
          .admin-modal-content {
            padding: 0.5rem !important;
            width: 95% !important;
            max-height: 95vh !important;
          }
          .admin-modal-content form {
            padding: 1rem !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
