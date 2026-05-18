'use client';
import '@/app/admin/animations.css';
import { useEffect, useState, useMemo } from 'react';
import { orderService } from '@/services';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  DollarSign, TrendingUp, CreditCard, Wallet, Package,
  ArrowUpRight, ShieldCheck, RefreshCw, CheckCircle, XCircle
} from 'lucide-react';

// ─── Revenue Split Donut ──────────────────────────────────────────────────────
function RevenueSplitRing({ data }: { data: { label: string; value: number; color: string }[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const size = 160, stroke = 18, r = (size - stroke * 2) / 2, circ = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          <defs>
            <filter id="ring-glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
          {data.map((d, i) => {
            const pct = d.value / total;
            const da = `${pct * circ} ${circ}`;
            const offset = circ - acc * circ;
            acc += pct;
            const isHovered = hoveredIdx === i;
            return (
              <circle key={i} cx={size / 2} cy={size / 2} r={r}
                fill="transparent" stroke={d.color} 
                strokeWidth={isHovered ? stroke + 4 : stroke}
                strokeDasharray={da} strokeDashoffset={offset}
                strokeLinecap="round" filter="url(#ring-glow)" 
                style={{ 
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
                  cursor: 'pointer',
                  opacity: hoveredIdx === null || isHovered ? 1 : 0.45
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', textAlign: 'center', padding: '10px' }}>
          {hoveredIdx !== null ? (
            <>
              <p style={{ fontSize: '1.2rem', fontWeight: '800', color: data[hoveredIdx].color, fontFamily: 'monospace', lineHeight: 1.1 }}>
                ${data[hoveredIdx].value.toFixed(2)}
              </p>
              <p style={{ fontSize: '0.55rem', color: '#fff', fontFamily: 'monospace', marginTop: '3px', letterSpacing: '0.05em' }}>
                {((data[hoveredIdx].value / total) * 100).toFixed(1)}%
              </p>
              <p style={{ fontSize: '0.5rem', color: 'var(--color-muted)', fontFamily: 'monospace', marginTop: '2px', textTransform: 'uppercase' }}>
                {data[hoveredIdx].label.replace(/_/g, ' ')}
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', fontFamily: 'monospace', lineHeight: 1 }}>${total.toFixed(0)}</p>
              <p style={{ fontSize: '0.58rem', color: 'var(--color-muted)', fontFamily: 'monospace', marginTop: '2px' }}>TOTAL_REV</p>
            </>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '150px' }}>
        {data.map((d, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div key={d.label} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                cursor: 'pointer',
                opacity: hoveredIdx === null || isHovered ? 1 : 0.45,
                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0, boxShadow: `0 0 6px ${d.color}` }} />
              <span style={{ fontSize: '0.72rem', color: isHovered ? '#fff' : 'rgba(255,255,255,0.6)', fontFamily: 'monospace', fontWeight: isHovered ? '700' : '500' }}>
                {d.label}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: d.color, fontFamily: 'monospace', marginLeft: 'auto' }}>
                ${d.value.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TxRow({ order }: { order: any }) {
  const fee = (order.totalPrice * 0.029 + 0.30).toFixed(2);
  const net = (order.totalPrice - parseFloat(fee)).toFixed(2);
  return (
    <tr className="ledger-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--color-accent)' }}>
        #{order._id.slice(-10).toUpperCase()}
      </td>
      <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>
        {new Date(order.createdAt).toLocaleDateString()}
      </td>
      <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', fontFamily: 'monospace', color: '#fff' }}>
        ${order.totalPrice.toFixed(2)}
      </td>
      <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontSize: '0.72rem', color: '#f87171' }}>
        -${fee}
      </td>
      <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontWeight: '700', color: '#4ade80' }}>
        ${net}
      </td>
      <td style={{ padding: '0.85rem 1.25rem' }}>
        {order.isPaid ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: '700' }}>
            <CheckCircle size={10} /> CLEARED
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: '700' }}>
            <XCircle size={10} /> PENDING
          </span>
        )}
      </td>
    </tr>
  );
}

const getCardColorClass = (color: string) => {
  if (color === '#4ade80') return 'kpi-card-green';
  if (color === '#f87171') return 'kpi-card-rose';
  if (color === '#f59e0b') return 'kpi-card-orange';
  return 'kpi-card'; // default gold
};

