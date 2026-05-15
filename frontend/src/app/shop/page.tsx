'use client';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { productService, categoryService } from '@/services';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { ProductSkeleton } from '@/components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import QuickViewModal from '@/components/QuickViewModal';

export default function ShopPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ShopPageContent />
    </Suspense>
  );
}

const COLORS = ['Black', 'White', 'Blue', 'Red', 'Gold', 'Silver', 'Beige', 'Green'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const MATERIALS = ['Silk', 'Cashmere', 'Cotton', 'Leather', 'Linen', 'Wool'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

type Metadata = {
  colors: { name: string; count: number }[];
  sizes: { name: string; count: number }[];
  materials: { name: string; count: number }[];
};

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', padding: '0 0 1rem 0' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '700', color: 'var(--color-accent)' }}>{title}</span>
        {open ? <ChevronUp size={14} style={{ color: 'var(--color-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--color-muted)' }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [metadata, setMetadata] = useState<Metadata>({ colors: [], sizes: [], materials: [] });

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sort: '',
    dealType: searchParams.get('dealType') || '',
    color: '',
    size: '',
    material: '',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize: 12 };
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.dealType) params.dealType = filters.dealType;
      if (filters.color) params.color = filters.color;
      if (filters.size) params.size = filters.size;
      if (filters.material) params.material = filters.material;

      const data = await productService.getAll(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      if (data.metadata) setMetadata(data.metadata);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { categoryService.getAll().then(setCategories); }, []);

  const clearFilters = () => {
    setFilters({ keyword: '', category: '', minPrice: '', maxPrice: '', sort: '', dealType: '', color: '', size: '', material: '' });
    setPage(1);
  };

  const activeFilterCount = [filters.category, filters.color, filters.size, filters.material, filters.minPrice, filters.keyword].filter(Boolean).length;

  const getCount = (list: { name: string; count: number }[], name: string) => list.find(i => i.name === name)?.count;

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingTop: '7rem', paddingBottom: '5rem' }}>
      <div className="container">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Discover</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '600' }}>
              {filters.keyword ? `Search: "${filters.keyword}"` : filters.dealType ? filters.dealType : 'All Collections'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>{total} products</span>
              {/* Sort */}
              <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                className="input-field" style={{ width: 'auto', fontSize: '0.85rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                <option value="">Sort By</option>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button onClick={() => setSidebarOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                <SlidersHorizontal size={15} /> Filters
                {activeFilterCount > 0 && <span className="badge">{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          {/* Active filter tags */}
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                {[
                  { key: 'color', label: filters.color },
                  { key: 'size', label: filters.size },
                  { key: 'material', label: filters.material },
                  { key: 'keyword', label: filters.keyword && `"${filters.keyword}"` },
                ].filter(f => f.label).map(f => (
                  <motion.button key={f.key} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => setFilters(prev => ({ ...prev, [f.key]: '' }))}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '20px', color: 'var(--color-accent)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500' }}>
                    {f.label} <X size={12} />
                  </motion.button>
                ))}
                <button onClick={clearFilters} style={{ padding: '4px 12px', background: 'none', border: '1px solid var(--color-border)', borderRadius: '20px', color: 'var(--color-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>Clear all</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Layout ── */}
        <div className="shop-layout" style={{ display: 'grid', gridTemplateColumns: sidebarOpen ? '260px 1fr' : '1fr', gap: '3rem', alignItems: 'start' }}>

          {/* ── Sidebar ── */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
                style={{ position: 'sticky', top: '100px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.75rem' }}>
                
                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                  <input className="input-field" value={filters.keyword} onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))}
                    placeholder="Search products..." style={{ paddingLeft: '36px', fontSize: '0.875rem' }} />
                </div>

                {/* Category */}
                <FilterSection title="Category">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input type="radio" name="cat" checked={!filters.category} onChange={() => setFilters(f => ({ ...f, category: '' }))} style={{ accentColor: 'var(--color-accent)' }} />
                      <span style={{ color: !filters.category ? 'var(--color-accent)' : 'var(--color-text)' }}>All Categories</span>
                    </label>
                    {categories.map((c: any) => (
                      <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.875rem' }}>
                        <input type="radio" name="cat" checked={filters.category === c._id} onChange={() => setFilters(f => ({ ...f, category: c._id }))} style={{ accentColor: 'var(--color-accent)' }} />
                        <span style={{ color: filters.category === c._id ? 'var(--color-accent)' : 'var(--color-text)' }}>{c.name}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Price Range */}
                <FilterSection title="Price Range">
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input className="input-field" type="number" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} placeholder="Min $" style={{ fontSize: '0.8rem', padding: '0.5rem' }} />
                    <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>–</span>
                    <input className="input-field" type="number" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} placeholder="Max $" style={{ fontSize: '0.8rem', padding: '0.5rem' }} />
                  </div>
                </FilterSection>

                {/* Size */}
                <FilterSection title="Size">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {SIZES.map(s => {
                      const cnt = getCount(metadata.sizes, s);
                      const active = filters.size === s;
                      return (
                        <button key={s} onClick={() => setFilters(f => ({ ...f, size: f.size === s ? '' : s }))}
                          style={{ padding: '5px 12px', borderRadius: '6px', border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`, background: active ? 'rgba(201,168,76,0.12)' : 'transparent', color: active ? 'var(--color-accent)' : cnt === 0 ? 'var(--color-muted)' : 'var(--color-text)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', opacity: cnt === 0 ? 0.4 : 1 }}>
                          {s} {cnt !== undefined && <span style={{ color: 'var(--color-muted)', fontSize: '0.7rem' }}>({cnt})</span>}
                        </button>
                      );
                    })}
                  </div>
                </FilterSection>

                {/* Color */}
                <FilterSection title="Color">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {COLORS.map(c => {
                      const cnt = getCount(metadata.colors, c);
                      const colorMap: Record<string, string> = { Black: '#1a1a1a', White: '#f0f0f0', Blue: '#3b82f6', Red: '#ef4444', Gold: '#c9a84c', Silver: '#94a3b8', Beige: '#d4c5a9', Green: '#22c55e' };
                      const active = filters.color === c;
                      return (
                        <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', opacity: cnt === 0 ? 0.4 : 1 }}>
                          <div onClick={() => setFilters(f => ({ ...f, color: f.color === c ? '' : c }))}
                            style={{ width: '18px', height: '18px', borderRadius: '50%', background: colorMap[c], border: active ? '2px solid var(--color-accent)' : '1px solid var(--color-border)', cursor: 'pointer', boxShadow: active ? '0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-accent)' : 'none', transition: 'all 0.2s', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.875rem', color: active ? 'var(--color-accent)' : 'var(--color-text)' }}>{c}</span>
                          {cnt !== undefined && <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>({cnt})</span>}
                        </label>
                      );
                    })}
                  </div>
                </FilterSection>

                {/* Material */}
                <FilterSection title="Material" defaultOpen={false}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {MATERIALS.map(m => {
                      const cnt = getCount(metadata.materials, m);
                      const active = filters.material === m;
                      return (
                        <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', opacity: cnt === 0 ? 0.4 : 1 }}>
                          <input type="checkbox" checked={active} onChange={() => setFilters(f => ({ ...f, material: f.material === m ? '' : m }))} style={{ accentColor: 'var(--color-accent)' }} />
                          <span style={{ fontSize: '0.875rem', color: active ? 'var(--color-accent)' : 'var(--color-text)' }}>{m}</span>
                          {cnt !== undefined && <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>({cnt})</span>}
                        </label>
                      );
                    })}
                  </div>
                </FilterSection>

                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', padding: '0.6rem' }}>
                    <X size={14} /> Clear All Filters
                  </button>
                )}
              </motion.aside>
            )}
          </AnimatePresence>

          {/* ── Products Grid ── */}
          <div>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--color-muted)' }}>
                <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No products found</p>
                <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters</p>
                {activeFilterCount > 0 && <button onClick={clearFilters} className="btn-outline" style={{ marginTop: '1.5rem' }}>Clear Filters</button>}
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}
                >
                  <AnimatePresence mode="popLayout">
                    {products.map((p, i) => (
                      <motion.div key={p._id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35, delay: i * 0.04 }}
                      >
                        <ProductCard product={p} onQuickView={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      style={{ padding: '0.5rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: page === 1 ? 'var(--color-muted)' : 'var(--color-text)', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                      Prev
                    </button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        style={{ padding: '0.5rem 1rem', background: p === page ? 'var(--color-accent)' : 'var(--color-surface)', border: '1px solid', borderColor: p === page ? 'var(--color-accent)' : 'var(--color-border)', color: p === page ? '#0d0d0d' : 'var(--color-text)', borderRadius: '6px', cursor: 'pointer', fontWeight: p === page ? '700' : '400' }}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                      style={{ padding: '0.5rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: page === pages ? 'var(--color-muted)' : 'var(--color-text)', borderRadius: '6px', cursor: page === pages ? 'not-allowed' : 'pointer' }}>
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal product={quickViewProduct} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />

      <style>{`
        @media (max-width: 768px) {
          .shop-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
