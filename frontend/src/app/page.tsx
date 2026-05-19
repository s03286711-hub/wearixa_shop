'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ProductSkeleton } from '@/components/Skeleton';
import { productService, categoryService, promoService } from '@/services';
import { Truck, RefreshCw, Shield, Sparkles, ArrowRight, Star, Ticket, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickViewModal from '@/components/QuickViewModal';

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
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [seasonalData, setSeasonalData] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [activePromos, setActivePromos] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
      <section className="hero-section-inline" style={{
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(13,13,13,0.8), rgba(13,13,13,0.8)), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute', top: '0', right: '0', width: '40%', height: '100%',
          background: 'linear-gradient(270deg, rgba(201,168,76,0.05) 0%, transparent 100%)',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-grid-inline">
            <style dangerouslySetInnerHTML={{__html: `
              .hero-section-inline {
                padding-top: 80px;
                padding-bottom: 40px;
              }
              .hero-grid-inline {
                display: grid;
                grid-template-columns: 1.2fr 0.8fr;
                gap: 4rem;
                align-items: center;
              }
              @media (max-width: 960px) {
                .hero-section-inline {
                  padding-top: 120px;
                }
                .hero-grid-inline {
                  grid-template-columns: 1fr;
                  gap: 3rem;
                }
                .hero-grid-inline > div:first-child {
                  text-align: center;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }
                .hero-grid-inline > div:first-child p {
                  text-align: center;
                }
                .hero-grid-inline > div:last-child {
                  max-width: 350px !important;
                  margin: 0 auto;
                  width: 100%;
                }
              }
            `}} />
            {/* Left Content */}
            <motion.div 
              key={slide}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: 'rgba(201,168,76,0.15)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '30px', padding: '8px 20px', marginBottom: '2.5rem',
              }}>
                <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
                <span style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: '700' }}>
                  {current.subtitle}
                </span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
                fontWeight: '800',
                lineHeight: '1',
                marginBottom: '2rem',
                textShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}>
                <span className="text-gold" style={{ filter: 'drop-shadow(0 0 10px rgba(201,168,76,0.3))' }}>
                  {current.title.split('\n')[0]}
                </span>
                <br />
                <span style={{ color: 'white' }}>{current.title.split('\n')[1]}</span>
              </h1>

              <p style={{ 
                color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginBottom: '3.5rem', 
                maxWidth: '520px', lineHeight: '1.8', letterSpacing: '0.01em' 
              }}>
                Experience the pinnacle of fashion with our meticulously curated collection of modern essentials.
              </p>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <Link href="/shop" className="btn-primary" style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '12px',
                  padding: '1.2rem 2.8rem', fontSize: '1rem', boxShadow: '0 20px 40px rgba(201,168,76,0.2)'
                }}>
                  {current.cta} <ArrowRight size={20} />
                </Link>
                <Link href="/shop" className="btn-outline" style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '12px',
                  padding: '1.2rem 2.8rem', fontSize: '1rem', borderColor: 'rgba(255,255,255,0.2)'
                }}>
                  New Arrivals
                </Link>
              </div>
            </motion.div>

            {/* Right Visual Element */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
            >
              <div style={{ 
                position: 'relative', width: '100%', maxWidth: '450px', aspectRatio: '3/4',
                borderRadius: '20px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop" 
                  alt="Fashion Luxury" 
                  style={{ 
                    width: '100%', height: '100%', objectFit: 'cover', 
                    transform: 'scale(1.05)', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                />
                
                {/* Floating Glass Tag */}
                <div style={{
                  position: 'absolute', bottom: '2rem', right: '-2rem',
                  background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                  padding: '1.5rem', width: '220px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}>
                  <p style={{ color: 'var(--color-accent)', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.5rem' }}>Trending Now</p>
                  <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Summer Silk Series</p>
                  <Link 
                    href="/shop" 
                    style={{ 
                      color: 'white', fontSize: '0.8rem', display: 'flex', 
                      alignItems: 'center', gap: '5px', textDecoration: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      const arrow = e.currentTarget.querySelector('svg');
                      if (arrow) arrow.style.transform = 'translateX(5px)';
                      e.currentTarget.style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                      const arrow = e.currentTarget.querySelector('svg');
                      if (arrow) arrow.style.transform = 'translateX(0)';
                      e.currentTarget.style.color = 'white';
                    }}
                  >
                    Shop Collection <ArrowRight size={14} style={{ transition: 'transform 0.3s ease' }} />
                  </Link>
                </div>
              </div>

              {/* Decorative background glow */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '120%', height: '120%',
                background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)',
                zIndex: -1
              }} />
            </motion.div>
          </div>
        </div>

        {/* Slide navigation / Progress indicators */}
        <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px' }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              width: i === slide ? '40px' : '10px', height: '4px',
              borderRadius: '2px', background: i === slide ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)',
              border: 'none', cursor: 'pointer', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          ))}
        </div>

        {/* Vertical Scroll Label */}
        <div style={{ position: 'absolute', bottom: '3rem', right: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <span style={{ 
            fontSize: '0.7rem', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.3)', 
            textTransform: 'uppercase', writingMode: 'vertical-rl', fontWeight: '500' 
          }}>Discover</span>
          <div style={{ 
            width: '1px', height: '80px', 
            background: 'linear-gradient(to bottom, var(--color-accent), transparent)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '40%',
              background: 'white', animation: 'scrollDown 2s infinite ease-in-out'
            }} />
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
                        {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
                        {promo.minOrderAmount > 0 && ` on orders over $${promo.minOrderAmount}`}
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
                <Link key={cat._id} href={`/shop?category=${cat.name.toLowerCase()}`} style={{ display: 'block' }}>
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
                    Unlock <span className="text-gold">{featuredPromo.discountType === 'percentage' ? `${featuredPromo.discountValue}%` : `$${featuredPromo.discountValue}`} Off</span><br />
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
                    {featuredPromo.minOrderAmount > 0 ? ` Valid for order aggregates exceeding $${featuredPromo.minOrderAmount}.` : ''}
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
