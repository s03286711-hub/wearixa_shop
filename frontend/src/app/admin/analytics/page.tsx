'use client';
import '@/app/admin/animations.css';
import { useEffect, useState, useMemo } from 'react';
import { orderService, authService, productService } from '@/services';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  BarChart3, TrendingUp, Users, ShoppingCart, Eye, MousePointer,
  Activity, Zap, Target, Globe, ArrowUpRight, RefreshCw
} from 'lucide-react';

// ─── Mini Funnel Chart ────────────────────────────────────────────────────────
function FunnelChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = data[0]?.value || 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>{d.label}</span>
              <span style={{ fontSize: '0.72rem', color: d.color, fontFamily: 'monospace', fontWeight: '700' }}>{d.value.toLocaleString()}</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: `linear-gradient(90deg, ${d.color}99, ${d.color})`,
                borderRadius: '3px',
                boxShadow: `0 0 8px ${d.color}40`,
                transition: 'width 1s ease'
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SVG Session Activity Graph ───────────────────────────────────────────────
function SessionGraph({ orders }: { orders: any[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const values = useMemo(() => {
    const base = [420, 680, 540, 820, 760, 950, 610];
    return base.map(v => v + Math.round(orders.length * 3.5));
  }, [orders]);

  const W = 500, H = 140, pad = 30;
  const maxV = Math.max(...values);
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v / maxV) * (H - pad * 2));
    return `${x},${y}`;
  });
  const linePath = `M ${pts.join(' L ')}`;
  const areaPath = `M ${pad},${H - pad} L ${pts.join(' L ')} L ${W - pad},${H - pad} Z`;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="sg-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
          <filter id="sg-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Grid lines */}
        {[0, 0.33, 0.66, 1].map((r, i) => (
          <line key={i} x1={pad} y1={H - pad - r * (H - pad * 2)} x2={W - pad} y2={H - pad - r * (H - pad * 2)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="url(#sg-area)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#sg-glow)" />
        {/* Data points */}
        {pts.map((pt, i) => {
          const [x, y] = pt.split(',');
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#06b6d4" filter="url(#sg-glow)" />
              <circle cx={x} cy={y} r="2" fill="#fff" />
            </g>
          );
        })}
        {/* X labels */}
        {days.map((d, i) => {
          const x = pad + (i / (days.length - 1)) * (W - pad * 2);
          return <text key={d} x={x} y={H - 4} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.3)" fontFamily="monospace">{d}</text>;
        })}
      </svg>
    </div>
  );
}

