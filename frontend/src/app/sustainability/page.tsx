'use client';
import { motion } from 'framer-motion';
import { Leaf, Recycle, Wind, Droplets, ShieldCheck, Sun } from 'lucide-react';

const PILLARS = [
  {
    Icon: Leaf,
    title: 'Ethical Sourcing',
    desc: 'We partner exclusively with certified suppliers who guarantee fair wages, safe conditions, and zero child labor.',
    color: '#4ade80'
  },
  {
    Icon: Recycle,
    title: 'Circular Fashion',
    desc: 'Our goal is 100% circularity. We use recycled materials and offer a repair program to extend garment life.',
    color: '#60a5fa'
  },
  {
    Icon: Droplets,
    title: 'Water Preservation',
    desc: 'Our manufacturing processes use 60% less water than industry standards through advanced filtration.',
    color: '#38bdf8'
  },
  {
    Icon: Sun,
    title: 'Solar Powered',
    desc: 'Our headquarters and logistics centers are 100% powered by renewable energy sources.',
    color: '#fbbf24'
  }
];

export default function SustainabilityPage() {
  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* ── Visual Hero Section ── */}
      <section style={{ 
        height: '80vh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.4)'
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ maxWidth: '700px' }}
          >
            <p style={{ color: '#4ade80', letterSpacing: '0.4em', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              Eco-Luxury Commitment
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(3rem, 7vw, 5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '2rem' }}>
              Fashion Shouldn&apos;t <br/> <span style={{ color: '#4ade80' }}>Cost the Earth.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
              We believe luxury and sustainability are inseparable. Our mission is to create timeless pieces that honor both craftsmanship and the environment.
            </p>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>70%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Recycled Fabrics</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>100%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Carbon Neutral</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pillars Section ── */}
      <section style={{ padding: '8rem 0', background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '600', marginBottom: '1.5rem' }}>Our Pillars of Change</h2>
            <p style={{ color: 'var(--color-muted)', maxWidth: '600px', margin: '0 auto' }}>We anchor our sustainability strategy in four core principles that guide every decision we make.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass"
                style={{ padding: '3.5rem 2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }}
              >
                <p.Icon size={40} style={{ color: p.color, marginBottom: '2rem' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.25rem' }}>{p.title}</h3>
                <p style={{ color: 'var(--color-muted)', lineHeight: '1.7', fontSize: '0.95rem' }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Transparency Banner ── */}
      <section style={{ padding: '6rem 0', background: 'rgba(74,222,128,0.03)' }}>
        <div className="container">
          <div className="glass" style={{ 
            padding: '4rem', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '3rem', border: '1px solid rgba(74,222,128,0.2)'
          }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4ade80', marginBottom: '1rem' }}>
                <ShieldCheck size={20} />
                <span style={{ fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Radical Transparency</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Trace Every Thread.</h2>
              <p style={{ color: 'var(--color-muted)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                By 2027, every Wearixa garment will feature a unique Digital ID, allowing you to trace its journey from raw fiber to our warehouse.
              </p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <button className="btn-primary" style={{ background: '#4ade80', border: 'none', padding: '1.2rem 3rem' }}>Read Impact Report</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote Section ── */}
      <section style={{ padding: '10rem 0', textAlign: 'center' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 style={{ 
              fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', 
              fontStyle: 'italic', maxWidth: '900px', margin: '0 auto', lineHeight: '1.5',
              color: 'rgba(255,255,255,0.9)'
            }}>
              &quot;Luxury is not about excess. It is about the preservation of beauty—in our designs and in our world.&quot;
            </h2>
            <p style={{ marginTop: '2.5rem', color: 'var(--color-accent)', fontWeight: '600', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem' }}>
              — Team Wearixa
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
