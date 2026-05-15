'use client';
import { motion } from 'framer-motion';
import { Users, Rocket, Heart, Sparkles, ArrowRight, Briefcase, Globe, Code } from 'lucide-react';
import Link from 'next/link';

const VALUES = [
  { 
    Icon: Sparkles, 
    title: 'Innovation First', 
    desc: 'We push the boundaries of fashion and technology to create something truly unique.' 
  },
  { 
    Icon: Users, 
    title: 'Inclusive Culture', 
    desc: 'Diversity is our strength. We believe great ideas can come from anyone, anywhere.' 
  },
  { 
    Icon: Rocket, 
    title: 'Fast Growth', 
    desc: 'We move quickly, learn constantly, and scale our impact across the globe.' 
  },
  { 
    Icon: Heart, 
    title: 'Passion Driven', 
    desc: 'We love what we do, and that passion is reflected in every stitch and every pixel.' 
  }
];

export default function CareersPage() {
  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* ── Hero Section ── */}
      <section style={{ 
        height: '90vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
            pointerEvents: 'none'
          }}
        />
        <div className="container" style={{ textAlign: 'center', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <p style={{ color: 'var(--color-accent)', letterSpacing: '0.4em', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              Join the Movement
            </p>
            <h1 className="hero-title" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: '800', lineHeight: '1', marginBottom: '2rem' }}>
              Shape the Future of <br/> <span className="text-gold">Fashion Tech.</span>
            </h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.8' }}>
              At Wearixa, we’re blending luxury fashion with cutting-edge technology. We’re looking for visionaries to help us build the next generation of retail.
            </p>
            <motion.a 
              href="#openings" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary" 
              style={{ padding: '1rem 3rem', borderRadius: '40px' }}
            >
              View Open Positions
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ── Values Section ── */}
      <section style={{ padding: '10rem 0', background: 'rgba(201,168,76,0.01)' }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '6rem' }}
          >
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '600', marginBottom: '1rem' }}>Our Core Values</h2>
            <div style={{ width: '60px', height: '3px', background: 'var(--color-accent)', margin: '0 auto' }}></div>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="values-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}
          >
            {VALUES.map((val) => (
              <motion.div
                key={val.title}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -10, borderColor: 'var(--color-accent)' }}
                className="glass"
                style={{ padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid var(--color-border)' }}
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  style={{ 
                    width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem',
                    border: '1px solid rgba(201,168,76,0.2)', transition: 'all 0.3s'
                  }}
                  className="icon-container"
                >
                  <val.Icon size={28} style={{ color: 'var(--color-accent)' }} />
                </motion.div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1.25rem' }}>{val.title}</h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>{val.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Digital Services Banner (Speciality) ── */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01, boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}
            viewport={{ once: true }}
            className="glass services-banner" 
            style={{ 
              padding: '4rem', borderRadius: '24px', border: '1px solid rgba(201,168,76,0.2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(20,20,40,0.4) 0%, rgba(10,10,10,0.4) 100%)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <Code size={24} style={{ color: 'var(--color-accent)' }} />
              <Globe size={24} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Looking for <span className="text-gold">Digital Excellence?</span></h2>
            <p style={{ color: 'var(--color-muted)', maxWidth: '700px', lineHeight: '1.8', marginBottom: '2.5rem' }}>
              Beyond fashion, we design world-class digital experiences. Our engineering team is available for select high-end projects. If you need a website as premium as this one, let&apos;s talk.
            </p>
            <Link href="mailto:services@wearixa.com" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              Hire Our Team <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Open Positions ── */}
      <section id="openings" style={{ padding: '8rem 0', background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '600', marginBottom: '1rem' }}>Current Openings</h2>
              <p style={{ color: 'var(--color-muted)' }}>Come build the future of luxury with us.</p>
            </div>
            <div style={{ padding: '10px 20px', borderRadius: '30px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', border: '1px solid var(--color-border)' }}>
              0 Open Positions
            </div>
          </div>

          <div className="glass" style={{ padding: '5rem 2rem', borderRadius: '24px', textAlign: 'center', border: '1px dashed var(--color-border)' }}>
            <Briefcase size={40} style={{ color: 'var(--color-muted)', marginBottom: '1.5rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>No current openings</h3>
            <p style={{ color: 'var(--color-muted)', maxWidth: '500px', margin: '0 auto' }}>
              We&apos;re always looking for exceptional talent. If you don&apos;t see a role that fits, send your portfolio to <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>careers@wearixa.com</span>
            </p>
          </div>
        </div>
      </section>
      <style>{`
        @media (max-width: 960px) {
          .values-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .services-banner { padding: 2.5rem !important; }
          .hero-title { font-size: 2.5rem !important; }
          section { padding: 4rem 0 !important; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 2rem !important; }
        }
      `}</style>
    </main>
  );
}