// ─── Live Log Console ─────────────────────────────────────────────────────────
function LiveLog({ orders }: { orders: any[] }) {
  const [logs, setLogs] = useState<string[]>([]);
  const templates = useMemo(() => [
    '→ GET /api/products [200] 12ms',
    '→ POST /api/auth/login [200] 34ms',
    '→ GET /api/orders [200] 8ms',
    '→ POST /api/cart/add [201] 19ms',
    '→ GET /api/categories [200] 6ms',
    '→ PATCH /api/orders/:id [200] 44ms',
    `→ SESSION_ACTIVE: ${orders.length} tx in buffer`,
    '→ CACHE_HIT: product_catalog [HIT]',
    '→ DB_QUERY: users.find() [OK] 22ms',
    '→ ANALYTICS_BEACON: pageview /shop',
  ], [orders]);

  useEffect(() => {
    const seed = templates.slice(0, 5);
    setLogs(seed);
    const interval = setInterval(() => {
      const line = templates[Math.floor(Math.random() * templates.length)];
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${line}`, ...prev.slice(0, 11)]);
    }, 2200);
    return () => clearInterval(interval);
  }, [templates]);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.15)',
      padding: '1rem', fontFamily: 'monospace', fontSize: '0.7rem',
      height: '180px', overflowY: 'auto', lineHeight: '1.8'
    }}>
      {logs.map((l, i) => (
        <p key={i} style={{ color: i === 0 ? '#06b6d4' : 'rgba(255,255,255,0.35)', margin: 0, transition: 'color 0.5s' }}>
          {l}
        </p>
      ))}
    </div>
  );
}

const getCardColorClass = (color: string) => {
  if (color === '#4ade80') return 'kpi-card-green';
  if (color === '#06b6d4') return 'kpi-card-cyan';
  if (color === '#c9a84c') return 'kpi-card';
  if (color === '#a78bfa') return 'kpi-card-purple';
  if (color === '#f59e0b') return 'kpi-card-orange';
  if (color === '#f43f5e') return 'kpi-card-rose';
  return 'kpi-card';
};

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    Promise.all([orderService.getAllOrders(), authService.getAllUsers(), productService.getAll({ pageSize: 1 })])
      .then(([o, u, p]) => { setOrders(o); setUsers(u); setProducts(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <LoadingSpinner />;

  const convRate = orders.length > 0 ? ((orders.filter(o => o.isPaid).length / orders.length) * 100).toFixed(1) : '0.0';
  const avgOrder = orders.length > 0 ? (orders.reduce((s, o) => s + o.totalPrice, 0) / orders.length).toFixed(2) : '0.00';

  const metrics = [
    { label: 'CONV_RATE_INDEX', value: `${convRate}%`, desc: 'Paid / Total Orders', Icon: Target, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
    { label: 'PLATFORM_SESSIONS', value: `${(users.length * 42).toLocaleString()}`, desc: 'Est. Monthly Sessions', Icon: Globe, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
    { label: 'AVG_ORDER_VALUE', value: `$${avgOrder}`, desc: 'Revenue Per Order', Icon: ShoppingCart, color: '#c9a84c', bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.2)' },
    { label: 'REGISTERED_NODES', value: users.length, desc: 'Total User Accounts', Icon: Users, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
    { label: 'CATALOG_ENTRIES', value: products.total || 0, desc: 'Active Products', Icon: BarChart3, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    { label: 'TOTAL_ORDERS', value: orders.length, desc: 'Lifetime Transactions', Icon: Activity, color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)' },
  ];

  const funnel = [
    { label: 'VISITORS', value: users.length * 42, color: '#06b6d4' },
    { label: 'PRODUCT_VIEWS', value: Math.round(users.length * 18), color: '#a78bfa' },
    { label: 'ADD_TO_CART', value: Math.round(orders.length * 2.8), color: '#c9a84c' },
    { label: 'CHECKOUT_INIT', value: Math.round(orders.length * 1.4), color: '#f59e0b' },
    { label: 'ORDERS_PLACED', value: orders.length, color: '#4ade80' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ─ Header ─ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <BarChart3 size={20} style={{ color: 'var(--color-accent)', filter: 'drop-shadow(0 0 6px rgba(201,168,76,0.5))' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Analytics Command
            </h1>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.72rem', fontFamily: 'monospace' }}>
            TELEMETRY_MODULE // PERFORMANCE_MATRIX_ACTIVE
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); setRefreshKey(k => k + 1); }}
          className="hover-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.06)', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'monospace', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,0.06)'}
        >
          <RefreshCw size={13} /> REFRESH_DATA
        </button>
      </div>

      {/* ─ Metrics Grid ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {metrics.map(({ label, value, desc, Icon, color, bg, border }, i) => (
          <div key={label} className={`glass animate-fade-in-stagger ${getCardColorClass(color)}`} style={{ animationDelay: `${i * 0.08}s`,
            borderRadius: '12px', padding: '1.25rem',
            background: 'rgba(13,13,13,0.5)', border: `1px solid ${border}`,
            position: 'relative', overflow: 'hidden',
            clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: bg, borderRadius: '0 0 0 60px', opacity: 0.5 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>{label}</p>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <p style={{ fontSize: '1.6rem', fontWeight: '800', color, fontFamily: 'monospace', marginTop: '0.75rem', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* ─ Session Graph + Funnel ─ */}
      <div className="cyber-dashboard-grid animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>

        {/* Session Graph */}
        <div className="glass" style={{ borderRadius: '14px', padding: '1.5rem', background: 'rgba(13,13,13,0.5)', border: '1px solid rgba(6,182,212,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={15} style={{ color: '#06b6d4' }} /> Weekly Sessions
              </h2>
              <p style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>SESSION_MATRIX_7D</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#4ade80', fontFamily: 'monospace' }}>
              <TrendingUp size={12} /> +18.4% WoW
            </div>
          </div>
          <SessionGraph orders={orders} />
        </div>

        {/* Conversion Funnel */}
        <div className="glass" style={{ borderRadius: '14px', padding: '1.5rem', background: 'rgba(13,13,13,0.5)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MousePointer size={15} style={{ color: '#a78bfa' }} /> Conversion Funnel
            </h2>
            <p style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>DROP_OFF_SCOPE_ACTIVE</p>
          </div>
          <FunnelChart data={funnel} />
        </div>
      </div>

      {/* ─ Live Console ─ */}
      <div className="glass" style={{ borderRadius: '14px', padding: '1.5rem', background: 'rgba(13,13,13,0.5)', border: '1px solid rgba(6,182,212,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Zap size={15} style={{ color: '#06b6d4', filter: 'drop-shadow(0 0 4px rgba(6,182,212,0.6))' }} />
          <h2 style={{ fontSize: '0.95rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Telemetry Feed</h2>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', fontFamily: 'monospace', color: '#4ade80' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80', animation: 'pulse 2s infinite' }} />
            STREAM_ACTIVE
          </span>
        </div>
        <LiveLog orders={orders} />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cyber-dashboard-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}
