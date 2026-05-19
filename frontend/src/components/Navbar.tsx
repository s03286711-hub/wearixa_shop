'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Search, User, Menu, X, ChevronDown, Heart, Bell } from 'lucide-react';
import { notificationService } from '@/services';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data || []);
      } catch (err) {
        console.error('Error loading customer notifications:', err);
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?keyword=${encodeURIComponent(searchQuery)}`;
      setSearchOpen(false);
    }
  };

  return (
    <>
      <nav
        className="main-navbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'all 0.3s ease',
          background: scrolled ? 'rgba(13,13,13,0.98)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
          padding: '0 2rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '700', letterSpacing: '0.15em' }} className="text-gold">
              WEARIXA
            </span>
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.35em', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Fashion House
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }} className="hidden-mobile">
            {[
              { label: 'Home', href: '/' },
              { label: 'Shop', href: '/shop' },
              { label: 'Collections', href: '/shop?category=collections' },
              { label: 'About', href: '/about' },
            ].map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                    fontSize: '0.85rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: isActive ? '700' : '500',
                    transition: 'all 0.3s',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--color-accent)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--color-text)'; }}
                >
                  {link.label}
                  {isActive && (
                    <span style={{
                      position: 'absolute', bottom: '-8px', width: '20px', height: '2px',
                      background: 'var(--color-accent)', borderRadius: '2px',
                    }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="right-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', padding: '4px', transition: 'color 0.3s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" style={{ color: pathname === '/wishlist' ? 'var(--color-accent)' : 'var(--color-text)', transition: 'color 0.3s' }}
              onMouseEnter={(e) => { if (pathname !== '/wishlist') e.currentTarget.style.color = 'var(--color-accent)'; }}
              onMouseLeave={(e) => { if (pathname !== '/wishlist') e.currentTarget.style.color = 'var(--color-text)'; }}
            >
              <Heart size={20} fill={pathname === '/wishlist' ? 'var(--color-accent)' : 'none'} />
            </Link>

            {/* Cart */}
            <Link href="/cart" style={{ position: 'relative', color: pathname === '/cart' ? 'var(--color-accent)' : 'var(--color-text)', transition: 'color 0.3s' }}
              onMouseEnter={(e) => { if (pathname !== '/cart') e.currentTarget.style.color = 'var(--color-accent)'; }}
              onMouseLeave={(e) => { if (pathname !== '/cart') e.currentTarget.style.color = 'var(--color-text)'; }}
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="badge" style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '0.65rem' }}>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Dynamic Notification Bell */}
            {user && (
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  style={{ background: 'none', border: 'none', color: notifDropdownOpen ? 'var(--color-accent)' : 'var(--color-text)', cursor: 'pointer', padding: '4px', position: 'relative', transition: 'color 0.3s' }}
                  onMouseEnter={(e) => { if (!notifDropdownOpen) e.currentTarget.style.color = 'var(--color-accent)'; }}
                  onMouseLeave={(e) => { if (!notifDropdownOpen) e.currentTarget.style.color = 'var(--color-text)'; }}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="badge" style={{ position: 'absolute', top: '-2px', right: '-2px', fontSize: '0.6rem', padding: '2px 5px', minWidth: '16px', height: '16px' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div
                    className="glass"
                    style={{
                      position: 'absolute', right: '-80px', top: 'calc(100% + 12px)',
                      width: '320px', borderRadius: '8px', overflow: 'hidden',
                      animation: 'fadeIn 0.2s ease',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      zIndex: 1001
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>NOTIFICATIONS</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} style={{ fontSize: '0.75rem', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            style={{
                              padding: '0.9rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                              background: notif.isRead ? 'transparent' : 'rgba(201,168,76,0.04)',
                              transition: 'background 0.3s', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px',
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: notif.isRead ? 'var(--color-text)' : 'var(--color-accent)' }}>
                                {notif.title}
                              </span>
                              {!notif.isRead && (
                                <button
                                  onClick={(e) => handleMarkAsRead(notif._id, e)}
                                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)', border: 'none', padding: 0, cursor: 'pointer' }}
                                  title="Mark as read"
                                />
                              )}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.4 }}>
                              {notif.message}
                            </p>
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginTop: '2px' }}>
                              {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', 
                  color: ['/profile', '/orders'].includes(pathname || '') ? 'var(--color-accent)' : 'var(--color-text)', 
                  cursor: 'pointer', transition: 'color 0.3s' 
                }}
                onMouseEnter={(e) => { if (!['/profile', '/orders'].includes(pathname || '')) e.currentTarget.style.color = 'var(--color-accent)'; }}
                onMouseLeave={(e) => { if (!['/profile', '/orders'].includes(pathname || '')) e.currentTarget.style.color = 'var(--color-text)'; }}
              >
                <User size={20} />
                {user && <span className="user-name-span" style={{ fontSize: '0.8rem' }}>{user.name.split(' ')[0]}</span>}
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div
                  className="glass"
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 12px)',
                    minWidth: '180px', borderRadius: '8px',
                    overflow: 'hidden', animation: 'fadeIn 0.2s ease',
                  }}
                >
                  {user ? (
                    <>
                      <Link href="/profile" style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.85rem', borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >My Profile</Link>
                      <Link href="/orders" style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.85rem', borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >My Orders</Link>
                      {isAdmin && (
                        <Link href="/admin" style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--color-accent)', borderBottom: '1px solid var(--color-border)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >Admin Panel</Link>
                      )}
                      <button onClick={logout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.85rem', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >Logout</button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.85rem', borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >Login</Link>
                      <Link href="/auth/register" style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.85rem' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >Register</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer', display: 'none' }}
              className="mobile-menu-btn"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '1rem 2rem' }}>
            <form onSubmit={handleSearch} style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '1rem' }}>
              <input
                className="input-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands..."
                autoFocus
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '1.5rem 2rem' }}>
            {[
              { label: 'Home', href: '/' },
              { label: 'Shop', href: '/shop' },
              { label: 'Collections', href: '/shop?category=collections' },
              { label: 'Cart', href: '/cart' },
              { label: 'Wishlist', href: '/wishlist' },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                style={{ display: 'block', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: '0.9rem', letterSpacing: '0.05em' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button onClick={logout} style={{ marginTop: '1rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                Logout
              </button>
            ) : (
              <Link href="/auth/login" style={{ display: 'block', marginTop: '1rem', color: 'var(--color-accent)', fontSize: '0.9rem' }}>
                Login / Register
              </Link>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .main-navbar { padding: 0 1rem !important; }
          .right-actions { gap: 0.75rem !important; }
          .user-name-span { display: none !important; }
        }
      `}</style>
    </>
  );
}
