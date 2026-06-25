'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ProductSkeleton } from '@/components/Skeleton';
import { productService, categoryService, promoService } from '@/services';
import { Truck, RefreshCw, Shield, Sparkles, ArrowRight, Star, Ticket, Copy, Check, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickViewModal from '@/components/QuickViewModal';
import { useCart } from '@/context/CartContext';

const HERO_SLIDES = [
  {
    title: 'The Art of\nModern Elegance',
    subtitle: 'Spring / Summer 2026 Collection',
    cta: 'Explore Collection',
    bg: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)',
    accent: '#c9a84c',
  },
  {
    title: 'Redefine\nYour Style',
    subtitle: 'Exclusive Pieces, Timeless Design',
    cta: 'Shop Now',
    bg: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a2e 50%, #0d0d0d 100%)',
    accent: '#c9a84c',
  },
];

export default function HomePage() {
  const { cartItems } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [seasonalData, setSeasonalData] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [activePromos, setActivePromos] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const cartProductIds = cartItems.map(item => item._id).join(',');
        const recentlyViewedCategories = typeof window !== 'undefined' 
          ? localStorage.getItem('wearixaRecentlyViewedCategories') || '' 
          : '';
        const recs = await productService.getRecommendations({
          cartProductIds,
          recentlyViewedCategories
        });
        setRecommendedProducts(recs || []);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      }
    };

    if (!loading) {
      fetchRecommendations();
    }
  }, [loading, cartItems]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pData, cData, promoData] = await Promise.all([
          productService.getAll({ pageSize: 8 }),
          categoryService.getAll(),
          promoService.getActivePromos().catch(() => []),
        ]);
        setProducts(pData.products || []);
        setCategories(cData || []);
        setActivePromos((promoData || []).sort((a: any, b: any) => b.discountValue - a.discountValue));

        // Fetch seasonal products
        const seasons = ['Summer Collection', 'Winter Collection', 'Eid Special', 'Christmas Offer'];
        const seasonalResults = await Promise.all(
          seasons.map(s => productService.getAll({ dealType: s, pageSize: 4 }))
        );
        
        const seasonalMap: { [key: string]: any[] } = {};
        seasons.forEach((s, i) => {
          if (seasonalResults[i].products && seasonalResults[i].products.length > 0) {
            seasonalMap[s] = seasonalResults[i].products;
          }
        });
        setSeasonalData(seasonalMap);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const current = HERO_SLIDES[slide];

  if (!hasMounted) return null; // Let the page transition handle initial fade in

  return (
    <>
      {/* ── Luxury Hero Section ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-black/80">
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(13,13,13,0.8), rgba(13,13,13,0.8)), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')`
          }}
        />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-amber-500/5 to-transparent z-0" />

        <div className="container relative z-10 px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              key={slide}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2.5 bg-amber-500/15 backdrop-blur-md border border-amber-500/30 rounded-full px-5 py-2 mb-10">
                <Sparkles size={16} className="text-amber-500" />
                <span className="text-[0.8rem] tracking-[0.2em] text-amber-500 uppercase font-bold">
                  {current.subtitle}
                </span>
              </div>
<h1 className="font-heading text-[clamp(3.5rem,8vw,6.5rem)] font-extrabold leading-none mb-8 text-white drop-shadow-xl">
  <span className="text-gold drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]">
    {current.title.split('\n')[0]}
  </span>
  <br />
  {current.title.split('\n')[1]}
</h1>

<p className="text-white/70 text-xl mb-14 max-w-[520px] leading-relaxed tracking-wide">
  Experience the pinnacle of fashion with our meticulously curated collection of modern essentials.
</p>

<div className="flex flex-wrap gap-6">
  <Link href="/shop" className="btn-primary inline-flex items-center gap-3 px-11 py-5 text-base shadow-[0_20px_40px_rgba(201,168,76,0.2)]">
    {current.cta} <ArrowRight size={20} />
  </Link>
  <Link href="/shop" className="btn-outline inline-flex items-center gap-3 px-11 py-5 text-base border-white/20">
    New Arrivals
  </Link>
</div>
</motion.div>

{/* Right Visual Element */}
<motion.div 
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.8, delay: 0.2 }}
className="relative hidden md:block"
>
<div className="relative z-10 w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
   <img src="https://images.unsplash.com/photo-1523381294911-8d3cead1b475?q=80&w=1000&auto=format&fit=crop" alt="Hero" className="object-cover w-full h-full" />
