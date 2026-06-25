'use client';
import './animations.css';
import { useEffect, useState } from 'react';
import { authService, productService, orderService } from '@/services';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Users, Package, ShoppingCart, Banknote, TrendingUp, 
  ArrowUpRight, Cpu, Clock, Activity, ShieldCheck, Eye
} from 'lucide-react';
import { SalesTrendMatrix, CategoryDistributionRing, LiveActivityConsole } from '@/components/DigitalCharts';

const getCardColorClass = (color: string) => {
  if (color === '#60a5fa') return 'kpi-card-blue';
  if (color === '#a78bfa') return 'kpi-card-purple';
  if (color === '#4ade80') return 'kpi-card-green';
  return 'kpi-card'; // gold default
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0, visitors: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [utcTime, setUtcTime] = useState('');

  // Live UTC Clock for high-tech digital telemetry feel
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setUtcTime(d.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch db data
  useEffect(() => {
    const load = async () => {
      try {
        const [users, products, orders, analyticsRes] = await Promise.all([
          authService.getAllUsers(),
          productService.getAll({ pageSize: 1 }),
          orderService.getAllOrders(),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/stats`).then(r => r.json()).catch(() => ({ data: { totalVisits: 0 } })),
        ]);
        const revenue = orders.reduce((s: number, o: any) => s + (o.isPaid ? o.totalPrice : 0), 0);
        const visitors = analyticsRes?.data?.totalVisits || 0;
        setStats({ users: users.length, products: products.total || 0, orders: orders.length, revenue, visitors });
        setRecentOrders(orders.slice(0, 6));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  // Cyber metric cards with micro sparklines
  const cards = [
    { 
      label: 'Total Accumulated Revenue', 
      value: `Rs. ${stats.revenue.toFixed(2)}`, 
      sub: 'Revenue in PKR',
      Icon: Banknote, 
      color: '#c9a84c', 
      bg: 'rgba(201,168,76,0.06)', 
      border: 'rgba(201,168,76,0.2)',
      sparkline: 'M0 20 L20 18 L40 25 L60 10 L80 15 L100 5 L120 12'
    },
    { 
      label: 'Total Orders Compiled', 
      value: stats.orders, 
      sub: 'Latest Orders',
      Icon: ShoppingCart, 
      color: '#60a5fa', 
      bg: 'rgba(96,165,250,0.06)', 
      border: 'rgba(96,165,250,0.2)',
      sparkline: 'M0 22 L20 20 L40 12 L60 25 L80 8 L100 12 L120 4'
    },
    { 
      label: 'Database Products Ledger', 
      value: stats.products, 
      sub: 'Product Inventory',
      Icon: Package, 
      color: '#a78bfa', 
      bg: 'rgba(167,139,250,0.06)', 
      border: 'rgba(167,139,250,0.2)',
      sparkline: 'M0 15 L20 22 L40 18 L60 20 L80 12 L100 10 L120 6'
    },
    { 
      label: 'Registered Network Users', 
      value: stats.users, 
      sub: 'User Connections',
      Icon: Users, 
      color: '#4ade80', 
      bg: 'rgba(74,222,128,0.06)', 
      border: 'rgba(74,222,128,0.2)',
      sparkline: 'M0 25 L20 20 L40 15 L60 12 L80 18 L100 8 L120 5'
    },
    { 
      label: 'Total Website Visitors', 
      value: stats.visitors, 
      sub: 'Unique Sessions',
      Icon: Eye, 
      color: '#f472b6', 
      bg: 'rgba(244,114,182,0.06)', 
      border: 'rgba(244,114,182,0.2)',
      sparkline: 'M0 30 L20 10 L40 25 L60 5 L80 20 L100 2 L120 15'
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Cybernetic Telemetry Header */}
      <div className="glass cyber-telemetry-header" style={{
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
        {/* Neon accent grid corner lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', borderTop: '2px solid var(--color-accent)', borderLeft: '2px solid var(--color-accent)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderBottom: '2px solid var(--color-accent)', borderRight: '2px solid var(--color-accent)' }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={18} className="text-gold" style={{ filter: 'drop-shadow(0 0 5px rgba(201,168,76,0.6))' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '700', letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase' }}>
              Wearixa Dashboard
            </h1>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '4px', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} /> Secure Connection
            </span>
          </p>
        </div>

        {/* Telemetry metadata section */}
        <div className="cyber-telemetry-meta" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Uptime and latency info */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--color-muted)' }}>
            <span>Core System v2.4</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              API Latency: <span style={{ color: '#4ade80' }}>14ms</span>
            </span>
          </div>
          
          {/* Real-time UTC clock */}
          <div className="cyber-clock-box" style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '8px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            color: 'var(--color-accent-light)',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
          }}>
            <Clock size={13} />
            <span>{utcTime || 'SYNCHRONIZING...'}</span>
          </div>
        </div>
      </div>

      {/* 2. Cyber Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        {cards.map(({ label, value, sub, Icon, color, bg, border, sparkline }, i) => {
          return (
            <div 
              key={label} 
              className={`glass animate-fade-in-stagger ${getCardColorClass(color)}`}
              style={{ 
                animationDelay: `${i * 0.15}s`,
                borderRadius: '16px', 
                padding: '1.5rem', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                background: 'rgba(13, 13, 13, 0.4)',
                border: `1px solid ${border}`,
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
            {/* Background grid texture overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
              backgroundSize: '12px 12px',
              pointerEvents: 'none',
              opacity: 0.4
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
              <div>
                <p style={{ fontSize: '0.62rem', color: 'var(--color-muted)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  {sub}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#fff', fontWeight: '500', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {label}
                </p>
              </div>
              <div 
                className="kpi-icon-container"
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '8px', 
                  background: bg, 
                  border: `1px solid ${border}`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0
                }}
              >
                <Icon size={18} style={{ color }} />
              </div>
            </div>

            {/* Sparkline & Values bottom container */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.5rem', position: 'relative', zIndex: 2 }}>
              <div>
                <p style={{ fontSize: '1.75rem', fontWeight: '700', color, fontFamily: 'monospace', lineHeight: 1.1 }}>{value}</p>
                <p style={{ fontSize: '0.68rem', color: '#4ade80', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'monospace' }}>
                  <TrendingUp size={11} /> +12% increase
                </p>
              </div>

              {/* Sparkline micro-graph */}
              <div style={{ width: '80px', height: '30px', opacity: 0.7 }}>
                <svg width="100%" height="100%" viewBox="0 0 120 30" style={{ overflow: 'visible' }}>
                  <path
                    d={sparkline}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: `drop-shadow(0 0 3px ${color}40)` }}
                  />
                </svg>
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* 3. High-Tech Visual Charts Grid */}
      <div className="cyber-dashboard-grid">
        <div style={{ gridColumn: 'span 1' }}>
          <SalesTrendMatrix stats={stats} />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <CategoryDistributionRing stats={stats} />
        </div>
      </div>

      {/* 4. Database Ledger (Recent Orders) & Live Logging Console */}
      <div className="cyber-dashboard-grid">
        
        {/* Recent Orders LEDGER */}
        <div className="glass" style={{
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'rgba(13, 13, 13, 0.45)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Cyber accents */}
          <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.15, pointerEvents: 'none', fontFamily: 'monospace', fontSize: '0.6rem', padding: '6px' }}>
            Transaction Ledger
          </div>

          <div>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={16} className="text-gold" /> System Orders Ledger
                </h2>
                <p style={{ fontSize: '0.68rem', color: 'var(--color-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                  Realtime Transaction Record
                </p>
              </div>
              <a href="/admin/orders" style={{
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
                background: 'rgba(201,168,76,0.05)',
                border: '1px solid rgba(201,168,76,0.2)',
                padding: '4px 10px',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.12)'; e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.05)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; }}
              >
                View All <ArrowUpRight size={12} />
              </a>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)' }}>
                    {['Order ID', 'Customer', 'Date', 'Gross Vol', 'Paid', 'Dispatched'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--color-muted)', fontWeight: '600', fontSize: '0.68rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order._id} style={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.03)', 
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderLeft: '3px solid transparent'
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
                        e.currentTarget.style.borderLeftColor = 'var(--color-accent)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderLeftColor = 'transparent';
                      }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-accent-light)', whiteSpace: 'nowrap' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#eaeaea', fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px' }}>
                        {order.user?.name || 'GUEST_USER'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-muted)', fontFamily: 'monospace', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#fff', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        Rs. {order.totalPrice.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.68rem', 
                          fontWeight: '700', 
                          fontFamily: 'monospace',
                          background: order.isPaid ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)', 
                          color: order.isPaid ? '#4ade80' : '#f87171', 
                          border: `1px solid ${order.isPaid ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}` 
                        }}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.68rem', 
                          fontWeight: '700', 
                          fontFamily: 'monospace',
                          background: order.isDelivered ? 'rgba(74,222,128,0.08)' : 'rgba(255,165,0,0.08)', 
                          color: order.isDelivered ? '#4ade80' : '#ffa500', 
                          border: `1px solid ${order.isDelivered ? 'rgba(74,222,128,0.2)' : 'rgba(255,165,0,0.2)'}` 
                        }}>
                          {order.isDelivered ? 'Delivered' : 'Waiting'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentOrders.length === 0 && <p style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>No recent orders found</p>}
            </div>
          </div>
        </div>

        {/* Live Terminal Output Console */}
        <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column' }}>
          <LiveActivityConsole recentOrders={recentOrders} />
        </div>
      </div>

      <style>{`
        .cyber-dashboard-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 1024px) {
          .cyber-dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          .cyber-telemetry-header {
            padding: 1rem !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .cyber-telemetry-meta {
            align-items: flex-start !important;
            width: 100% !important;
            justify-content: space-between !important;
            flex-direction: row !important;
          }
          .cyber-clock-box {
            width: 100% !important;
            justify-content: center !important;
            margin-top: 0.5rem !important;
          }
        }
      `}</style>

    </div>
  );
}

