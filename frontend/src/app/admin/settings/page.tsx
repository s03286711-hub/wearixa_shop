'use client';
import '@/app/admin/animations.css';
import { useState } from 'react';
import {
  Settings, CreditCard, Wallet, Truck, Percent, Tag, Shield,
  Bell, Globe, Database, RefreshCw, CheckCircle, Save, Zap, AlertTriangle
} from 'lucide-react';

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function ToggleSwitch({ enabled, onChange, label, desc, color = '#4ade80' }: {
  enabled: boolean; onChange: (v: boolean) => void;
  label: string; desc?: string; color?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div>
        <p style={{ fontSize: '0.85rem', fontWeight: '500', color: '#fff' }}>{label}</p>
        {desc && <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        style={{
          width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
          background: enabled ? color : 'rgba(255,255,255,0.08)',
          position: 'relative', transition: 'all 0.3s',
          boxShadow: enabled ? `0 0 10px ${color}60` : 'none', flexShrink: 0
        }}
      >
        <span style={{
          position: 'absolute', top: '3px',
          left: enabled ? '23px' : '3px',
          width: '18px', height: '18px', borderRadius: '50%',
          background: '#fff', transition: 'left 0.3s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
        }} />
      </button>
    </div>
  );
}

// ─── Setting Section Card ────────────────────────────────────────────────────
function SettingCard({ title, subtitle, Icon, color, children }: {
  title: string; subtitle: string; Icon: any; color: string; children: React.ReactNode;
}) {
  return (
    <div className="glass animate-fade-in-stagger" style={{ borderRadius: '14px', overflow: 'hidden', background: 'rgba(13,13,13,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: `rgba(${color},0.03)`, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: `rgba(${color},0.12)`, border: `1px solid rgba(${color},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} style={{ color: `rgb(${color})` }} />
        </div>
        <div>
          <h2 style={{ fontSize: '0.92rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</h2>
          <p style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ padding: '0 1.5rem' }}>
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  // ── Payment Gateway Toggles ──
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [walletEnabled, setWalletEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [jazzEnabled, setJazzEnabled] = useState(true);
  const [easyEnabled, setEasyEnabled] = useState(true);

  // ── Tax & Fees ──
  const [taxRate, setTaxRate] = useState('8');
  const [shippingFlat, setShippingFlat] = useState('12.99');
  const [freeShipThreshold, setFreeShipThreshold] = useState('100');
  const [walletCashback, setWalletCashback] = useState('5');

  // ── Platform Config ──
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotify, setEmailNotify] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);

  // ── Save state ──
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000); }, 1200);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px', padding: '0.65rem 1rem', color: '#fff', fontSize: '0.85rem',
    outline: 'none', fontFamily: 'monospace', transition: 'border-color 0.2s', boxSizing: 'border-box'
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '900px' }}>

      {/* ─ Header ─ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Settings size={20} style={{ color: 'var(--color-accent)', filter: 'drop-shadow(0 0 6px rgba(201,168,76,0.5))' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              System Settings
            </h1>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.72rem', fontFamily: 'monospace' }}>
            CONFIG_NODE // CORE_PARAMETERS_CONTROL
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            borderRadius: '8px', border: '1px solid rgba(201,168,76,0.3)',
            background: saved ? 'rgba(74,222,128,0.1)' : 'rgba(201,168,76,0.1)',
            color: saved ? '#4ade80' : 'var(--color-accent)',
            cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.82rem',
            fontFamily: 'monospace', fontWeight: '600', transition: 'all 0.3s',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
          {saving ? 'SAVING...' : saved ? 'SAVED!' : 'SAVE_CONFIG'}
        </button>
      </div>

      {/* ─ Maintenance Alert ─ */}
      {maintenanceMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem 1.25rem', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' }}>
          <AlertTriangle size={16} />
          <p style={{ fontSize: '0.82rem', fontWeight: '600' }}>MAINTENANCE_MODE is ACTIVE — The storefront is currently offline for visitors.</p>
        </div>
      )}

      {/* ─ Payment Gateways ─ */}
      <SettingCard title="Payment Gateways" subtitle="GATEWAY_ROUTING_CONFIG" Icon={CreditCard} color="6,182,212">
        <ToggleSwitch enabled={stripeEnabled} onChange={setStripeEnabled} label="Stripe Card Payments" desc="Accept Visa, Mastercard, Amex via Stripe" color="#06b6d4" />
        <ToggleSwitch enabled={walletEnabled} onChange={setWalletEnabled} label="Digital Wallet" desc="Allow balance top-ups and wallet checkouts" color="#a78bfa" />
        <ToggleSwitch enabled={codEnabled} onChange={setCodEnabled} label="Cash on Delivery (COD)" desc="Enable COD as a global payment option" color="#4ade80" />
        <ToggleSwitch enabled={jazzEnabled} onChange={setJazzEnabled} label="JazzCash Mobile" desc="JazzCash mobile wallet gateway" color="#f59e0b" />
        <div style={{ paddingBottom: '0.5rem' }}>
          <ToggleSwitch enabled={easyEnabled} onChange={setEasyEnabled} label="EasyPaisa Mobile" desc="EasyPaisa mobile wallet gateway" color="#f59e0b" />
        </div>
      </SettingCard>

      {/* ─ Tax & Fees ─ */}
      <SettingCard title="Tax & Fees" subtitle="COMMERCE_RATE_CONFIG" Icon={Percent} color="201,168,76">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.25rem 0' }}>
          {[
            { label: 'Sales Tax Rate (%)', value: taxRate, onChange: setTaxRate, hint: 'e.g. 8 = 8%' },
            { label: 'Flat Shipping Rate ($)', value: shippingFlat, onChange: setShippingFlat, hint: 'Default shipping cost' },
            { label: 'Free Shipping Threshold ($)', value: freeShipThreshold, onChange: setFreeShipThreshold, hint: 'Orders above get free shipping' },
            { label: 'Wallet Cashback Rate (%)', value: walletCashback, onChange: setWalletCashback, hint: '% cashback on wallet payment' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.08em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'monospace' }}>{f.label}</label>
              <input style={inputStyle} type="number" value={f.value}
                onChange={e => f.onChange(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{f.hint}</p>
            </div>
          ))}
        </div>
      </SettingCard>

      {/* ─ Platform Controls ─ */}
      <SettingCard title="Platform Controls" subtitle="SYSTEM_OPERATION_PARAMS" Icon={Globe} color="167,139,250">
        <ToggleSwitch enabled={maintenanceMode} onChange={setMaintenanceMode} label="Maintenance Mode" desc="Take storefront offline for maintenance" color="#f59e0b" />
        <ToggleSwitch enabled={emailNotify} onChange={setEmailNotify} label="Email Notifications" desc="Send order confirmation emails to customers" color="#a78bfa" />
        <ToggleSwitch enabled={orderAlerts} onChange={setOrderAlerts} label="Admin Order Alerts" desc="Notify admin on each new order placed" color="#a78bfa" />
        <div style={{ paddingBottom: '0.5rem' }}>
          <ToggleSwitch enabled={autoApprove} onChange={setAutoApprove} label="Auto-Approve Orders" desc="Automatically mark orders as delivered" color="#f87171" />
        </div>
      </SettingCard>

      {/* ─ System Actions ─ */}
      <SettingCard title="System Actions" subtitle="DB_NODE_MAINTENANCE_OPS" Icon={Database} color="74,222,128">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', padding: '1.25rem 0' }}>
          {[
            { label: 'Purge Cache', desc: 'Clear all server-side caches', color: '#06b6d4', Icon: RefreshCw },
            { label: 'Backup Database', desc: 'Export DB snapshot to JSON', color: '#a78bfa', Icon: Database },
            { label: 'Rebuild Indexes', desc: 'Re-index product catalog', color: '#c9a84c', Icon: Zap },
            { label: 'Security Audit', desc: 'Run a system security scan', color: '#4ade80', Icon: Shield },
          ].map(a => (
            <button key={a.label}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: '6px', padding: '1rem', borderRadius: '10px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                color: '#fff', textAlign: 'left', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `rgba(${a.color.replace('#', '')},0.06)`; e.currentTarget.style.borderColor = `${a.color}40`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <a.Icon size={16} style={{ color: a.color }} />
              <p style={{ fontSize: '0.82rem', fontWeight: '600' }}>{a.label}</p>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>{a.desc}</p>
            </button>
          ))}
        </div>
      </SettingCard>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