</div>
{/* Decorative blob */}
<div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl z-0" />
</motion.div>
</div>
</div>
</section>
                  <Link 
                    href="/shop" 
                    className="flex items-center gap-2 text-white hover:text-amber-500 transition-colors"
                  >
                    Shop Collection <ArrowRight size={14} className="transition-transform duration-300" />
                  </Link>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(201,168,76,0.15)_0%,transparent_70%)] -z-10" />
            </motion.div>
          </div>
        </div>

        {/* Slide navigation / Progress indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
          {HERO_SLIDES.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setSlide(i)} 
              className={`transition-all duration-500 ease-out h-1 rounded-full ${i === slide ? 'w-10 bg-amber-500' : 'w-2.5 bg-white/20'}`}
            />
          ))}
        </div>

        {/* Vertical Scroll Label */}
        <div className="absolute bottom-12 right-12 hidden md:flex flex-col items-center gap-4">
          <span className="text-[0.7rem] tracking-[0.4em] text-white/30 uppercase font-medium [writing-mode:vertical-rl]">Discover</span>
          <div className="w-px h-20 bg-gradient-to-b from-amber-500 to-transparent relative">
            <div className="absolute top-0 left-0 w-full h-[40%] bg-white animate-[scrollDown_2s_infinite_ease-in-out]" />
          </div>
        </div>
      </section>

      {/* ── Active Broadcast Campaigns Banner ── */}
      {activePromos.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(90deg, rgba(201,168,76,0.04) 0%, rgba(13,13,13,0.9) 50%, rgba(201,168,76,0.04) 100%)',
            borderBottom: '1px solid rgba(201, 168, 76, 0.15)',
            padding: '1.25rem 0',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 10
          }}
        >
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Ticket size={18} style={{ color: 'var(--color-accent)', filter: 'drop-shadow(0 0 5px var(--color-accent))' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
                Active Offers
              </span>
            </div>
            
            <div 
              style={{ 
                overflow: 'hidden', 
                whiteSpace: 'nowrap', 
                flex: 1, 
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .marquee-container {
                  display: flex;
                  gap: 1.5rem;
                  animation: marquee 35s linear infinite;
                  width: max-content;
                  padding-right: 1.5rem;
                }
                .marquee-container:hover {
                  animation-play-state: paused;
                }
              `}} />
              
              <div className="marquee-container">
                {[...activePromos, ...activePromos, ...activePromos].map((promo, idx) => {
                  const isCopied = copiedCode === promo.code;
                  return (
                    <div 
                      key={`${promo._id}-${idx}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px dashed rgba(201, 168, 76, 0.25)',
                        borderRadius: '8px',
                        padding: '6px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexShrink: 0
                      }}
                    >
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                        {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `Rs. ${promo.discountValue} OFF`}
                        {promo.minOrderAmount > 0 && ` on orders over Rs. ${promo.minOrderAmount}`}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(promo.code);
                          setCopiedCode(promo.code);
                          setTimeout(() => setCopiedCode(null), 2000);
                        }}
                        style={{
                          background: isCopied ? 'rgba(74, 222, 128, 0.1)' : 'rgba(201, 168, 76, 0.1)',
                          border: `1px solid ${isCopied ? '#4ade80' : 'rgba(201, 168, 76, 0.3)'}`,
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          color: isCopied ? '#4ade80' : 'var(--color-accent)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {promo.code}
                        {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Feature Badges ── */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="container" style={{ padding: '2rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {[
              { Icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { Icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
              { Icon: Shield, title: 'Secure Payment', desc: 'SSL encrypted checkout' },
              { Icon: Sparkles, title: 'Premium Quality', desc: 'Curated collections' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'rgba(201,168,76,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{title}</p>
                  <p style={{ color: 'var(--color-muted)', fontSize: '0.78rem' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Categories ── */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="section"
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Browse by</p>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '600' }}>
              Shop <span className="text-gold">Categories</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio: '1/1', borderRadius: '8px' }} />
              ))
            ) : categories.length === 0 ? (
              <div style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1', color: 'var(--color-muted)' }}>No categories available.</div>
            ) : (
              categories.map((cat: any) => (
                <Link 
                  key={cat._id} 
                  href={`/shop?category=${cat.name.toLowerCase()}`} 
                  style={{ display: 'block' }}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const existing = localStorage.getItem('wearixaRecentlyViewedCategories');
                      let list = existing ? existing.split(',').filter(Boolean) : [];
                      list = [cat._id, ...list.filter(id => id !== cat._id)].slice(0, 5);
                      localStorage.setItem('wearixaRecentlyViewedCategories', list.join(','));
                    }
                  }}
                >
                  <motion.div 
                    whileHover={{ y: -5 }}
                    style={{
                      position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden',
                      border: '1px solid var(--color-border)', transition: 'all 0.3s',
                    }}
                  >
                    <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>{cat.name}</h3>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* ── Tailored For You (AI Recommendations) ── */}
      {hasMounted && recommendedProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.02) 50%, transparent 100%)',
            borderTop: '1px solid var(--color-border)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle glowing radial background for recommendations AI vibe */}
          <div style={{
            position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
            width: '800px', height: '300px',
            background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ 
                fontSize: '0.75rem', 
                letterSpacing: '0.3em', 
                color: 'var(--color-accent)', 
                textTransform: 'uppercase', 
                marginBottom: '0.75rem', 
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Sparkles size={14} className="text-gold" /> Personalized Curation
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '600', textTransform: 'uppercase' }}>
                Tailored <span className="text-gold">For You</span>
              </h2>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', maxWidth: '480px', margin: '0.5rem auto 0', lineHeight: '1.5' }}>
                Our hybrid intelligence recommendations deck, dynamically styled based on your active cart and browsing intent.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {recommendedProducts.map((p) => (
                <ProductCard 
                  key={p._id} 
                  product={p} 
                  onQuickView={(p) => { 
                    setQuickViewProduct(p); 
                    setIsQuickViewOpen(true); 
                  }} 
                />
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Seasonal Deal Sections ── */}
      {!loading && Object.keys(seasonalData).map((season, idx) => (
        <motion.section 
          key={season} 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section" 
          style={{ 
            background: idx % 2 === 0 ? 'rgba(201,168,76,0.02)' : 'transparent',
            borderTop: '1px solid var(--color-border)'
          }}
        >
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Limited Collection</p>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '600' }}>
                  {season.split(' ')[0]} <span className="text-gold">{season.split(' ').slice(1).join(' ')}</span>
                </h2>
              </div>
              <Link href={`/shop?dealType=${season}`} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                View All <ArrowRight size={15} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {loading ? (
                [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
              ) : (
                seasonalData[season].map((p) => <ProductCard key={p._id} product={p} onQuickView={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }} />)
              )}
            </div>
          </div>
        </motion.section>
      ))}

      {/* ── Featured Products ── */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="section" 
        style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Handpicked for you</p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '600' }}>
                Featured <span className="text-gold">Products</span>
              </h2>
            </div>
            <Link href="/shop" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              View All <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-muted)' }}>
              <p>No products yet. Check back soon!</p>
            </div>
          ) : (
            <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {products.map((p) => <ProductCard key={p._id} product={p} onQuickView={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }} />)}
            </motion.div>
          )}
        </div>
      </motion.section>

      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />

      {/* ── Banner CTA ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d0d 100%)',
        borderTop: '1px solid rgba(201,168,76,0.2)',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
        padding: '5rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        {(() => {
          const featuredPromo = activePromos[0];
          return (
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 'bold' }}>
                {featuredPromo ? 'ACTIVE CAMPAIGN DISPATCHED' : 'Limited Time Offer'}
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: '700', marginBottom: '1rem', textTransform: 'uppercase', lineHeight: '1.2' }}>
                {featuredPromo ? (
                  <>
                    Unlock <span className="text-gold">{featuredPromo.discountType === 'percentage' ? `${featuredPromo.discountValue}%` : `Rs. ${featuredPromo.discountValue}`} Off</span><br />
                    With Code: <span style={{ color: '#fff', borderBottom: '2px dashed var(--color-accent)', paddingBottom: '2px', fontFamily: 'monospace' }}>{featuredPromo.code}</span>
                  </>
                ) : (
                  <>
                    Up to <span className="text-gold">40% Off</span><br />New Season Styles
                  </>
                )}
              </h2>
              <p style={{ color: 'var(--color-muted)', fontSize: '1rem', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
                {featuredPromo ? (
                  <>
                    Initiate the {featuredPromo.code} protocol. Apply coupon code at checkout to unlock savings.
                    {featuredPromo.minOrderAmount > 0 ? ` Valid for order aggregates exceeding Rs. ${featuredPromo.minOrderAmount}.` : ''}
                  </>
                ) : (
                  "Don't miss out on our seasonal sale. Premium fashion at unbeatable prices."
                )}
              </p>
              {featuredPromo ? (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(featuredPromo.code);
                    setCopiedCode(featuredPromo.code);
                    setTimeout(() => setCopiedCode(null), 2000);
                  }}
                  className="btn-primary" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem', padding: '1rem 2.5rem', boxShadow: '0 15px 30px rgba(201,168,76,0.2)', cursor: 'pointer' }}
                >
                  {copiedCode === featuredPromo.code ? 'Copied to Clipboard! ✓' : `Copy Code: ${featuredPromo.code}`}
                </button>
              ) : (
                <Link href="/shop" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem', padding: '1rem 2.5rem' }}>
                  Shop the Sale <ArrowRight size={18} />
                </Link>
              )}
            </div>
          );
        })()}
      </section>
    </>
  );
}
