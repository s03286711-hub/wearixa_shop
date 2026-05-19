'use client';
import '@/app/admin/animations.css';
import { useEffect, useState } from 'react';
import { categoryService } from '@/services';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Trash2, Edit, Plus, X, Tag, FolderOpen, ImageIcon, Cpu, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await categoryService.delete(id);
      fetchCategories();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (c: any) => {
    setEditingCategory(c);
    setForm({
      name: c.name,
      description: c.description || '',
      image: c.image || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory._id, form);
      } else {
        await categoryService.create(form);
      }
      setShowModal(false);
      setEditingCategory(null);
      setForm({ name: '', description: '', image: '' });
      fetchCategories();
    } catch (err) { console.error(err); }
  };

  // Telemetry computations
  const totalCategories = categories.length;
  const categoriesWithImage = categories.filter(c => c.image).length;
  const averageNameLength = totalCategories > 0 
    ? Math.round(categories.reduce((acc, c) => acc + c.name.length, 0) / totalCategories) 
    : 0;

  return (
    <div>
      {/* Telemetry Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Taxonomies Management <span style={{ fontSize: '0.72rem', background: 'rgba(201, 168, 76, 0.1)', color: 'var(--color-accent)', padding: '4px 10px', borderRadius: '20px', fontFamily: 'monospace', fontWeight: 'bold' }}>METRICS_DECK</span>
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Hierarchical categorization and taxonomy control center</p>
        </div>
        <button onClick={() => { setEditingCategory(null); setShowModal(true); }} className="btn-primary hover-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(201, 168, 76, 0.25)' }}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* KPI Cards section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { title: 'Taxonomy Volume', val: totalCategories, label: 'Active segments', color: 'var(--color-accent)', icon: FolderOpen, kpiClass: 'kpi-card' },
          { title: 'Visual Coverage', val: `${categoriesWithImage}/${totalCategories}`, label: 'Catalog with assets', color: '#10b981', icon: ImageIcon, kpiClass: 'kpi-card-green' },
          { title: 'System Security', val: 'SECURE', label: 'Protocol status', color: '#60a5fa', icon: Cpu, kpiClass: 'kpi-card-blue' },
          { title: 'Semantic Depth', val: `${averageNameLength} char`, label: 'Avg category length', color: '#f59e0b', icon: Sparkles, kpiClass: 'kpi-card-orange' },
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
                <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>{card.val}</h3>
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

      {loading ? <LoadingSpinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {categories.map((c, i) => (
              <motion.div 
                key={c._id} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="glass glass-container" 
                style={{ 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  background: 'rgba(255, 255, 255, 0.015)',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.25)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(201, 168, 76, 0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Image layout container with overlay */}
                <div style={{ height: '160px', background: 'var(--color-surface-2)', position: 'relative', overflow: 'hidden' }}>
                  <img src={c.image || 'https://placehold.co/400x200?text=' + encodeURIComponent(c.name)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,13,0.8), transparent)' }} />
                  
                  {/* Floating Action Controls */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button onClick={() => handleEdit(c)} style={{
                      background: 'rgba(13, 13, 13, 0.6)',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'var(--color-muted)',
                      padding: '8px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(c._id, c.name)} style={{
                      background: 'rgba(13, 13, 13, 0.6)',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'var(--color-muted)',
                      padding: '8px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  {/* Bottom Image Tag overlay */}
                  <span style={{ position: 'absolute', bottom: '12px', left: '16px', fontSize: '0.65rem', background: 'rgba(201, 168, 76, 0.15)', border: '1px solid rgba(201, 168, 76, 0.25)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: '10px', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    active_segment
                  </span>
                </div>
                
                {/* Description details */}
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.6rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>{c.name}</h3>
                  <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', lineHeight: '1.6', height: '48px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {c.description || 'No description provided for this luxury catalog taxonomy segment.'}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {categories.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
              <Tag size={40} style={{ color: 'var(--color-muted)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--color-muted)' }}>No categories found. Create your first one!</p>
            </div>
          )}
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '440px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Name</label>
                <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Description</label>
                <textarea className="input-field" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Image URL</label>
                <input className="input-field" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
