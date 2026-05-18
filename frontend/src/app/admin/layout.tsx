'use client';
import './animations.css';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag,
  LogOut, Menu, X, BarChart3, DollarSign, Settings,
  Activity, Bell, ChevronRight, Zap
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'COMMAND',
    items: [
      { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
      { href: '/admin/orders', label: 'Orders', Icon: ShoppingCart },
      { href: '/admin/products', label: 'Products', Icon: Package },
      { href: '/admin/users', label: 'Customers', Icon: Users },
      { href: '/admin/categories', label: 'Categories', Icon: Tag },
    ]
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { href: '/admin/analytics', label: 'Analytics', Icon: BarChart3 },
      { href: '/admin/finance', label: 'Finance', Icon: DollarSign },
    ]
  },
  {
    label: 'SYSTEM',
    items: [
      { href: '/admin/settings', label: 'Settings', Icon: Settings },
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && user === null) { router.push('/auth/login'); return; }
    if (!loading && user && !isAdmin) { router.push('/'); }
  }, [user, isAdmin, router, loading]);

  // Close sidebar on mobile by default
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  if (loading || !user || !isAdmin) return null;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>

        {/* ── Sidebar ── */}
        <aside className="admin-sidebar" style={{
          width: sidebarOpen ? '240px' : '68px', flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(13,13,13,0.98) 0%, rgba(18,18,18,0.98) 100%)',
          borderRight: '1px solid rgba(201,168,76,0.1)',
          display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          position: 'sticky', top: 0, height: '100vh', overflowX: 'hidden', zIndex: 20,
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)'
        }}>

          {/* Logo / Brand */}
          <div style={{
            padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '64px',
            background: 'rgba(201,168,76,0.03)'
          }}>
            {sidebarOpen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  background: 'linear-gradient(135deg,#c9a84c,#e8c97a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(201,168,76,0.4)'
                }}>
                  <Zap size={14} color="#0d0d0d" fill="#0d0d0d" />
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: '800', letterSpacing: '0.12em', whiteSpace: 'nowrap', color: '#fff' }}>
                    WEARIXA
                  </span>
                  <p style={{ fontSize: '0.55rem', color: 'var(--color-accent)', fontFamily: 'monospace', letterSpacing: '0.1em', lineHeight: 1 }}>
                    ADMIN ERP v2.4
                  </p>
                </div>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                color: 'var(--color-muted)', cursor: 'pointer', padding: '6px', borderRadius: '6px',
                marginLeft: sidebarOpen ? 0 : 'auto', marginRight: sidebarOpen ? 0 : 'auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--color-muted)'; }}
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className={`admin-nav ${sidebarOpen ? 'open' : 'closed'}`} style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto', overflowX: 'hidden' }}>
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                {/* Group Label */}
                {sidebarOpen && (
                  <p style={{
                    fontSize: '0.58rem', fontFamily: 'monospace', letterSpacing: '0.12em',
                    color: 'rgba(255,255,255,0.2)', padding: '0.85rem 1.25rem 0.35rem',
                    textTransform: 'uppercase', fontWeight: '600'
                  }}>
                    {group.label}
                  </p>
                )}
                {!sidebarOpen && <div style={{ height: '8px' }} />}

                {group.items.map(({ href, label, Icon, exact }) => {
                  const active = isActive(href, exact);
                  return (
                    <Link key={href} href={href} title={label} 
                      className={`admin-nav-link ${active ? 'active' : ''}`}
                      style={{
                        display: 'flex', alignItems: 'center',
                        gap: sidebarOpen ? '10px' : '0',
                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                        padding: sidebarOpen ? '0.65rem 1.25rem' : '0.75rem',
                        margin: '1px 8px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        whiteSpace: 'nowrap', textDecoration: 'none',
                        position: 'relative'
                      }}
                    >
                      {/* Active glow dot */}
                      {active && sidebarOpen && (
                        <span style={{
                          position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)',
                          width: '3px', height: '18px', borderRadius: '2px',
                          background: 'var(--color-accent)',
                          boxShadow: '0 0 8px rgba(201,168,76,0.8)'
                        }} />
                      )}
                      <Icon size={16} style={{ flexShrink: 0, filter: active ? 'drop-shadow(0 0 4px rgba(201,168,76,0.5))' : 'none' }} />
                      {sidebarOpen && (
                        <>
                          <span style={{ flex: 1 }}>{label}</span>
                          {active && <ChevronRight size={12} style={{ opacity: 0.6 }} />}
                        </>
                      )}
                    </Link>
                  );
                })}
                {/* Group separator */}
                <div style={{ height: '0.5rem' }} />
              </div>
            ))}
          </nav>

          {/* User / Logout footer */}
          <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
            {sidebarOpen && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '0.6rem 0.75rem', marginBottom: '0.5rem',
                borderRadius: '8px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#c9a84c,#e8c97a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '0.8rem', color: '#0d0d0d', flexShrink: 0
                }}>
                  {user.name.charAt(0)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                  <p style={{ fontSize: '0.62rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>ADMIN_CLEARANCE</p>
                </div>
              </div>
            )}
            <button onClick={logout} title="Logout" style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              width: '100%',
              background: 'none', border: '1px solid transparent', color: 'rgba(248,113,113,0.7)',
              cursor: 'pointer', padding: '0.6rem 0.75rem', borderRadius: '8px',
              fontSize: '0.82rem', whiteSpace: 'nowrap', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#f87171'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.7)'; }}
            >
              <LogOut size={16} style={{ flexShrink: 0 }} />
              {sidebarOpen && 'Logout'}
            </button>
          </div>
        </aside>

        {/* ── Main content area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minWidth: 0 }}>

          {/* Top Header Bar */}
          <header className="admin-header" style={{
            background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '0 1.5rem', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={14} style={{ color: '#4ade80' }} />
              <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>
                SYS_STATUS: <span style={{ color: '#4ade80' }}>ONLINE</span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '6px', color: 'var(--color-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Bell size={15} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#c9a84c,#e8c97a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '0.8rem', color: '#0d0d0d'
                }}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff' }}>{user.name}</p>
                  <p style={{ fontSize: '0.6rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>ADMINISTRATOR</p>
                </div>
              </div>
            </div>
          </header>

          <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-layout { flex-direction: column !important; }
          .admin-sidebar { width: 100% !important; height: auto !important; position: sticky !important; top: 0 !important; z-index: 100 !important; }
          .admin-nav.closed { display: none !important; }
          .admin-sidebar > div:last-child { border-top: none !important; padding: 0.5rem !important; }
          .admin-header { display: none !important; }
          main { padding: 1rem !important; }
        }
      `}</style>
    </>
  );
}
