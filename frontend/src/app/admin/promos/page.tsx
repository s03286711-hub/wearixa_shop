'use client';
import '@/app/admin/animations.css';
import { useEffect, useState } from 'react';
import { promoService } from '@/services';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Percent, Trash2, Plus, X, Calendar, Ticket, Zap, Sparkles, CheckCircle, AlertTriangle, Play, ShieldAlert, Cpu 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    expiresAt: '',
  });

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const data = await promoService.getAll();
      setPromos(data || []);
    } catch (err) { console.error('Error fetching promos:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPromos(); }, []);

  // Live countdown clock ticker for active expiring campaigns
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining: Record<string, string> = {};
      promos.forEach(p => {
        if (p.expiresAt && p.isActive) {
          const distance = new Date(p.expiresAt).getTime() - new Date().getTime();
          if (distance < 0) {
            remaining[p._id] = 'EXPIRED';
          } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            const daysStr = days > 0 ? `${days}d ` : '';
            remaining[p._id] = `${daysStr}${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
          }
        }
      });
      setTimeRemaining(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [promos]);

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Revoke and delete promo campaign "${code}"?`)) return;
    try {
      await promoService.delete(id);
      fetchPromos();
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSuccessMsg('');

    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };

      await promoService.create(payload);
      setSuccessMsg('Promo Campaign initiated successfully!');
      fetchPromos();
      setTimeout(() => {
        setShowModal(false);
        setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', expiresAt: '' });
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to initiate campaign. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Telemetry computations
  const totalCampaigns = promos.length;
  const activeCampaigns = promos.filter(p => p.isActive && (!p.expiresAt || new Date(p.expiresAt) > new Date())).length;
  const totalRedeemed = promos.reduce((acc, p) => acc + (p.usedCount || 0), 0);
  
  // Calculate average discount value across campaigns
  const avgDiscount = totalCampaigns > 0
    ? Math.round(promos.reduce((acc, p) => acc + p.discountValue, 0) / totalCampaigns)
    : 0;

  // Find the primary/closest expiring campaign with a countdown
  const expiringCampaigns = promos.filter(p => p.expiresAt && p.isActive && new Date(p.expiresAt) > new Date())
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
  
  const primaryExpiring = expiringCampaigns[0];

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 10px rgba(201, 168, 76, 0.2); }
          100% { box-shadow: 0 0 25px rgba(201, 168, 76, 0.4); }
        }
        @media (max-width: 991px) {
          .promo-dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .promo-telemetry-cards {
            grid-template-columns: 1fr !important;
          }
          .neon-timer-box {
            font-size: 1.1rem !important;
            padding: 0.8rem 1rem !important;
            gap: 8px !important;
          }
          .modal-padding {
            padding: 1.25rem 1rem !important;
          }
        }
        @media (max-width: 480px) {
          .form-grid-split {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
        }
      `}} />

      {/* Upper header controls */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Campaigns & Promos <span style={{ fontSize: '0.72rem', background: 'rgba(201, 168, 76, 0.1)', color: 'var(--color-accent)', padding: '4px 10px', borderRadius: '20px', fontFamily: 'monospace', fontWeight: 'bold' }}>PROMO_MATRIX</span>
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Real-time coupon validation, rates, and active campaign tracking</p>
        </div>
        <button onClick={() => { setSubmitError(''); setSuccessMsg(''); setShowModal(true); }} className="btn-primary hover-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(201, 168, 76, 0.25)' }}>
          <Plus size={18} /> Create Campaign
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="promo-telemetry-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { title: 'Active Campaigns', val: activeCampaigns, label: 'Running promotions', color: 'var(--color-accent)', icon: Ticket, kpiClass: 'kpi-card' },
          { title: 'Total Redeemed', val: totalRedeemed, label: 'Accumulated usages', color: '#10b981', icon: CheckCircle, kpiClass: 'kpi-card-green' },
          { title: 'Mean Benefit', val: `${avgDiscount}% / fixed`, label: 'Offer weight mean', color: '#60a5fa', icon: Sparkles, kpiClass: 'kpi-card-blue' },
          { title: 'Security Nodes', val: 'ACTIVE', label: 'Fraud shield online', color: '#f59e0b', icon: Cpu, kpiClass: 'kpi-card-orange' },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`glass ${card.kpiClass}`}
              style={{
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.015)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.title}</span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>{card.val}</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{card.label}</span>
              </div>
              <div 
                className="kpi-icon-container"
                style={{
                  background: `rgba(255, 255, 255, 0.03)`,
                  borderRadius: '8px',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={24} style={{ filter: `drop-shadow(0 0 4px ${card.color}44)` }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ⚡ High-tech Countdown Clocks & Active Neon Indicators ⚡ */}
      <div className="promo-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: primaryExpiring ? '3fr 2fr' : '1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Campaign Neon Countdown Panel */}
        {primaryExpiring ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass"
            style={{
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid rgba(201, 168, 76, 0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 25px rgba(201, 168, 76, 0.1)',
              background: 'rgba(201, 168, 76, 0.02)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            {/* Grid neon overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.35, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '2px', background: 'var(--color-accent)' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '20px', background: 'var(--color-accent)' }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} style={{ color: 'var(--color-accent)', filter: 'drop-shadow(0 0 5px var(--color-accent))' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 'bold', letterSpacing: '0.1em' }}>LIVE_COUNTDOWN_ALERT</span>
                </div>
                <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '2px 8px', borderRadius: '10px', fontFamily: 'monospace', fontWeight: 'bold', animation: 'pulse 1.5s infinite alternate' }}>
                  EXPIRING_SOON
                </span>
              </div>

              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', margin: '0.5rem 0', letterSpacing: '0.05em', textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>
                {primaryExpiring.code}
              </h2>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', maxWidth: '480px', lineHeight: '1.6' }}>
                Active special seasonal discount campaigns compiled. Restricting catalog prices by <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{primaryExpiring.discountType === 'percentage' ? `${primaryExpiring.discountValue}%` : `Rs. ${primaryExpiring.discountValue}`}</span> off purchases.
              </p>
            </div>

            {/* Glowing neon timer block */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', position: 'relative', zIndex: 2 }}>
              {timeRemaining[primaryExpiring._id] ? (
                <div className="neon-timer-box" style={{
                  background: 'rgba(13,13,13,0.5)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  borderRadius: '12px',
                  padding: '1.25rem 2rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'monospace',
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  color: 'var(--color-accent)',
                  textShadow: '0 0 10px rgba(201, 168, 76, 0.5)',
                  boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8), 0 0 15px rgba(201, 168, 76, 0.15)'
                }}>
                  <Calendar size={22} style={{ color: 'var(--color-accent)', animation: 'spin 4s linear infinite' }} />
                  <span>{timeRemaining[primaryExpiring._id]}</span>
                </div>
              ) : (
                <span style={{ color: 'var(--color-muted)' }}>Calculating time parameters...</span>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass"
            style={{
              padding: '2.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.005)'
            }}
          >
            <Play size={40} style={{ color: 'var(--color-muted)', marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#fff', marginBottom: '0.5rem' }}>No Active Countdown Campaigns</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', maxWidth: '380px', lineHeight: '1.6' }}>
              Create an expiring campaign with an expiration timestamp to activate the real-time neon countdown visual telemetry panel.
            </p>
          </motion.div>
        )}

        {/* Campaign Metrics Coverage Panel */}
        {primaryExpiring && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass"
            style={{
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              background: 'rgba(255, 255, 255, 0.015)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                <Percent size={16} style={{ color: '#10b981' }} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#10b981', fontWeight: 'bold', letterSpacing: '0.1em' }}>CAMPAIGN_PERFORMANCE</span>
              </div>
              
              {/* Progress bar visual */}
              {(() => {
                const limit = primaryExpiring.usageLimit || 100;
                const used = primaryExpiring.usedCount || 0;
                const percent = Math.min(Math.round((used / limit) * 100), 100);
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
                      <span>Redemption Allocation</span>
                      <span style={{ color: '#fff', fontWeight: '600' }}>{percent}% ({used}/{limit})</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <div style={{ height: '100%', width: `${percent}%`, background: 'linear-gradient(90deg, var(--color-accent), #10b981)', boxShadow: '0 0 8px var(--color-accent)' }} />
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Min Order Req</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Rs. {primaryExpiring.minOrderAmount || '0'}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Max Cap discount</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{primaryExpiring.maxDiscount > 0 ? `Rs. ${primaryExpiring.maxDiscount}` : 'UNLIMITED'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '1.5rem' }}>
              <ShieldAlert size={12} />
              <span>Restricted access: coupon validation operates under SHA-256 shields.</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Promos Table list */}
      {loading ? <LoadingSpinner /> : (
        <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Campaign Code', 'Type', 'Amount', 'Redeemed', 'Limit Allocations', 'Expiration Timeline', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'var(--color-muted)', fontWeight: '500', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {promos.map((p, idx) => {
                    const expired = p.expiresAt && new Date(p.expiresAt) < new Date();
                    const capped = p.usageLimit > 0 && p.usedCount >= p.usageLimit;
                    const isActive = p.isActive && !expired && !capped;
                    
                    return (
                      <motion.tr
                        key={p._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                        className="ledger-row"
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                      >
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ fontWeight: '700', color: '#fff', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{p.code}</span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textTransform: 'capitalize', color: 'var(--color-muted)' }}>
                          {p.discountType}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: 'var(--color-accent)' }}>
                          {p.discountType === 'percentage' ? `${p.discountValue}%` : `Rs. ${p.discountValue.toFixed(2)}`}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '600' }}>
                          {p.usedCount || 0}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                          {p.usageLimit > 0 ? p.usageLimit : 'UNLIMITED'}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--color-muted)' }}>
                          {p.expiresAt ? (
                            <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={13} /> {new Date(p.expiresAt).toLocaleDateString()}
                              {expired && <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>(EXPIRED)</span>}
                            </span>
                          ) : 'NEVER'}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: isActive ? '#10b981' : '#ef4444',
                              boxShadow: isActive ? '0 0 8px #10b981' : '0 0 8px #ef4444',
                            }} />
                            <span style={{
                              fontFamily: 'monospace',
                              fontSize: '0.78rem',
                              fontWeight: 'bold',
                              color: isActive ? '#34d399' : '#f87171'
                            }}>
                              {isActive ? 'ACTIVE' : expired ? 'EXPIRED' : capped ? 'DEPLETED' : 'OFFLINE'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <button onClick={() => handleDelete(p._id, p.code)} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-muted)', padding: '6px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {promos.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-muted)' }}>
                      <Ticket size={40} style={{ color: 'var(--color-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                      <p>No promo campaigns active. Click "Create Campaign" to initiate one!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '480px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Ticket size={20} style={{ color: 'var(--color-accent)' }} /> Create Promo Campaign
              </h2>
              <button onClick={() => setShowModal(false)} disabled={submitting} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: submitting ? 'not-allowed' : 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-padding" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Error messages */}
              {submitError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.875rem 1rem', color: '#f87171', fontSize: '0.875rem' }}>
                  ⚠️ {submitError}
                </div>
              )}

              {/* Success message */}
              {successMsg && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '0.875rem 1rem', color: '#4ade80', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} /> {successMsg}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Promo Code</label>
                <input className="input-field" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. EIDSPECIAL" required disabled={submitting} style={{ fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 'bold' }} />
              </div>

              <div className="form-grid-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Type</label>
                  <select className="input-field" value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} disabled={submitting}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Value</label>
                  <input className="input-field" type="number" step="0.01" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} required placeholder="e.g. 15" disabled={submitting} />
                </div>
              </div>

              <div className="form-grid-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Min Order (Rs.)</label>
                  <input className="input-field" type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="0 (Optional)" disabled={submitting} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Max Cap (Rs.)</label>
                  <input className="input-field" type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} placeholder="0 (Optional)" disabled={submitting} />
                </div>
              </div>

              <div className="form-grid-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Usage Limit</label>
                  <input className="input-field" type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="0 (Unlimited)" disabled={submitting} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Expiration</label>
                  <input className="input-field" type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} disabled={submitting} />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {submitting ? 'Initiating Campaign...' : 'Initiate Campaign'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
