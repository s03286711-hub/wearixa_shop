'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Database, Mail, ChevronRight, RefreshCcw } from 'lucide-react';

const SECTIONS = [
  { id: 'collection', title: '1. Information We Collect', icon: Database },
  { id: 'usage', title: '2. How We Use Information', icon: Eye },
  { id: 'security', title: '3. Data Security', icon: Lock },
  { id: 'return-policy', title: '4. Return Policy', icon: RefreshCcw },
  { id: 'contact', title: '5. Contact Us', icon: Mail },
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
        {/* ── Cinematic Hero ── */}
        <header style={{ 
          height: '50vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '30px', overflow: 'hidden', marginBottom: '5rem'
        }}>
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?q=80&w=2070&auto=format&fit=crop')`,
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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 1rem' }}
          >
            <ShieldCheck size={48} style={{ color: 'var(--color-accent)', margin: '0 auto 1.5rem' }} />
            <h1 className="hero-title" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', marginBottom: '1rem' }}>
              Your Privacy <span className="text-gold">Matters.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>Last updated: May 12, 2026</p>
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
                className="footer-link"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid transparent', color: 'var(--color-muted)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s', fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
                  e.currentTarget.style.color = 'var(--color-accent)';
                  const icon = e.currentTarget.querySelector('svg');
                  if (icon) icon.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-muted)';
                  const icon = e.currentTarget.querySelector('svg');
                  if (icon) icon.style.transform = 'scale(1)';
                }}
              >
                <s.icon size={16} style={{ transition: 'transform 0.3s' }} />
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
              id="return-policy" 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              style={{ marginBottom: '4rem' }}
            >
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <RefreshCcw size={24} style={{ color: 'var(--color-accent)' }} /> 4. Return Policy
              </h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                We want you to be completely satisfied with your Wearixa purchase. If you are not entirely happy, we offer a straightforward return process.
              </p>
              <ul style={{ color: 'var(--color-muted)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <li>Items can be returned within 30 days of the original delivery date.</li>
                <li>Items must be unworn, unwashed, and have original tags attached.</li>
                <li>Sale items and custom-tailored pieces are final sale and cannot be returned.</li>
                <li>Refunds will be issued to the original form of payment within 5-7 business days after we receive the return.</li>
              </ul>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
                  To initiate a return, please visit your <a href="/profile" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Account Profile</a> or contact our support team.
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
                <Mail size={24} style={{ color: 'var(--color-accent)' }} /> 5. Contact Us
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
          .privacy-layout { grid-template-columns: 1fr !important; gap: 3rem !important; }
          header { height: auto !important; padding: 4rem 1rem !important; }
          .hero-title { font-size: 2.2rem !important; }
          section { padding: 2.5rem !important; }
          aside { position: relative !important; top: 0 !important; order: -1; width: 100% !important; }
        }
      `}</style>
    </main>
  );
}
