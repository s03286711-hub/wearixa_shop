'use client';
import { motion } from 'framer-motion';
import { FileText, Download, Mail, Newspaper, Share2, Image as ImageIcon } from 'lucide-react';

const RELEASES = [
  {
    date: 'May 12, 2026',
    title: 'Wearixa Launches Summer Collection',
    excerpt: 'Discover the inspiration behind our most vibrant collection yet, blending traditional craftsmanship with modern silhouettes.',
    category: 'Product'
  },
  {
    date: 'March 04, 2026',
    title: 'Commitment to Zero-Waste Manufacturing',
    excerpt: 'Our bold new initiative to reduce our carbon footprint and implement circular economy principles by 2030.',
    category: 'Sustainability'
  },
  {
    date: 'January 15, 2026',
    title: 'Digital Transformation in Luxury Retail',
    excerpt: 'How Wearixa is using AI and AR to redefine the online shopping experience for global customers.',
    category: 'Innovation'
  }
];

export default function PressPage() {
  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">
        {/* ── Header ── */}
        <header style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ color: 'var(--color-accent)', letterSpacing: '0.4em', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700', marginBottom: '1rem' }}>
              Press & Media Hub
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', marginBottom: '1.5rem' }}>
              Our Story, <span className="text-gold">Shared.</span>
            </h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.8' }}>
              Welcome to the Wearixa press room. Access our latest announcements, brand resources, and reach out for media inquiries.
            </p>
          </motion.div>
        </header>

        <div className="press-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem', alignItems: 'start' }}>
          {/* ── Main Content: Releases ── */}
          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Newspaper size={24} style={{ color: 'var(--color-accent)' }} /> Latest Releases
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {RELEASES.map((rel, i) => (
                <motion.article
                  key={rel.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass"
                  style={{ padding: '2.5rem', borderRadius: '20px', border: '1px solid var(--color-border)', transition: 'transform 0.3s' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{rel.category}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{rel.date}</span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '1rem' }}>{rel.title}</h3>
                  <p style={{ color: 'var(--color-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>{rel.excerpt}</p>
                  <button style={{ 
                    background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: '600', 
                    fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 
                  }}>
                    Read Full Story <Share2 size={14} />
                  </button>
                </motion.article>
              ))}
            </div>
          </section>

          {/* ── Sidebar: Resources & Contact ── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Resources Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass" 
              style={{ padding: '2rem', borderRadius: '20px', background: 'rgba(201,168,76,0.05)' }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Media Kit</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Download size={16} /> Brand Logos</span>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.7rem' }}>2.4 MB</span>
                </button>
                <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ImageIcon size={16} /> Product Photos</span>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.7rem' }}>148 MB</span>
                </button>
                <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={16} /> Fact Sheet</span>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.7rem' }}>0.5 MB</span>
                </button>
              </div>
            </motion.div>

            {/* Contact Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass" 
              style={{ padding: '2rem', borderRadius: '20px' }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Media Inquiries</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                For all press inquiries and interview requests, please contact our PR team.
              </p>
              <a href="mailto:press@wearixa.com" style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-accent)', 
                textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' 
              }}>
                <Mail size={16} /> press@wearixa.com
              </a>
            </motion.div>
          </aside>
        </div>
      </div>
      <style>{`
        @media (max-width: 960px) {
          .press-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