export default function FinancePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    orderService.getAllOrders()
      .then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <LoadingSpinner />;

  const paid = orders.filter(o => o.isPaid);
  const grossRev = paid.reduce((s, o) => s + o.totalPrice, 0);
  const totalFees = paid.reduce((s, o) => s + (o.totalPrice * 0.029 + 0.30), 0);
  const netRev = grossRev - totalFees;
  const pending = orders.filter(o => !o.isPaid).reduce((s, o) => s + o.totalPrice, 0);

  const financials = [
    { label: 'GROSS_REVENUE', value: `$${grossRev.toFixed(2)}`, desc: 'Total paid revenue', Icon: DollarSign, color: '#c9a84c', bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.2)' },
    { label: 'NET_SETTLED', value: `$${netRev.toFixed(2)}`, desc: 'After gateway fees', Icon: TrendingUp, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
    { label: 'GATEWAY_FEES', value: `$${totalFees.toFixed(2)}`, desc: 'Stripe 2.9% + $0.30', Icon: CreditCard, color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
    { label: 'PENDING_CAPTURE', value: `$${pending.toFixed(2)}`, desc: 'Unpaid orders value', Icon: Wallet, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  ];

  // Mock split: 60% card, 25% wallet, 15% COD
  const split = [
    { label: 'STRIPE_CARD', value: grossRev * 0.60, color: '#06b6d4' },
    { label: 'DIGI_WALLET', value: grossRev * 0.25, color: '#a78bfa' },
    { label: 'CASH_ON_DEL', value: grossRev * 0.15, color: '#4ade80' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ─ Header ─ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <DollarSign size={20} style={{ color: 'var(--color-accent)', filter: 'drop-shadow(0 0 6px rgba(201,168,76,0.5))' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Finance Intelligence
            </h1>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.72rem', fontFamily: 'monospace' }}>
            LEDGER_MODULE // PAYMENT_GATEWAY_POOLS_ACTIVE
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', fontFamily: 'monospace', color: '#4ade80', padding: '6px 12px', borderRadius: '6px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <ShieldCheck size={12} /> STRIPE_CONNECTED
          </span>
          <button
            onClick={() => { setLoading(true); setRefreshKey(k => k + 1); }}
            className="hover-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.06)', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'monospace', transition: 'all 0.2s' }}
          >
            <RefreshCw size={13} /> SYNC_LEDGER
          </button>
        </div>
      </div>

      {/* ─ Financial KPIs ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {financials.map(({ label, value, desc, Icon, color, bg, border }, i) => {
          const isHovered = hoveredCard === i;
          return (
            <div 
              key={label} 
              className="glass animate-fade-in-stagger"
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ 
                animationDelay: `${i * 0.1}s`,
                borderRadius: '12px', padding: '1.5rem',
                background: isHovered ? 'rgba(20, 20, 20, 0.65)' : 'rgba(13,13,13,0.5)',
                border: `1px solid ${isHovered ? color : border}`,
                boxShadow: isHovered 
                  ? `0 10px 25px -5px ${color}22, 0 8px 16px -6px ${color}11, inset 0 0 12px ${color}0a`
                  : '0 4px 20px rgba(0, 0, 0, 0.4)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative', overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '70px', height: '70px', background: bg, borderRadius: '0 0 0 70px', opacity: 0.6 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.07em' }}>{label}</p>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <p style={{ fontSize: '1.85rem', fontWeight: '800', color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>{desc}</p>
            <p style={{ fontSize: '0.62rem', color: '#4ade80', fontFamily: 'monospace', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <TrendingUp size={10} /> +8.2% MTD
            </p>
          </div>
        )})}
      </div>

      {/* ─ Revenue Split + Payout Ledger ─ */}
      <div className="finance-grid animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '1.25rem' }}>

        {/* Donut Ring */}
        <div className="glass" style={{ borderRadius: '14px', padding: '1.5rem', background: 'rgba(13,13,13,0.5)', border: '1px solid rgba(201,168,76,0.12)' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <Package size={15} style={{ color: 'var(--color-accent)' }} /> Payment Split
          </h2>
          <RevenueSplitRing data={split} />
        </div>

        {/* Settlement Ledger */}
        <div className="glass" style={{ borderRadius: '14px', background: 'rgba(13,13,13,0.5)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={15} style={{ color: '#06b6d4' }} /> Settlement Ledger
              </h2>
              <p style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>STRIPE_DISBURSEMENT_RECORDS</p>
            </div>
            <a href="/admin/orders" style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)', padding: '4px 10px', borderRadius: '6px' }}>
              VIEW_ALL <ArrowUpRight size={11} />
            </a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
                  {['TX_HASH', 'DATE', 'GROSS', 'FEE', 'NET', 'STATUS'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', color: 'rgba(255,255,255,0.3)', fontWeight: '600', fontSize: '0.62rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map(o => <TxRow key={o._id} order={o} />)}
              </tbody>
            </table>
            {orders.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>LEDGER_EMPTY: NO_TRANSACTIONS</p>}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .finance-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
