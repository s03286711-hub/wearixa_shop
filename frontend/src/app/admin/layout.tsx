'use client';
import './animations.css';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag,
  LogOut, Menu, X, BarChart3, DollarSign, Settings,
  Activity, Bell, ChevronRight, Zap, Percent
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
      { href: '/admin/promos', label: 'Campaigns', Icon: Percent },
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
      { href: '/admin/notifications', label: 'Notifications', Icon: Bell },
      { href: '/admin/settings', label: 'Settings', Icon: Settings },
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data || []);
      } catch (err) {
        console.error('Error loading admin notifications:', err);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 20000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutsideNotif = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideNotif);
    return () => document.removeEventListener('mousedown', handleClickOutsideNotif);
  }, []);

  useEffect(() => {
    const handleClickOutsideProfile = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideProfile);
    return () => document.removeEventListener('mousedown', handleClickOutsideProfile);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

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
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`} style={{
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
             <div className="sidebar-brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <div className="sidebar-footer" style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
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
            background: 'rgba(13, 13, 13, 0.98)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} ref={notifRef}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: notifDropdownOpen ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px', padding: '6px', color: notifDropdownOpen ? 'var(--color-accent)' : 'var(--color-muted)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', transition: 'all 0.2s'
                  }}
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-4px', fontSize: '0.58rem',
                      background: 'var(--color-accent)', color: '#000', fontWeight: 'bold',
                      borderRadius: '50%', minWidth: '13px', height: '13px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1px 3px'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div
                    className="glass"
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      width: '320px', borderRadius: '12px', overflow: 'hidden',
                      animation: 'fadeIn 0.2s ease',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      zIndex: 100
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                      <Link href="/admin/notifications" style={{ fontSize: '0.75rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--color-accent)', letterSpacing: '0.05em', textDecoration: 'underline' }}
                        onClick={() => setNotifDropdownOpen(false)}
                      >
                        SYS_NOTIFICATIONS ↗
                      </Link>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                          NO SYSTEM EVENTS RECORDED
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            style={{
                              padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)',
                              background: notif.isRead ? 'transparent' : 'rgba(201,168,76,0.04)',
                              transition: 'background 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '3px',
                              textAlign: 'left'
                            }}
                            onClick={async () => {
                              if (!notif.isRead) {
                                await notificationService.markAsRead(notif._id);
                                setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                              }
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(201,168,76,0.04)')}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: notif.isRead ? '#fff' : 'var(--color-accent)' }}>
                                {notif.title}
                              </span>
                              {!notif.isRead && (
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
                              )}
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.4 }}>
                              {notif.message}
                            </p>
                            <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', marginTop: '1px' }}>
                              {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ position: 'relative' }} ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px 10px',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
                  onMouseLeave={e => { if (!profileDropdownOpen) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg,#c9a84c,#e8c97a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '0.8rem', color: '#0d0d0d'
                  }}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#fff', lineHeight: 1.2 }}>{user.name}</span>
                    <span style={{ fontSize: '0.58rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>ADMINISTRATOR</span>
                  </div>
                  <ChevronRight size={12} style={{ transform: profileDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'rgba(255,255,255,0.4)' }} />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="glass"
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      width: '180px', borderRadius: '8px', overflow: 'hidden',
                      animation: 'fadeIn 0.2s ease',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      zIndex: 100
                    }}
                  >
                    <Link href="/" style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => setProfileDropdownOpen(false)}
                    >Storefront Home</Link>
                    <Link href="/profile" style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => setProfileDropdownOpen(false)}
                    >My Account</Link>
                    <Link href="/admin/settings" style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => setProfileDropdownOpen(false)}
                    >System Settings</Link>
                    <button onClick={logout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >Logout</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
        </div>
      </div>

      <style>{`
        /* Collapsed desktop sidebar brand layout */
        .admin-sidebar.closed .sidebar-brand-logo {
          display: none !important;
        }

        @media (max-width: 768px) {
          .admin-layout { flex-direction: column !important; }
          .admin-sidebar { 
            width: 100% !important; 
            height: auto !important; 
            position: sticky !important; 
            top: 0 !important; 
            z-index: 100 !important; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(201,168,76,0.15) !important;
          }
          .admin-sidebar.closed .sidebar-brand-logo {
            display: flex !important;
          }
          .admin-sidebar.closed .sidebar-brand-logo > div:last-child {
            display: block !important;
          }
          .admin-sidebar.closed .sidebar-footer {
            display: none !important;
          }
          .admin-sidebar.closed .sidebar-brand-logo {
            display: flex !important;
          }
          .admin-sidebar.closed .sidebar-footer {
            display: none !important;
          }
          .admin-nav.closed { display: none !important; }
          .sidebar-footer { border-top: 1px solid rgba(255,255,255,0.05) !important; padding: 0.75rem !important; }
          .admin-header { display: none !important; }
          main { padding: 1rem !important; }
        }
      `}</style>
    </>
  );
}
