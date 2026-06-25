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
      <section className="relative min-h-[100vh] lg:min-h-[115vh] flex items-center overflow-hidden bg-black">
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
          style={{
            backgroundImage: `linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.6)), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')`
          }}
        />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-amber-500/10 to-transparent z-0 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-black to-transparent z-0" />

        <div className="container relative z-10 px-6 mx-auto mt-12 lg:mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <motion.div 
              key={slide}
              initial={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-3 bg-amber-500/10 backdrop-blur-xl border border-amber-500/40 rounded-full px-6 py-2.5 mb-10 lg:mb-12 shadow-[0_0_20px_rgba(201,168,76,0.15)]">
                <Sparkles size={18} className="text-amber-400" />
                <span className="text-[0.85rem] tracking-[0.25em] text-amber-400 uppercase font-extrabold">
                  {current.subtitle}
                </span>
              </div>
              <h1 className="font-heading text-[clamp(4rem,9vw,8rem)] font-black leading-[1.05] mb-8 text-white drop-shadow-2xl tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_0_15px_rgba(201,168,76,0.4)]">
                  {current.title.split('\n')[0]}
                </span>
                <br />
                <span className="opacity-90">{current.title.split('\n')[1]}</span>
              </h1>

              <p className="text-white/80 text-xl lg:text-2xl mb-12 max-w-[600px] leading-relaxed tracking-wide font-light">
                Experience the pinnacle of fashion with our meticulously curated collection of modern essentials. Designed to elevate your everyday elegance.
              </p>

              <div className="flex flex-wrap gap-6 lg:gap-8">
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
              initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 group">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
                 <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1000" alt="Hero Fashion" className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-1000 ease-out" />
              </div>
              {/* Decorative blob */}
              <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-amber-500/30 rounded-full blur-[80px] z-0 animate-pulse" />
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-300/20 rounded-full blur-[60px] z-0" />
              
              {/* Decorative background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle,rgba(201,168,76,0.2)_0%,transparent_60%)] -z-10" />
            </motion.div>
          </div>
        </div>

        {/* Slide navigation / Progress indicators */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {HERO_SLIDES.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setSlide(i)} 
              className={`transition-all duration-500 ease-out h-1.5 rounded-full ${i === slide ? 'w-16 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'w-4 bg-white/30 hover:bg-white/50'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Vertical Scroll Label */}
        <div className="absolute bottom-16 right-16 hidden lg:flex flex-col items-center gap-6 z-20">
          <span className="text-[0.75rem] tracking-[0.5em] text-white/50 uppercase font-bold [writing-mode:vertical-rl] mix-blend-screen">Discover</span>
          <div className="w-px h-32 bg-gradient-to-b from-amber-500/80 via-amber-500/20 to-transparent relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[30%] bg-amber-200 animate-[scrollDown_2.5s_infinite_ease-in-out] shadow-[0_0_8px_rgba(253,230,138,1)]" />
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

      {/* ── Premium Ad Banner ── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20 pt-8">
        <div className="max-w-[1400px] mx-auto relative rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 bg-black">
            {/* Background Image Container */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop" 
                alt="Collection Background" 
                className="w-full h-full object-cover opacity-40 transform scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/20" />
            </div>

            <div className="relative z-10 px-8 py-16 lg:px-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Content Left */}
              <div className="text-left max-w-xl">
                <div className="inline-flex items-center gap-3 mb-6">
                  <span className="w-10 h-px bg-amber-500"></span>
                  <span className="text-[0.75rem] tracking-[0.25em] text-amber-500 uppercase font-bold">
                    {activePromos.length > 0 ? 'Exclusive Campaign' : 'Premium Arrivals'}
                  </span>
                </div>
                
                <h2 className="font-heading text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.1] mb-6 text-white drop-shadow-lg">
                  {activePromos.length > 0 ? (
                    <>
                      Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">
                      {activePromos[0].discountType === 'percentage' ? `${activePromos[0].discountValue}%` : `Rs. ${activePromos[0].discountValue}`} Off
                      </span>
                    </>
                  ) : (
                    <>The New <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-400 animate-pulse">Standard</span></>
                  )}
                </h2>

                <p className="text-white/80 text-lg mb-10 leading-relaxed max-w-md">
                  {activePromos.length > 0 ? (
                    `Use code ${activePromos[0].code} at checkout to unlock your savings. Valid on premium collections and new arrivals.`
                  ) : (
                    "Discover our latest arrivals crafted with uncompromising attention to detail and luxury materials. Upgrade your wardrobe today."
                  )}
                </p>

                {activePromos.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(activePromos[0].code);
                        setCopiedCode(activePromos[0].code);
                        setTimeout(() => setCopiedCode(null), 2000);
                      }}
                      className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-base shadow-[0_10px_30px_rgba(201,168,76,0.15)] rounded-full"
                    >
                      {copiedCode === activePromos[0].code ? 'Code Copied! ✓' : `Copy Code: ${activePromos[0].code}`}
                    </button>
                    <Link href="/shop" className="btn-outline inline-flex items-center gap-3 px-8 py-4 text-base border-white/20 rounded-full">
                      Shop Collection
                    </Link>
                  </div>
                ) : (
                  <div className="relative inline-block group mt-2">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 rounded-full blur-md opacity-60 group-hover:opacity-100 transition duration-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                    <Link href="/shop" className="relative inline-flex items-center gap-4 px-10 py-4 lg:py-5 bg-black rounded-full border border-amber-500/30 overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-amber-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative text-amber-400 font-bold tracking-[0.2em] uppercase text-sm">Explore Collection</span>
                      <Sparkles className="relative text-amber-400 group-hover:rotate-12 transition-transform" size={18} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Content Right (Empty for aesthetic breathing room or can hold a subtle floating element) */}
              <div className="hidden lg:flex justify-end relative h-full min-h-[300px]">
                <div className="absolute top-1/2 right-10 -translate-y-1/2 w-72 h-72 border border-white/10 rounded-full flex items-center justify-center animate-[spin_60s_linear_infinite]">
                  <div className="w-48 h-48 border border-amber-500/20 rounded-full flex items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>
    </>
  );
}
