'use client';
import '@/app/admin/animations.css';
import { useEffect, useState, useMemo, Fragment } from 'react';
import { orderService } from '@/services';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  CheckCircle, Truck, Package, Clock, ShieldCheck, XCircle,
  Search, ChevronDown, ChevronUp, DollarSign, MapPin, 
  CreditCard, Activity, Calendar
} from 'lucide-react';

const STATUS_OPTIONS = ['Processing', 'Packing', 'Shipped', 'Delivered', 'Cancelled'];

const getCardColorClass = (color: string) => {
  if (color === '#60a5fa') return 'kpi-card-blue';
  if (color === '#a78bfa') return 'kpi-card-purple';
  if (color === '#4ade80') return 'kpi-card-green';
  return 'kpi-card'; // gold default
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const fetchOrders = () => {
    setLoading(true);
    orderService.getAllOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await orderService.updateStatus(id, newStatus);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeliveryUpdate = async (id: string, date: string) => {
    try {
      const order = orders.find(o => o._id === id);
      await orderService.updateStatus(id, order.status, date);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const markPaid = async (id: string) => {
    await orderService.updateToPaid(id, { id: 'manual', status: 'COMPLETED', update_time: new Date().toISOString() });
    fetchOrders();
  };

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 1. Analytical indicators calculation
  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, o) => acc + (o.isPaid ? o.totalPrice : 0), 0);
  }, [orders]);

  const pendingCount = useMemo(() => {
    return orders.filter(o => ['Processing', 'Packing'].includes(o.status || 'Processing')).length;
  }, [orders]);

  const shippedCount = useMemo(() => {
    return orders.filter(o => o.status === 'Shipped').length;
  }, [orders]);

  const completedCount = useMemo(() => {
    return orders.filter(o => o.status === 'Delivered').length;
  }, [orders]);

  // Tab count labels
  const tabCounts = useMemo(() => {
    return {
      All: orders.length,
      Processing: orders.filter(o => (o.status || 'Processing') === 'Processing').length,
      Packing: orders.filter(o => o.status === 'Packing').length,
      Shipped: orders.filter(o => o.status === 'Shipped').length,
      Delivered: orders.filter(o => o.status === 'Delivered').length,
      Cancelled: orders.filter(o => o.status === 'Cancelled').length
    };
  }, [orders]);

  // Filtered dataset
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Tab filter
      if (activeTab !== 'All' && (order.status || 'Processing') !== activeTab) {
        return false;
      }
      // Text search
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const orderId = `#${order._id.slice(-8).toUpperCase()}`;
        const name = (order.user?.name || '').toLowerCase();
        const email = (order.user?.email || '').toLowerCase();
        return orderId.includes(term) || name.includes(term) || email.includes(term);
      }
      return true;
    });
  }, [orders, activeTab, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return { bg: 'rgba(59, 130, 246, 0.08)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.25)', icon: <Clock size={11} className="pulse-slow" /> };
      case 'Packing': return { bg: 'rgba(167, 139, 250, 0.08)', text: '#a78bfa', border: 'rgba(167, 139, 250, 0.25)', icon: <Package size={11} /> };
      case 'Shipped': return { bg: 'rgba(251, 191, 36, 0.08)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.25)', icon: <Truck size={11} /> };
      case 'Delivered': return { bg: 'rgba(74, 222, 128, 0.08)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.25)', icon: <CheckCircle size={11} /> };
      case 'Cancelled': return { bg: 'rgba(239, 68, 68, 0.08)', text: '#f87171', border: 'rgba(239, 68, 68, 0.25)', icon: <XCircle size={11} /> };
      default: return { bg: 'rgba(156, 163, 175, 0.08)', text: '#9ca3af', border: 'rgba(156, 163, 175, 0.25)', icon: <Clock size={11} /> };
    }
  };

  const statCards = [
    { label: 'Cumulative Revenue', value: `$${totalRevenue.toFixed(2)}`, sub: 'PAID_VOLUME_USD', color: '#c9a84c', bg: 'rgba(201,168,76,0.06)', border: 'rgba(201,168,76,0.2)', icon: <DollarSign size={16} /> },
    { label: 'Pending Queue', value: pendingCount, sub: 'PROCESSING_ORDERS', color: '#60a5fa', bg: 'rgba(96,165,250,0.06)', border: 'rgba(96,165,250,0.2)', icon: <Package size={16} /> },
    { label: 'Active Shipments', value: shippedCount, sub: 'IN_TRANSIT_CARRIERS', color: '#a78bfa', bg: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.2)', icon: <Truck size={16} /> },
    { label: 'Completed Deliveries', value: completedCount, sub: 'LIFECYCLE_DELIVERED', color: '#4ade80', bg: 'rgba(74,222,128,0.06)', border: 'rgba(74,222,128,0.2)', icon: <CheckCircle size={16} /> }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Futuristic Header */}
      <div className="glass" style={{
        borderRadius: '16px',
        padding: '1.25rem 2rem',
        background: 'rgba(13, 13, 13, 0.45)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', borderTop: '2px solid var(--color-accent)', borderLeft: '2px solid var(--color-accent)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderBottom: '2px solid var(--color-accent)', borderRight: '2px solid var(--color-accent)' }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={18} className="text-gold" style={{ filter: 'drop-shadow(0 0 5px rgba(201,168,76,0.6))' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '700', letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase' }}>
              Orders Command Deck
            </h1>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '4px', letterSpacing: '0.02em' }}>
            ORDER_CONTROLLER_SYS // TOTAL_QUEUES: {orders.length} ACTIVE_RECORDS
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)' }}>NODE_CLEARED_SECURE</span>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
        </div>
      </div>

      {/* 2. Analytical Statistics Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {statCards.map((card, i) => {
          return (
            <div 
              key={card.label} 
              className={`glass ${getCardColorClass(card.color)}`}
              style={{
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                background: 'rgba(13, 13, 13, 0.4)',
                border: `1px solid ${card.border}`,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div>
                <p style={{ fontSize: '0.58rem', color: 'var(--color-muted)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>[{card.sub}]</p>
                <p style={{ fontSize: '0.72rem', color: '#fff', fontWeight: '500', marginTop: '2px', textTransform: 'uppercase' }}>{card.label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: card.color, fontFamily: 'monospace', marginTop: '6px', lineHeight: 1.1 }}>{card.value}</p>
              </div>
              <div 
                className="kpi-icon-container"
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '8px', 
                  background: card.bg, 
                  border: `1px solid ${card.border}`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: card.color
                }}
              >
                {card.icon}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Table Filters, Search & Command Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Dynamic Tab Filter controls */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
            {(['All', 'Processing', 'Packing', 'Shipped', 'Delivered', 'Cancelled'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
                  border: activeTab === tab ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                  color: activeTab === tab ? 'var(--color-accent)' : 'rgba(255,255,255,0.6)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={e => { if (activeTab !== tab) e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (activeTab !== tab) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                {tab.toUpperCase()}
                <span style={{ 
                  background: activeTab === tab ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontSize: '0.62rem',
                  color: activeTab === tab ? 'var(--color-accent-light)' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'monospace'
                }}>
                  {tabCounts[tab as keyof typeof tabCounts]}
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Search Console */}
          <div style={{ position: 'relative', minWidth: '280px', flex: '1 0 auto', maxWidth: '400px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }}>
              <Search size={14} />
            </span>
            <input 
              type="text"
              placeholder="SEARCH_BY_ID_CUSTOMER_EMAIL..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: 'white',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            />
          </div>

        </div>

        {/* 4. Main Database Table */}
        {loading ? <LoadingSpinner /> : (
          <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                    <th style={{ width: '40px' }} /> {/* Expand trigger col */}
                    {['Order ID', 'Customer Info', 'Total Price', 'Payment Cleared', 'Lifecycle Status', 'Command Console'].map(h => (
                      <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', color: 'var(--color-muted)', fontWeight: '600', fontSize: '0.68rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order: any) => {
                    const s = getStatusColor(order.status || 'Processing');
                    const isExpanded = expandedOrders.includes(order._id);
                    return (
                      <Fragment key={order._id}>
                        <tr 
                          style={{ 
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            borderLeft: isExpanded ? '3px solid var(--color-accent)' : '3px solid transparent',
                            background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
                            if (!isExpanded) {
                              e.currentTarget.style.borderLeftColor = 'rgba(201,168,76,0.35)';
                            }
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent';
                            if (!isExpanded) {
                              e.currentTarget.style.borderLeftColor = 'transparent';
                            }
                          }}
                        >
                          
                          {/* Expand Trigger Button */}
                          <td style={{ padding: '0.9rem 0 0.9rem 1rem', textAlign: 'center' }}>
                            <button 
                              onClick={() => toggleExpand(order._id)}
                              style={{
                                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', transition: 'all 0.2s', padding: '4px',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)'
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                            >
                              <ChevronDown size={14} />
                            </button>
                          </td>

                          {/* Order ID */}
                          <td style={{ padding: '0.9rem 1.25rem' }}>
                            <button 
                              onClick={() => toggleExpand(order._id)}
                              style={{ 
                                background: 'none', border: 'none', padding: 0, textAlign: 'left',
                                fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-accent-light)', 
                                fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' 
                              }}
                            >
                              #{order._id.slice(-8).toUpperCase()}
                            </button>
                            <p style={{ fontSize: '0.65rem', color: 'var(--color-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </td>

                          {/* Customer details */}
                          <td style={{ padding: '0.9rem 1.25rem' }}>
                            <p style={{ fontWeight: '600', color: '#eaeaea', fontSize: '0.8rem' }}>{order.user?.name || 'GUEST_USER'}</p>
                            <p style={{ fontSize: '0.68rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>{order.user?.email || 'guest@wearixa.com'}</p>
                          </td>

                          {/* Gross Value */}
                          <td style={{ padding: '0.9rem 1.25rem', fontWeight: '700', color: '#fff', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                            ${order.totalPrice.toFixed(2)}
                          </td>

                          {/* Payment indicator badge */}
                          <td style={{ padding: '0.9rem 1.25rem' }}>
                            <div style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              padding: '3px 8px', 
                              borderRadius: '4px', 
                              fontSize: '0.65rem', 
                              fontWeight: '700', 
                              fontFamily: 'monospace',
                              background: order.isPaid ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)', 
                              color: order.isPaid ? '#4ade80' : '#f87171', 
                              border: `1px solid ${order.isPaid ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}` 
                            }}>
                              {order.isPaid ? <ShieldCheck size={11} /> : <Clock size={11} />}
                              {order.isPaid ? 'VAL_TRUE' : 'VAL_FALSE'}
                            </div>
                          </td>

                          {/* Status lifecycle badge */}
                          <td style={{ padding: '0.9rem 1.25rem' }}>
                            <div style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px', 
                              padding: '3px 8px', 
                              borderRadius: '4px', 
                              fontSize: '0.65rem', 
                              fontWeight: '700', 
                              fontFamily: 'monospace',
                              background: s.bg, 
                              color: s.text, 
                              border: `1px solid ${s.border}` 
                            }}>
                              {s.icon}
                              {order.status?.toUpperCase() || 'PROCESSING'}
                            </div>
                          </td>

                          {/* Actions control panel */}
                          <td style={{ padding: '0.9rem 1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '170px' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <select 
                                  value={order.status || 'Processing'} 
                                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                  style={{ 
                                    background: 'rgba(0,0,0,0.3)', 
                                    border: '1px solid rgba(255,255,255,0.08)', 
                                    color: 'white', 
                                    fontSize: '0.72rem', 
                                    fontFamily: 'monospace',
                                    padding: '5px 8px', 
                                    borderRadius: '6px', 
                                    outline: 'none', 
                                    cursor: 'pointer', 
                                    flex: 1 
                                  }}
                                >
                                  {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} style={{ background: '#111', color: '#fff' }}>{opt}</option>)}
                                </select>
                                {!order.isPaid && (
                                  <button 
                                    onClick={() => markPaid(order._id)} 
                                    style={{ 
                                      background: 'rgba(74,222,128,0.06)', 
                                      border: '1px solid rgba(74,222,128,0.25)', 
                                      color: '#4ade80', 
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      cursor: 'pointer', 
                                      fontSize: '0.68rem', 
                                      fontWeight: '700',
                                      fontFamily: 'monospace',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.15)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.06)'}
                                  >
                                    PAY_VAL
                                  </button>
                                )}
                              </div>
                              
                              {/* Delivery Date Calendar Input */}
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '4px 8px', 
                                background: 'rgba(201,168,76,0.03)', 
                                borderRadius: '6px', 
                                border: '1px solid rgba(201,168,76,0.18)' 
                              }}>
                                <Calendar size={10} style={{ color: 'var(--color-accent)' }} />
                                <input 
                                  type="date" 
                                  value={order.expectedDelivery ? new Date(order.expectedDelivery).toISOString().split('T')[0] : ''}
                                  onChange={(e) => handleDeliveryUpdate(order._id, e.target.value)}
                                  style={{ 
                                    background: 'none', border: 'none', color: '#eaeaea', 
                                    fontSize: '0.72rem', fontFamily: 'monospace', outline: 'none', 
                                    width: '100%', cursor: 'pointer' 
                                  }} 
                                />
                              </div>
                            </div>
                          </td>

                        </tr>

                        {/* Expandable Order Sub-Deck Panel */}
                        {isExpanded && (
                          <tr style={{ background: 'rgba(0,0,0,0.15)' }}>
                            <td colSpan={7} style={{ padding: '0.5rem 1.25rem 1.25rem 1.25rem' }}>
                              <div style={{
                                padding: '1.25rem',
                                borderRadius: '12px',
                                background: 'rgba(13,13,13,0.5)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                                display: 'grid',
                                gridTemplateColumns: '1.8fr 1fr',
                                gap: '1.5rem',
                                animation: 'slide-down 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
                              }}>
                                
                                {/* Left Side: Items buffer list */}
                                <div>
                                  <h4 style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-accent)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', fontFamily: 'monospace' }}>
                                    <Package size={12} /> Purchased Items ({order.orderItems?.length || 0})
                                  </h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {order.orderItems?.map((item: any, idx: number) => (
                                      <div 
                                        key={idx} 
                                        style={{ 
                                          display: 'flex', 
                                          gap: '1rem', 
                                          alignItems: 'center', 
                                          background: 'rgba(255,255,255,0.015)', 
                                          padding: '8px 12px', 
                                          borderRadius: '8px', 
                                          border: '1px solid rgba(255,255,255,0.03)',
                                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                        onMouseEnter={e => {
                                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                          e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
                                          e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={e => {
                                          e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
                                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
                                          e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                      >
                                        {item.image ? (
                                          <img src={item.image} alt={item.name} style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }} />
                                        ) : (
                                          <div style={{ width: '40px', height: '50px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Package size={16} style={{ opacity: 0.2 }} />
                                          </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                          <p style={{ fontSize: '0.78rem', fontWeight: '600', color: '#fff' }}>{item.name}</p>
                                          <p style={{ fontSize: '0.68rem', color: 'var(--color-muted)', marginTop: '2px', fontFamily: 'monospace' }}>Qty: {item.qty} × ${item.price?.toFixed(2)}</p>
                                        </div>
                                        <p style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-accent-light)', fontFamily: 'monospace' }}>
                                          ${(item.qty * item.price)?.toFixed(2)}
                                        </p>
                                      </div>
                                    ))}
                                    {(!order.orderItems || order.orderItems.length === 0) && (
                                      <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>BUFFER_EMPTY: NO_ITEMS_IN_RECORD</p>
                                    )}
                                  </div>
                                </div>

                                {/* Right Side: Destination & Transaction Protocol */}
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                  <div>
                                    <h4 style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-accent)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                                      <MapPin size={12} /> Destination Address
                                    </h4>
                                    {order.shippingAddress ? (
                                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', fontFamily: 'monospace' }}>
                                        {order.shippingAddress.address}<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                                        {order.shippingAddress.country}
                                      </p>
                                    ) : (
                                      <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>No destination details recorded.</p>
                                    )}
                                  </div>

                                  <div>
                                    <h4 style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-accent)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.4rem', fontFamily: 'monospace' }}>
                                      <CreditCard size={12} /> Transaction Protocol
                                    </h4>
                                    <p style={{ fontSize: '0.72rem', color: '#eaeaea', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                                      Method: <span style={{ color: 'var(--color-accent-light)' }}>{order.paymentMethod || 'UNKNOWN'}</span>
                                    </p>
                                    <p style={{ fontSize: '0.68rem', color: 'var(--color-muted)', marginTop: '3px', fontFamily: 'monospace' }}>
                                      Cleared Status: {order.isPaid ? 'VAL_TRUE' : 'VAL_FALSE'}
                                    </p>
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        BUFFER_EMPTY: NO_MATCHING_ORDER_RECORDS
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-down {
          0% { opacity: 0; transform: translateY(-6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .pulse-slow {
          animation: badge-pulse 2s infinite ease-in-out;
        }
        @keyframes badge-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
      
    </div>
  );
}
