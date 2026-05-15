'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Database, Mail, ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'collection', title: '1. Information We Collect', icon: Database },
  { id: 'usage', title: '2. How We Use Information', icon: Eye },
  { id: 'security', title: '3. Data Security', icon: Lock },
  { id: 'contact', title: '4. Contact Us', icon: Mail },
];

export default function PrivacyPolicyPage() {
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
            <ShieldCheck size={48} style={{ color: 'var(--color-accent)', marginBottom: '1.5rem' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', marginBottom: '1rem' }}>
              Your Privacy <span className="text-gold">Matters.</span>
            </h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '1rem' }}>Last updated: May 12, 2026</p>
          </motion.div>
        </header>

        <div className="privacy-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '4rem', alignItems: 'start' }}>
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
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } }
            }}
            className="glass" 
            style={{ padding: '4rem', borderRadius: '24px', border: '1px solid var(--color-border)', lineHeight: '1.8' }}
          >
            <motion.div 
              id="collection" 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              style={{ marginBottom: '4rem' }}
            >
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Database size={24} style={{ color: 'var(--color-accent)' }} /> 1. Information We Collect
              </h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.
              </p>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-accent)', marginBottom: '0.75rem' }}>Personal data includes:</p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {['Full Name', 'Email Address', 'Shipping Details', 'Phone Number', 'Payment Methods', 'Purchase History'].map(item => (
                    <li key={item} style={{ fontSize: '0.85rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ChevronRight size={12} style={{ color: 'var(--color-accent)' }} /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div 
              id="usage" 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              style={{ marginBottom: '4rem' }}
            >
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Eye size={24} style={{ color: 'var(--color-accent)' }} /> 2. How We Use Information
              </h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                We use the information we collect to provide, maintain, and improve our services, including:
              </p>
              <ul style={{ color: 'var(--color-muted)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li>Processing transactions and sending related information like receipts and confirmations.</li>
                <li>Sending technical notices, updates, security alerts, and support messages.</li>
                <li>Responding to your comments, questions, and customer service requests.</li>
                <li>Communicating with you about products, services, offers, and events offered by Wearixa.</li>
              </ul>
            </motion.div>

            <motion.div 
              id="security" 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              style={{ marginBottom: '4rem' }}
            >
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Lock size={24} style={{ color: 'var(--color-accent)' }} /> 3. Data Security
              </h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                We take your security seriously. Wearixa implements industry-standard security measures to help protect information about you from loss, theft, misuse and unauthorized access.
              </p>
              <div style={{ padding: '1.5rem', background: 'rgba(74,222,128,0.03)', borderRadius: '12px', border: '1px solid rgba(74,222,128,0.2)' }}>
                <p style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: '600' }}>
                  All payment transactions are encrypted using SSL technology and processed via secure payment gateways. We never store your full credit card information on our servers.
                </p>
              </div>
            </motion.div>

            <motion.div 
              id="contact"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={24} style={{ color: 'var(--color-accent)' }} /> 4. Contact Us
              </h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                If you have any questions or concerns about this Privacy Policy or our data practices, please reach out to our dedicated privacy team.
              </p>
              <a href="mailto:privacy@wearixa.com" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} /> Email Privacy Team
              </a>
            </motion.div>
          </motion.section>
        </div>
      </div>
      <style>{`
        @media (max-width: 960px) {
          .privacy-layout { grid-template-columns: 1fr !important; }
          aside { display: none !important; }
          .glass { padding: 2.5rem !important; }
        }
      `}</style>
    </main>
  );
}
