'use client';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Heart, Users, MapPin, ArrowRight } from 'lucide-react';

const STATS = [
  { label: 'Founded', value: '2018' },
  { label: 'Global Offices', value: '12' },
  { label: 'Artisans', value: '450+' },
  { label: 'Happy Clients', value: '50k+' },
];

export default function AboutPage() {
  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text)' }}>
      {/* ── Cinematic Hero ── */}
      <section style={{ 
        height: '90vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 2, ease: "easeOut" }}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}
        />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <p style={{ color: 'var(--color-accent)', letterSpacing: '0.4em', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              The Wearixa Story
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: '800', lineHeight: '1', marginBottom: '2rem' }}>
              Crafting <span className="text-gold">Timeless</span> <br/> Elegance.
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '80px' }}
              transition={{ duration: 1, delay: 1.2 }}
              style={{ height: '3px', background: 'var(--color-accent)', margin: '0 auto 2.5rem' }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Philosophy Section (Staggered) ── */}
      <section style={{ padding: '10rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '6rem', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{ position: 'relative' }}
            >
              <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', aspectRatio: '4/5', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
                <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" alt="Craftsmanship" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
              </div>
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ 
                  position: 'absolute', bottom: '-30px', right: '-30px', padding: '2rem', 
                  background: 'var(--color-accent)', color: 'black', borderRadius: '16px', fontWeight: '800', fontSize: '1.5rem'
                }}
              >
                Est. 2018
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', marginBottom: '1.5rem', fontWeight: '700' }}>Our <span className="text-gold">Philosophy</span></h2>
              <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                At the heart of Wearixa lies a simple truth: fashion is the ultimate form of self-expression. We don&apos;t just curate clothes; we craft experiences that empower individuals to step into their own light.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {[
                  { Icon: Shield, title: 'Heritage Quality', desc: 'Working with master artisans who have perfected their craft over generations.' },
                  { Icon: Heart, title: 'Ethical Soul', desc: 'Commitment to zero-waste practices and fair-trade partnerships across our supply chain.' },
                  { Icon: Sparkles, title: 'Pure Innovation', desc: 'Integrating digital tech with physical design for a seamless shopping journey.' }
                ].map((item, i) => (
                  <motion.div 
                    key={item.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    style={{ display: 'flex', gap: '1.5rem' }}
                  >
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.Icon size={22} style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>{item.title}</h4>
                      <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Animated Stats Section ── */}
      <section style={{ padding: '8rem 0', background: 'rgba(201,168,76,0.03)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', textAlign: 'center' }}>
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', damping: 15, delay: i * 0.1 }}
              >
                <p style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{stat.value}</p>
                <p style={{ color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem', fontWeight: '600' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Join the Movement CTA ── */}
      <section style={{ padding: '10rem 0', textAlign: 'center' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <Users size={60} style={{ color: 'var(--color-accent)', marginBottom: '2rem', opacity: 0.5 }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', marginBottom: '1.5rem', fontWeight: '700' }}>Become Part of <span className="text-gold">Our Legacy.</span></h2>
            <p style={{ color: 'var(--color-muted)', maxWidth: '600px', margin: '0 auto 3rem', fontSize: '1.1rem', lineHeight: '1.8' }}>
              We are constantly seeking designers, dreamers, and innovators to join our global fashion house.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a href="/careers" className="btn-primary" style={{ padding: '1.2rem 3.5rem', borderRadius: '40px' }}>
                Join the Team <ArrowRight size={18} style={{ marginLeft: '10px' }} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
