'use client';
import { motion } from 'framer-motion';
import { Cookie, MousePointer2, Settings2, ShieldCheck, ChevronRight, Info } from 'lucide-react';

const SECTIONS = [
  { id: 'what', title: '1. What Are Cookies?', icon: Cookie },
  { id: 'usage', title: '2. How We Use Cookies', icon: MousePointer2 },
  { id: 'types', title: '3. Types of Cookies', icon: Settings2 },
  { id: 'manage', title: '4. Managing Cookies', icon: ShieldCheck },
];

export default function CookiesPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingTop: '8rem', paddingBottom: '8rem' }}>
      <div className="container">
        {/* ── Header ── */}
        <header style={{ marginBottom: '5rem', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Cookie size={48} style={{ color: 'var(--color-accent)', marginBottom: '1.5rem' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', marginBottom: '1rem' }}>
              Cookie <span className="text-gold">Policy.</span>
            </h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '1rem' }}>Last updated: May 12, 2026</p>
          </motion.div>
        </header>

        <div className="policy-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '4rem', alignItems: 'start' }}>
          {/* ── Sticky Navigation ── */}
          <aside style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-muted)', marginBottom: '1rem', fontWeight: '700' }}>Sections</p>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid transparent', color: 'var(--color-muted)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s', fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
                  e.currentTarget.style.color = 'var(--color-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-muted)';
                }}
              >
                <s.icon size={16} />
                {s.title.split('. ')[1]}
              </button>
            ))}
          </aside>

          {/* ── Content ── */}
          <section className="glass" style={{ padding: '4rem', borderRadius: '24px', border: '1px solid var(--color-border)', lineHeight: '1.8' }}>
            <div id="what" style={{ marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Cookie size={24} style={{ color: 'var(--color-accent)' }} /> 1. What Are Cookies?
              </h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                Cookies are small text files that are placed on your computer or mobile device when you browse websites. They are essential for making websites work more efficiently and for providing a tailored user experience.
              </p>
            </div>

            <div id="usage" style={{ marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MousePointer2 size={24} style={{ color: 'var(--color-accent)' }} /> 2. How We Use Cookies
              </h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                Wearixa uses cookies for various critical functions to enhance your shopping experience:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  'Keep you signed in',
                  'Remember your cart items',
                  'Personalize your feed',
                  'Analyze site performance',
                  'Security & Fraud prevention',
                  'Marketing relevance'
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                    <ChevronRight size={14} style={{ color: 'var(--color-accent)' }} /> {item}
                  </div>
                ))}
              </div>
            </div>

            <div id="types" style={{ marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Settings2 size={24} style={{ color: 'var(--color-accent)' }} /> 3. Types of Cookies
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { title: 'Essential Cookies', desc: 'Required for the basic operation of our website, including security and account access.' },
                  { title: 'Analytics Cookies', desc: 'Allow us to recognize and count the number of visitors and see how they move around our site.' },
                  { title: 'Marketing Cookies', desc: 'Used to track visitors across websites to display advertisements that are relevant and engaging.' }
                ].map((type) => (
                  <div key={type.title} style={{ paddingLeft: '1.5rem', borderLeft: '2px solid var(--color-accent)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--color-text)' }}>{type.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>{type.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="manage">
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={24} style={{ color: 'var(--color-accent)' }} /> 4. Managing Cookies
              </h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                You have the full right to control your cookie preferences. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.
              </p>
              <div style={{ padding: '1.5rem', background: 'rgba(201,168,76,0.03)', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', gap: '15px' }}>
                <Info size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '3px' }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                  Please note that if you disable or refuse cookies, some parts of this website may become inaccessible or not function properly, such as the persistent shopping cart and user login.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <style>{`
        @media (max-width: 960px) {
          .policy-layout { grid-template-columns: 1fr !important; }
          aside { display: none !important; }
          .glass { padding: 2.5rem !important; }
        }
      `}</style>
    </main>
  );
}
