'use client';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', marginTop: '5rem' }}>
      <div className="container" style={{ padding: '4rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: '700', letterSpacing: '0.15em' }} className="text-gold">
                WEARIXA
              </span>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.35em', color: 'var(--color-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                Fashion House
              </div>
            </div>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              Curated fashion for the modern individual. Explore premium collections crafted with elegance and purpose.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {[
                { Icon: Mail, href: 'mailto:s03286711@gmail.com' },
                { Icon: Phone, href: 'tel:+923286711208' },
                { Icon: MapPin, href: 'https://maps.google.com/?q=Lahore,+Punjab+Pakistan' }
              ].map(({ Icon, href }, i) => (
                <motion.a 
                  key={i} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  whileHover={{ y: -3, color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}
                  style={{
                    width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--color-border)', borderRadius: '50%', color: 'var(--color-muted)',
                    transition: 'all 0.3s',
                  }}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '1.5rem', fontFamily: 'var(--font-body)', fontWeight: '600' }}>
              Shop
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Women', 'Men', 'Accessories', 'New Arrivals', 'Sale'].map((item) => {
                const isSpecial = ['New Arrivals', 'Sale'].includes(item);
                const href = isSpecial ? '/shop' : `/shop?category=${item.toLowerCase()}`;
                return (
                  <li key={item}>
                    <Link href={href} style={{ color: 'var(--color-muted)', fontSize: '0.875rem', position: 'relative', display: 'inline-block' }} className="footer-link">
                      {item}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '1.5rem', fontFamily: 'var(--font-body)', fontWeight: '600' }}>
              Company
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Careers', path: '/careers' },
                { name: 'Press', path: '/press' },
                { name: 'Sustainability', path: '/sustainability' },
                { name: 'Privacy Policy', path: '/privacy' }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.path} style={{ color: 'var(--color-muted)', fontSize: '0.875rem', position: 'relative', display: 'inline-block' }} className="footer-link">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '1.5rem', fontFamily: 'var(--font-body)', fontWeight: '600' }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { Icon: Mail, text: 's03286711@gmail.com', href: 'mailto:s03286711@gmail.com' },
                { Icon: Phone, text: '+92 328 6711 208', href: 'tel:+923286711208' },
                { Icon: MapPin, text: 'Lahore, Punjab Pakistan', href: 'https://maps.google.com/?q=Lahore,+Punjab+Pakistan' },
              ].map(({ Icon, text, href }) => (
                <motion.a 
                  key={text} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  whileHover={{ x: 5, color: 'var(--color-text)' }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-muted)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.3s' }}
                >
                  <Icon size={15} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  {text}
                </motion.a>
              ))}
            </div>

            {/* Newsletter */}
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>Subscribe to our newsletter</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="input-field"
                  placeholder="Enter email"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                />
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary" 
                  style={{ padding: '0.5rem 1.5rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                >
                  Join
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Animated Bottom Bar ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ 
            borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            flexWrap: 'wrap', gap: '1rem' 
          }}
        >
          <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Wearixa. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[
              { name: 'Terms', path: '/terms' },
              { name: 'Privacy', path: '/privacy' },
              { name: 'Cookies', path: '/cookies' }
            ].map((item) => (
              <Link key={item.name} href={item.path} style={{ color: 'var(--color-muted)', fontSize: '0.8rem', position: 'relative' }} className="footer-link">
                {item.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
      
      <style>{`
        .footer-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 1px;
          bottom: -2px;
          left: 0;
          background-color: var(--color-accent);
          transition: width 0.3s ease;
        }
        .footer-link:hover::after {
          width: 100%;
        }
        .footer-link:hover {
          color: var(--color-text) !important;
        }
      `}</style>
    </footer>
  );
}
