'use client';

import React, { useEffect, useState } from 'react';
import { 
  Bell, Search, Filter, CheckCircle2, Calendar, 
  Trash2, Banknote, Package, ShoppingCart, Info, Clock, RefreshCw
} from 'lucide-react';
import { notificationService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const getEventIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('order')) return <ShoppingCart size={15} style={{ color: '#60a5fa' }} />;
  if (t.includes('payment') || t.includes('deposit') || t.includes('wallet')) return <Banknote size={15} style={{ color: '#4ade80' }} />;
  if (t.includes('deliver') || t.includes('dispatch') || t.includes('shipped')) return <Package size={15} style={{ color: '#a78bfa' }} />;
  return <Info size={15} style={{ color: 'var(--color-accent)' }} />;
};

const getEventTagColor = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('order')) return 'rgba(96,165,250,0.1)';
  if (t.includes('payment') || t.includes('deposit') || t.includes('wallet')) return 'rgba(74,222,128,0.1)';
  if (t.includes('deliver') || t.includes('dispatch') || t.includes('shipped')) return 'rgba(167,139,250,0.1)';
  return 'rgba(201,168,76,0.1)';
};

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'order' | 'payment'>('all');

  const fetchNotifs = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notification records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifs();
    }
  }, [user]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Filter logic
  const filteredNotifications = notifications.filter(notif => {
    // Search filter
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'unread' && !notif.isRead) || 
      (statusFilter === 'read' && notif.isRead);

    // Type filter
    const matchesType = 
      typeFilter === 'all' || 
      (typeFilter === 'order' && notif.title.toLowerCase().includes('order')) || 
      (typeFilter === 'payment' && (
        notif.title.toLowerCase().includes('payment') || 
        notif.title.toLowerCase().includes('deposit') || 
        notif.title.toLowerCase().includes('wallet')
      ));

    return matchesSearch && matchesStatus && matchesType;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.5rem 0' }}>
      
      {/* Telemetry Header */}
      <div className="glass" style={{
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        background: 'rgba(13, 13, 13, 0.45)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        border: '1px solid rgba(201, 168, 76, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'relative'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={18} className="text-gold" style={{ filter: 'drop-shadow(0 0 5px rgba(201,168,76,0.6))' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '700', letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase' }}>
              System Notifications Console
            </h1>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '4px', letterSpacing: '0.02em' }}>
            TELEMETRY_LOG_INTERFACE // EVENT_HISTORY
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchNotifs}
            className="btn-primary" 
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#fff'
            }}
          >
            <RefreshCw size={13} />
            SYNC_EVENTS
          </button>
          
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="btn-primary" 
              style={{ 
                padding: '0.5rem 1rem', 
                fontSize: '0.75rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}
            >
              <CheckCircle2 size={13} />
              RESOLVE_ALL_UNREAD
            </button>
          )}
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          { label: 'Unresolved Alerts', value: unreadCount, sub: '[ACTIVE_THREAT_QUEUE]', color: '#f87171', bg: 'rgba(239,68,68,0.05)', border: 'rgba(239,68,68,0.2)' },
          { label: 'Logged Incidents', value: notifications.length, sub: '[TOTAL_SYSTEM_LOGS]', color: '#60a5fa', bg: 'rgba(96,165,250,0.05)', border: 'rgba(96,165,250,0.2)' },
          { label: 'System Healthy', value: '100%', sub: '[CORE_NODE_STATUS]', color: '#4ade80', bg: 'rgba(74,222,128,0.05)', border: 'rgba(74,222,128,0.2)' }
        ].map((card, index) => (
          <div key={card.label} className="glass notif-stat-card animate-fade-in-stagger" style={{
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            background: 'rgba(13, 13, 13, 0.4)',
            border: `1px solid ${card.border}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '110px',
            animationDelay: `${index * 0.1}s`
          }}>
            <div>
              <span style={{ fontSize: '0.6rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>{card.sub}</span>
              <h4 style={{ fontSize: '0.75rem', color: '#fff', textTransform: 'uppercase', marginTop: '2px', fontWeight: '600' }}>{card.label}</h4>
            </div>
            <span style={{ fontSize: '1.75rem', color: card.color, fontFamily: 'monospace', fontWeight: 'bold' }}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* Control Filter Bar */}
      <div className="glass" style={{
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        background: 'rgba(13, 13, 13, 0.35)',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '6px 12px', minWidth: '280px', flex: 1 }}>
          <Search size={14} style={{ color: 'var(--color-muted)' }} />
          <input 
            type="text" 
            placeholder="Search records by title, keyword, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.8rem', width: '100%', outline: 'none' }}
          />
        </div>

        {/* Filter dropboxes */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '6px 10px' }}>
            <Filter size={12} style={{ color: 'var(--color-muted)' }} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.78rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all" style={{ background: '#121212' }}>ALL_STATUS</option>
              <option value="unread" style={{ background: '#121212' }}>UNRESOLVED_ONLY</option>
              <option value="read" style={{ background: '#121212' }}>RESOLVED_ONLY</option>
            </select>
          </div>

          {/* Event type filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '6px 10px' }}>
            <Clock size={12} style={{ color: 'var(--color-muted)' }} />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.78rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all" style={{ background: '#121212' }}>ALL_EVENT_TYPES</option>
              <option value="order" style={{ background: '#121212' }}>ORDER_EVENTS</option>
              <option value="payment" style={{ background: '#121212' }}>FINANCIAL_EVENTS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main timeline listing */}
      <div className="glass" style={{
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(13, 13, 13, 0.45)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
            NO EVENTS FOUND MATCHING SPECIFIED TELESCOPE FILTERS
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredNotifications.map((notif, index) => (
              <div 
                key={notif._id}
                style={{
                  padding: '1.25rem 2rem',
                  borderBottom: index === filteredNotifications.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  background: notif.isRead ? 'transparent' : 'rgba(201,168,76,0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1.5rem',
                  position: 'relative',
                  animationDelay: `${index * 0.05}s`
                }}
                className="notif-timeline-item animate-fade-in-stagger"
              >
                {/* Visual Unread Strip Indicator */}
                {!notif.isRead && (
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--color-accent)' }} />
                )}

                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  {/* Glassmorphic Event Icon Container */}
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: getEventTagColor(notif.title),
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getEventIcon(notif.title)}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: notif.isRead ? '#e2e2e2' : '#fff' }}>
                        {notif.title}
                      </span>
                      {!notif.isRead && (
                        <span style={{
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '0.62rem',
                          fontWeight: '700',
                          background: 'rgba(239,68,68,0.1)',
                          color: '#f87171',
                          border: '1px solid rgba(239,68,68,0.2)',
                          fontFamily: 'monospace'
                        }}>
                          NEW_INCIDENT
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: '2px 0 0 0', lineHeight: 1.5 }}>
                      {notif.message}
                    </p>
                    
                    {/* Event Timestamp and ID */}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '6px', fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} />
                        {new Date(notif.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span>ID: #{notif._id}</span>
                    </div>
                  </div>
                </div>

                {/* Mark as resolved action button */}
                {!notif.isRead && (
                  <button 
                    onClick={() => handleMarkRead(notif._id)}
                    className="btn-primary"
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.72rem',
                      background: 'rgba(201,168,76,0.1)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      color: 'var(--color-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.18)'; e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; }}
                  >
                    <CheckCircle2 size={12} />
                    RESOLVE
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

