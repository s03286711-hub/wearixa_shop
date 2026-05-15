'use client';
import { motion } from 'framer-motion';
import { Gavel, CheckCircle2, AlertCircle, ShoppingCart, Info, ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance of Terms', icon: CheckCircle2 },
  { id: 'usage', title: '2. Use of Service', icon: AlertCircle },
  { id: 'pricing', title: '3. Products and Pricing', icon: ShoppingCart },
  { id: 'changes', title: '4. Changes to Terms', icon: Info },
];

export default function TermsPage() {
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
            <Gavel size={48} style={{ color: 'var(--color-accent)', marginBottom: '1.5rem' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', marginBottom: '1rem' }}>
              Terms of <span className="text-gold">Service.</span>
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
            <div id="acceptance" style={{ marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={24} style={{ color: 'var(--color-accent)' }} /> 1. Acceptance of Terms
              </h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                By accessing and using Wearixa (the &quot;Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. Our platform is designed to provide a premium luxury experience, and your use of it signifies your formal acceptance of these policies.
              </p>
            </div>

            <div id="usage" style={{ marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={24} style={{ color: 'var(--color-accent)' }} /> 2. Use of Service
              </h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                You agree to use the Service only for lawful purposes. To maintain the integrity of our community, you are strictly prohibited from:
              </p>
              <div style={{ background: 'rgba(239,68,68,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    'Violating any local, state, national, or international law.',
                    'Infringing on the intellectual property rights (Copyright/TM) of Wearixa.',
                    'Transmitting any material that is abusive, harassing, or objectionable.',
                    'Attempting to bypass any security measures of the platform.'
                  ].map(item => (
                    <li key={item} style={{ fontSize: '0.875rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertCircle size={14} /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div id="pricing" style={{ marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShoppingCart size={24} style={{ color: 'var(--color-accent)' }} /> 3. Products and Pricing
              </h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                We strive for absolute accuracy in our product listings. However, all products and prices are subject to change at any time without notice.
              </p>
              <div style={{ padding: '1.5rem', background: 'rgba(201,168,76,0.03)', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.2)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: '600' }}>
                  We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at any time without notice at our sole discretion.
                </p>
              </div>
            </div>

            <div id="changes">
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Info size={24} style={{ color: 'var(--color-accent)' }} /> 4. Changes to Terms
              </h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                We reserve the right to modify these terms at any time. Updates will be posted directly to this page.
              </p>
              <p style={{ color: 'var(--color-muted)' }}>
                Your decision to continue to visit and make use of the Site after such changes have been made constitutes your formal acceptance of the new Terms of Service.
              </p>
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
